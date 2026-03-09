"""
ASCRD — Acoustic Screening for Canine Rabies Detection
FastAPI Backend — main entry point
"""

from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

import audio_processor
import database
import auth
from models import AnalysisResult, HistoryResponse, HistoryEntry, UserCreate, UserResponse, Token, UserProfileUpdate


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


@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await database.get_user_by_username(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = await database.create_user(user.username, hashed_password)
    if not new_user:
        raise HTTPException(status_code=500, detail="Failed to create user")
    return new_user


@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await database.get_user_by_username(form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(auth.get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "organization": current_user.organization,
        "created_at": current_user.created_at.isoformat()
    }


@app.put("/me", response_model=UserResponse)
async def update_users_me(profile_update: UserProfileUpdate, current_user = Depends(auth.get_current_user)):
    updated_user_dict = await database.update_user_profile(
        current_user.username, 
        profile_update.model_dump(exclude_unset=True)
    )
    if not updated_user_dict:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user_dict


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_audio(
    file: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None)
):
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
        latitude=latitude,
        longitude=longitude,
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
async def analyze_audio_full(
    file: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None)
):
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
        latitude=latitude,
        longitude=longitude,
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
