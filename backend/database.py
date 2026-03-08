"""
PostgreSQL database layer for ASCRD using SQLAlchemy 2.0 async + asyncpg.
Connection URL is loaded from the .env file (DATABASE_URL variable).
"""

import os
from datetime import datetime
from dotenv import load_dotenv

from sqlalchemy import Column, Integer, String, Float, DateTime, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Please create a .env file (see .env.example).")

# ── Engine & Session ────────────────────────────────────────────
engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


# ── ORM Model ───────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


class HistoryEntryORM(Base):
    __tablename__ = "screening_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    prediction = Column(String(255), nullable=False)
    confidence = Column(Float, nullable=False)
    peak_frequency = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)


# ── Init ─────────────────────────────────────────────────────────
async def init_db():
    """Create tables if they don't already exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ── CRUD ─────────────────────────────────────────────────────────
async def add_entry(prediction: str, confidence: float, peak_frequency: float, risk_level: str, latitude: float = None, longitude: float = None) -> dict:
    async with AsyncSessionLocal() as session:
        entry = HistoryEntryORM(
            prediction=prediction,
            confidence=round(confidence, 4),
            peak_frequency=round(peak_frequency, 1),
            risk_level=risk_level,
            latitude=latitude,
            longitude=longitude,
        )
        session.add(entry)
        await session.commit()
        await session.refresh(entry)
        return _to_dict(entry)


async def get_all_entries() -> list[dict]:
    from sqlalchemy import select
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(HistoryEntryORM).order_by(HistoryEntryORM.id.desc())
        )
        return [_to_dict(row) for row in result.scalars().all()]


async def clear_history():
    async with AsyncSessionLocal() as session:
        await session.execute(text("DELETE FROM screening_history"))
        await session.commit()


# ── Helper ───────────────────────────────────────────────────────
def _to_dict(entry: HistoryEntryORM) -> dict:
    return {
        "id": entry.id,
        "date": entry.date.strftime("%Y-%m-%d %H:%M:%S") if entry.date else "",
        "prediction": entry.prediction,
        "confidence": entry.confidence,
        "peak_frequency": entry.peak_frequency,
        "risk_level": entry.risk_level,
        "latitude": entry.latitude,
        "longitude": entry.longitude,
    }
