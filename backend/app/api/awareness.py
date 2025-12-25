"""
Awareness API Routes
Security education content
"""

from typing import List
from fastapi import APIRouter

from app.schemas import PhishingExample, SecurityTip


router = APIRouter()


# Static educational content
PHISHING_EXAMPLES = [
    PhishingExample(
        id=1,
        title="Fake PayPal Security Alert",
        description="An email claiming your PayPal account is locked and needs immediate verification. The sender uses 'paypa1-security.com' instead of the real PayPal domain.",
        red_flags=[
            "Sender domain is 'paypa1-security.com' (note the '1' instead of 'l')",
            "Creates urgency with 'Your account will be permanently closed in 24 hours'",
            "Contains a link to a non-PayPal website",
            "Generic greeting 'Dear Customer' instead of your name"
        ],
        category="impersonation",
        difficulty="easy"
    ),
    PhishingExample(
        id=2,
        title="Microsoft Account Recovery Scam",
        description="Email pretending to be from Microsoft claiming someone tried to reset your password. Links to a fake Microsoft login page.",
        red_flags=[
            "Sender is 'security@microsoft-verify.net' - not a real Microsoft domain",
            "Asks you to click a link to 'secure your account'",
            "The link URL doesn't go to microsoft.com",
            "SPF/DKIM authentication failed"
        ],
        category="impersonation",
        difficulty="medium"
    ),
    PhishingExample(
        id=3,
        title="Fake Invoice with Attachment",
        description="Email claiming to be an invoice from a known company, with a ZIP file attachment that contains malware.",
        red_flags=[
            "Unexpected invoice you don't recognize",
            "Attachment is a .zip file (can contain malware)",
            "Sender email doesn't match the company claimed",
            "Generic subject like 'Invoice #123456'"
        ],
        category="attachment",
        difficulty="medium"
    ),
    PhishingExample(
        id=4,
        title="CEO Fraud / Business Email Compromise",
        description="Email appearing to be from your CEO asking for an urgent wire transfer. The sender's email is spoofed or uses a lookalike domain.",
        red_flags=[
            "Unusual request from an executive",
            "Urgency and secrecy requested",
            "Reply-To address differs from sender",
            "Request bypasses normal procedures"
        ],
        category="urgency",
        difficulty="hard"
    ),
    PhishingExample(
        id=5,
        title="Package Delivery Notification Scam",
        description="Fake FedEx/UPS/USPS notification claiming you have a package waiting. Links to a phishing site or requests payment.",
        red_flags=[
            "You weren't expecting a package",
            "Link uses URL shortener",
            "Asks for payment for 'delivery fees'",
            "Sender domain is not the official carrier domain"
        ],
        category="link",
        difficulty="easy"
    ),
    PhishingExample(
        id=6,
        title="Tax Refund Phishing",
        description="Email claiming you're owed a tax refund and need to provide bank details. Often appears during tax season.",
        red_flags=[
            "IRS/tax authority never contacts by email first",
            "Asks for bank account details",
            "Creates urgency about claiming refund",
            "Contains suspicious links"
        ],
        category="urgency",
        difficulty="medium"
    )
]

SECURITY_TIPS = [
    SecurityTip(
        id=1,
        title="Always Verify the Sender",
        content="Before clicking any link or downloading attachments, check the sender's email address carefully. Look for misspellings or unusual domains. When in doubt, contact the company directly through their official website.",
        category="verification",
        published_at="2024-01-01T00:00:00Z"
    ),
    SecurityTip(
        id=2,
        title="Hover Before You Click",
        content="Always hover over links to see the actual URL before clicking. If the displayed link text says 'paypal.com' but the actual URL goes somewhere else, it's likely a phishing attempt.",
        category="links",
        published_at="2024-01-08T00:00:00Z"
    ),
    SecurityTip(
        id=3,
        title="Be Wary of Urgency",
        content="Phishing emails often create a sense of urgency ('Act now!', 'Your account will be closed!'). Legitimate companies rarely use such threatening language. Take your time to verify before acting.",
        category="psychology",
        published_at="2024-01-15T00:00:00Z"
    ),
    SecurityTip(
        id=4,
        title="Enable Two-Factor Authentication",
        content="Even if a phisher gets your password, 2FA adds an extra layer of protection. Enable it on all important accounts, especially email, banking, and social media.",
        category="security",
        published_at="2024-01-22T00:00:00Z"
    ),
    SecurityTip(
        id=5,
        title="Don't Download Unexpected Attachments",
        content="Be extremely cautious with email attachments, especially ZIP files, executables (.exe), or Office documents with macros. If you weren't expecting a file, verify with the sender first.",
        category="attachments",
        published_at="2024-01-29T00:00:00Z"
    ),
    SecurityTip(
        id=6,
        title="Check for HTTPS",
        content="When entering sensitive information, ensure the website uses HTTPS (look for the padlock icon). However, remember that phishing sites can also use HTTPS - it's necessary but not sufficient proof of legitimacy.",
        category="links",
        published_at="2024-02-05T00:00:00Z"
    ),
    SecurityTip(
        id=7,
        title="Verify Payment Requests",
        content="If you receive an email requesting payment or bank transfer, always verify through a different channel (phone call to known number). Never use contact information provided in the suspicious email.",
        category="verification",
        published_at="2024-02-12T00:00:00Z"
    ),
    SecurityTip(
        id=8,
        title="Keep Software Updated",
        content="Regularly update your email client, browser, and operating system. Updates often include security patches that protect against known vulnerabilities that phishers might exploit.",
        category="security",
        published_at="2024-02-19T00:00:00Z"
    )
]


