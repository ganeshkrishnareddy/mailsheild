"""
MailShield - Phishing Awareness Platform
Main FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, emails, notifications, settings as settings_router, admin, awareness, threats


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await init_db()
    
    print("🛡️ MailShield Backend Started")
    yield
    # Shutdown
    print("🛡️ MailShield Backend Shutting Down")


app = FastAPI(
    title=settings.APP_NAME,
    description="Privacy-first phishing detection and awareness platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://mail.google.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(emails.router, prefix="/api/emails", tags=["Emails"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["Settings"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(awareness.router, prefix="/api/awareness", tags=["Awareness"])
app.include_router(threats.router, prefix="/api/threats", tags=["Threats"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "message": "🛡️ MailShield API is running"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "services": {
            "gmail_api": "ready",
            "telegram": "ready",
            "detection_engine": "ready"
        }
    }
