from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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


class HistoryEntry(BaseModel):
    id: int
    date: str
    prediction: str
    confidence: float
    peak_frequency: float
    risk_level: str


class HistoryResponse(BaseModel):
    entries: list[HistoryEntry]
    total: int
