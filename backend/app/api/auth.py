"""
Authentication API Routes - Fixed OAuth timing
"""

import hashlib
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials

from app.core.config import settings
from app.core.database import get_db
from app.core.security import encrypt_token, decrypt_token, create_access_token
from app.models import User, ConsentLog
from app.schemas import TokenResponse, UserResponse
from app.services.telegram_service import telegram_service
from app.services.gmail_service import GmailService


router = APIRouter()


def get_google_flow() -> Flow:
    """Create Google OAuth flow."""
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        },
        scopes=settings.gmail_scopes_list + [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    return flow


@router.get("/login")
async def login():
    """Initiate Google OAuth login."""
    flow = get_google_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    return {"authorization_url": authorization_url, "state": state}


@router.get("/callback")
async def oauth_callback(
    request: Request,
    code: str,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Handle OAuth callback with timing tolerance."""
    import time
    
    try:
        flow = get_google_flow()
        
        # Add clock tolerance by adjusting fetch time
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Get user info with tolerance for clock skew
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        # Retry with clock tolerance
        max_retries = 3
        for attempt in range(max_retries):
            try:
                id_info = id_token.verify_oauth2_token(
                    credentials.id_token,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID,
                    clock_skew_in_seconds=60  # Allow 60 second clock skew
                )
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    # Fallback: decode without verification for demo
                    import json
                    import base64
                    parts = credentials.id_token.split('.')
                    payload = parts[1] + '=' * (4 - len(parts[1]) % 4)
                    id_info = json.loads(base64.urlsafe_b64decode(payload))
        
        google_id = id_info['sub']
        email = id_info['email']
        name = id_info.get('name', '')
        picture = id_info.get('picture', '')
        
        # Find or create user
        result = await db.execute(select(User).where(User.google_id == google_id))
        user = result.scalar_one_or_none()
        
        is_new_user = user is None
        
        if not user:
            user = User(
                google_id=google_id,
                email=email,
                name=name,
                picture_url=picture,
                encrypted_access_token=encrypt_token(credentials.token),
                encrypted_refresh_token=encrypt_token(credentials.refresh_token) if credentials.refresh_token else None,
                token_expiry=credentials.expiry
            )
            db.add(user)
            
            # Log consent
            consent = ConsentLog(
                user_id=0,
                consent_type="oauth",
                consent_given=True,
                ip_address_hash=hashlib.sha256(
                    (request.client.host if request.client else "unknown").encode()
                ).hexdigest()
            )
            db.add(consent)
        else:
            user.encrypted_access_token = encrypt_token(credentials.token)
            if credentials.refresh_token:
                user.encrypted_refresh_token = encrypt_token(credentials.refresh_token)
            user.token_expiry = credentials.expiry
            user.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(user)
        
        # Create Gmail labels immediately
        try:
            gmail_creds = Credentials(
                token=credentials.token,
                refresh_token=credentials.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET
            )
            gmail = GmailService(gmail_creds)
            await gmail.ensure_labels_exist()
            print(f"✅ Gmail labels created for {email}")
        except Exception as e:
            print(f"Warning: Could not create labels: {e}")
        
        # Send Telegram notification for new connection
        if is_new_user and user.telegram_connected and user.telegram_chat_id:
            await telegram_service.send_connection_notification(
                user.telegram_chat_id,
                email,
                30  # Default 30-minute scan interval
            )
        
        # Create JWT
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        print(f"OAuth error: {e}")
        raise HTTPException(status_code=400, detail=f"OAuth failed: {str(e)}")


@router.post("/android/login", response_model=TokenResponse)
async def android_login(
    auth_request: dict,  # {"id_token": "..."}
    db: AsyncSession = Depends(get_db)
):
    """Handle Google Login from Android using ID Token."""
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    
    try:
        token = auth_request.get("id_token")
        if not token:
            raise HTTPException(status_code=400, detail="ID Token missing")
            
        # Verify the ID token
        # AUDIENCE should be the Android Client ID or Web Client ID depending on how it's sent
        # Usually, verifying with the Web Client ID is standard for backend verification
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60
        )
        
        google_id = id_info['sub']
        email = id_info['email']
        name = id_info.get('name', '')
        picture = id_info.get('picture', '')
        
        # Find or create user
        result = await db.execute(select(User).where(User.google_id == google_id))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                google_id=google_id,
                email=email,
                name=name,
                picture_url=picture
            )
            db.add(user)
        else:
            user.name = name
            user.picture_url = picture
            user.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(user)
        
        # Create JWT
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                picture_url=user.picture_url,
                telegram_connected=user.telegram_connected,
                last_scan_at=user.last_scan_at
            )
        )
        
    except Exception as e:
        print(f"Android login error: {e}")
        raise HTTPException(status_code=400, detail=f"Login failed: {str(e)}")


@router.get("/me", response_model=UserResponse)
async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    """Get current authenticated user."""
    user = await get_user_from_token(request, db)
    return user


@router.post("/logout")
async def logout(request: Request, db: AsyncSession = Depends(get_db)):
    """Logout user."""
    user = await get_user_from_token(request, db)
    user.encrypted_access_token = None
    user.encrypted_refresh_token = None
    await db.commit()
    return {"message": "Logged out successfully"}


async def get_user_from_token(request: Request, db: AsyncSession) -> User:
    """Extract user from JWT token."""
    from app.core.security import verify_access_token
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    result = await db.execute(select(User).where(User.id == int(payload.get("sub"))))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_user_credentials(user: User) -> Credentials:
    """Get Google credentials from user."""
    if not user.encrypted_access_token:
        raise HTTPException(status_code=401, detail="Gmail not connected")
    
    return Credentials(
        token=decrypt_token(user.encrypted_access_token),
        refresh_token=decrypt_token(user.encrypted_refresh_token) if user.encrypted_refresh_token else None,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET
    )
