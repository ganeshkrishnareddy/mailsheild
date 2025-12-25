"""
Telegram Bot Polling Service
Listens for user messages (verification codes)
"""

import asyncio
from typing import Optional
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from sqlalchemy import select

from app.core.config import settings
from app.services.telegram_service import telegram_service
from app.core.database import async_session_maker
from app.models import User


class TelegramPollingService:
    """Service to poll Telegram for updates."""
    
    def __init__(self):
        self.app: Optional[Application] = None
        self.running = False
        self.task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start polling."""
        if self.running or not settings.TELEGRAM_BOT_TOKEN:
            return
            
        print("🤖 Starting Telegram Bot polling...")
        
        # Build application
        self.app = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()
        self.app.add_handler(CommandHandler("start", self._start_command))
        self.app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self._handle_message))
        
        self.running = True
        await self.app.initialize()
        await self.app.start()
        
        # Use a background task for polling updates manually to avoid conflicts
        self.task = asyncio.create_task(self._poll_updates())

    async def _poll_updates(self):
        """Manual update polling to be safe."""
        try:
            print("✅ Telegram Polling Active")
            # Clear existing webhook to force polling
            await self.app.bot.delete_webhook(drop_pending_updates=True)
            
            await self.app.updater.start_polling()
            while self.running:
                await asyncio.sleep(1)
        except Exception as e:
            print(f"❌ Polling error: {e}")
        finally:
            if self.app.updater.running:
                await self.app.updater.stop()

    async def stop(self):
        """Stop polling."""
        self.running = False
        if self.app:
            await self.app.stop()
            await self.app.shutdown()

    async def _start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command."""
        user = update.effective_user
        await update.message.reply_text(
            f"👋 Hi {user.first_name}!\n\n"
            "To connect your MailShield account, please send the **Verification Code** shown in your Settings page."
        )

    async def _handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle verification codes."""
        text = update.message.text.strip().upper()
        chat_id = str(update.effective_chat.id)
        
        # Check if it's a verification code
        user_id = telegram_service.verify_code(text)
        
        if user_id:
            # Code is valid, link user
            async with async_session_maker() as db:
                result = await db.execute(select(User).where(User.id == int(user_id)))
                user = result.scalar_one_or_none()
                
                if user:
                    user.telegram_connected = True
                    user.telegram_chat_id = chat_id
                    await db.commit()
                    
                    await update.message.reply_text(
                        "✅ **Successfully Connected!**\n\n"
                        "You will now receive alerts here for any detected phishing threats."
                    , parse_mode='Markdown')
                    
                    # Send welcome info
                    await telegram_service.send_welcome_message(chat_id)
                else:
                    await update.message.reply_text("❌ Error: User not found.")
        else:
            await update.message.reply_text(
                "❓ Unknown code. Please checks the code in your MailShield Settings page."
            )

# Singleton
bot_polling = TelegramPollingService()
