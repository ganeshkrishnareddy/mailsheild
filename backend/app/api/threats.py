from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_user_from_token
from app.schemas import UrlScanRequest, UrlScanResponse
from app.models.models import UrlScanHistory
from app.detection import detection_engine
import tldextract

router = APIRouter()

@router.post("/scan-url", response_model=UrlScanResponse)
async def scan_url(
    scan_request: UrlScanRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Scan a URL for phishing threats."""
    user = None
    try:
        user = await get_user_from_token(request, db)
    except:
        # Allow anonymous scans for the extension if not logged in? 
        # For now, let's just make it anonymous-friendly but trace if possible
        pass
    
    url = scan_request.url
    extracted = tldextract.extract(url)
    domain = f"{extracted.domain}.{extracted.suffix}"
    
    # 1. Homoglyph detection
    is_homo, homo_reason = detection_engine.detect_homoglyph_attack(domain)
    
    # 2. Typosquatting
    is_typo, typo_reason = detection_engine.check_typosquatting(domain)
    
    # 3. IDN
    is_idn, idn_reason = detection_engine.detect_idn_homograph(domain)
    
    reasons = []
    score = 0
    
    if is_homo:
        reasons.append(homo_reason)
        score += 35
    if is_typo:
        reasons.append(typo_reason)
        score += 25
    if is_idn:
        reasons.append(idn_reason)
        score += 30
        
    # Cap score
    score = min(score, 100)
    
    risk_level = "safe"
    if score >= 50:
        risk_level = "high"
    elif score >= 25:
        risk_level = "medium"
    elif score >= 10:
        risk_level = "low"
        
    # Store in history
    scan_record = UrlScanHistory(
        user_id=user.id if user else None,
        url=url,
        domain=domain,
        risk_score=score,
        risk_level=risk_level,
        detection_reasons={'types': reasons}
    )
    db.add(scan_record)
    await db.commit()
    
    return UrlScanResponse(
        url=url,
        risk_level=risk_level,
        risk_score=score,
        reasons=reasons,
        is_safe=(risk_level == "safe")
    )

@router.get("/recent-urls", response_model=List[UrlScanResponse])
async def get_recent_urls(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get recent URL scans for the dashboard."""
    user = await get_user_from_token(request, db)
    
    from sqlalchemy import select
    result = await db.execute(
        select(UrlScanHistory)
        .where(UrlScanHistory.user_id == user.id)
        .order_by(UrlScanHistory.scanned_at.desc())
        .limit(10)
    )
    histories = result.scalars().all()
    
    return [
        UrlScanResponse(
            url=h.url,
            risk_level=h.risk_level,
            risk_score=h.risk_score,
            reasons=h.detection_reasons.get('types', []) if h.detection_reasons else [],
            is_safe=(h.risk_level == "safe")
        ) for h in histories
    ]
