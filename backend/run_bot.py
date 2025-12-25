import asyncio
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from sqlalchemy import select

# Setup logs
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

from app.core.config import settings
from app.services.telegram_service import telegram_service
from app.core.database import async_session_maker
from app.models import User

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    await update.message.reply_text(
        f"👋 Hi {user.first_name}!\n\n"
        "To connect your MailShield account, please send the **Verification Code** shown in your Settings page.",
        parse_mode='Markdown'
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip().upper()
    chat_id = str(update.effective_chat.id)
    
    print(f"📩 Received code: {text} from {chat_id}")
    
    # Check verification using DB
    async with async_session_maker() as db:
        user_id = await telegram_service.verify_code(db, text)
        
        if user_id:
            # We need to fetch the user again to update fields attached to this session
            result = await db.execute(select(User).where(User.id == int(user_id)))
            user = result.scalar_one_or_none()
            
            if user:
                user.telegram_connected = True
                user.telegram_chat_id = chat_id
                # user.telegram_verification_code = None # Optional: Clear code
                await db.commit()
                
                await update.message.reply_text(
                    "✅ **Successfully Connected!**\n\n"
                    "You will now receive alerts here for any detected phishing threats.",
                    parse_mode='Markdown'
                )
                
                # Assign bot instance to service so it can send alerts
                telegram_service.bot = context.bot
                await telegram_service.send_welcome_message(chat_id)
            else:
                await update.message.reply_text("❌ Error: User not found.")
        else:
            await update.message.reply_text(
                "❓ Unknown verification code.\n"
                "Please check the code in your MailShield Settings page."
            )

def main():
    """Start the bot."""
    if not settings.TELEGRAM_BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN not set!")
        return

    print("🤖 Starting MailShield Telegram Bot...")
    application = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("✅ Bot is polling...")
    application.run_polling()

if __name__ == "__main__":
    main()
