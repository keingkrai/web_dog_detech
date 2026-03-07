"""
ASCRD — Acoustic Screening for Canine Rabies Detection
FastAPI Backend — main entry point
"""

from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import audio_processor
import database
from models import AnalysisResult, HistoryResponse, HistoryEntry


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup."""
    await database.init_db()
    yield


app = FastAPI(
    title="ASCRD API",
    description="Acoustic Screening for Canine Rabies Detection",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "ASCRD API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_audio(file: UploadFile = File(...)):
    """Basic analyze endpoint — no chart data in response."""
    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file received.")
    try:
        result = audio_processor.analyze(audio_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Audio processing failed: {str(e)}")

    await database.add_entry(
        prediction=result["prediction"],
        confidence=result["confidence"],
        peak_frequency=result["peak_frequency"],
        risk_level=result["risk_level"],
    )

    return AnalysisResult(
        prediction=result["prediction"],
        confidence=result["confidence"],
        risk_level=result["risk_level"],
        peak_frequency=result["peak_frequency"],
        mfcc_features=result["mfcc_features"],
        waveform_data=[],
        frequency_data=result["frequency_data"],
        processing_time_ms=result["processing_time_ms"],
        timestamp=datetime.utcnow().isoformat(),
    )


@app.post("/analyze/full")
async def analyze_audio_full(file: UploadFile = File(...)):
    """Full analyze endpoint — includes waveform + frequency data for charts."""
    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file received.")
    try:
        result = audio_processor.analyze(audio_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Audio processing failed: {str(e)}")

    await database.add_entry(
        prediction=result["prediction"],
        confidence=result["confidence"],
        peak_frequency=result["peak_frequency"],
        risk_level=result["risk_level"],
    )

    return {
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "risk_level": result["risk_level"],
        "peak_frequency": result["peak_frequency"],
        "mfcc_features": result["mfcc_features"],
        "waveform_data": result["waveform_data"],
        "frequency_data": result["frequency_data"],
        "processing_time_ms": result["processing_time_ms"],
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/history", response_model=HistoryResponse)
async def get_history():
    """Return all past analysis results (most recent first)."""
    entries_raw = await database.get_all_entries()
    entries = [HistoryEntry(**e) for e in entries_raw]
    return HistoryResponse(entries=entries, total=len(entries))


@app.delete("/history")
async def clear_history():
    """Delete all history entries from the database."""
    await database.clear_history()
    return {"message": "History cleared."}
