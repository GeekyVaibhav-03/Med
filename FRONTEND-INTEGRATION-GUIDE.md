# 🎯 Lab Report System - Frontend Integration Guide

## How It Works in Your MedWatch Website

### 📋 Overview

The lab report system integrates seamlessly with your existing **MedWatch** hospital tracking application. Here's the complete workflow:

```
Hospital Lab 
    ↓
Upload Lab Report (Frontend)
    ↓
Backend Process (8 steps)
    ↓
Real-Time Alerts (WebSocket)
    ↓
Dashboard Updates (Doctors/Admins see alerts instantly)
```

---

## 🔄 Complete User Flow

### 1️⃣ **Doctor Uploads Lab Report**

**Location:** `/doctor/lab-reports`

**What Happens:**
```
1. Doctor fills form with:
   - Patient ID
   - Report ID (e.g., LRP-12345)
   - Test Name (Blood Culture, Urine Culture, etc.)
   - Organism (ESBL, MRSA, E. coli, etc.)
   - Sample Type (Blood, Urine, Sputum, Wound, etc.)
   - Collection Date & Result Date
   - Antibiotic Sensitivity Results

2. Frontend validates all fields

3. Sends POST request to:
   → http://localhost:5000/api/lab-reports/upload

4. Backend checks organism against MDR list:
   ✅ If MDR (e.g., ESBL, MRSA):
      - Patient flagged automatically
      - Severity assigned (critical/high/moderate)
      - Real-time alert sent via WebSocket
      - Push notification to all doctors/nurses
      - SMS/Email to infection control team
      - Audit log created
   
   ✅ If Non-MDR (e.g., normal E. coli):
      - Report saved only
      - No alerts triggered
```

---

### 2️⃣ **Real-Time Alerts Dashboard**

**Location:** `/doctor/lab-reports` or `/admin/mdr-alerts`

**What Happens:**
```
1. WebSocket Connection Established:
   ws://localhost:5000/api/notifications/live?userId=123

2. When MDR detected, ALL connected users see:
   🚨 ALERT: Patient #456 tested positive for MDR-ESBL
   
   - Patient name & ID
   - Organism details (ESBL - Extended-Spectrum Beta-Lactamases)
   - Severity level (CRITICAL/HIGH/MODERATE)
   - Isolation requirements (Contact Precautions)
   - Treatment guidelines

3. Frontend displays:
   - Red banner notification
   - Active MDR flags list updates
   - Dashboard stats refresh
   - Browser push notification
```

---

### 3️⃣ **Admin Manages MDR Flags**

**Location:** `/admin/mdr-alerts`

**What Happens:**
```
1. Admin sees all active MDR flags sorted by severity

2. Can update:
   - Isolation status (Pending → Isolated → Not Isolated)
   - Room number assignment
   - Add notes

3. Can clear flag:
   - Enter clearance reason
   - Creates audit trail
   - Sends notification to team
```

---

## 🛠️ Integration Steps

### Step 1: Add New Routes to Frontend

**File:** `client/src/routes/DoctorRoute.jsx`

Add lab reports route:

```jsx
import LabReports from '../features/doctor/LabReports/LabReports';

const doctorMenuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
  { path: '/search', label: 'Patient Search', icon: 'ri-search-line' },
  { path: '/map', label: 'Real-Time Map', icon: 'ri-map-pin-line' },
  { path: '/network', label: 'Contact Network', icon: 'ri-node-tree' },
  { path: '/equipment', label: 'Equipment Check', icon: 'ri-stethoscope-line' },
  { path: '/checklist', label: 'MDR Checklist', icon: 'ri-checkbox-multiple-line' },
  { path: '/lab-reports', label: 'Lab Reports', icon: 'ri-file-list-3-line' }, // NEW
];

// Inside <Routes>
<Route path="/lab-reports" element={<LabReports />} />
```

**File:** `client/src/routes/AdminRoute.jsx`

Add MDR alerts route:

```jsx
import MDRAlerts from '../features/admin/MDRAlerts/MDRAlerts';

// Inside <Routes>
<Route path="/mdr-alerts" element={<MDRAlerts />} />

// Add to navigation menu
<Link
  to="/admin/mdr-alerts"
  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-[#0E8B86] transition flex items-center gap-2"
>
  <i className="ri-alert-line"></i>
  MDR Alerts
</Link>
```

---

### Step 2: Add WebSocket Connection

**File:** `client/src/services/websocket.js` (create new file)

