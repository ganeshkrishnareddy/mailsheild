"""
Gmail Service
Handles Gmail API operations with privacy-first approach
"""

import hashlib
import base64
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build, Resource

from app.core.config import settings
from app.detection import analyze_email, DetectionResult


@dataclass
class EmailMetadata:
    """Email metadata (no body content stored)."""
    message_id: str
    thread_id: str
    sender: str
    sender_name: str
    sender_domain: str
    subject: str
    received_at: datetime
    headers: Dict[str, str]
    has_attachments: bool
    attachment_names: List[str]
    snippet: str  # Gmail's short snippet (first few words)
    is_read: bool
    labels: List[str]


class GmailService:
    """
    Gmail API service wrapper.
    Processes emails in-memory only - no content storage.
    """
    
    # Gmail label IDs (will be created if not exist)
    LABEL_PHISHING = "🚨 Phishing Alert"
    LABEL_SUSPICIOUS = "⚠ Suspicious"
    LABEL_SAFE = "✅ Verified Safe"
    LABEL_QUARANTINE = "[MailShield Quarantined]"
    
    def __init__(self, credentials: Credentials):
        """Initialize Gmail service with OAuth credentials."""
        self.service: Resource = build('gmail', 'v1', credentials=credentials)
        self._label_cache: Dict[str, str] = {}
    
    async def ensure_labels_exist(self) -> Dict[str, str]:
        """Create MailShield labels if they don't exist."""
        if self._label_cache:
            return self._label_cache
        
        labels_to_create = [
            (self.LABEL_PHISHING, "#d93025"),  # Red
            (self.LABEL_SUSPICIOUS, "#f9ab00"),  # Orange
            (self.LABEL_SAFE, "#34a853"),  # Green
            (self.LABEL_QUARANTINE, "#202124"),  # Dark
        ]
        
        # Get existing labels
        results = self.service.users().labels().list(userId='me').execute()
        existing_labels = {label['name']: label['id'] for label in results.get('labels', [])}
        
        for label_name, color in labels_to_create:
            if label_name in existing_labels:
                self._label_cache[label_name] = existing_labels[label_name]
            else:
                # Create new label
                label_body = {
                    'name': label_name,
                    'labelListVisibility': 'labelShow',
                    'messageListVisibility': 'show',
                    'color': {
                        'backgroundColor': color,
                        'textColor': '#ffffff'
                    }
                }
                try:
                    created = self.service.users().labels().create(
                        userId='me',
                        body=label_body
                    ).execute()
                    self._label_cache[label_name] = created['id']
                except Exception as e:
                    print(f"Error creating label {label_name}: {e}")
        
        return self._label_cache
    
    def fetch_emails(
        self,
        max_results: int = 50,
        include_read: bool = False,
        query: str = ""
    ) -> List[EmailMetadata]:
        """
        Fetch emails from Gmail.
        Returns metadata only - no body content.
        """
        # Build query
        q_parts = []
        if not include_read:
            q_parts.append("is:unread")
        if query:
            q_parts.append(query)
        
        final_query = " ".join(q_parts) if q_parts else None
        
        # List messages
        results = self.service.users().messages().list(
            userId='me',
            maxResults=max_results,
            q=final_query
        ).execute()
        
        messages = results.get('messages', [])
        emails = []
        
        for msg_ref in messages:
            email_data = self._get_email_metadata(msg_ref['id'])
            if email_data:
                emails.append(email_data)
        
        return emails
    
    def _get_email_metadata(self, message_id: str) -> Optional[EmailMetadata]:
        """Get email metadata (headers only, no body)."""
        try:
            # Fetch metadata only (not full)
            msg = self.service.users().messages().get(
                userId='me',
                id=message_id,
                format='metadata',
                metadataHeaders=[
                    'From', 'To', 'Subject', 'Date', 'Reply-To',
                    'Authentication-Results', 'Received-SPF',
                    'DKIM-Signature', 'Content-Type'
                ]
            ).execute()
            
            headers = {}
            for header in msg.get('payload', {}).get('headers', []):
                headers[header['name']] = header['value']
            
            # Parse sender
            sender_full = headers.get('From', '')
            sender_name, sender_email = self._parse_sender(sender_full)
            sender_domain = sender_email.split('@')[-1] if '@' in sender_email else ''
            
            # Parse date
            date_str = headers.get('Date', '')
            received_at = self._parse_date(date_str)
            
            # Check for attachments
            has_attachments, attachment_names = self._check_attachments(msg)
            
            # Get labels
            labels = msg.get('labelIds', [])
            is_read = 'UNREAD' not in labels
            
            return EmailMetadata(
                message_id=message_id,
                thread_id=msg.get('threadId', ''),
                sender=sender_email,
                sender_name=sender_name,
                sender_domain=sender_domain,
                subject=headers.get('Subject', '(No Subject)'),
                received_at=received_at,
                headers=headers,
                has_attachments=has_attachments,
                attachment_names=attachment_names,
                snippet=msg.get('snippet', ''),
                is_read=is_read,
                labels=labels
            )
            
        except Exception as e:
            print(f"Error fetching email {message_id}: {e}")
            return None
    
    def _parse_sender(self, sender_full: str) -> Tuple[str, str]:
        """Parse sender into name and email."""
        # Format: "Name <email@domain.com>" or just "email@domain.com"
        match = re.match(r'^(.+?)\s*<(.+?)>$', sender_full)
        if match:
            return match.group(1).strip('"\''), match.group(2)
        return '', sender_full
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse email date string."""
        try:
            # Try common formats
            from email.utils import parsedate_to_datetime
            return parsedate_to_datetime(date_str)
        except:
            return datetime.utcnow()
    
    def _check_attachments(self, msg: Dict) -> Tuple[bool, List[str]]:
        """Check for attachments in message."""
        attachment_names = []
        
        def check_parts(parts):
            for part in parts:
                filename = part.get('filename', '')
                if filename:
                    attachment_names.append(filename)
                if 'parts' in part:
                    check_parts(part['parts'])
        
        payload = msg.get('payload', {})
        if 'parts' in payload:
            check_parts(payload['parts'])
        
        return len(attachment_names) > 0, attachment_names
    
    def analyze_and_label_email(
        self,
        email: EmailMetadata,
        auto_label: bool = True
    ) -> DetectionResult:
        """
        Analyze email for phishing and optionally apply label.
        Processing is in-memory only.
        """
        # Extract links from snippet (privacy: we don't store body)
        links = re.findall(r'https?://\S+', email.snippet)
        
        # Run detection
        result = analyze_email(
            sender=email.sender,
            subject=email.subject,
            headers=email.headers,
            has_attachments=email.has_attachments,
            attachment_names=email.attachment_names,
            links_in_email=links
        )
        
        # Apply label if enabled
        if auto_label and result.label_to_apply:
            self.apply_label(email.message_id, result.label_to_apply)
        
        return result
    
    def apply_label(self, message_id: str, label_name: str) -> bool:
        """Apply a label to an email."""
        try:
            label_id = self._label_cache.get(label_name)
            if not label_id:
                # Ensure labels exist
                import asyncio
                asyncio.get_event_loop().run_until_complete(self.ensure_labels_exist())
                label_id = self._label_cache.get(label_name)
            
            if label_id:
                self.service.users().messages().modify(
                    userId='me',
                    id=message_id,
                    body={'addLabelIds': [label_id]}
                ).execute()
                return True
        except Exception as e:
            print(f"Error applying label: {e}")
        return False
    
    def remove_label(self, message_id: str, label_name: str) -> bool:
        """Remove a label from an email."""
        try:
            label_id = self._label_cache.get(label_name)
            if not label_id:
                # If it's a system label like INBOX, use the name directly
                label_id = label_name
            
            if label_id:
                self.service.users().messages().modify(
                    userId='me',
                    id=message_id,
                    body={'removeLabelIds': [label_id]}
                ).execute()
                return True
        except Exception as e:
            print(f"Error removing label {label_name}: {e}")
        return False

    def quarantine_email(self, message_id: str) -> bool:
        """Quarantine email (add quarantine label, remove from INBOX)."""
        try:
            # Add quarantine label
            self.apply_label(message_id, self.LABEL_QUARANTINE)
            # Remove from INBOX
            self.remove_label(message_id, 'INBOX')
            return True
        except Exception as e:
            print(f"Error quarantining email: {e}")
            return False
    
    def mark_as_safe(self, message_id: str) -> bool:
        """Mark email as safe (remove threat labels, add safe label)."""
        try:
            # Remove threat labels
            for label in [self.LABEL_PHISHING, self.LABEL_SUSPICIOUS]:
                self.remove_label(message_id, label)
            # Add safe label
            return self.apply_label(message_id, self.LABEL_SAFE)
        except Exception as e:
            print(f"Error marking as safe: {e}")
            return False
    
    def get_user_profile(self) -> Dict[str, Any]:
        """Get user's Gmail profile."""
        try:
            profile = self.service.users().getProfile(userId='me').execute()
            return profile
        except Exception as e:
            print(f"Error getting profile: {e}")
            return {}
    
    @staticmethod
    def hash_message_id(message_id: str) -> str:
        """Hash message ID for privacy-safe storage."""
        return hashlib.sha256(message_id.encode()).hexdigest()
