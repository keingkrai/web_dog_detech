"""
Audio processing pipeline for ASCRD:
1. Spectral Gating (noise reduction via noisereduce)
2. MFCC extraction (40 coefficients via librosa)
3. Peak Frequency via FFT
4. Model inference (placeholder — swap in real .pkl once provided)
"""

import io
import time
import numpy as np
import librosa

# Patch pkg_resources for Python 3.12 compatibility before importing noisereduce
import sys
try:
    import pkg_resources
except ImportError:
    class _DummyPkgResources:
        @staticmethod
        def resource_filename(package_or_requirement, resource_name):
            import os, importlib.util
            try:
                spec = importlib.util.find_spec(package_or_requirement)
                if spec and spec.origin:
                    return os.path.join(os.path.dirname(spec.origin), resource_name)
            except Exception:
                pass
            return resource_name
    sys.modules["pkg_resources"] = _DummyPkgResources()

import noisereduce as nr
import soundfile as sf

from pathlib import Path

MODEL_PATH = Path(__file__).parent / "models_ml" / "urban_sound_classifier.pkl"
ENCODER_PATH = Path(__file__).parent / "models_ml" / "label_encoder.pkl"

# Lazy-load ML models
_model = None
_encoder = None


def _load_models():
    global _model, _encoder
    if MODEL_PATH.exists() and ENCODER_PATH.exists():
        import joblib
        _model = joblib.load(MODEL_PATH)
        _encoder = joblib.load(ENCODER_PATH)
    # If files don't exist yet, inference uses placeholder logic


def load_audio_bytes(audio_bytes: bytes, sr: int = 22050):
    """
    Load audio from raw bytes. Supports webm/m4a/wav by writing to a temp file first.
    librosa.load directly on BytesIO often fails with 'Format not recognised' for browser uploads.
    """
    import tempfile
    import os
    
    # Write bytes to a temporary file to allow robust format sniffing by soundfile/audioread
    fd, temp_path = tempfile.mkstemp(suffix=".tmp")
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(audio_bytes)
        
        # Load using librosa, which will use soundfile or audioread under the hood
        y, sr = librosa.load(temp_path, sr=sr, mono=True)
        return y, sr
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass



def spectral_gate(y: np.ndarray, sr: int) -> np.ndarray:
    """Apply spectral gating noise reduction."""
    if len(y) == 0:
        return y
    # Use first 0.5 seconds as noise profile if available
    noise_clip = y[: int(sr * 0.5)] if len(y) > int(sr * 0.5) else y
    return nr.reduce_noise(y=y, sr=sr, y_noise=noise_clip, prop_decrease=0.75)


def extract_mfcc(y: np.ndarray, sr: int, n_mfcc: int = 40) -> np.ndarray:
    """Extract n_mfcc MFCC features (mean across time frames)."""
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    return np.mean(mfcc, axis=1)


def extract_peak_frequency(y: np.ndarray, sr: int) -> float:
    """Compute FFT and return the dominant (peak) frequency in Hz."""
    fft_vals = np.abs(np.fft.rfft(y))
    freqs = np.fft.rfftfreq(len(y), d=1.0 / sr)
    if len(fft_vals) == 0:
        return 0.0
    peak_idx = np.argmax(fft_vals)
    return float(freqs[peak_idx])


def build_frequency_spectrum(y: np.ndarray, sr: int, max_points: int = 512):
    """Return downsampled frequency spectrum for charting."""
    fft_vals = np.abs(np.fft.rfft(y))
    freqs = np.fft.rfftfreq(len(y), d=1.0 / sr)
    # Only show 0–8000 Hz (meaningful range for dog barks)
    mask = freqs <= 8000
    freqs_cut = freqs[mask]
    fft_cut = fft_vals[mask]
    # Downsample to max_points
    if len(freqs_cut) > max_points:
        step = len(freqs_cut) // max_points
        freqs_cut = freqs_cut[::step]
        fft_cut = fft_cut[::step]
    # Normalize magnitude to 0-1
    max_val = fft_cut.max() if fft_cut.max() > 0 else 1
    return [
        {"freq": round(float(f), 1), "magnitude": round(float(m / max_val), 4)}
        for f, m in zip(freqs_cut, fft_cut)
    ]


def build_waveform(y: np.ndarray, sr: int, max_points: int = 512):
    """Return downsampled waveform for time-domain chart."""
    if len(y) > max_points:
        step = len(y) // max_points
        y_ds = y[::step][:max_points]
    else:
        y_ds = y
    duration = len(y) / sr
    times = np.linspace(0, duration, len(y_ds))
    return [
        {"time": round(float(t), 4), "amplitude": round(float(a), 4)}
        for t, a in zip(times, y_ds)
    ]


def predict_audio(mfcc_features: np.ndarray) -> dict:
    """
    Inference using the provided .pkl model.
    Falls back to a deterministic placeholder when model files are absent.
    """
    _load_models()
    if _model is not None and _encoder is not None:
        feat = mfcc_features.reshape(1, -1)
        proba = _model.predict_proba(feat)[0]
        class_idx = int(np.argmax(proba))
        label = _encoder.inverse_transform([class_idx])[0]
        confidence = float(proba[class_idx])
        # Map label to risk logic
        risk_labels = {"dog_bark_abnormal", "laryngeal_paralysis", "bark_risk"}
        risk_level = "risk" if label.lower() in risk_labels else "normal"
        return {"prediction": label, "confidence": confidence, "risk_level": risk_level}
    else:
        # Placeholder: simulate inference from MFCC statistics
        energy = float(np.mean(np.abs(mfcc_features)))
        if energy > 15:
            return {"prediction": "Abnormal Bark Pattern", "confidence": 0.82, "risk_level": "risk"}
        else:
            return {"prediction": "Normal Bark Pattern", "confidence": 0.91, "risk_level": "normal"}


def analyze(audio_bytes: bytes) -> dict:
    """Full pipeline: load → denoise → features → inference → charting data."""
    t0 = time.time()
    y, sr = load_audio_bytes(audio_bytes)
    y_clean = spectral_gate(y, sr)
    mfcc = extract_mfcc(y_clean, sr)
    peak_freq = extract_peak_frequency(y_clean, sr)
    inference = predict_audio(mfcc)
    waveform = build_waveform(y_clean, sr)
    freq_spectrum = build_frequency_spectrum(y_clean, sr)
    elapsed_ms = (time.time() - t0) * 1000

    return {
        **inference,
        "peak_frequency": round(peak_freq, 1),
        "mfcc_features": [round(float(v), 4) for v in mfcc.tolist()],
        "waveform_data": waveform,
        "frequency_data": freq_spectrum,
        "processing_time_ms": round(elapsed_ms, 1),
    }
