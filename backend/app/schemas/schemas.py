"""
Pydantic Schemas for API Request/Response
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# ===========================================
# User Schemas
# ===========================================

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""
    google_id: str


class UserResponse(UserBase):
    """User response schema."""
    id: int
    picture_url: Optional[str] = None
    telegram_connected: bool = False
    whatsapp_connected: bool = False
    auto_labeling_enabled: bool = True
    notification_enabled: bool = True
    notification_level: str = "high"
    emails_scanned: int = 0
    phishing_detected: int = 0
    suspicious_detected: int = 0
    created_at: datetime
    last_scan_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ===========================================
# Authentication Schemas
# ===========================================

class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class OAuthCallbackRequest(BaseModel):
    """OAuth callback request."""
    code: str
    state: Optional[str] = None


# ===========================================
# Email Analysis Schemas
# ===========================================

class EmailSummary(BaseModel):
    """Email summary for display (NO body content)."""
    message_id: str
    sender: str
    sender_domain: str
    subject: str
    received_at: datetime
    risk_level: str  # high, medium, low, safe
    risk_score: int  # 0-100
    detection_reasons: List[str]
    label_applied: Optional[str] = None
    is_read: bool = False


class EmailAnalysisResult(BaseModel):
    """Result of email analysis."""
    message_id: str
    risk_level: str
    risk_score: int
    detection_reasons: List[Dict[str, Any]]
    human_readable_explanation: str
    recommended_action: str
    label_to_apply: str


class ScanRequest(BaseModel):
    """Request to scan emails."""
    max_emails: int = Field(default=50, ge=1, le=200)
    include_read: bool = False


class ScanResponse(BaseModel):
    """Scan response with results."""
    total_scanned: int
    phishing_found: int
    suspicious_found: int
    safe_found: int
    emails: List[EmailSummary]


class UrlScanRequest(BaseModel):
    """Request to scan a URL."""
    url: str


class UrlScanResponse(BaseModel):
    """Result of a URL scan."""
    url: str
    risk_level: str
    risk_score: int
    reasons: List[str]
    is_safe: bool


# ===========================================
# Dashboard Stats Schemas
# ===========================================

class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_emails_scanned: int
    phishing_detected: int
    suspicious_detected: int
    safe_emails: int
    last_scan_at: Optional[datetime]
    risk_breakdown: Dict[str, int]
    recent_threats: List[EmailSummary]
    recent_url_scans: List[UrlScanResponse] = []


# ===========================================
# Notification Schemas
# ===========================================

class TelegramConnectRequest(BaseModel):
    """Request to connect Telegram."""
    verification_code: str


class TelegramConnectResponse(BaseModel):
    """Telegram connection status."""
    connected: bool
    chat_id: Optional[str] = None
    bot_username: str
    verification_code: Optional[str] = None


class NotificationPreferences(BaseModel):
    """User notification preferences."""
    notification_enabled: bool = True
    notification_level: str = "high"  # high, medium, all
    telegram_enabled: bool = True
    whatsapp_enabled: bool = False


# ===========================================
# Settings Schemas
# ===========================================

class UserSettings(BaseModel):
    """User settings."""
    auto_labeling_enabled: bool
    notification_enabled: bool
    notification_level: str
    telegram_connected: bool
    whatsapp_connected: bool


class UpdateSettingsRequest(BaseModel):
    """Update settings request."""
    auto_labeling_enabled: Optional[bool] = None
    notification_enabled: Optional[bool] = None
    notification_level: Optional[str] = None


# ===========================================
# Admin Schemas
# ===========================================

class AdminStats(BaseModel):
    """Admin dashboard statistics."""
    total_users: int
    active_users_today: int
    total_scans: int
    total_phishing_detected: int
    detection_accuracy: float
    false_positive_rate: float


class DetectionRuleCreate(BaseModel):
    """Create detection rule."""
    name: str
    description: str
    rule_type: str
    pattern: str
    risk_weight: int = Field(default=10, ge=1, le=50)


class DetectionRuleResponse(BaseModel):
    """Detection rule response."""
    id: int
    name: str
    description: str
    rule_type: str
    pattern: str
    risk_weight: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===========================================
# Awareness Schemas
# ===========================================

class PhishingExample(BaseModel):
    """Phishing example for education."""
    id: int
    title: str
    description: str
    red_flags: List[str]
    category: str  # urgency, impersonation, link, attachment
    difficulty: str  # easy, medium, hard


class SecurityTip(BaseModel):
    """Weekly security tip."""
    id: int
    title: str
    content: str
    category: str
    published_at: datetime
