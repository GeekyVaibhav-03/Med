# 🚀 Quick Start: Lab Report MDR Alert System

## ⚡ Get Started in 5 Minutes

### **1. Start Backend & Frontend** (if not already running)
```powershell
# Terminal 1: Start Backend
cd c:\Users\HP\OneDrive\Desktop\Med\server
node server.js
# Expected: DB connected, Server + Socket listening on 5000

# Terminal 2: Start Frontend
cd c:\Users\HP\OneDrive\Desktop\Med\client
npm run dev
# Expected: VITE ready at http://localhost:5173/
```

---

### **2. Login as Admin**
- Go to: http://localhost:5173/
- Click **Sign Up**
- Create account:
  - Username: `admin`
  - Password: `Admin@123`
  - Role: `admin`
- Click **Sign Up**
- Login with same credentials
- Select any hospital
- Click **Confirm**

---

### **3. Access Lab Report Upload**
- You'll see Admin Dashboard
- Click **"Lab Report Upload"** in sidebar (or go to `/admin/lab-upload`)

---

### **4. Test MDR Detection**

#### **Test Case 1: MRSA (Should Alert ✅)**
Fill the form:
```
Patient UID: P001
Patient Name: John Doe
Specimen Type: Blood
Organism: Staphylococcus aureus

Antibiotic Profile:
- Ampicillin: Resistant (R)
- Amoxicillin: Resistant (R)
- Ciprofloxacin: Resistant (R)
- Gentamicin: Resistant (R)
- Erythromycin: Resistant (R)

Click "Upload Report"
```

**Expected Result:**
- ❌ Red banner appears: "🚨 MDR ALERT: Staphylococcus aureus"
- Toast shows: "MDR ALERT: Staphylococcus aureus detected! Alerts sent."
- Report appears in list with red "🚨 MDR+" badge
- Real-time notification at top-right

---

#### **Test Case 2: Non-MDR E. coli (No Alert ✅)**
Fill the form:
```
Patient UID: P002
Patient Name: Jane Smith
Specimen Type: Urine
Organism: Escherichia coli

Antibiotic Profile:
- Ampicillin: Resistant (R)
- Ciprofloxacin: Susceptible (S)
- Gentamicin: Susceptible (S)
- Erythromycin: Susceptible (S)

Click "Upload Report"
```

**Expected Result:**
- ✅ Green success toast: "Report processed successfully."
- Report appears with green "✓ Safe" badge
- No urgent alerts

---

### **5. Check Notifications**
- Look at top-right corner for **MDRAlertBanner**
- Shows unread alerts with:
  - 🚨 MDR organism name
  - Patient information
  - Time received
  - Click "X" to close
  - Click "Mark as Read" to acknowledge

---

### **6. Verify Real-Time Alerts via API**
```bash
# Get unread notifications
curl -X GET http://localhost:5000/api/notifications/unread \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# Mark notification as read
curl -X PUT http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# Get all MDR-flagged reports
curl -X GET http://localhost:5000/api/labreports/mdr/flagged \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 🧪 What Happens Behind the Scenes

### **When You Upload MRSA:**

1. **API Call** → Backend receives `/api/labreports/upload`

2. **Database Save** → LabReport created with all details

3. **MDR Detection** → Service analyzes:
   - Organism name matches "MRSA" pattern? YES
   - Antibiotic resistance ≥3 classes? YES (Beta-lactams, Fluoroquinolones, Aminoglycosides)
   - → **RESULT: MDR = TRUE**

4. **Create Case** → MdrCase record created for tracking

5. **Send Alerts** → 3 notifications created:
   - Infection Control notification
   - Doctor notification
   - Admin notification

6. **Real-Time Broadcast** → Socket.io sends to all connected clients

7. **Frontend Display** → MDRAlertBanner shows immediately

---

## 🔍 Database Check

To verify reports were saved:

```powershell
# View SQLite database
sqlite3 c:\Users\HP\OneDrive\Desktop\Med\server\medwatch.db

# Check lab reports table
SELECT * FROM lab_reports;

# Check notifications
SELECT * FROM notifications;

# Check MDR cases
SELECT * FROM mdr_cases;
```

---

## 🧩 Component Files Created

| File | Purpose |
|------|---------|
| `server/src/routes/labreports.js` | Lab report API endpoints |
| `server/src/routes/notifications.js` | Notification API endpoints |
| `server/src/services/mdrDetectionService.js` | MDR detection logic |
| `server/src/services/notificationService.js` | Notification sending logic |
| `server/src/socket.js` | Socket.io real-time config (UPDATED) |
| `server/server.js` | Register new routes (UPDATED) |
| `server/src/models/index.js` | LabReport & Notification models (UPDATED) |
| `client/src/features/admin/LabReportUpload/LabReportUpload.jsx` | Upload form & UI |
| `client/src/services/mdrAlertListener.js` | Socket.io client listener |
| `client/src/components/MDRAlertBanner.jsx` | Real-time alert display |
| `client/src/routes/AdminRoute.jsx` | Added lab upload route (UPDATED) |

---

## ✅ Troubleshooting

| Issue | Solution |
|-------|----------|
| No alerts showing | Check browser console (F12), ensure Socket.io connected |
| MDRAlertBanner not visible | Check if component imported in AdminRoute |
| Notifications not saved | Verify database exists at `server/medwatch.db` |
| API 401 error | Check JWT token is included in Authorization header |
| Port 5000 in use | Kill process or change PORT in `.env` |

---

## 📞 Support

**Backend Logs**: Check server terminal for error messages  
**Frontend Logs**: Open browser DevTools (F12 → Console)  
**Database**: SQLite at `server/medwatch.db`  

---

**You're all set! Start uploading lab reports and see the MDR alerts in action! 🎉**
