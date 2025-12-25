"""Detection module exports."""
from app.detection.engine import (
    PhishingDetectionEngine,
    DetectionResult,
    analyze_email,
    detection_engine,
)

__all__ = [
    "PhishingDetectionEngine",
    "DetectionResult",
    "analyze_email",
    "detection_engine",
]
