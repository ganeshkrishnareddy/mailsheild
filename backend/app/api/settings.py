"""
User Settings API Routes
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import User
from app.schemas import UserSettings, UpdateSettingsRequest
from app.api.auth import get_user_from_token


router = APIRouter()


@router.get("/", response_model=UserSettings)
async def get_settings(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get user settings."""
    user = await get_user_from_token(request, db)
    
    return UserSettings(
        auto_labeling_enabled=user.auto_labeling_enabled,
        notification_enabled=user.notification_enabled,
        notification_level=user.notification_level,
        telegram_connected=user.telegram_connected,
        whatsapp_connected=user.whatsapp_connected
    )


@router.put("/")
async def update_settings(
    request: Request,
    settings_update: UpdateSettingsRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update user settings."""
    user = await get_user_from_token(request, db)
    
    if settings_update.auto_labeling_enabled is not None:
        user.auto_labeling_enabled = settings_update.auto_labeling_enabled
    
    if settings_update.notification_enabled is not None:
        user.notification_enabled = settings_update.notification_enabled
    
    if settings_update.notification_level is not None:
        if settings_update.notification_level not in ["high", "medium", "all"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid notification level. Must be: high, medium, or all"
            )
        user.notification_level = settings_update.notification_level
    
    user.updated_at = datetime.utcnow()
    await db.commit()
    
    return {"success": True, "message": "Settings updated"}


@router.delete("/account")
async def delete_account(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete user account and all associated data.
    GDPR right to erasure compliance.
    """
    user = await get_user_from_token(request, db)
    
    # Delete user and cascade to related records
    await db.delete(user)
    await db.commit()
    
    return {
        "success": True,
        "message": "Account deleted successfully. All your data has been removed."
    }


@router.get("/privacy-export")
async def export_data(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Export user data (GDPR data portability).
    Returns all stored data about the user.
    """
    user = await get_user_from_token(request, db)
    
    # Note: We store minimal data, so export is simple
    return {
        "user_data": {
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "settings": {
                "auto_labeling_enabled": user.auto_labeling_enabled,
                "notification_enabled": user.notification_enabled,
                "notification_level": user.notification_level
            },
            "integrations": {
                "telegram_connected": user.telegram_connected,
                "whatsapp_connected": user.whatsapp_connected
            },
            "statistics": {
                "emails_scanned": user.emails_scanned,
                "phishing_detected": user.phishing_detected,
                "suspicious_detected": user.suspicious_detected
            }
        },
        "privacy_notice": "MailShield does not store email content. Only metadata and scan counts are retained."
    }
