"""
Notifications API Routes
Telegram and WhatsApp integration
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import User
from app.schemas import (
    TelegramConnectRequest,
    TelegramConnectResponse,
    NotificationPreferences
)
from app.api.auth import get_user_from_token
from app.services import telegram_service


router = APIRouter()


@router.get("/telegram/connect", response_model=TelegramConnectResponse)
async def get_telegram_connection(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get Telegram connection status and verification code."""
    user = await get_user_from_token(request, db)
    
    if user.telegram_connected:
        return TelegramConnectResponse(
            connected=True,
            chat_id=user.telegram_chat_id,
            bot_username=telegram_service.bot_username
        )
    
    
    # Generate verification code
    code = await telegram_service.generate_verification_code(db, user.id)
    
    return TelegramConnectResponse(
        connected=False,
        bot_username=telegram_service.bot_username,
        verification_code=code
    )


@router.post("/telegram/verify")
async def verify_telegram(
    request: Request,
    verify_request: TelegramConnectRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify Telegram connection with code."""
    user = await get_user_from_token(request, db)
    
    # This would typically be called after user sends code to bot
    # For demo, we'll accept the chat_id directly
    # In production, implement proper bot webhook handling
    
    return {
        "message": "To complete verification, send the code to @mailshield_alert_bot on Telegram",
        "code": verify_request.verification_code,
        "instructions": [
            "1. Open Telegram and search for @mailshield_alert_bot",
            "2. Start a chat with the bot",
            f"3. Send the verification code: {verify_request.verification_code}",
            "4. The bot will confirm your connection"
        ]
    }


@router.post("/telegram/link/{chat_id}")
async def link_telegram(
    chat_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Link Telegram chat ID to user account.
    Called by bot webhook when user sends verification code.
    """
    user = await get_user_from_token(request, db)
    
    user.telegram_chat_id = chat_id
    user.telegram_connected = True
    
    await db.commit()
    
    # Send welcome message
    await telegram_service.send_welcome_message(chat_id)
    
    return {"success": True, "message": "Telegram connected successfully"}


@router.post("/telegram/disconnect")
async def disconnect_telegram(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Disconnect Telegram from account."""
    user = await get_user_from_token(request, db)
    
    user.telegram_chat_id = None
    user.telegram_connected = False
    
    await db.commit()
    
    return {"success": True, "message": "Telegram disconnected"}


@router.get("/preferences", response_model=NotificationPreferences)
async def get_preferences(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get notification preferences."""
    user = await get_user_from_token(request, db)
    
    return NotificationPreferences(
        notification_enabled=user.notification_enabled,
        notification_level=user.notification_level,
        telegram_enabled=user.telegram_connected,
        whatsapp_enabled=user.whatsapp_connected
    )


@router.put("/preferences")
async def update_preferences(
    request: Request,
    preferences: NotificationPreferences,
    db: AsyncSession = Depends(get_db)
):
    """Update notification preferences."""
    user = await get_user_from_token(request, db)
    
    user.notification_enabled = preferences.notification_enabled
    user.notification_level = preferences.notification_level
    
    await db.commit()
    
    return {"success": True, "message": "Preferences updated"}


@router.post("/test")
async def send_test_notification(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Send a test notification to verify setup."""
    user = await get_user_from_token(request, db)
    
    if not user.telegram_connected:
        raise HTTPException(
            status_code=400,
            detail="Telegram not connected. Please connect first."
        )
    
    from app.services import AlertMessage
    
    test_alert = AlertMessage(
        sender="test@example.com",
        subject="Test Alert from MailShield",
        risk_level="medium",
        risk_score=50,
        reasons=[{"description": "This is a test notification"}],
        recommended_action="No action needed - this is just a test!"
    )
    
    success = await telegram_service.send_alert(user.telegram_chat_id, test_alert)
    
    if success:
        return {"success": True, "message": "Test notification sent!"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test notification")
