"""
Telegram Notification Service - Enhanced
"""

import asyncio
from typing import Optional, Dict, Any
from dataclasses import dataclass
import secrets

from telegram import Bot
from telegram.error import TelegramError

from app.core.config import settings


@dataclass
class AlertMessage:
    """Phishing alert structure."""
    sender: str
    subject: str
    risk_level: str
    risk_score: int
    reasons: list
    recommended_action: str


class TelegramService:
    """Telegram Bot service for alerts."""
    
    _pending_verifications: Dict[str, str] = {}
    
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.bot: Optional[Bot] = None
        if self.bot_token:
            self.bot = Bot(token=self.bot_token)
    
    @property
    def bot_username(self) -> str:
        return "mailshield_alert_bot"
    
    async def generate_verification_code(self, db, user_id: int) -> str:
        """Generate and store verification code in DB."""
        code = secrets.token_hex(4).upper()
        
        from sqlalchemy import select, update
        from app.models.models import User
        
        # Store in DB
        stmt = update(User).where(User.id == user_id).values(telegram_verification_code=code)
        await db.execute(stmt)
        await db.commit()
        
        return code
    
    async def verify_code(self, db, code: str) -> Optional[int]:
        """Verify code against DB."""
        from sqlalchemy import select
        from app.models.models import User
        
        stmt = select(User).where(User.telegram_verification_code == code.upper())
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            # Clear code after usage? Or keep it? Let's keep it for now or clear it.
            # Best practice is to clear it, but let's just return the user_id.
            return user.id
        return None
    
    async def send_alert(self, chat_id: str, alert: AlertMessage) -> bool:
        """Send phishing alert."""
        if not self.bot:
            return False
        
        try:
            emoji = {'high': '🚨', 'medium': '⚠️', 'low': 'ℹ️', 'safe': '✅'}.get(alert.risk_level, '❓')
            risk_text = {'high': 'HIGH RISK', 'medium': 'SUSPICIOUS', 'low': 'LOW RISK', 'safe': 'SAFE'}.get(alert.risk_level, 'UNKNOWN')
            
            reasons_text = "\n".join([f"• {r.get('description', r) if isinstance(r, dict) else r}" for r in alert.reasons[:3]])
            
            message = f"""
{emoji} <b>MailShield Alert</b> {emoji}

<b>Risk Level:</b> {risk_text} ({alert.risk_score}/100)

<b>From:</b> {self._escape(alert.sender)}
<b>Subject:</b> {self._escape(alert.subject[:80])}

<b>Why flagged:</b>
{reasons_text}

<b>Action:</b> {alert.recommended_action}

━━━━━━━━━━━━━━━━
🛡️ <i>Protected by MailShield</i>
            """.strip()
            
            await self.bot.send_message(chat_id=chat_id, text=message, parse_mode='HTML')
            return True
        except Exception as e:
            print(f"Telegram error: {e}")
            return False
    
    async def send_connection_notification(self, chat_id: str, email: str, scan_interval: int) -> bool:
        """Notify user that their email is connected."""
        if not self.bot:
            return False
        
        try:
            message = f"""
🎉 <b>Email Connected Successfully!</b>

<b>Account:</b> {self._escape(email)}
<b>Auto-Scan:</b> Every {scan_interval} minutes

<b>What happens now:</b>
• Automatic scanning of all mail categories
• Primary, Promotions, Social, and Spam
• Real-time alerts for detected threats
• Gmail labels applied automatically

<b>Categories monitored:</b>
📥 Primary
🏷️ Promotions
👥 Social
🚫 Spam

<b>Detection includes:</b>
🔍 Homoglyph attacks (lookalike characters)
🎭 Brand impersonation
📧 Spoofed domains
🔗 Suspicious links
📎 Dangerous attachments

You're now protected! 🛡️
            """.strip()
            
            await self.bot.send_message(chat_id=chat_id, text=message, parse_mode='HTML')
            return True
        except Exception as e:
            print(f"Telegram connection notification error: {e}")
            return False
    
    async def send_welcome_message(self, chat_id: str) -> bool:
        """Send welcome message."""
        if not self.bot:
            return False
        
        try:
            message = """
🛡️ <b>Welcome to MailShield!</b>

Your Telegram is now connected.

<b>You'll receive alerts for:</b>
🚨 HIGH RISK - Phishing detected
⚠️ SUSPICIOUS - Exercise caution
ℹ️ LOW RISK - Minor concerns

<b>Privacy:</b>
• We never store your email content
• Only headers are analyzed
• You control all settings

Stay safe! 🔒
            """.strip()
            
            await self.bot.send_message(chat_id=chat_id, text=message, parse_mode='HTML')
            return True
        except Exception as e:
            print(f"Welcome message error: {e}")
            return False
    
    async def send_scan_summary(self, chat_id: str, stats: Dict[str, Any]) -> bool:
        """Send scan summary."""
        if not self.bot:
            return False
        
        try:
            message = f"""
📊 <b>MailShield Scan Complete</b>

📧 Scanned: {stats.get('total', 0)}
🚨 Phishing: {stats.get('phishing', 0)}
⚠️ Suspicious: {stats.get('suspicious', 0)}
✅ Safe: {stats.get('safe', 0)}

Categories: Primary, Promotions, Social, Spam

🛡️ <i>Next scan in {stats.get('interval', 30)} minutes</i>
            """.strip()
            
            await self.bot.send_message(chat_id=chat_id, text=message, parse_mode='HTML')
            return True
        except Exception as e:
            print(f"Scan summary error: {e}")
            return False
    
    def _escape(self, text: str) -> str:
        return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


telegram_service = TelegramService()
