/**
 * MailShield Popup Script
 */

document.addEventListener('DOMContentLoaded', function () {
    const dashboardBtn = document.getElementById('open-dashboard');

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function () {
            chrome.tabs.create({ url: 'http://localhost:3000' });
        });
    }

    // Load recent scans
    fetch('http://localhost:8000/api/threats/recent-urls')
        .then(response => response.json())
        .then(data => {
            const scanList = document.getElementById('scan-list');
            if (data.length === 0) {
                scanList.innerText = "No scans yet.";
                return;
            }
            scanList.innerHTML = data.slice(0, 3).map(scan => `
                <div style="margin-bottom: 5px; display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 2px;">
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">${scan.url}</span>
                    <span style="color: ${scan.risk_score > 50 ? '#d93025' : (scan.risk_score > 0 ? '#f9ab00' : '#137333')}; font-weight: bold;">
                        ${scan.risk_score}
                    </span>
                </div>
            `).join('');
        })
        .catch(err => {
            document.getElementById('scan-list').innerText = "Dashboard not connected.";
        });
});
