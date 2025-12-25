"""
Background Scheduler for Auto-Scanning
Scans all mail categories: Primary, Promotions, Social, Spam
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import threading

from app.services.gmail_service import GmailService
from app.services.telegram_service import telegram_service, AlertMessage
from app.models import User, ScanHistory
from app.core.database import async_session_maker
from app.core.security import decrypt_token
from app.core.config import settings

from google.oauth2.credentials import Credentials
from sqlalchemy import select


class AutoScanner:
    """Background scanner for automatic email scanning."""
    
    def __init__(self):
        self.running = False
        self.scan_interval = 30 * 60  # 30 minutes default
        self.tasks: Dict[int, asyncio.Task] = {}
    
    def set_interval(self, minutes: int):
        """Set scan interval in minutes."""
        self.scan_interval = minutes * 60
    
    async def start_user_scanner(self, user_id: int):
        """Start auto-scanning for a specific user."""
        if user_id in self.tasks:
            return  # Already running
        
        task = asyncio.create_task(self._scan_loop(user_id))
        self.tasks[user_id] = task
    
    async def stop_user_scanner(self, user_id: int):
        """Stop auto-scanning for a user."""
        if user_id in self.tasks:
            self.tasks[user_id].cancel()
            del self.tasks[user_id]
    
    async def _scan_loop(self, user_id: int):
        """Continuous scanning loop for a user."""
        while True:
            try:
                await self._scan_user_emails(user_id)
                await asyncio.sleep(self.scan_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Auto-scan error for user {user_id}: {e}")
                await asyncio.sleep(60)  # Wait 1 min on error
    
    async def _scan_user_emails(self, user_id: int):
        """Scan emails for a user across all categories."""
        async with async_session_maker() as db:
            # Get user
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            
            if not user or not user.encrypted_access_token:
                return
            
            try:
                # Get credentials
                credentials = Credentials(
                    token=decrypt_token(user.encrypted_access_token),
                    refresh_token=decrypt_token(user.encrypted_refresh_token) if user.encrypted_refresh_token else None,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=settings.GOOGLE_CLIENT_ID,
                    client_secret=settings.GOOGLE_CLIENT_SECRET
                )
                
                gmail = GmailService(credentials)
                await gmail.ensure_labels_exist()
                
                # Scan all categories
                categories = [
                    'category:primary',
                    'category:promotions', 
                    'category:social',
                    'in:spam'
                ]
                
                threats_found = []
                
                for category in categories:
                    emails = gmail.fetch_emails(
                        max_results=20,
                        include_read=False,
                        query=category
                    )
                    
                    for email in emails:
                        # Check if already scanned
                        msg_hash = GmailService.hash_message_id(email.message_id)
                        existing = await db.execute(
                            select(ScanHistory).where(ScanHistory.message_id_hash == msg_hash)
                        )
                        if existing.scalar_one_or_none():
                            continue
                        
                        # Analyze
                        detection = gmail.analyze_and_label_email(
                            email,
                            auto_label=user.auto_labeling_enabled
                        )
                        
                        # Store result
                        scan_record = ScanHistory(
                            user_id=user.id,
                            message_id_hash=msg_hash,
                            risk_level=detection.risk_level,
                            risk_score=detection.risk_score,
                            detection_reasons={'types': [r.get('type') for r in detection.detection_reasons]},
                            label_applied=detection.label_to_apply
                        )
                        db.add(scan_record)
                        
                        # Track threats
                        if detection.risk_level in ['high', 'medium']:
                            threats_found.append({
                                'sender': email.sender,
                                'subject': email.subject,
                                'risk_level': detection.risk_level,
                                'risk_score': detection.risk_score,
                                'reasons': detection.detection_reasons,
                                'action': detection.recommended_action
                            })
                        
                        # Update counts
                        user.emails_scanned += 1
                        if detection.risk_level == 'high':
                            user.phishing_detected += 1
                        elif detection.risk_level in ['medium', 'low']:
                            user.suspicious_detected += 1
                
                user.last_scan_at = datetime.utcnow()
                await db.commit()
                
                # Send Telegram alerts for threats
                if threats_found and user.telegram_connected and user.notification_enabled:
                    for threat in threats_found:
                        if (user.notification_level == 'all' or 
                            (user.notification_level == 'high' and threat['risk_level'] == 'high') or
                            (user.notification_level == 'medium' and threat['risk_level'] in ['high', 'medium'])):
                            
                            alert = AlertMessage(
                                sender=threat['sender'],
                                subject=threat['subject'],
                                risk_level=threat['risk_level'],
                                risk_score=threat['risk_score'],
                                reasons=threat['reasons'],
                                recommended_action=threat['action']
                            )
                            await telegram_service.send_alert(user.telegram_chat_id, alert)
                
            except Exception as e:
                print(f"Scan error for user {user_id}: {e}")


# Singleton
auto_scanner = AutoScanner()


async def start_auto_scanning_for_user(user_id: int, interval_minutes: int = 30):
    """Start auto-scanning for a user."""
    auto_scanner.set_interval(interval_minutes)
    await auto_scanner.start_user_scanner(user_id)


async def stop_auto_scanning_for_user(user_id: int):
    """Stop auto-scanning for a user."""
    await auto_scanner.stop_user_scanner(user_id)
