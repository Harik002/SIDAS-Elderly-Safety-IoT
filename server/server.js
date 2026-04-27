const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory alert storage
let alerts = [];

// POST endpoint - Receive alert from ESP32
app.post('/alert', (req, res) => {
    const alert = {
        timestamp: new Date().toISOString(),
        alertType: req.body.alertType || 'SOUND_DETECTED',
        id: Date.now()
    };
    
    alerts.unshift(alert); // Add to beginning of array
    
    console.log(`🔴 ALERT RECEIVED: ${alert.alertType} at ${alert.timestamp}`);
    
    res.status(200).json({
        success: true,
        message: 'Alert received',
        alert: alert
    });
});

// GET endpoint - Fetch all alerts
app.get('/alerts', (req, res) => {
    res.status(200).json({
        success: true,
        count: alerts.length,
        alerts: alerts
    });
});

// DELETE endpoint - Clear all alerts
app.delete('/reset', (req, res) => {
    const count = alerts.length;
    alerts = [];
    
    console.log(`🧹 SYSTEM RESET: ${count} alerts cleared`);
    
    res.status(200).json({
        success: true,
        message: `${count} alerts cleared`,
        alerts: []
    });
});

// GET endpoint - System status
app.get('/status', (req, res) => {
    const lastAlert = alerts.length > 0 ? alerts[0] : null;
    const isActive = lastAlert && (Date.now() - new Date(lastAlert.timestamp).getTime() < 10000);
    
    res.status(200).json({
        success: true,
        status: isActive ? 'ALERT' : 'SAFE',
        totalAlerts: alerts.length,
        lastAlert: lastAlert
    });
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🛡️  SIDAS - Sound Intrusion Detection System 🛡️        ║
║                                                           ║
║   Server Status: ACTIVE                                   ║
║   Port: ${PORT}                                              ║
║   URL: http://localhost:${PORT}                              ║
║                                                           ║
║   Dashboard: http://localhost:${PORT}                        ║
║   API Ready: ✅                                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
