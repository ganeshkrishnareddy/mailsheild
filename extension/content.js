/**
 * MailShield Content Script
 * Scans Gmail UI for suspicious links and highlights them.
 */

console.log("🛡️ MailShield Phishing Guard active");

// List of suspicious patterns (simplified for demo)
const SUSPICIOUS_KEYWORDS = [
    'verify', 'account', 'secure', 'login', 'update', 'confirm', 'password'
];

async function scanEmails() {
    const links = document.querySelectorAll('a[href]:not([data-mailshield-scanned])');

    links.forEach(async (link) => {
        link.setAttribute('data-mailshield-scanned', 'true');
        const href = link.href;

        try {
            const response = await fetch('http://localhost:8000/api/threats/scan-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: href })
            });
            const data = await response.json();

            if (data.risk_score > 0) {
                const isHighRisk = data.risk_score >= 50;

                link.style.border = isHighRisk ? "3px solid #d93025" : "2px solid #f9ab00";
                link.style.backgroundColor = isHighRisk ? "rgba(217, 48, 37, 0.1)" : "rgba(249, 171, 0, 0.1)";
                link.style.borderRadius = "4px";
                link.style.padding = "2px";
                link.title = `🛡️ MailShield Score: ${data.risk_score} | ${data.reasons.join(', ')}`;

                // Add Shield icon
                if (!link.previousElementSibling?.classList.contains('mailshield-alert')) {
                    const span = document.createElement('span');
                    span.innerHTML = isHighRisk ? "🚨 " : "⚠️ ";
                    span.className = "mailshield-alert";
                    span.style.cursor = "help";
                    span.title = isHighRisk ? "VERY HIGH RISK! DO NOT CLICK." : "Suspicious link detected.";
                    link.parentNode.insertBefore(span, link);

                    // Show "VERY RISK" popup for high risk
                    if (isHighRisk) {
                        const toast = document.createElement('div');
                        toast.innerText = "🛑 VERY HIGH RISK LINK DETECTED!";
                        toast.style.position = "fixed";
                        toast.style.top = "20px";
                        toast.style.right = "20px";
                        toast.style.backgroundColor = "#d93025";
                        toast.style.color = "white";
                        toast.style.padding = "15px";
                        toast.style.borderRadius = "8px";
                        toast.style.zIndex = "10000";
                        toast.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                        toast.style.fontWeight = "bold";
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 5000);
                    }
                }

                // Add score badge
                const badge = document.createElement('span');
                badge.innerText = `[Score: ${data.risk_score}]`;
                badge.style.fontSize = "10px";
                badge.style.color = isHighRisk ? "#d93025" : "#f9ab00";
                badge.style.marginLeft = "5px";
                link.after(badge);
            }
        } catch (err) {
            console.error("MailShield scan failed:", err);
        }
    });
}

// Observe Gmail UI changes (emails loading dynamically)
const observer = new MutationObserver((mutations) => {
    scanEmails();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial scan
scanEmails();
