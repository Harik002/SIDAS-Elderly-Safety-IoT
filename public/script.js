// ===== CONFIGURATION =====
const API_BASE_URL = 'http://localhost:3000';
const REFRESH_INTERVAL = 2000; // 2 seconds
let refreshIntervalId = null;
let startTime = Date.now();

// ===== DOM ELEMENTS =====
const elements = {
    clock: document.getElementById('clock'),
    connectionText: document.getElementById('connectionText'),
    statusCard: document.getElementById('statusCard'),
    statusIcon: document.getElementById('statusIcon'),
    statusText: document.getElementById('statusText'),
    statusSubtext: document.getElementById('statusSubtext'),
    totalAlerts: document.getElementById('totalAlerts'),
    lastAlertTime: document.getElementById('lastAlertTime'),
    lastAlertDate: document.getElementById('lastAlertDate'),
    uptime: document.getElementById('uptime'),
    alertTableBody: document.getElementById('alertTableBody'),
    resetBtn: document.getElementById('resetBtn'),
    refreshStatus: document.getElementById('refreshStatus'),
    alertSound: document.getElementById('alertSound')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🛡️ SIDAS Dashboard Initialized', 'color: #00ff88; font-size: 16px; font-weight: bold;');
    
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Start uptime counter
    updateUptime();
    setInterval(updateUptime, 1000);
    
    // Initial data fetch
    fetchAlerts();
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Reset button handler
    elements.resetBtn.addEventListener('click', resetAlerts);
});

// ===== CLOCK FUNCTIONS =====
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    elements.clock.textContent = `${hours}:${minutes}:${seconds}`;
}

function updateUptime() {
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    elements.uptime.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ===== API FUNCTIONS =====
async function fetchAlerts() {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateDashboard(data.alerts);
            updateConnectionStatus(true);
        }
    } catch (error) {
        console.error('Error fetching alerts:', error);
        updateConnectionStatus(false);
    }
}

async function resetAlerts() {
    try {
        // Confirmation
        const confirmed = confirm('⚠️ Clear all alert logs?\n\nThis action cannot be undone.');
        
        if (!confirmed) return;
        
        const response = await fetch(`${API_BASE_URL}/reset`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Alerts cleared successfully');
            fetchAlerts(); // Refresh dashboard
            
            // Visual feedback
            elements.resetBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                elements.resetBtn.style.transform = 'scale(1)';
            }, 100);
        }
    } catch (error) {
        console.error('Error resetting alerts:', error);
        alert('❌ Failed to clear alerts. Please check server connection.');
    }
}

// ===== DASHBOARD UPDATE =====
function updateDashboard(alerts) {
    const previousCount = parseInt(elements.totalAlerts.textContent) || 0;
    const currentCount = alerts.length;
    
    // Update total alerts
    elements.totalAlerts.textContent = currentCount;
    
    // Check for new alert
    if (currentCount > previousCount) {
        triggerAlertAnimation();
        playAlertSound();
    }
    
    // Update status
    const lastAlert = alerts[0];
    const isActive = lastAlert && (Date.now() - new Date(lastAlert.timestamp).getTime() < 10000);
    
    if (isActive) {
        setStatusAlert();
    } else {
        setStatusSafe();
    }
    
    // Update last alert time
    if (lastAlert) {
        const alertDate = new Date(lastAlert.timestamp);
        const time = alertDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        const date = alertDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        elements.lastAlertTime.textContent = time;
        elements.lastAlertDate.textContent = date;
    } else {
        elements.lastAlertTime.textContent = '--:--:--';
        elements.lastAlertDate.textContent = 'No alerts yet';
    }
    
    // Update table
    updateAlertTable(alerts);
}

// ===== STATUS FUNCTIONS =====
function setStatusSafe() {
    elements.statusCard.classList.remove('status-alert');
    elements.statusIcon.classList.remove('status-alert');
    elements.statusText.classList.remove('status-alert');
    
    elements.statusCard.classList.add('status-safe');
    elements.statusIcon.classList.add('status-safe');
    elements.statusText.classList.add('status-safe');
    
    elements.statusText.textContent = 'SAFE';
    elements.statusSubtext.textContent = 'No intrusion detected';
    elements.statusSubtext.style.color = 'var(--text-secondary)';
}