@router.get("/phishing-examples", response_model=List[PhishingExample])
async def get_phishing_examples():
    """Get common phishing examples for education."""
    return PHISHING_EXAMPLES


@router.get("/security-tips", response_model=List[SecurityTip])
async def get_security_tips():
    """Get weekly security tips."""
    return SECURITY_TIPS


@router.get("/quiz")
async def get_quiz():
    """Get a quiz to test phishing awareness."""
    return {
        "title": "Can You Spot the Phish?",
        "questions": [
            {
                "id": 1,
                "question": "An email from 'support@amaz0n-security.com' asks you to verify your account. Is this suspicious?",
                "options": ["Yes, it's suspicious", "No, it's legitimate"],
                "correct": 0,
                "explanation": "The domain 'amaz0n-security.com' is not Amazon's official domain. Notice the '0' instead of 'o' - a common phishing tactic."
            },
            {
                "id": 2,
                "question": "Your bank emails you saying 'Your account will be closed in 24 hours unless you click here.' What should you do?",
                "options": [
                    "Click the link immediately to save your account",
                    "Call your bank directly using the number on their official website"
                ],
                "correct": 1,
                "explanation": "Never click links in urgent emails. Always verify by contacting the organization through official channels."
            },
            {
                "id": 3,
                "question": "An email from your CEO asks you to urgently wire $50,000 to a new vendor. The email says to keep it confidential. What's the red flag?",
                "options": [
                    "CEOs often send such emails",
                    "Urgency + secrecy + unusual request = classic CEO fraud"
                ],
                "correct": 1,
                "explanation": "This is a classic Business Email Compromise (BEC) attack. Always verify unusual requests through a different channel."
            },
            {
                "id": 4,
                "question": "You receive an invoice attachment in .zip format from an unknown sender. Should you open it?",
                "options": [
                    "Yes, invoices are normal business emails",
                    "No, ZIP files from unknown senders can contain malware"
                ],
                "correct": 1,
                "explanation": "ZIP files can contain malware that antivirus might not catch. Never open attachments from unknown or unexpected senders."
            }
        ]
    }


@router.get("/how-to-spot-phishing")
async def get_guide():
    """Get comprehensive guide on spotting phishing emails."""
    return {
        "title": "How to Spot Phishing Emails",
        "sections": [
            {
                "title": "Check the Sender",
                "content": "Look carefully at the sender's email address. Phishers often use domains that look similar to legitimate ones (e.g., 'paypa1.com' instead of 'paypal.com').",
                "examples": [
                    "✅ support@paypal.com",
                    "❌ support@paypa1.com",
                    "❌ paypal-security@gmail.com"
                ]
            },
            {
                "title": "Look for Urgency",
                "content": "Phishing emails often create a false sense of urgency to make you act without thinking. Phrases like 'Act now', 'Immediate action required', or 'Your account will be closed' are red flags.",
                "examples": [
                    "❌ 'Your account will be suspended in 24 hours!'",
                    "❌ 'Immediate action required - verify now!'",
                    "✅ 'Please review your statement at your convenience'"
                ]
            },
            {
                "title": "Inspect Links",
                "content": "Hover over links to see where they actually go. If the displayed text says 'www.paypal.com' but the actual URL points elsewhere, it's a phishing attempt.",
                "examples": [
                    "✅ Link text and URL both go to official domain",
                    "❌ Link says 'Click here to verify' but goes to suspicious domain",
                    "❌ Uses URL shorteners like bit.ly"
                ]
            },
            {
                "title": "Beware of Attachments",
                "content": "Be extremely cautious with email attachments, especially from unknown senders. Dangerous file types include .exe, .zip, .scr, and Office files with macros.",
                "examples": [
                    "❌ Invoice.zip (can contain malware)",
                    "❌ Document.exe (executable files are dangerous)",
                    "❌ Report.docm (m = macros enabled)"
                ]
            },
            {
                "title": "Check for Generic Greetings",
                "content": "Legitimate companies usually address you by name. Generic greetings like 'Dear Customer' or 'Dear User' can indicate a phishing attempt.",
                "examples": [
                    "✅ 'Dear John Smith,'",
                    "❌ 'Dear Valued Customer,'",
                    "❌ 'Dear User,'"
                ]
            }
        ]
    }