```javascript
import useAuthStore from '../store/useAuthStore';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = [];
  }

  connect() {
    const user = useAuthStore.getState().user;
    if (!user) return;

    this.ws = new WebSocket(`ws://localhost:5000/api/notifications/live?userId=${user.id}`);

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📩 WebSocket message:', data);

      // Notify all listeners
      this.listeners.forEach(callback => callback(data));
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  unsubscribe(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();
```

---

### Step 3: Use WebSocket in Components

**File:** `client/src/features/doctor/LabReports/LabReports.jsx`

```jsx
import { useEffect } from 'react';
import websocketService from '../../../services/websocket';

const LabReports = () => {
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Listen for MDR alerts
    const handleAlert = (data) => {
      if (data.type === 'mdr_alert') {
        // Show toast notification
        setToast({
          type: 'warning',
          message: `🚨 MDR ALERT: ${data.data.message}`
        });

        // Refresh MDR flags list
        fetchActiveMDRFlags();
      }
    };

    websocketService.subscribe(handleAlert);

    return () => {
      websocketService.unsubscribe(handleAlert);
    };
  }, []);

  // ... rest of component
};
```

---

### Step 4: Add Browser Push Notifications (Optional)

**File:** `client/src/services/pushNotifications.js`

```javascript
// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Show browser notification
export const showBrowserNotification = (title, options) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/badge.png',
      ...options
    });
  }
};

// Usage in LabReports component:
import { showBrowserNotification } from '../../../services/pushNotifications';