function setStatusAlert() {
    elements.statusCard.classList.remove('status-safe');
    elements.statusIcon.classList.remove('status-safe');
    elements.statusText.classList.remove('status-safe');
    
    elements.statusCard.classList.add('status-alert');
    elements.statusIcon.classList.add('status-alert');
    elements.statusText.classList.add('status-alert');
    
    elements.statusText.textContent = 'ALERT';
    elements.statusSubtext.textContent = '⚠️ Intrusion detected!';
    elements.statusSubtext.style.color = 'var(--accent-red)';
}

// ===== ALERT TABLE =====
function updateAlertTable(alerts) {
    if (alerts.length === 0) {
        elements.alertTableBody.innerHTML = `
            <tr class="no-data">
                <td colspan="4">
                    <div class="no-data-content">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <p>No alerts detected</p>
                        <span>System monitoring active</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    elements.alertTableBody.innerHTML = alerts.map((alert, index) => {
        const date = new Date(alert.timestamp);
        const time = date.toLocaleString('en-US', { 
            month: 'short',
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true
        });
        
        return `
            <tr style="animation-delay: ${index * 0.05}s">
                <td style="color: var(--accent-cyan); font-family: 'Orbitron', monospace; font-weight: 700;">#${String(alerts.length - index).padStart(4, '0')}</td>
                <td style="font-family: 'Orbitron', monospace;">${time}</td>
                <td style="color: var(--text-secondary);">${alert.alertType || 'SOUND_DETECTED'}</td>
                <td>
                    <span class="status-badge detected">● DETECTED</span>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== ANIMATIONS & EFFECTS =====
function triggerAlertAnimation() {
    // Flash status card
    elements.statusCard.style.animation = 'none';
    setTimeout(() => {
        elements.statusCard.style.animation = '';
    }, 10);
    
    // Screen flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 0, 85, 0.1);
        z-index: 9999;
        pointer-events: none;
        animation: flash 0.5s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
    }, 500);
    
    // Add flash animation
    if (!document.querySelector('#flash-animation')) {
        const style = document.createElement('style');
        style.id = 'flash-animation';
        style.textContent = `
            @keyframes flash {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

function playAlertSound() {
    try {
        elements.alertSound.currentTime = 0;
        elements.alertSound.play().catch(err => {
            console.log('Audio playback prevented:', err);
        });
    } catch (error) {
        console.log('Alert sound error:', error);
    }
}

// ===== CONNECTION STATUS =====
function updateConnectionStatus(isConnected) {
    const statusDot = document.querySelector('.status-dot');
    
    if (isConnected) {
        elements.connectionText.textContent = 'SYSTEM ONLINE';
        elements.connectionText.style.color = 'var(--accent-green)';
        statusDot.style.background = 'var(--accent-green)';
        statusDot.style.boxShadow = '0 0 10px var(--accent-green)';
        elements.refreshStatus.textContent = 'Active';
        elements.refreshStatus.style.color = 'var(--accent-green)';
    } else {
        elements.connectionText.textContent = 'CONNECTION LOST';
        elements.connectionText.style.color = 'var(--accent-red)';
        statusDot.style.background = 'var(--accent-red)';
        statusDot.style.boxShadow = '0 0 10px var(--accent-red)';
        elements.refreshStatus.textContent = 'Offline';
        elements.refreshStatus.style.color = 'var(--accent-red)';
    }
}

// ===== AUTO-REFRESH =====
function startAutoRefresh() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
    }
    
    refreshIntervalId = setInterval(fetchAlerts, REFRESH_INTERVAL);
    console.log(`✅ Auto-refresh started (every ${REFRESH_INTERVAL / 1000}s)`);
}

function stopAutoRefresh() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
        console.log('⏸️ Auto-refresh stopped');
    }
}

// ===== PAGE VISIBILITY =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        fetchAlerts();
        startAutoRefresh();
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R: Manual refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        console.log('🔄 Manual refresh triggered');
        fetchAlerts();
    }
    
    // Ctrl/Cmd + K: Clear logs
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        resetAlerts();
    }
});

// ===== CONSOLE BRANDING =====
console.log('%c╔═══════════════════════════════════════════════╗', 'color: #00d4ff');
console.log('%c║   🛡️  SIDAS - Dashboard Console 🛡️          ║', 'color: #00d4ff; font-weight: bold');
console.log('%c╚═══════════════════════════════════════════════╝', 'color: #00d4ff');
console.log('%cShortcuts:', 'color: #00ff88; font-weight: bold');
console.log('%c  Ctrl/Cmd + R : Manual Refresh', 'color: #fff');
console.log('%c  Ctrl/Cmd + K : Clear Logs', 'color: #fff');
console.log('');
