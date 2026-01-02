"""
Email Scanning API Routes
Gmail integration and phishing detection
"""

import hashlib
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models import User, ScanHistory, UrlScanHistory
from app.schemas import (
    EmailSummary,
    ScanRequest,
    ScanResponse,
    DashboardStats,
    EmailAnalysisResult,
    UrlScanResponse
)
from app.api.auth import get_user_from_token, get_user_credentials
from app.services import GmailService, AlertMessage, telegram_service
from app.detection import DetectionResult


router = APIRouter()


@router.post("/scan", response_model=ScanResponse)
async def scan_emails(
    request: Request,
    scan_request: ScanRequest = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Scan emails for phishing threats.
    Processes in-memory only - no email content stored.
    """
    user = await get_user_from_token(request, db)
    credentials = get_user_credentials(user)
    
    # Default scan request
    if not scan_request:
        scan_request = ScanRequest()
    
    try:
        gmail = GmailService(credentials)
        await gmail.ensure_labels_exist()
        
        # Fetch emails (metadata only)
        emails = gmail.fetch_emails(
            max_results=scan_request.max_emails,
            include_read=scan_request.include_read
        )
        
        results: List[EmailSummary] = []
        phishing_count = 0
        suspicious_count = 0
        safe_count = 0
        
        for email in emails:
            # Check if already scanned
            msg_hash = GmailService.hash_message_id(email.message_id)
            existing = await db.execute(
                select(ScanHistory).where(ScanHistory.message_id_hash == msg_hash)
            )
            
            if existing.scalar_one_or_none():
                continue  # Skip already scanned
            
            # Analyze email
            detection: DetectionResult = gmail.analyze_and_label_email(
                email,
                auto_label=user.auto_labeling_enabled
            )
            
            # Create summary (no body content)
            summary = EmailSummary(
                message_id=email.message_id,
                sender=email.sender,
                sender_domain=email.sender_domain,
                subject=email.subject,
                received_at=email.received_at,
                risk_level=detection.risk_level,
                risk_score=detection.risk_score,
                detection_reasons=[r.get('description', '') for r in detection.detection_reasons],
                label_applied=detection.label_to_apply if user.auto_labeling_enabled else None,
                is_read=email.is_read
            )
            results.append(summary)
            
            # Update counts
            if detection.risk_level == "high":
                phishing_count += 1
            elif detection.risk_level in ["medium", "low"]:
                suspicious_count += 1
            else:
                safe_count += 1
            
            # Store scan record (anonymized)
            scan_record = ScanHistory(
                user_id=user.id,
                message_id_hash=msg_hash,
                risk_level=detection.risk_level,
                risk_score=detection.risk_score,
                detection_reasons={
                    'types': [r.get('type') for r in detection.detection_reasons]
                },
                label_applied=detection.label_to_apply
            )
            db.add(scan_record)
            
            # Send Telegram notification for high/medium risk
            if (user.telegram_connected and 
                user.notification_enabled and
                detection.risk_level in ["high", "medium"]):
                
                if user.notification_level == "all" or \
                   (user.notification_level == "high" and detection.risk_level == "high") or \
                   (user.notification_level == "medium" and detection.risk_level in ["high", "medium"]):
                    
                    alert = AlertMessage(
                        sender=email.sender,
                        subject=email.subject,
                        risk_level=detection.risk_level,
                        risk_score=detection.risk_score,
                        reasons=detection.detection_reasons,
                        recommended_action=detection.recommended_action
                    )
                    await telegram_service.send_alert(user.telegram_chat_id, alert)
        
        # Update user stats
        user.emails_scanned += len(results)
        user.phishing_detected += phishing_count
        user.suspicious_detected += suspicious_count
        user.last_scan_at = datetime.utcnow()
        
        await db.commit()
        
        return ScanResponse(
            total_scanned=len(results),
            phishing_found=phishing_count,
            suspicious_found=suspicious_count,
            safe_found=safe_count,
            emails=results
        )
        
    except Exception as e:
        print(f"Scan error: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics for user."""
    user = await get_user_from_token(request, db)
    
    # Get recent threats
    result = await db.execute(
        select(ScanHistory)
        .where(ScanHistory.user_id == user.id)
        .where(ScanHistory.risk_level.in_(["high", "medium"]))
        .order_by(ScanHistory.scanned_at.desc())
        .limit(5)
    )
    recent_scans = result.scalars().all()
    
    # We don't have email details stored (privacy), so just show counts
    # Get recent URL scans
    url_result = await db.execute(
        select(UrlScanHistory)
        .where(UrlScanHistory.user_id == user.id)
        .order_by(UrlScanHistory.scanned_at.desc())
        .limit(5)
    )
    url_scans = url_result.scalars().all()
    
    recent_url_scans = [
        UrlScanResponse(
            url=h.url,
            risk_level=h.risk_level,
            risk_score=h.risk_score,
            reasons=h.detection_reasons.get('types', []) if h.detection_reasons else [],
            is_safe=(h.risk_level == "safe")
        ) for h in url_scans
    ]
    
    return DashboardStats(
        total_emails_scanned=user.emails_scanned,
        phishing_detected=user.phishing_detected,
        suspicious_detected=user.suspicious_detected,
        safe_emails=user.emails_scanned - user.phishing_detected - user.suspicious_detected,
        last_scan_at=user.last_scan_at,
        risk_breakdown={
            "high": user.phishing_detected,
            "medium": user.suspicious_detected,
            "safe": user.emails_scanned - user.phishing_detected - user.suspicious_detected
        },
        recent_threats=recent_threats,
        recent_url_scans=recent_url_scans
    )


@router.post("/mark-safe/{message_id}")
async def mark_email_safe(
    message_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Mark an email as safe (user override)."""
    user = await get_user_from_token(request, db)
    credentials = get_user_credentials(user)
    
    try:
        gmail = GmailService(credentials)
        success = gmail.mark_as_safe(message_id)
        
        if success:
            # Update scan history
            msg_hash = GmailService.hash_message_id(message_id)
            result = await db.execute(
                select(ScanHistory).where(ScanHistory.message_id_hash == msg_hash)
            )
            scan = result.scalar_one_or_none()
            if scan:
                scan.user_marked_safe = True
                await db.commit()
        
        return {"success": success, "message": "Email marked as safe"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report-phishing/{message_id}")
async def report_phishing(
    message_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Report an email as phishing (user feedback)."""
    user = await get_user_from_token(request, db)
    credentials = get_user_credentials(user)
    
    try:
        gmail = GmailService(credentials)
        gmail.apply_label(message_id, GmailService.LABEL_PHISHING)
        
        # Update scan history
        msg_hash = GmailService.hash_message_id(message_id)
        result = await db.execute(
            select(ScanHistory).where(ScanHistory.message_id_hash == msg_hash)
        )
        scan = result.scalar_one_or_none()
        if scan:
            scan.user_reported_phishing = True
            scan.risk_level = "high"
            await db.commit()
        
        return {"success": True, "message": "Reported as phishing"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent", response_model=List[EmailSummary])
async def get_recent_emails(
    request: Request,
    limit: int = Query(default=20, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get recently scanned emails."""
    user = await get_user_from_token(request, db)
    credentials = get_user_credentials(user)
    
    try:
        gmail = GmailService(credentials)
        emails = gmail.fetch_emails(max_results=limit, include_read=True)
        
        results: List[EmailSummary] = []
        for email in emails:
            # Quick analysis without labeling
            detection = gmail.analyze_and_label_email(email, auto_label=False)
            
            results.append(EmailSummary(
                message_id=email.message_id,
                sender=email.sender,
                sender_domain=email.sender_domain,
                subject=email.subject,
                received_at=email.received_at,
                risk_level=detection.risk_level,
                risk_score=detection.risk_score,
                detection_reasons=[r.get('description', '') for r in detection.detection_reasons],
                is_read=email.is_read
            ))
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report/pdf")
async def generate_security_report(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Generate a PDF security report."""
    user = await get_user_from_token(request, db)
    
    html_content = f"""
    <html>
    <head>
        <title>MailShield Security Report</title>
        <style>
            body {{ font-family: sans-serif; padding: 40px; color: #333; }}
            h1 {{ color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px; }}
            .stats {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }}
            .stat-card {{ background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; }}
            .stat-val {{ font-size: 24px; font-weight: bold; color: #1F2937; }}
            .stat-label {{ font-size: 14px; color: #6B7280; }}
            .footer {{ margin-top: 50px; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px; }}
        </style>
    </head>
    <body>
        <h1>MailShield Security Report</h1>
        <p>Prepared for: <strong>{user.email}</strong></p>
        <p>Date: {datetime.utcnow().strftime('%Y-%m-%d')}</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-val">{user.emails_scanned}</div>
                <div class="stat-label">Total Scanned</div>
            </div>
            <div class="stat-card">
                <div class="stat-val" style="color: #EF4444">{user.phishing_detected}</div>
                <div class="stat-label">Phishing Threats</div>
            </div>
            <div class="stat-card">
                <div class="stat-val" style="color: #F59E0B">{user.suspicious_detected}</div>
                <div class="stat-label">Suspicious Emails</div>
            </div>
        </div>
        
        <h2>Recent Activity</h2>
        <p>Your inbox is currently being monitored for threats. The following categories are scanned automatically:</p>
        <ul>
            <li>Primary Inbox</li>
            <li>Promotions</li>
            <li>Social Updates</li>
            <li>Spam Folder</li>
        </ul>
        
        <div class="footer">
            Generated by MailShield - Privacy-First Phishing Protection
        </div>
    </body>
    </html>
    """
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)


@router.get("/export")
async def export_user_data(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Export all user data (GDPR)."""
    user = await get_user_from_token(request, db)
    
    data = {
        "user_profile": {
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at.isoformat(),
            "google_id": user.google_id
        },
        "statistics": {
            "scanned": user.emails_scanned,
            "phishing": user.phishing_detected,
            "suspicious": user.suspicious_detected,
            "last_scan": user.last_scan_at.isoformat() if user.last_scan_at else None
        },
        "settings": {
            "notifications": user.notification_enabled,
            "auto_label": user.auto_labeling_enabled,
            "telegram_connected": user.telegram_connected
        }
    }
    
    return data
