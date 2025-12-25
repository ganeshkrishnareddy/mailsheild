"""
Admin API Routes
Admin dashboard and detection rule management
"""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models import User, ScanHistory, DetectionRule
from app.schemas import AdminStats, DetectionRuleCreate, DetectionRuleResponse
from app.api.auth import get_user_from_token


router = APIRouter()


async def verify_admin(request: Request, db: AsyncSession) -> User:
    """Verify user is admin (for demo, first user is admin)."""
    user = await get_user_from_token(request, db)
    
    # For demo purposes, user with id=1 is admin
    # In production, add an is_admin field to User
    if user.id != 1:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return user


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard statistics."""
    await verify_admin(request, db)
    
    # Total users
    total_users_result = await db.execute(func.count(User.id))
    total_users = total_users_result.scalar() or 0
    
    # Active users today
    today = datetime.utcnow().date()
    active_today_result = await db.execute(
        select(func.count(User.id))
        .where(User.last_scan_at >= datetime.combine(today, datetime.min.time()))
    )
    active_today = active_today_result.scalar() or 0
    
    # Total scans
    total_scans_result = await db.execute(func.count(ScanHistory.id))
    total_scans = total_scans_result.scalar() or 0
    
    # Total phishing detected
    phishing_result = await db.execute(
        select(func.count(ScanHistory.id))
        .where(ScanHistory.risk_level == "high")
    )
    total_phishing = phishing_result.scalar() or 0
    
    # Calculate accuracy from user feedback
    user_marked_safe_result = await db.execute(
        select(func.count(ScanHistory.id))
        .where(ScanHistory.user_marked_safe == True)
        .where(ScanHistory.risk_level.in_(["high", "medium"]))
    )
    false_positives = user_marked_safe_result.scalar() or 0
    
    total_flagged_result = await db.execute(
        select(func.count(ScanHistory.id))
        .where(ScanHistory.risk_level.in_(["high", "medium"]))
    )
    total_flagged = total_flagged_result.scalar() or 0
    
    accuracy = 1.0 - (false_positives / total_flagged if total_flagged > 0 else 0)
    fp_rate = false_positives / total_flagged if total_flagged > 0 else 0
    
    return AdminStats(
        total_users=total_users,
        active_users_today=active_today,
        total_scans=total_scans,
        total_phishing_detected=total_phishing,
        detection_accuracy=round(accuracy * 100, 2),
        false_positive_rate=round(fp_rate * 100, 2)
    )


@router.get("/rules", response_model=List[DetectionRuleResponse])
async def list_detection_rules(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """List all detection rules."""
    await verify_admin(request, db)
    
    result = await db.execute(
        select(DetectionRule).order_by(DetectionRule.created_at.desc())
    )
    rules = result.scalars().all()
    
    return rules


@router.post("/rules", response_model=DetectionRuleResponse)
async def create_detection_rule(
    rule: DetectionRuleCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Create a new detection rule."""
    await verify_admin(request, db)
    
    new_rule = DetectionRule(
        name=rule.name,
        description=rule.description,
        rule_type=rule.rule_type,
        pattern=rule.pattern,
        risk_weight=rule.risk_weight,
        is_active=True
    )
    
    db.add(new_rule)
    await db.commit()
    await db.refresh(new_rule)
    
    return new_rule


@router.put("/rules/{rule_id}")
async def update_detection_rule(
    rule_id: int,
    rule: DetectionRuleCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Update a detection rule."""
    await verify_admin(request, db)
    
    result = await db.execute(
        select(DetectionRule).where(DetectionRule.id == rule_id)
    )
    existing = result.scalar_one_or_none()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    existing.name = rule.name
    existing.description = rule.description
    existing.rule_type = rule.rule_type
    existing.pattern = rule.pattern
    existing.risk_weight = rule.risk_weight
    existing.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {"success": True, "message": "Rule updated"}


@router.delete("/rules/{rule_id}")
async def delete_detection_rule(
    rule_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Delete a detection rule."""
    await verify_admin(request, db)
    
    result = await db.execute(
        select(DetectionRule).where(DetectionRule.id == rule_id)
    )
    rule = result.scalar_one_or_none()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    await db.delete(rule)
    await db.commit()
    
    return {"success": True, "message": "Rule deleted"}


@router.post("/rules/{rule_id}/toggle")
async def toggle_rule(
    rule_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Toggle a detection rule on/off."""
    await verify_admin(request, db)
    
    result = await db.execute(
        select(DetectionRule).where(DetectionRule.id == rule_id)
    )
    rule = result.scalar_one_or_none()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule.is_active = not rule.is_active
    await db.commit()
    
    return {
        "success": True,
        "is_active": rule.is_active,
        "message": f"Rule {'enabled' if rule.is_active else 'disabled'}"
    }
