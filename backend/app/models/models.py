"""
Database Models for MailShield
Minimal data storage - privacy-first approach
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, Integer, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    """User model - stores minimal user data with encrypted tokens."""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    google_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    picture_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Encrypted OAuth tokens
    encrypted_access_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    encrypted_refresh_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    token_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Telegram integration
    telegram_chat_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    telegram_connected: Mapped[bool] = mapped_column(Boolean, default=False)
    telegram_verification_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, index=True)
    
    # WhatsApp integration (optional)
    whatsapp_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    whatsapp_connected: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # User preferences
    auto_labeling_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    quarantine_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    auto_reporting_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    notification_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    notification_level: Mapped[str] = mapped_column(String(20), default="high")  # high, medium, all
    
    # Security State
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Stats (anonymized counts only)
    emails_scanned: Mapped[int] = mapped_column(Integer, default=0)
    phishing_detected: Mapped[int] = mapped_column(Integer, default=0)
    suspicious_detected: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_scan_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class ConsentLog(Base):
    """GDPR-compliant consent logging."""
    __tablename__ = "consent_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    consent_type: Mapped[str] = mapped_column(String(50))  # oauth, telegram, whatsapp, data_processing
    consent_given: Mapped[bool] = mapped_column(Boolean, default=True)
    ip_address_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # Hashed for privacy
    user_agent_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ScanHistory(Base):
    """Anonymized scan history for statistics only - NO email content stored."""
    __tablename__ = "scan_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    
    # Message identifier (hashed for privacy, used to prevent re-scanning)
    message_id_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    
    # Risk assessment only - NO content stored
    risk_level: Mapped[str] = mapped_column(String(20))  # high, medium, low, safe
    risk_score: Mapped[int] = mapped_column(Integer)  # 0-100
    
    # Detection reasons (structured, no raw content)
    detection_reasons: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Label applied
    label_applied: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # User feedback
    user_marked_safe: Mapped[bool] = mapped_column(Boolean, default=False)
    user_reported_phishing: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    scanned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UrlScanHistory(Base):
    """Tracks individual URL scans from the browser extension."""
    __tablename__ = "url_scan_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    
    url: Mapped[str] = mapped_column(Text)
    domain: Mapped[str] = mapped_column(String(255))
    
    risk_score: Mapped[int] = mapped_column(Integer)
    risk_level: Mapped[str] = mapped_column(String(20))
    detection_reasons: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    scanned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DetectionRule(Base):
    """Admin-managed detection rules."""
    __tablename__ = "detection_rules"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str] = mapped_column(Text)
    rule_type: Mapped[str] = mapped_column(String(50))  # keyword, domain, pattern, header
    pattern: Mapped[str] = mapped_column(Text)
    risk_weight: Mapped[int] = mapped_column(Integer, default=10)  # Contribution to risk score
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
