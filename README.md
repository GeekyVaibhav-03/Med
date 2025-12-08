# 🏥 MedWatch - Hospital MDR Management System

> **Enterprise-Grade Hospital Information System** for Multi-Drug Resistant (MDR) infection management, lab report ingestion, real-time alerts, and patient contact tracing.

![MedWatch Banner](https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop)

## ⚡ Quick Links

- **Frontend Setup:** See `client/README.md`
- **Backend Setup:** See `server/` directory
- **API Reference:** See `API_REFERENCE.md`
- **Lab Features:** See `LAB_REPORT_IMPLEMENTATION.md`
- **File Upload Guide:** See `FILE_UPLOAD_GUIDE.md`

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+
- npm
- Windows/Mac/Linux

### 1️⃣ Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2️⃣ Run Backend

```bash
cd server
npm start
```

✅ You should see: `Server + Socket listening on 5000`

### 3️⃣ Run Frontend (New Terminal)

```bash
cd client
npm run dev
```

✅ You should see: `VITE ready - Local: http://localhost:4000/`

### 4️⃣ Open Browser

Go to: **http://localhost:4000**

### 5️⃣ Login

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hospital.com` | `admin123` |
| Doctor | `doctor@hospital.com` | `doctor123` |

---

## 🎯 What This System Does

### Core Features

✅ **Lab Report Management**
- Upload single or batch lab reports (JSON/CSV)
- Automatic MDR detection
- Duplicate prevention
- Detailed error reporting

✅ **Real-Time Alerts**
- Socket.io powered notifications
- MDR+ case alerts to Infection Control
- Mark as read / Delete functionality
- Hospital-scoped broadcasting

✅ **Patient Tracking**
- Patient search by ID/name
- Contact history
- MDR status visibility
- Contamination zones

✅ **Interactive Map**
- Real-time patient locations
- Equipment tracking
- Risk status visualization
- Zone-based contamination

✅ **User Management**
- Admin and Doctor roles
- Hospital assignment
- Bulk CSV import/export
- Password reset

### MDR Detection

**Automatic detection using dual-method algorithm:**
1. **Known organism list** (MRSA, ESBL, VRE, etc.)
2. **Resistance profile analysis** (≥3 classes OR ≥50% resistant)

Result → Auto-flag patient → Generate alert → Notify doctors

---

## 📁 Project Structure

```
Med/
├── server/                    # Express backend (Port 5000)
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── models/           # Sequelize models
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Authentication
│   │   └── socket.js         # Real-time
│   ├── server.js             # App entry
│   ├── .env                  # Config
│   └── medwatch.db           # SQLite (auto-created)
│
├── client/                   # React frontend (Port 4000)
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── features/        # Feature modules
│   │   ├── components/      # UI components
│   │   ├── services/        # API client
│   │   ├── store/           # Zustand state
│   │   └── App.jsx
│   ├── vite.config.js
│   └── tailwind.config.cjs
│
├── sample-lab-reports.json   # Test data (JSON)
├── sample-lab-reports.csv    # Test data (CSV)
├── API_REFERENCE.md          # API docs
├── LAB_REPORT_IMPLEMENTATION.md
├── FILE_UPLOAD_GUIDE.md
└── README.md                 # This file
```

---

## 🔧 Technology Stack

### Frontend
- **React 18** + **Vite**
- **TailwindCSS** (styling)
- **Socket.io-client** (real-time)
- **React Router** (navigation)
- **Zustand** (state management)
- **Cytoscape** (network graphs)
- **Recharts** (charts)
- **GSAP** (animations)

### Backend
- **Express.js** (web framework)
- **Node.js 16+** (runtime)
- **Sequelize** (ORM)
- **SQLite3** (database)
- **Socket.io** (real-time events)
- **Multer** (file uploads)
- **JWT** (authentication)
- **bcrypt** (password hashing)

### Database
- **SQLite** (file-based, zero setup)
- **8 models** (User, Patient, LabReport, Notification, MdrCase, etc.)
- **Auto-sync** on startup

---

## 📊 Lab Report Upload Workflow

### Single Report
1. Go to Admin Dashboard → Lab Report Upload
2. Fill form (patient UID, organism, antibiotic profile)
3. Click Upload
4. MDR detection runs automatically
5. Alert generated if MDR+

### Batch Upload (JSON)
```json
[
  {
    "patient_uid": "P001",
    "patient_name": "John Doe",
    "specimen_type": "Blood",
    "organism": "Staphylococcus aureus",
    "antibiotic_profile": {
      "Ampicillin": "R",
      "Ciprofloxacin": "R",
      "Vancomycin": "S"
    }
  }
]
```

### Batch Upload (CSV)
```csv
patient_uid,patient_name,specimen_type,organism,Ampicillin,Ciprofloxacin
P001,John Doe,Blood,Staph aureus,R,R
```

**Features:**
- ✅ Automatic file validation (5MB limit, JSON/CSV only)
- ✅ Duplicate detection
- ✅ Per-record error handling
- ✅ MDR detection on each record
- ✅ Real-time alert generation
- ✅ Detailed upload results

---

## 🔌 API Overview

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### Lab Reports
```
POST   /api/labreports/upload                # Single
POST   /api/labreports/upload-file           # Batch
GET    /api/labreports/:patient_uid          # History
GET    /api/labreports/mdr/flagged           # MDR cases
```

### Notifications
```
GET    /api/notifications/unread
GET    /api/notifications/all
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
```

### Patients
```
GET    /api/patients/search?q=term
GET    /api/patients/:uid
```

**Full API Reference:** See `API_REFERENCE.md`

---

## 🚨 Real-Time Alerts

### Socket.io Events

**Connect to hospital room:**
```javascript
socket.emit('join_hospital', {
  hospital: 'Hospital A',
  userRole: 'admin'
})
```

**Receive MDR alerts:**
```javascript
socket.on('mdr_alert_notification', (alert) => {
  console.log('New MDR case:', alert)
  // Display alert banner
})
```

### Alert Types
1. **Critical** (Red) - High-risk MDR organism
2. **High** (Orange) - Resistant to multiple classes
3. **Medium** (Yellow) - 3+ antibiotic resistances
4. **Low** (Blue) - Other alerts

---

## 🗄️ Database Models

### LabReport
```
- patient_uid (unique)
- patient_name
- specimen_type
- organism
- antibiotic_profile (JSON)
- is_mdr (boolean)
- status (pending/processed/flagged)
- created_at
```

### Notification
```
- lab_report_id (FK)
- recipient_role
- recipient_hospital
- title
- message
- severity
- is_read
- created_at
```

### User
```
- email (unique)
- password (bcrypt)
- role (admin/doctor)
- hospital
- name
- created_at
```

**Plus 5 more models:** Patient, MdrCase, ContactEdge, RawEvent, Alert

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:4000
```

