# 🚀 QUICK START GUIDE

## 5-Minute Setup

### Prerequisites Check
- [ ] Node.js installed? → Run `node --version`
- [ ] Arduino IDE installed?
- [ ] ESP32 connected via USB?
- [ ] All hardware components ready?

---

## STEP 1: Server Setup (2 minutes)

```bash
# Navigate to project folder
cd sidas-project

# Install dependencies
npm install

# Start server
npm start
```

✅ **Success when you see:**
```
🛡️  SIDAS - Sound Intrusion Detection System 🛡️
Server Status: ACTIVE
```

---

## STEP 2: Access Dashboard (30 seconds)

1. Open browser
2. Go to: **http://localhost:3000**
3. You should see the SIDAS dashboard

---

## STEP 3: Find Your Laptop IP (1 minute)

**Windows:**
```cmd
ipconfig
```
Look for: `IPv4 Address: 192.168.X.X`

**Mac/Linux:**
```bash
ifconfig | grep inet
```
Look for: `inet 192.168.X.X`

📝 **Write down this IP!** Example: `192.168.1.100`

---

## STEP 4: Configure ESP32 (2 minutes)

1. Open `esp32_code.ino` in Arduino IDE
2. Change these 3 lines:

```cpp
// Line 25-26: Your WiFi credentials
const char* ssid = "YourWiFiName";
const char* password = "YourWiFiPassword";

// Line 29: Your laptop IP (from Step 3)
const char* serverURL = "http://192.168.1.100:3000/alert";
//                              ↑↑↑↑↑↑↑↑↑↑↑
//                         PUT YOUR IP HERE
```

3. **Tools → Board** → "ESP32 Dev Module"
4. **Tools → Port** → Select COM port
5. Click **Upload** ➜

---

## STEP 5: Test the System (30 seconds)

1. **Open Serial Monitor** (Ctrl+Shift+M)
2. **Clap your hands** near the sensor
3. Watch:
   - ✅ LED turns on
   - ✅ Buzzer sounds
   - ✅ Serial Monitor shows "🔴 ALERT"
   - ✅ Dashboard changes to RED
   - ✅ New alert appears in table

---

## 🎉 YOU'RE DONE!

### Quick Test Checklist:
- [ ] Server running on port 3000
- [ ] Dashboard accessible in browser
- [ ] ESP32 connected to WiFi
- [ ] Sound detection working
- [ ] LED and buzzer responding
- [ ] Alerts appearing on dashboard

---

## Common First-Time Issues

### ❌ "WiFi not connecting"
→ Make sure WiFi is 2.4GHz (not 5GHz)

### ❌ "Server not receiving alerts"
→ Laptop and ESP32 must be on SAME WiFi network

### ❌ "Sensor not detecting"
→ Turn the small potentiometer on KY-038 sensor

### ❌ "Dashboard shows offline"
→ Check if `npm start` is still running

---

## Keyboard Shortcuts

- **Ctrl/Cmd + R** → Refresh dashboard
- **Ctrl/Cmd + K** → Clear all logs

---

## Need Help?

1. Check Serial Monitor for ESP32 errors
2. Check browser console (F12) for errors
3. Read full README.md for detailed troubleshooting

---

**🛡️ Happy Monitoring!**
