/**
 * MailShield Popup Script v1.1
 * Now with Website Trust Score feature
 */

const API_BASE = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function () {
    const dashboardBtn = document.getElementById('open-dashboard');

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function () {
            chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
        });
    }

    // Get current tab and scan for trust score
    scanCurrentSite();

    // Load recent scans
    loadRecentScans();
});

/**
 * Scan current tab's URL for trust score
 */
async function scanCurrentSite() {
    const trustContent = document.getElementById('trust-score-content');

    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.url) {
            trustContent.innerHTML = '<div class="loading">Unable to get current tab</div>';
            return;
        }

        const url = tab.url;

        // Skip chrome://, about:, extension pages
        if (url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('chrome-extension://')) {
            trustContent.innerHTML = `
                <div class="trust-score-domain">Browser Page</div>
                <div class="trust-score-value">
                    <span class="score-badge safe">—</span>
                    <span class="score-label safe">System</span>
                </div>
            `;
            return;
        }

        // Extract domain for display
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        // Show loading with domain
        trustContent.innerHTML = `
            <div class="trust-score-domain">${domain}</div>
            <div class="loading">Scanning...</div>
        `;

        // Call backend API to scan URL
        const response = await fetch(`${API_BASE}/api/threats/scan-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) throw new Error('Scan failed');

        const data = await response.json();
        const score = data.risk_score;
        const level = data.risk_level;

        // Determine display values
        let scoreClass = 'safe';
        let labelText = 'Trusted';
        let emoji = '✅';

        if (score >= 50) {
            scoreClass = 'high';
            labelText = 'High Risk';
            emoji = '🚨';
        } else if (score >= 25) {
            scoreClass = 'medium';
            labelText = 'Suspicious';
            emoji = '⚠️';
        } else if (score > 0) {
            scoreClass = 'low';
            labelText = 'Low Risk';
            emoji = 'ℹ️';
        }

        trustContent.innerHTML = `
            <div class="trust-score-domain">${domain}</div>
            <div class="trust-score-value">
                <span class="score-badge ${scoreClass}">${score}</span>
                <span class="score-label ${scoreClass}">${emoji} ${labelText}</span>
            </div>
            ${data.reasons && data.reasons.length > 0 ? `
                <div style="margin-top: 8px; font-size: 10px; color: #94a3b8;">
                    ${data.reasons.slice(0, 2).join(' • ')}
                </div>
            ` : ''}
        `;

    } catch (err) {
        console.error('Trust score error:', err);
        trustContent.innerHTML = `
            <div class="loading">⚠️ Backend offline</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
                Start the MailShield server to enable scanning
            </div>
        `;
    }
}

/**
 * Load recent URL scans from backend
 */
async function loadRecentScans() {
    const scanList = document.getElementById('scan-list');

    try {
        const response = await fetch(`${API_BASE}/api/threats/recent-urls`);
        const data = await response.json();

        if (!data || data.length === 0) {
            scanList.innerHTML = '<span style="color: #64748b;">No recent scans</span>';
            return;
        }

        scanList.innerHTML = data.slice(0, 5).map(scan => {
            let color = '#22c55e';
            if (scan.risk_score >= 50) color = '#ef4444';
            else if (scan.risk_score >= 25) color = '#f97316';
            else if (scan.risk_score > 0) color = '#eab308';

            const urlDisplay = scan.url.replace(/^https?:\/\//, '').slice(0, 30);

            return `
                <div class="scan-item">
                    <span class="scan-url" title="${scan.url}">${urlDisplay}</span>
                    <span style="color: ${color}; font-weight: 600;">${scan.risk_score}</span>
                </div>
            `;
        }).join('');

    } catch (err) {
        scanList.innerHTML = '<span style="color: #64748b;">No scans available</span>';
    }
}