### Database
- **Auto-creates** `server/medwatch.db` on first run
- **Zero manual setup** required
- **Auto-syncs** schema on startup

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `netstat -ano \| findstr :5000` |
| Database error | Delete `server/medwatch.db` and restart |
| CORS error | Ensure frontend on `localhost:4000` (not 127.0.0.1) |
| No alerts | Check Socket.io connection in DevTools → Network → WS |
| Login failed | Check `.env` JWT_SECRET is set, use default credentials |
| Build error | Run `npm install` in both directories |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `client/README.md` | Frontend setup & features |
| `API_REFERENCE.md` | Complete API documentation |
| `LAB_REPORT_IMPLEMENTATION.md` | Lab report feature details |
| `FILE_UPLOAD_GUIDE.md` | File upload instructions |
| `QUICK_START.md` | 5-minute setup guide |

---

## 🧪 Testing

### Test Data Included

**sample-lab-reports.json** (5 records)
- 3 MDR+ cases (MRSA, Acinetobacter, Pseudomonas)
- 2 Non-MDR cases
- Complete antibiotic profiles

**sample-lab-reports.csv** (10 records)
- Various organisms
- Real antibiotic data
- Test CSV parsing

### How to Test
1. Login as Admin
2. Go to Lab Report Upload
3. Click Batch Upload tab
4. Select `sample-lab-reports.json`
5. Click Upload
6. View results in banner

---

## 🚀 Deployment

### Build Frontend
```bash
cd client
npm run build
# Creates dist/ folder for static hosting
```

### Deploy Backend
```bash
cd server
NODE_ENV=production npm start
```

### Database Backup
```bash
cp server/medwatch.db server/medwatch.db.backup
```

---

## 🤝 Support

### Common Issues

**Frontend blank page?**
- Clear browser cache (Ctrl+Shift+Delete)
- Check DevTools console (F12)
- Ensure backend running on 5000

**Login not working?**
- Check backend logs
- Verify `.env` JWT_SECRET
- Use default credentials

**Alerts not appearing?**
- Check Socket.io in DevTools (Network → WS)
- Verify both servers running
- Check browser console errors

### Getting Help
1. Check **Troubleshooting** section above
2. Review console errors (F12)
3. Check backend logs (`npm start` output)
4. Verify all files created correctly

---

## 📄 License

This project is proprietary hospital software. All rights reserved.

---

## 📞 Contact

For issues, questions, or contributions, please refer to the documentation files above.

---

**Version:** 1.0.0  
**Last Updated:** December 8, 2025  
**Status:** ✅ Production Ready

---

## 🎉 Key Highlights

✨ **Zero Database Setup** - SQLite auto-initializes  
✨ **Real-Time Alerts** - Socket.io powered notifications  
✨ **Batch Import** - JSON & CSV file support  
✨ **MDR Detection** - Automatic organism + resistance analysis  
✨ **Hospital Scoping** - Multi-hospital data isolation  
✨ **Role-Based Access** - Admin & Doctor dashboards  
✨ **Production Ready** - Comprehensive error handling  
✨ **Well Documented** - 5+ documentation files included
