"""
MailShield Enhanced Phishing Detection Engine
Includes: Homoglyph attacks, IDN attacks, advanced pattern detection
"""

import re
import hashlib
import unicodedata
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from urllib.parse import urlparse
import tldextract


@dataclass
class DetectionResult:
    """Result of phishing detection analysis."""
    risk_score: int
    risk_level: str
    detection_reasons: List[Dict[str, Any]]
    human_readable: str
    recommended_action: str
    label_to_apply: str


class PhishingDetectionEngine:
    """Enhanced phishing detection with homoglyph and advanced attack detection."""
    
    # Homoglyph mappings - characters that look similar
    HOMOGLYPHS = {
        'a': ['а', 'ą', 'ä', 'à', 'á', 'â', 'ã', 'å', 'ā', 'ă', 'ȧ', 'ǎ', 'ạ', 'α', '@'],
        'b': ['ḃ', 'ḅ', 'ḇ', 'Ƅ', 'ƅ', 'ɓ', 'β'],
        'c': ['ç', 'ć', 'ĉ', 'ċ', 'č', 'с', 'ƈ', '¢'],
        'd': ['ḋ', 'ḍ', 'ḏ', 'ḑ', 'ḓ', 'đ', 'ɗ', 'ð'],
        'e': ['е', 'ё', 'ę', 'ë', 'è', 'é', 'ê', 'ē', 'ĕ', 'ė', 'ě', 'ẹ', 'ε', '3'],
        'g': ['ġ', 'ǵ', 'ğ', 'ĝ', 'ģ', 'ǧ', 'ɠ', '9'],
        'h': ['ḣ', 'ḥ', 'ḧ', 'ḩ', 'ḫ', 'ĥ', 'ħ', 'ɦ'],
        'i': ['і', 'ı', 'ì', 'í', 'î', 'ï', 'ĩ', 'ī', 'ĭ', 'į', 'ǐ', 'ị', '1', 'l', '|'],
        'j': ['ĵ', 'ǰ', 'ɉ', 'ʝ'],
        'k': ['ķ', 'ḱ', 'ḳ', 'ḵ', 'ƙ', 'ǩ'],
        'l': ['ł', 'ĺ', 'ļ', 'ľ', 'ḷ', 'ḹ', 'ḻ', 'ḽ', '1', 'I', '|'],
        'm': ['ṁ', 'ṃ', 'ḿ', 'ɱ', 'rn'],
        'n': ['ń', 'ņ', 'ň', 'ṅ', 'ṇ', 'ṉ', 'ṋ', 'ñ', 'ŋ', 'ɲ'],
        'o': ['о', 'ö', 'ò', 'ó', 'ô', 'õ', 'ō', 'ŏ', 'ȯ', 'ǒ', 'ọ', 'ơ', '0', 'θ'],
        'p': ['ṕ', 'ṗ', 'ρ', 'þ'],
        'r': ['ŕ', 'ŗ', 'ř', 'ṙ', 'ṛ', 'ṝ', 'ṟ', 'г'],
        's': ['ś', 'ŝ', 'ş', 'š', 'ṡ', 'ṣ', 'ș', '$', '5'],
        't': ['ţ', 'ť', 'ṫ', 'ṭ', 'ṯ', 'ṱ', 'ț', 'ŧ', '+', '7'],
        'u': ['ù', 'ú', 'û', 'ü', 'ũ', 'ū', 'ŭ', 'ů', 'ű', 'ų', 'ǔ', 'ụ', 'ư', 'μ'],
        'v': ['ṽ', 'ṿ', 'ν', 'υ'],
        'w': ['ŵ', 'ẁ', 'ẃ', 'ẅ', 'ẇ', 'ẉ', 'ω'],
        'x': ['ẋ', 'ẍ', 'χ', '×'],
        'y': ['ý', 'ÿ', 'ŷ', 'ẏ', 'ỳ', 'ỵ', 'ỷ', 'ỹ', 'γ', 'ү'],
        'z': ['ź', 'ż', 'ž', 'ẑ', 'ẓ', 'ẕ', 'ζ'],
    }
    
    # Reverse mapping for detection
    HOMOGLYPH_TO_ASCII = {}
    for ascii_char, homoglyphs in HOMOGLYPHS.items():
        for h in homoglyphs:
            HOMOGLYPH_TO_ASCII[h] = ascii_char
    
    # Urgent language patterns
    URGENT_PATTERNS = [
        r'\b(urgent|immediately|suspended|locked|verify now|confirm now)\b',
        r'\b(account.*(suspend|terminat|clos|lock))',
        r'\b(action required|immediate action|respond immediately)\b',
        r'\b(your account (has been|will be|is) (suspended|locked|closed))\b',
        r'\b(within \d+ hours?|expires? (today|soon|immediately))\b',
        r'\b(unauthorized|unusual|suspicious) (activity|access|login)\b',
        r'\b(click (here|below|now) to (verify|confirm|secure))\b',
        r'\b(failure to (verify|confirm|respond).*result in)\b',
        r'\b(last warning|final notice|urgent notice)\b',
        r'\b(security alert|security warning|account compromised)\b',
    ]
    
    # Known brand domains
    LEGITIMATE_DOMAINS = {
        'paypal': ['paypal.com', 'paypal.me'],
        'amazon': ['amazon.com', 'amazon.co.uk', 'amazon.in', 'amazonaws.com'],
        'apple': ['apple.com', 'icloud.com'],
        'microsoft': ['microsoft.com', 'outlook.com', 'live.com', 'hotmail.com', 'office.com'],
        'google': ['google.com', 'gmail.com', 'googlemail.com', 'youtube.com'],
        'netflix': ['netflix.com'],
        'facebook': ['facebook.com', 'fb.com', 'meta.com'],
        'instagram': ['instagram.com'],
        'linkedin': ['linkedin.com'],
        'twitter': ['twitter.com', 'x.com'],
        'dropbox': ['dropbox.com'],
        'spotify': ['spotify.com'],
        'bank of america': ['bankofamerica.com'],
        'chase': ['chase.com'],
        'wells fargo': ['wellsfargo.com'],
        'payoneer': ['payoneer.com'],
    }
    
    # URL shorteners
    URL_SHORTENERS = [
        'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd',
        'buff.ly', 'adf.ly', 'j.mp', 'tr.im', 'cli.gs', 'short.to',
        'v.gd', 'tiny.cc', 'bc.vc', 'cutt.ly', 'rb.gy', 'shorturl.at'
    ]
    
    # Dangerous file extensions
    DANGEROUS_EXTENSIONS = [
        '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.js',
        '.jar', '.msi', '.dll', '.ps1', '.hta', '.iso', '.img', '.vbe',
        '.wsf', '.wsh', '.msc', '.cpl', '.reg', '.inf', '.scf', '.lnk'
    ]
    
    COMPRESSED_EXTENSIONS = ['.zip', '.rar', '.7z', '.tar', '.gz', '.cab', '.arj']

    def __init__(self):
        self.urgent_regex = [re.compile(p, re.IGNORECASE) for p in self.URGENT_PATTERNS]
    
    def normalize_homoglyphs(self, text: str) -> str:
        """Convert homoglyphs to ASCII equivalents."""
        result = []
        for char in text.lower():
            if char in self.HOMOGLYPH_TO_ASCII:
                result.append(self.HOMOGLYPH_TO_ASCII[char])
            else:
                result.append(char)
        return ''.join(result)
    
    def detect_homoglyph_attack(self, domain: str) -> Tuple[bool, str]:
        """Detect if domain uses homoglyph characters."""
        original = domain.lower()
        normalized = self.normalize_homoglyphs(original)
        
        # Check if normalization changed anything
        if original != normalized:
            # Check if normalized version matches a known brand
            for brand, legit_domains in self.LEGITIMATE_DOMAINS.items():
                for legit in legit_domains:
                    if normalized == legit or brand.replace(' ', '') in normalized:
                        return True, f"Domain uses lookalike characters to impersonate {brand}"
            return True, "Domain contains suspicious Unicode characters"
        return False, ""
    
    def detect_idn_homograph(self, domain: str) -> Tuple[bool, str]:
        """Detect IDN homograph attacks (Punycode domains)."""
        if domain.startswith('xn--'):
            # It's a Punycode domain
            try:
                decoded = domain.encode('ascii').decode('idna')
                if decoded != domain:
                    return True, f"Punycode domain detected: {domain} decodes to {decoded}"
            except:
                pass
        return False, ""
    
    def check_typosquatting(self, domain: str) -> Tuple[bool, str]:
        """Detect typosquatting attacks."""
        domain_lower = domain.lower()
        
        for brand, legit_domains in self.LEGITIMATE_DOMAINS.items():
            brand_clean = brand.replace(' ', '')
            
            for legit in legit_domains:
                legit_name = legit.split('.')[0]
                
                # Check common typosquatting patterns
                typo_patterns = [
                    legit_name + 's',  # paypal -> paypals
                    legit_name[:-1],   # paypal -> paypa
                    legit_name + 'l',  # paypal -> paypall
                    legit_name.replace('l', '1'),
                    legit_name.replace('o', '0'),
                    legit_name.replace('i', '1'),
                    legit_name + '-security',
                    legit_name + '-support',
                    legit_name + '-verify',
                    legit_name + '-login',
                    'secure-' + legit_name,
                    'login-' + legit_name,
                ]
                
                domain_name = domain_lower.split('.')[0]
                if domain_name in typo_patterns and domain_lower not in legit_domains:
                    return True, f"Possible typosquatting of {brand}"
        
        return False, ""
    
    def analyze_email(
        self,
        sender: str,
        subject: str,
        headers: Dict[str, str],
        has_attachments: bool = False,
        attachment_names: List[str] = None,
        links_in_email: List[str] = None
    ) -> DetectionResult:
        """Analyze email for phishing with enhanced detection."""
        detection_reasons = []
        total_score = 0
        
        sender_domain = self._extract_domain(sender)
        
        # 1. Homoglyph attack detection
        is_homoglyph, homoglyph_reason = self.detect_homoglyph_attack(sender_domain)
        if is_homoglyph:
            total_score += 35
            detection_reasons.append({
                'type': 'homoglyph_attack',
                'severity': 'critical',
                'description': homoglyph_reason
            })
        
        # 2. IDN Homograph detection
        is_idn, idn_reason = self.detect_idn_homograph(sender_domain)
        if is_idn:
            total_score += 30
            detection_reasons.append({
                'type': 'idn_homograph',
                'severity': 'critical',
                'description': idn_reason
            })
        
        # 3. Typosquatting detection
        is_typo, typo_reason = self.check_typosquatting(sender_domain)
        if is_typo:
            total_score += 25
            detection_reasons.append({
                'type': 'typosquatting',
                'severity': 'high',
                'description': typo_reason
            })
        
        # 4. Urgent language
        for regex in self.urgent_regex:
            if regex.search(subject):
                total_score += 15
                detection_reasons.append({
                    'type': 'urgent_language',
                    'severity': 'high',
                    'description': 'Subject contains urgent or threatening language'
                })
                break
        
        # 5. Brand impersonation
        imp_score, imp_reasons = self._check_brand_impersonation(sender, sender_domain, subject)
        total_score += imp_score
        detection_reasons.extend(imp_reasons)
        
        # 6. Authentication headers
        auth_score, auth_reasons = self._check_authentication(headers)
        total_score += auth_score
        detection_reasons.extend(auth_reasons)
        
        # 7. Attachments
        if attachment_names:
            attach_score, attach_reasons = self._check_attachments(attachment_names)
            total_score += attach_score
            detection_reasons.extend(attach_reasons)
        
        # 8. URLs
        if links_in_email:
            url_score, url_reasons = self._check_urls(links_in_email, sender_domain)
            total_score += url_score
            detection_reasons.extend(url_reasons)
        
        # 9. Reply-to mismatch
        reply_to = headers.get('Reply-To', '')
        if reply_to and self._extract_domain(reply_to) != sender_domain:
            total_score += 15
            detection_reasons.append({
                'type': 'reply_to_mismatch',
                'severity': 'medium',
                'description': 'Reply-To address differs from sender domain'
            })
        
        # Calculate final result
        total_score = min(total_score, 100)
        risk_level = self._get_risk_level(total_score)
        
        return DetectionResult(
            risk_score=total_score,
            risk_level=risk_level,
            detection_reasons=detection_reasons,
            human_readable=self._generate_explanation(detection_reasons, risk_level),
            recommended_action=self._get_recommended_action(risk_level),
            label_to_apply=self._get_label(risk_level)
        )
    
    def _extract_domain(self, email: str) -> str:
        try:
            if '<' in email:
                email = email.split('<')[1].split('>')[0]
            return email.split('@')[-1].lower().strip()
        except:
            return ""
    
    def _check_brand_impersonation(self, sender: str, sender_domain: str, subject: str) -> Tuple[int, List[Dict]]:
        score = 0
        reasons = []
        
        for brand, legit_domains in self.LEGITIMATE_DOMAINS.items():
            if brand in sender.lower() or brand in subject.lower():
                if sender_domain not in legit_domains:
                    score += 25
                    reasons.append({
                        'type': 'brand_impersonation',
                        'severity': 'high',
                        'description': f'Possible {brand.title()} impersonation from {sender_domain}'
                    })
                    break
        return score, reasons
    
    def _check_authentication(self, headers: Dict[str, str]) -> Tuple[int, List[Dict]]:
        score = 0
        reasons = []
        auth_results = headers.get('Authentication-Results', '').lower()
        
        if 'spf=fail' in auth_results or 'spf=softfail' in auth_results:
            score += 20
            reasons.append({'type': 'spf_fail', 'severity': 'high', 'description': 'SPF authentication failed'})
        
        if 'dkim=fail' in auth_results:
            score += 20
            reasons.append({'type': 'dkim_fail', 'severity': 'high', 'description': 'DKIM verification failed'})
        
        if 'dmarc=fail' in auth_results:
            score += 15
            reasons.append({'type': 'dmarc_fail', 'severity': 'high', 'description': 'DMARC policy failed'})
        
        return score, reasons
    
    def _check_attachments(self, names: List[str]) -> Tuple[int, List[Dict]]:
        score = 0
        reasons = []
        
        for name in names:
            name_lower = name.lower()
            for ext in self.DANGEROUS_EXTENSIONS:
                if name_lower.endswith(ext):
                    score += 30
                    reasons.append({
                        'type': 'dangerous_attachment',
                        'severity': 'critical',
                        'description': f'Dangerous file type: {ext}'
                    })
                    break
            
            # Double extension check
            if name_lower.count('.') >= 2:
                parts = name_lower.split('.')
                if parts[-1] in [e.lstrip('.') for e in self.DANGEROUS_EXTENSIONS]:
                    score += 25
                    reasons.append({
                        'type': 'double_extension',
                        'severity': 'high',
                        'description': f'Hidden file extension detected: {name}'
                    })
        
        return score, reasons
    
    def _check_urls(self, urls: List[str], sender_domain: str) -> Tuple[int, List[Dict]]:
        score = 0
        reasons = []
        
        for url in urls[:5]:  # Check first 5 URLs
            try:
                parsed = urlparse(url)
                extracted = tldextract.extract(url)
                url_domain = f"{extracted.domain}.{extracted.suffix}"
                
                # Homoglyph in URL
                is_homo, homo_reason = self.detect_homoglyph_attack(url_domain)
                if is_homo:
                    score += 25
                    reasons.append({'type': 'homoglyph_url', 'severity': 'critical', 'description': homo_reason})
                
                # URL shortener
                if url_domain in self.URL_SHORTENERS:
                    score += 10
                    reasons.append({'type': 'url_shortener', 'severity': 'medium', 'description': 'Link uses URL shortener'})
                
                # IP address URL
                if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', parsed.netloc):
                    score += 20
                    reasons.append({'type': 'ip_url', 'severity': 'high', 'description': 'Link uses IP address'})
                    
            except:
                continue
        
        return score, reasons
    
    def _get_risk_level(self, score: int) -> str:
        if score >= 50: return "high"
        elif score >= 25: return "medium"
        elif score >= 10: return "low"
        return "safe"
    
    def _get_label(self, risk_level: str) -> str:
        return {"high": "🚨 Phishing Alert", "medium": "⚠ Suspicious", "low": "⚠ Suspicious", "safe": "✅ Verified Safe"}.get(risk_level, "")
    
    def _get_recommended_action(self, risk_level: str) -> str:
        actions = {
            "high": "Do NOT click any links or download attachments. Report as phishing.",
            "medium": "Exercise caution. Verify sender through official channels.",
            "low": "Minor concerns. Review carefully before responding.",
            "safe": "No threats detected."
        }
        return actions.get(risk_level, "Review carefully.")
    
    def _generate_explanation(self, reasons: List[Dict], risk_level: str) -> str:
        if not reasons:
            return "✅ SAFE: No threats detected."
        
        prefix = {"high": "⚠️ HIGH RISK", "medium": "⚠️ CAUTION", "low": "ℹ️ NOTICE", "safe": "✅ SAFE"}.get(risk_level, "")
        parts = [f"• {r['description']}" for r in reasons[:3]]
        return f"{prefix}\n\n" + "\n".join(parts)


detection_engine = PhishingDetectionEngine()

def analyze_email(sender, subject, headers, has_attachments=False, attachment_names=None, links_in_email=None):
    return detection_engine.analyze_email(sender, subject, headers, has_attachments, attachment_names, links_in_email)
