/**
 * MailShield Content Script v1.2
 * Refined targeting and premium UI injections.
 */

console.log("🛡️ MailShield Premium Guard active");

/**
 * Scans relevant parts of the Gmail UI for links.
 * Ignores navigation sidebars and menus.
 */
async function scanEmails() {
    // Only target main content areas and dialogs/previews
    const mainContent = document.querySelector('div[role="main"], div[role="dialog"], .a3s');
    if (!mainContent) return;

    // Find links that haven't been scanned in the target areas
    const links = mainContent.querySelectorAll('a[href]:not([data-mailshield-scanned])');

    links.forEach(async (link) => {
        // Skip links that are likely part of the UI/navigation within the main area
        if (link.closest('nav, footer, .SK, .G-atb')) return;

        link.setAttribute('data-mailshield-scanned', 'true');
        const href = link.href;

        // Skip non-external links or common system links
        if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.includes('mail.google.com')) return;

        try {
            const response = await fetch('http://localhost:8000/api/threats/scan-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: href })
            });
            const data = await response.json();

            if (data.risk_score > 0) {
                const score = data.risk_score;
                const isDangerous = score >= 50;
                const isSuspicious = score >= 25;

                // Apply subtle highlighting to the link
                link.classList.add('ms-highlighted-link');
                if (isDangerous) {
                    link.classList.add('ms-dangerous-link');
                }

                // Create Premium Badge
                const badge = document.createElement('span');
                badge.className = `ms-badge ${isDangerous ? 'ms-badge-dangerous' : (isSuspicious ? 'ms-badge-suspicious' : 'ms-badge-safe')}`;

                let icon = '🛡️';
                let label = 'SECURE';
                if (isDangerous) { icon = '🚨'; label = 'DANGER'; }
                else if (isSuspicious) { icon = '⚠️'; label = 'WARNING'; }

                badge.innerHTML = `<span>${icon}</span> <span>${label} ${score}</span>`;
                badge.title = `MailShield Security Analysis:\nScore: ${score}/100\nThreats: ${data.reasons.join(', ')}`;

                // Tooltip info
                badge.setAttribute('role', 'status');
                badge.setAttribute('aria-label', `Security score ${score}`);

                // Insert badge after the link
                link.after(badge);

                // Show high-risk toast only once per link
                if (isDangerous && !window._ms_toasted_urls?.has(href)) {
                    showRiskToast(href);
                }
            }
        } catch (err) {
            console.error("MailShield scan failed:", err);
        }
    });
}

/**
 * Show a professional toast for high-risk links.
 */
function showRiskToast(url) {
    if (!window._ms_toasted_urls) window._ms_toasted_urls = new Set();
    window._ms_toasted_urls.add(url);

    const toast = document.createElement('div');
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">⛔</span>
            <div>
                <div style="font-weight: 800; font-size: 13px;">HIGH RISK DETECTED</div>
                <div style="font-size: 11px; opacity: 0.9; margin-top: 2px;">MailShield blocked a potential threat on this page.</div>
            </div>
        </div>
    `;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '16px',
        zIndex: '100000',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        fontFamily: "'Inter', sans-serif",
        cursor: 'pointer',
        animation: 'fadeIn 0.3s ease-out'
    });

    toast.onclick = () => toast.remove();
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 6000);
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Observe Gmail UI changes with debounce for performance
const debouncedScan = debounce(scanEmails, 1000);
const observer = new MutationObserver((mutations) => {
    debouncedScan();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial scan
scanEmails();