// When MDR detected:
showBrowserNotification('🚨 MDR Alert', {
  body: 'Patient #123 tested positive for ESBL',
  tag: 'mdr-alert',
  requireInteraction: true
});
```

---

## 📱 Complete UI Flow Examples

### Example 1: Upload Lab Report

```
┌─────────────────────────────────────────────────┐
│  Upload Lab Report                         [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Patient ID: [123        ]  Report ID: [LRP-__]│
│                                                 │
│  Test Name: [Blood Culture    ]                │
│  Organism:  [ESBL            ]  ← Detected MDR │
│  Sample:    [Blood ▾]                          │
│                                                 │
│  Collected: [2024-12-08 10:00]                 │
│  Result:    [2024-12-08 14:30]                 │
│                                                 │
│  Antibiotic Sensitivity:                        │
│  ┌────────────────────────────────────────┐   │
│  │ Ceftriaxone    - Resistant        [X]  │   │
│  │ Ciprofloxacin  - Resistant        [X]  │   │
│  │ Meropenem      - Sensitive        [X]  │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  [Cancel]              [Upload Report ✓]       │
└─────────────────────────────────────────────────┘

RESULT:
✅ Report uploaded successfully
🚨 MDR ORGANISM DETECTED! Patient flagged.
📧 Alerts sent to Infection Control team
```

---

### Example 2: Active MDR Flags Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Active MDR Flags (3)                      [Refresh 🔄]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────┐ HIGH   │
│  │ Patient #123 - John Doe                        │        │
│  │ 🦠 ESBL - Extended-Spectrum Beta-Lactamases    │        │
│  │ Contact precautions required                   │        │
│  │                                                 │        │
│  │ 📅 Flagged: Dec 8, 2024 2:30 PM               │        │
│  │ 🛡️ Isolation: Contact Precautions             │        │
│  │ 🏥 Room: ICU-201                               │        │
│  │                                                 │        │
│  │                            [Update] [Clear]    │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  ┌────────────────────────────────────────────────┐ CRITICAL│
│  │ Patient #456 - Jane Smith                      │        │
│  │ 🦠 MDR-TB - Multi-Drug Resistant Tuberculosis  │        │
│  │ Airborne isolation REQUIRED                    │        │
│  │                                                 │        │
│  │ 📅 Flagged: Dec 7, 2024 9:15 AM               │        │
│  │ 🛡️ Isolation: Airborne + N95 Required         │        │
│  │ 🏥 Room: Negative Pressure Room 5              │        │
│  │                                                 │        │
│  │                            [Update] [Clear]    │        │
│  └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

### Example 3: Real-Time WebSocket Alert

```javascript
// When MDR detected, this appears instantly:

┌─────────────────────────────────────────────────┐
│  🚨 MDR ALERT                              [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Patient #123 tested positive for MDR-ESBL     │
│                                                 │
│  Severity: HIGH                                 │
│  Action Required: Implement contact precautions│
│                                                 │
│  [View Details]              [Acknowledge]     │
└─────────────────────────────────────────────────┘

// + Browser notification
// + Push to mobile app (if configured)
// + SMS to infection control (if configured)
// + Email to department head (if configured)
```

---

## 🎨 Styling Integration

Your components use:
- **Tailwind CSS** (already configured)
- **Framer Motion** for animations (install: `npm install framer-motion`)
- **Remix Icons** (already included: `ri-*` classes)

The provided components match your existing design:
- Brand colors: `#0E8B86` (teal), `#28B99A` (mint)
- Card-based layouts
- Gradient buttons
- Shadow effects
- Responsive grid

---

## 🔧 Installation & Setup

### 1. Install dependencies (if needed)

```powershell
cd client
npm install framer-motion
```

### 2. Copy the new components

```
client/src/features/
  ├── doctor/
  │   └── LabReports/
  │       └── LabReports.jsx
  └── admin/
      └── MDRAlerts/
          └── MDRAlerts.jsx

client/src/services/
  ├── websocket.js
  └── pushNotifications.js
```

### 3. Update routes (DoctorRoute.jsx & AdminRoute.jsx)

Add the new pages to navigation menu and route definitions.

### 4. Start backend + worker

```powershell
cd server
node server.js

# New terminal
node src/workers/notificationWorker.js
```

### 5. Start frontend

```powershell
cd client
npm run dev
```

---

## 📊 How Data Flows

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌────────────────┐      ┌──────────────────┐          │
│  │  LabReports    │      │   MDRAlerts      │          │
│  │  Component     │      │   Component      │          │
│  └────────┬───────┘      └─────────┬────────┘          │
│           │                        │                     │
│           │  POST /lab-reports     │  GET /mdr-flags    │
│           │  /upload               │  /active           │
└───────────┼────────────────────────┼─────────────────────┘
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER                         │
│  ┌────────────────────────────────────────────────┐    │
│  │  /api/lab-reports/upload                        │    │
│  │    → labReportService.processLabReport()        │    │
│  │    → mdrDetectionService.checkMDROrganism()    │    │
│  │    → flagPatientMDR()                          │    │
│  │    → eventPublisher.publishMDRAlert()          │    │
│  └────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   REDIS MESSAGE QUEUE                    │
│  Channel: "mdr:alerts"                                   │
│  Queue:   "mdr:alert:queue"                             │
└───────────┬─────────────────────────────────────────────┘
            │
     ┌──────┴───────┐
     │              │
     ▼              ▼
┌─────────┐  ┌──────────────┐
│WebSocket│  │ Notification │
│Broadcast│  │   Worker     │
└────┬────┘  └──────┬───────┘
     │              │
     │              ├── Push Notification (FCM)
     │              ├── SMS (Twilio)
     │              └── Email (SMTP)
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND REAL-TIME UPDATE                   │
│  • Dashboard shows new MDR flag                          │
│  • Toast notification appears                            │
│  • Browser push notification                             │
│  • Stats counters update                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing the Workflow

### Test 1: Upload MDR Report (ESBL)

```javascript
// In LabReports component:
{
  patientId: 123,
  reportId: "LRP-TEST-001",
  testName: "Blood Culture",
  organism: "ESBL",
  sampleType: "Blood",
  collectedAt: "2024-12-08T10:00:00",
  resultAt: "2024-12-08T14:30:00",
  antibioticSensitivity: [
    { name: "Ceftriaxone", result: "Resistant" },
    { name: "Meropenem", result: "Sensitive" }
  ]
}

Expected Result:
✅ Report uploaded
✅ MDR flag created (severity: HIGH)
✅ WebSocket alert sent
✅ Notification worker processes alert
✅ Frontend shows: "🚨 MDR ORGANISM DETECTED!"
```

### Test 2: Upload Non-MDR Report

```javascript
{
  patientId: 456,
  reportId: "LRP-TEST-002",
  testName: "Urine Culture",
  organism: "E. coli",
  sampleType: "Urine",
  // ... other fields
}

Expected Result:
✅ Report uploaded
❌ No MDR flag (E. coli is not in mdr_list)
✅ Dashboard shows: "Report uploaded successfully"
```

---

## 🎯 Summary

**Your website now has:**

1. ✅ **Lab Report Upload Form** - Doctors can upload lab results
2. ✅ **Automated MDR Detection** - System checks organism against database
3. ✅ **Real-Time Alerts** - WebSocket pushes alerts to all users instantly
4. ✅ **MDR Flags Dashboard** - View/manage active MDR patients
5. ✅ **Multi-Channel Notifications** - Push, SMS, Email support
6. ✅ **Audit Trail** - Complete history of all actions
7. ✅ **Background Processing** - Worker handles notifications async
8. ✅ **Admin Controls** - Update isolation, clear flags, manage alerts

**User Experience:**
- Doctor uploads lab report → **2 seconds** → Alert appears on all connected dashboards
- Zero manual intervention required
- Complete automation from upload to notification

**Matches your existing design:**
- Same color scheme (#0E8B86 teal)
- Same card layouts
- Same navigation structure
- Same authentication flow
