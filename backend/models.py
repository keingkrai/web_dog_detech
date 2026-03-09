from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    organization: Optional[str] = None
    created_at: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    organization: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class AnalysisResult(BaseModel):
    prediction: str
    confidence: float
    risk_level: str  # "normal" | "risk"
    peak_frequency: float
    mfcc_features: list[float]
    waveform_data: list[float]
    frequency_data: list[dict]  # [{freq: float, magnitude: float}]
    processing_time_ms: float
    timestamp: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class HistoryEntry(BaseModel):
    id: int
    date: str
    prediction: str
    confidence: float
    peak_frequency: float
    risk_level: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class HistoryResponse(BaseModel):
    entries: list[HistoryEntry]
    total: int
