# 🏥 Lab Report Ingestion & MDR Alert System

Complete workflow for automated Multi-Drug Resistant (MDR) organism detection and real-time alerting.

## 📋 Table of Contents
- [System Architecture](#system-architecture)
- [Database Setup](#database-setup)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the System](#running-the-system)
- [API Endpoints](#api-endpoints)
- [Testing the Workflow](#testing-the-workflow)
- [Real-Time Notifications](#real-time-notifications)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ System Architecture

### Workflow Overview
```
Lab Report Upload
       ↓
Save to Database
       ↓
Check MDR List ──→ [YES] ──→ Flag Patient
       │                         ↓
       │                  Create Notification
       │                         ↓
       │                  Publish Event (Redis)
       │                         ↓
       │                  Worker Processes
       │                         ↓
       │                  Send Alerts:
       │                  • Push (FCM)
       │                  • WebSocket
       │                  • SMS
       │                  • Email
       ↓
      [NO] ──→ Save Report Only
```

### Components
1. **API Server** - Express.js REST API
2. **Database** - MySQL with MDR organism list
3. **Message Queue** - Redis for async processing
4. **Worker** - Background job processor
5. **WebSocket Server** - Real-time notifications
6. **Notification Services** - FCM, SMS, Email

---

## 💾 Database Setup

### Prerequisites
- MySQL 8.0+
- Create database: `hospital_db`

### Setup Steps

1. **Create Database**
```bash
mysql -u root -p
```

```sql
CREATE DATABASE hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_db;
```

2. **Run Schema Script**
```bash
cd server
mysql -u root -p hospital_db < database/lab-reports-schema.sql
```

This creates:
- ✅ `patients` - Patient master data
- ✅ `lab_reports` - All lab test results
- ✅ `mdr_list` - MDR organism catalog (pre-populated)
- ✅ `mdr_flags` - Active MDR patient flags
- ✅ `notifications` - Alert queue
- ✅ `notification_subscriptions` - User preferences
- ✅ `mdr_audit_log` - Audit trail

3. **Verify Installation**
```sql
-- Check MDR organisms
SELECT organism, severity FROM mdr_list;

-- Should return: MRSA, VRE, ESBL, CRE, MDR-TB, etc.
```

---

## 📦 Installation

### 1. Install Node Dependencies
```bash
cd server
npm install
```

### 2. Install Additional Dependencies
```bash
# Core dependencies (already in package.json)
npm install express mysql2 express-validator

# Redis for message queue
npm install ioredis

# WebSocket support
npm install ws

# Firebase Admin SDK (for push notifications)
npm install firebase-admin

# Optional: SMS and Email
npm install twilio nodemailer
```

---

## ⚙️ Configuration

### 1. Environment Variables
Create `server/.env`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hospital_db
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Redis (Message Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Firebase Cloud Messaging (Optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SMTP Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Firebase Setup (Optional)
1. Create Firebase project: https://console.firebase.google.com
2. Generate service account key
3. Add credentials to `.env`

### 3. Redis Setup
```bash
# Install Redis (Windows)
# Download from: https://github.com/microsoftarchive/redis/releases

# Or use Docker
docker run -d -p 6379:6379 redis:latest

# Test connection
redis-cli ping
# Should return: PONG
```

---

## 🚀 Running the System

### 1. Start MySQL Server
```bash
# Windows
net start MySQL80

# Or start via XAMPP/WAMP
```

### 2. Start Redis Server
```bash
# Windows
redis-server

# Or via Docker
docker start redis
```

### 3. Start API Server
```bash
cd server
node server.js
```

Expected output:
```
✅ MongoDB Connected Successfully
📦 Using MongoDB patient routes
🚀 MedWatch Server Running on Port 5000
✅ WebSocket server initialized at /api/notifications/live
```

### 4. Start Notification Worker (Separate Terminal)
```bash
cd server
node src/workers/notificationWorker.js
```

Expected output:
```
🚀 Starting notification worker...
✅ Subscribed to 1 channel(s)
✅ Notification worker is running
```

---

## 📡 API Endpoints

### Lab Reports

#### POST `/api/lab-reports/upload`
Upload a lab report and trigger MDR workflow.

**Request:**
```json
{
  "patientId": 123,
  "reportId": "LRP-8891",
  "testName": "Culture & Sensitivity",
  "organism": "ESBL",
  "sampleType": "Urine",
  "collectedAt": "2025-12-07T07:35:00Z",
  "resultAt": "2025-12-07T12:00:00Z",
  "reportFileUrl": "https://hospital.com/reports/abc.pdf",
  "antibioticSensitivity": [
    { "antibiotic": "Amoxicillin", "result": "Resistant" },
    { "antibiotic": "Ciprofloxacin", "result": "Sensitive" }
  ],
  "additionalNotes": "High bacterial count"
}
```

**Response (MDR Detected):**
```json
{
  "success": true,
  "message": "Lab report uploaded - MDR organism detected and patient flagged",
  "data": {
    "reportId": "LRP-8891",
    "patientId": 123,
    "mdrDetected": true,
    "organism": "ESBL",
    "severity": "high",
    "flagCreated": true,
    "flagId": 42,
    "alertSent": true,
    "notificationId": 156
  }
}
```

#### GET `/api/lab-reports/:reportId`
Get lab report details.

#### GET `/api/lab-reports/patient/:patientId`
Get all lab reports for a patient.

### MDR Flags

#### GET `/api/patients/:id/mdr-status`
Get active MDR flags for a patient.

**Response:**
```json
{
  "success": true,
  "data": {
    "patientId": 123,
    "activeFlags": 2,
    "flags": [
      {
        "flag_id": 42,
        "organism": "ESBL",
        "severity": "high",
        "isolation_status": "isolated",
        "flagged_at": "2025-12-07T12:05:00.000Z",
        "organism_full_name": "Extended-Spectrum Beta-Lactamase",
        "isolation_type": "Contact precautions"
      }
    ]
  }
}
```

#### POST `/api/mdr-flags/:flagId/clear`
Clear an MDR flag.

**Request:**
```json
{
  "reason": "Patient completed treatment course",
  "notes": "Follow-up cultures negative for 3 consecutive tests"
}
```

#### GET `/api/mdr-flags/active`
Get all active MDR flags (admin only).

#### PATCH `/api/mdr-flags/:flagId/isolation`
Update isolation status.

```json
{
  "isolationStatus": "isolated",
  "roomNumber": "ICU-3"
}
```

### Notifications

#### GET `/api/notifications`
Get notifications for current user.

Query params:
- `limit`: Number of results (default: 50)
- `unreadOnly`: true/false

#### POST `/api/notifications/:id/read`
Mark notification as read.

#### WebSocket: `ws://localhost:5000/api/notifications/live?userId=123`
Real-time notification stream.

#### SSE: `GET /api/notifications/live-sse`
Server-Sent Events alternative to WebSocket.

---

## 🧪 Testing the Workflow

### Automated Test Suite

Run comprehensive tests:
```bash
cd server
node tests/lab-report-tests.js
```

Tests cover:
1. ✅ MDR-positive report upload
2. ✅ Non-MDR organism handling
3. ✅ MDR status retrieval
4. ✅ Flag clearance
5. ✅ Active flags listing
6. ✅ Critical severity detection (MDR-TB)
7. ✅ Duplicate report validation

### Manual Testing with cURL

#### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "password": "admin123"}'

# Save token from response
TOKEN="your-jwt-token-here"
```

#### 2. Upload MDR-Positive Report
```bash
curl -X POST http://localhost:5000/api/lab-reports/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "reportId": "LRP-TEST-001",
    "testName": "Culture & Sensitivity",
    "organism": "MRSA",
    "sampleType": "Blood",
    "collectedAt": "2025-12-07T08:00:00Z",
    "resultAt": "2025-12-07T14:00:00Z"
  }'
```

#### 3. Check Patient MDR Status
```bash
curl -X GET http://localhost:5000/api/patients/123/mdr-status \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Get Active Flags
```bash
curl -X GET http://localhost:5000/api/mdr-flags/active \
  -H "Authorization: Bearer $TOKEN"
```

### Testing WebSocket Notifications

Create `test-websocket.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <h2>Live Notifications Test</h2>
  <div id="messages"></div>
  
  <script>
    const ws = new WebSocket('ws://localhost:5000/api/notifications/live?userId=1');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Notification received:', data);
      
      const div = document.createElement('div');
      div.textContent = JSON.stringify(data, null, 2);
      document.getElementById('messages').appendChild(div);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  </script>
</body>
</html>
```

---

## 🔔 Real-Time Notifications

### WebSocket Client Example (JavaScript)
```javascript
const ws = new WebSocket('ws://localhost:5000/api/notifications/live?userId=123');

ws.onopen = () => {
  console.log('Connected to notification stream');
};

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  
  if (notification.type === 'mdr_alert') {
    // Display critical alert
    showAlert({
      title: '🚨 MDR Alert',
      message: notification.data.message,
      priority: notification.data.priority
    });
  }
};
```

### Push Notification Setup

1. **Get FCM Server Key** from Firebase Console
2. **Register device token**:
```javascript
// Frontend (React/Angular/Vue)
import { getMessaging, getToken } from 'firebase/messaging';

const messaging = getMessaging();
const token = await getToken(messaging, { 
  vapidKey: 'your-vapid-key' 
});

// Send token to backend
await fetch('/api/users/fcm-token', {
  method: 'POST',
  body: JSON.stringify({ token })
});
```

3. **Backend saves token** to `notification_subscriptions` table

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MySQL"
**Solution:**
```bash
# Check MySQL is running
net start MySQL80

# Verify credentials in .env
# Test connection
mysql -u root -p hospital_db
```

### Issue: "Redis connection failed"
**Solution:**
```bash
# Start Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:latest

# Test
redis-cli ping
```

### Issue: "No notifications received"
**Solution:**
1. Check worker is running: `node src/workers/notificationWorker.js`
2. Check Redis connection in worker logs
3. Verify WebSocket connection in browser console
4. Check `notifications` table:
```sql
SELECT * FROM notifications WHERE sent = FALSE;
```

### Issue: "MDR not detected"
**Solution:**
1. Check organism exists in `mdr_list`:
```sql
SELECT * FROM mdr_list WHERE organism = 'ESBL';
```

2. Check lab report processed flag:
```sql
SELECT * FROM lab_reports WHERE report_id = 'LRP-XXX';
```

### Issue: "Duplicate flag not prevented"
**Solution:**
```sql
-- Check unique constraint
SHOW CREATE TABLE mdr_flags;

-- Should have: UNIQUE KEY unique_active_flag (patient_id, organism, status)
```

---

## 📊 Monitoring

### Check System Status
```bash
# Active MDR flags
mysql -u root -p hospital_db -e "SELECT COUNT(*) FROM mdr_flags WHERE status = 'active';"

# Pending notifications
mysql -u root -p hospital_db -e "SELECT COUNT(*) FROM notifications WHERE sent = FALSE;"

# Redis queue size
redis-cli LLEN mdr:alert:queue
```

### View Recent Activity
```sql
-- Recent flags (last 24 hours)
SELECT p.name, mf.organism, mf.severity, mf.flagged_at
FROM mdr_flags mf
JOIN patients p ON mf.patient_id = p.patient_id
WHERE mf.flagged_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY mf.flagged_at DESC;

-- Audit log
SELECT * FROM mdr_audit_log
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🔐 Security Notes

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong JWT secrets** - At least 32 random characters
3. **Validate all inputs** - express-validator used throughout
4. **Sanitize database queries** - Parameterized queries prevent SQL injection
5. **Require authentication** - All endpoints use `requireAuth` middleware
6. **Role-based access** - Admin-only endpoints enforced

---

## 📞 Support

For issues or questions:
1. Check logs in `server/logs/`
2. Review error messages in console
3. Verify all services running (MySQL, Redis, Node)
4. Check database connectivity
5. Test with automated test suite

---

## ✅ Quick Start Checklist

- [ ] MySQL 8.0+ installed and running
- [ ] Redis installed and running
- [ ] Database schema created (`lab-reports-schema.sql`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] API server started (`node server.js`)
- [ ] Worker started (`node src/workers/notificationWorker.js`)
- [ ] Tests passing (`node tests/lab-report-tests.js`)
- [ ] WebSocket connection working (test page)

---

**System ready! 🎉 Upload a lab report to see the full workflow in action.**
