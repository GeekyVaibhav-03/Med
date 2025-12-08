# 🏥 MedWatch - Hospital MDR Management System

> **Complete Full-Stack Hospital Information System** for tracking Multi-Drug Resistant (MDR) infections, managing lab reports, real-time alerts, and patient contact tracing.

![MedWatch System](https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**MedWatch** is an enterprise-grade hospital management system designed to:

1. **Ingest lab reports** (JSON/CSV) with automated MDR detection
2. **Real-time alert system** for MDR+ cases with Socket.io
3. **Patient contact tracing** and contamination tracking
4. **Interactive hospital floor maps** with RFID tracking
5. **Comprehensive dashboards** for admin and doctor roles
6. **Hospital data isolation** with multi-hospital support

### Key Workflow
```
Lab Report Upload → MDR Detection → Notification Generation 
→ Real-time Alert → Doctor Notification → Patient Isolation
```

---

## ✨ Core Features

### 🏥 Admin Dashboard
- **📊 Lab Report Upload** (Single & Batch)
  - JSON file upload for multiple records
  - CSV file upload with antibiotic profiles
  - Automatic MDR detection on each record
  - Duplicate detection & error reporting
  
- **🚨 Real-Time Alerts**
  - Socket.io based live notifications
  - MDR+ case alerts to Infection Control
  - Hospital-scoped alert broadcasting
  - Mark as read / Delete functionality

- **👥 User Management**
  - Admin/Doctor role management
  - Hospital assignment
  - Bulk CSV import/export
  - Password reset functionality

- **🗺️ Hospital Map Configuration**
  - Floor plan editor with Konva
  - RFID room setup
  - Contact zone definition
  - Zone-based tracking

- **📈 Reports & Analytics**
  - MDR case statistics
  - Contamination trends
  - Compliance reports
  - System health monitoring

### 👨‍⚕️ Doctor Dashboard
- **🔍 Patient Search**
  - Search by patient UID/name
  - View patient history
  - See MDR status
  - Track contacts

- **🗺️ Real-Time Interactive Map**
  - Live patient locations (RFID)
  - Color-coded risk status
  - Equipment locations
  - Zone contamination

- **📡 Network Graph**
  - Visualize contact chains
  - Show transmission routes
  - Identify high-risk contacts
  - Interactive node/edge filtering

- **🛠️ Equipment Check**
  - Track contaminated equipment
  - Decontamination log
  - Equipment movement history

- **✅ MDR Protocol Checklist**
  - Isolation procedures
  - PPE requirements
  - Sample collection steps
  - Sign-off workflow

---

## 🛠️ Tech Stack

### Frontend
```
React 18          - UI Framework
Vite              - Build tool & dev server
TailwindCSS       - Styling
GSAP              - Animations
React Router      - Client-side routing
Zustand           - State management
Socket.io-client  - Real-time communication
axios             - HTTP client
```

### Backend
```
Express.js        - Web framework
Node.js 16+       - Runtime
Sequelize         - ORM
SQLite3           - Database (file-based)
Socket.io         - Real-time events
bcrypt            - Password hashing
JWT               - Authentication
Multer            - File upload handling
```

### Database
```
SQLite            - Primary database (medwatch.db)
No external setup - Zero MySQL/PostgreSQL needed
Auto-sync on startup - Self-initializing
```

### Supporting Libraries
- **Data Processing**: papaparse (CSV), xlsx (Excel)
- **Visualization**: cytoscape.js (graphs), recharts (charts), react-konva (canvas)
- **Export**: jsPDF (PDF), SheetJS (Excel)
- **Icons**: Remixicon, Material-UI Icons
- **Utilities**: dotenv, cors, morgan, body-parser

---

## 📁 Project Structure

```
Med/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── MDRAlertBanner.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Unauthorized.jsx
│   │   ├── features/                # Feature modules
│   │   │   ├── admin/
│   │   │   │   ├── LabReportUpload/     # Lab report ingestion
│   │   │   │   ├── MapEditor/           # Floor plan editor
│   │   │   │   ├── UsersPage/           # User management
│   │   │   │   ├── AlertsConfig/        # Alert configuration
│   │   │   │   ├── ReportsPage/         # Analytics & reports
│   │   │   │   └── SystemHealth/        # System monitoring
│   │   │   └── doctor/
│   │   │       ├── PatientSearch/       # Patient lookup
│   │   │       ├── RealTimeMap/         # Live map
│   │   │       ├── NetworkGraph/        # Contact graph
│   │   │       ├── EquipmentCheck/      # Equipment tracking
│   │   │       └── Checklist/           # MDR protocol
│   │   ├── routes/
│   │   │   ├── AdminRoute.jsx           # Admin routing
│   │   │   └── DoctorRoute.jsx          # Doctor routing
│   │   ├── services/                # API & utilities
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── mdrAlertListener.js   # Socket.io client
│   │   │   ├── csvParser.js
│   │   │   ├── reportsService.js
│   │   │   └── tracingEngine.js
│   │   ├── store/                   # Zustand stores
│   │   │   ├── useAuthStore.js
│   │   │   └── useAppStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   └── postcss.config.cjs
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.js              # Authentication
│   │   │   ├── labreports.js        # Lab report CRUD + upload
│   │   │   ├── notifications.js     # Alert management
│   │   │   ├── mdrcases.js          # MDR case tracking
│   │   │   ├── patients.js          # Patient data
│   │   │   ├── contacts.js          # Contact tracing
│   │   │   ├── map.js               # Map/zone data
│   │   │   ├── rfid.js              # RFID tracking
│   │   │   ├── users.js             # User management
│   │   │   ├── ingest.js            # Data ingestion
│   │   │   └── alerts.js            # Alert configuration
│   │   ├── models/
│   │   │   └── index.js             # Sequelize models (8 models)
│   │   ├── services/                # Business logic
│   │   │   ├── mdrDetectionService.js   # MDR detection algorithm
│   │   │   ├── notificationService.js   # Alert generation
│   │   │   ├── tracingEngine.js
│   │   │   ├── emrMockAdapter.js
│   │   │   └── websocketMock.js
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT auth middleware
│   │   ├── controllers/
│   │   │   └── contactCalculator.js
│   │   └── socket.js                # Socket.io setup
│   ├── server.js                    # Express app initialization
│   ├── Package.json
│   ├── .env                         # Environment variables
│   └── medwatch.db                  # SQLite database (auto-created)
│
├── sample-lab-reports.json          # Test data (JSON)
├── sample-lab-reports.csv           # Test data (CSV)
├── API_REFERENCE.md                 # API documentation
├── LAB_REPORT_IMPLEMENTATION.md     # Lab report feature guide
├── FILE_UPLOAD_GUIDE.md             # File upload instructions
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Windows/Mac/Linux**
- No database setup required (SQLite auto-initializes)

### Installation

**1. Clone/Download Project**
```bash
cd C:\Users\HP\OneDrive\Desktop\Med
```

**2. Install Backend Dependencies**
```bash
cd server
npm install
```

**3. Install Frontend Dependencies**
```bash
cd ../client
npm install
```

### Running the System

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
✅ Expected: `Server + Socket listening on 5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
✅ Expected: `VITE ready - Local: http://localhost:4000/`

### Access Application

Open browser: **http://localhost:4000**

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | doctor@hospital.com | doctor123 |

---

## 📖 Usage Guide

### 1. Upload Lab Reports (Admin)

**Navigate to:** Admin Dashboard → Lab Report Upload

**Two Modes:**

**Mode A: Single Report**
- Fill form with patient details
- Select specimen type (Blood, Urine, Sputum, etc.)
- Enter organism name
- Set antibiotic susceptibilities (S/R/I/U)
- Click Upload

**Mode B: Batch Upload (JSON/CSV)**
- Click "Batch Upload" tab
- Select `sample-lab-reports.json` or `.csv`
- View upload results
- MDR+ cases auto-trigger alerts

**Example JSON:**
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

**Example CSV:**
```csv
patient_uid,patient_name,specimen_type,organism,Ampicillin,Ciprofloxacin
P001,John Doe,Blood,Staph aureus,R,R
```

### 2. View Real-Time Alerts

**MDR Alert Banner** (bottom-right corner)
- Shows unread notifications
- Click to mark as read
- Displays severity (Critical/High/Medium)
- Auto-refreshes every 5 seconds

### 3. Patient Search (Doctor)

**Navigate to:** Doctor Dashboard → Patient Search
- Search by patient UID or name
- View MDR status
- See contact history
- Check contamination zones

### 4. Floor Map (Doctor)

**Navigate to:** Doctor Dashboard → Real-Time Map
- Interactive floor visualization
- Patient locations (RFID)
- Equipment status
- Zone contamination levels

---

## 🔌 API Documentation

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Lab Reports
```
POST /api/labreports/upload              # Single report
POST /api/labreports/upload-file         # Batch (JSON/CSV)
GET  /api/labreports/:patient_uid        # Patient history
GET  /api/labreports/mdr/flagged         # All MDR+ cases
GET  /api/labreports/latest/all          # Recent reports
```

### Notifications
```
GET  /api/notifications/unread           # Unread alerts
GET  /api/notifications/all              # All alerts
PUT  /api/notifications/:id/read         # Mark as read
DELETE /api/notifications/:id            # Delete alert
DELETE /api/notifications/cleanup/old    # Clean old (30+ days)
```

### Patients
```
GET  /api/patients/search?q=term         # Search patients
GET  /api/patients/:uid                  # Patient details
PUT  /api/patients/:uid/flag             # Flag as MDR+
```

### Users
```
POST /api/admin/users                    # Create user
GET  /api/admin/users                    # List users
PUT  /api/admin/users/:id                # Update user
DELETE /api/admin/users/:id              # Delete user
```

### Full API Reference
See **API_REFERENCE.md** for complete endpoint documentation

---

## 🗄️ Database Schema

### Models (8 Total)

**LabReport**
- patient_uid (unique)
- patient_name
- specimen_type
- organism
- antibiotic_profile (JSON)
- is_mdr (boolean)
- status (pending/processed/flagged)
- created_at

**Notification**
- lab_report_id (FK)
- mdr_case_id (FK)
- recipient_role (enum)
- recipient_hospital
- title
- message
- severity (critical/high/medium/low)
- is_read (boolean)
- created_at

**MdrCase** (tracks MDR instances)
- patient_uid
- organism
- antibiotic_profile
- risk_level
- created_at

**User**
- email (unique)
- password (bcrypt hashed)
- role (admin/doctor/nurse)
- hospital (hospital name)
- name
- created_at

**Patient**
- uid (unique)
- name
- age
- hospital
- status
- created_at

**ContactEdge** (patient-to-patient exposure)
- source_patient_uid
- target_patient_uid
- contact_type (direct/indirect/equipment)
- timestamp

**RawEvent** (RFID/sensor data)
- event_type
- patient_id
- location
- timestamp

**Alert** (alert configuration)
- name
- condition
- action
- hospital
- enabled

---

## ⚙️ Configuration

### Environment Variables (.env)

**Backend (.env in server/ directory):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=sqlite:./medwatch.db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:4000
```

### Database Initialization
- Auto-creates `medwatch.db` on first run
- Auto-syncs schema on startup
- No migration files needed

### CORS Settings
```javascript
origin: "http://localhost:4000"  // Frontend URL
credentials: true               // For auth cookies
methods: ["GET", "POST", "PUT", "DELETE"]
allowedHeaders: ["Content-Type", "Authorization"]
```

---

## 🌐 Real-Time Features

### Socket.io Events

**Client → Server:**
```javascript
socket.emit('join_hospital', { hospital: 'Hospital A', userRole: 'admin' })
socket.emit('subscribe_patient', { patientUid: 'P001' })
```

**Server → Client:**
```javascript
socket.on('mdr_alert_notification', (alert) => {
  // Real-time MDR+ alert
})
```

---

## 📊 MDR Detection Algorithm

### Dual-Method Detection

**Method 1: Known Organisms**
```
Known MDR Organisms:
- Staphylococcus aureus (MRSA)
- Escherichia coli (ESBL)
- Klebsiella pneumoniae
- Acinetobacter baumannii
- Pseudomonas aeruginosa
- Mycobacterium tuberculosis
- Vancomycin-resistant Enterococcus (VRE)
- Methicillin-resistant organisms
- Extended-spectrum beta-lactamase (ESBL)
```

**Method 2: Resistance Profile**
```
MDR if:
- Resistant to ≥3 antibiotic classes, OR
- Resistant to ≥50% of tested antibiotics, OR
- Known MDR organism name detected
```

**Antibiotic Classes:**
- Beta-lactams (Ampicillin, Amoxicillin, Cephalexin)
- Fluoroquinolones (Ciprofloxacin, Levofloxacin)
- Aminoglycosides (Gentamicin, Streptomycin)
- Tetracyclines (Doxycycline, Tetracycline)
- Carbapenems (Meropenem, Imipenem)
- Glycopeptides (Vancomycin, Teicoplanin)
- Oxazolidinones (Linezolid, Tedizolid)

---

## 🚀 Deployment

### Local Development
```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
cd client && npm run dev
```

### Production Build

**Frontend:**
```bash
cd client
npm run build
# Generates dist/ folder for static hosting
```

**Backend:**
```bash
cd server
NODE_ENV=production npm start
```

### Database Backup
```bash
# SQLite database file
cp server/medwatch.db server/medwatch.db.backup
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 4000 (frontend)
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Database Error
```bash
# Delete database and restart (will auto-recreate)
rm server/medwatch.db
npm start
```

### CORS Error
- Ensure frontend running on `http://localhost:4000` (not `127.0.0.1`)
- Check `.env` CORS_ORIGIN matches frontend URL

### No Alerts Appearing
- Check Socket.io connection (DevTools → Network → WS)
- Verify both frontend & backend running
- Check browser console (F12) for errors

### Login Failed
- Use default credentials (see Quick Start)
- Check backend is running (`npm start`)
- Check `.env` JWT_SECRET is set

### File Upload Issues
- Max file size: 5MB
- Supported formats: JSON, CSV only
- Check file format matches examples
- Use sample files to test

---

## 📝 File Format Reference

### JSON Lab Report Format
```json
[
  {
    "patient_uid": "string (required, unique)",
    "patient_name": "string (optional)",
    "specimen_type": "string (Blood/Urine/Sputum/etc)",
    "organism": "string (required)",
    "antibiotic_profile": {
      "Antibiotic_Name": "S|R|I|U"
    }
  }
]
```

### CSV Lab Report Format
```
Headers: patient_uid, patient_name, specimen_type, organism, [antibiotic_name...]
Values: Antibiotic values must be S (Susceptible), R (Resistant), I (Intermediate), or U (Unknown)
```

---

## 📚 Additional Documentation

- **`API_REFERENCE.md`** - Complete API endpoint reference
- **`LAB_REPORT_IMPLEMENTATION.md`** - Lab report feature details
- **`FILE_UPLOAD_GUIDE.md`** - File upload instructions
- **`QUICK_START.md`** - 5-minute setup guide

---

## 🤝 Contributing

To add features:

1. **Backend:** Add route in `server/src/routes/`
2. **Service:** Add business logic in `server/src/services/`
3. **Frontend:** Add component in `client/src/features/` or `client/src/pages/`
4. **Test:** Use sample data files to test

---

## 📄 License

This project is proprietary hospital software. All rights reserved.

---

## 📞 Support

For issues or questions:
1. Check **Troubleshooting** section above
2. Review console errors (F12)
3. Check backend logs (`npm start` output)
4. Verify all files are created (see Project Structure)

---

**Last Updated:** December 8, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm

### Steps

1. **Clone or navigate to the project directory**
```powershell
cd "c:\Users\bhara\Desktop\Medwatch"
```

2. **Install dependencies**
```powershell
npm install
```

3. **Start development server (Port 4000)**
```powershell
npm run dev
```

4. **Open in browser**
```
http://localhost:4000
```

## 📂 Project Structure

```
hospital-mdr-frontend/
├── package.json
├── vite.config.js (port 4000)
├── tailwind.config.cjs
├── postcss.config.cjs
├── index.html
├── src/
│   ├── main.jsx
│   ├── index.css (Poppins font + Tailwind)
│   ├── App.jsx
│   ├── routes/
│   │   ├── AdminRoute.jsx
│   │   └── DoctorRoute.jsx
│   ├── features/
│   │   ├── admin/
│   │   │   ├── MapEditor/
│   │   │   ├── UsersPage/
│   │   │   ├── AlertsConfig/
│   │   │   ├── ReportsPage/
│   │   │   └── SystemHealth/
│   │   └── doctor/
│   │       ├── PatientSearch/
│   │       ├── RealTimeMap/
│   │       ├── NetworkGraph/
│   │       ├── EquipmentCheck/
│   │       └── Checklist/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── Toast.jsx
│   ├── services/
│   │   ├── csvParser.js
│   │   ├── websocketMock.js
│   │   ├── emrMockAdapter.js
│   │   ├── tracingEngine.js
│   │   └── reportsService.js
│   └── store/
│       └── useAppStore.js (Zustand)
└── README.md
```

## 🧮 Contact Tracing Logic

### Direct Contact
- Two people in the same room with overlapping time → contact

### Indirect Contact
- Connected via shared equipment or staff member

### RFID vs Non-RFID Hospitals
- **RFID enabled**: Use real-time RFID event logs
- **Non-RFID**: Use shift schedules & manual timestamps

### Equipment Exposure
- If MDR patient used equipment → flag all users within 24-72 hrs

### Color Status
- 🟥 **Red** = Confirmed MDR/Threat
- 🟨 **Yellow** = Contact/Risky/Screening Due
- 🟩 **Green** = Safe

## 📊 Data Format (CSV/Excel Import)

```csv
personId,personName,roomId,timeIn,timeOut,equipmentIds
P001,Ramesh Kumar,R101,2025-11-10T08:00:00,2025-11-10T09:00:00,EQ001,EQ003
P002,Sunita Devi,R102,2025-11-10T08:30:00,2025-11-10T10:00:00,EQ002
```

Import via **Doctor Dashboard > Patient Search > Import CSV/Excel**

## 💾 Mock Services

### EMR/Lab Adapter
Auto-injects mock MDR lab results every 60 seconds

### WebSocket Mock
Simulates real-time people movement across rooms

### Reports Service
Generates compliance PDFs and Excel exports

## 🎯 Usage

### Admin Workflow
1. Go to `/admin` → Map Configuration
2. Upload hospital floor plan blueprint
3. Define rooms and enable RFID tracking
4. Add users via User Management
5. Configure alert rules for MDR events
6. Generate compliance reports

### Doctor Workflow
1. Go to `/doctor` → Patient Search
2. Import CSV/Excel with contact data
3. Search for patients by name/ID
4. View real-time map with live tracking
5. Build contact network graphs
6. Check equipment contamination
7. Complete MDR isolation checklist

## 🌐 Routes

- `/` → Redirects to `/doctor`
- `/doctor/*` → Doctor Dashboard
  - `/doctor/search` - Patient Search
  - `/doctor/map` - Real-Time Map
  - `/doctor/network` - Contact Network
  - `/doctor/equipment` - Equipment Check
  - `/doctor/checklist` - MDR Checklist
- `/admin/*` → Admin Panel
  - `/admin/map-editor` - Map Configuration
  - `/admin/users` - User Management
  - `/admin/alerts` - Alert Configuration
  - `/admin/reports` - Reports & Analytics
  - `/admin/system` - System Health

## ✅ Acceptance Checklist

- [x] Admin can upload blueprint and draw rooms
- [x] Doctor can import CSV and trace patient contacts
- [x] Real-time map updates via WebSocket mock
- [x] Equipment check flags MDR exposures
- [x] Alert rules configuration
- [x] Admin can export compliance reports (PDF/Excel)
- [x] App runs on **http://localhost:4000**

## 🎨 UI/UX Highlights

- **Bilingual microcopy** (Hindi-English)
- **GSAP animations** on page load, hover effects, pulsing markers
- **Smooth transitions** and hover states
- **Color-coded status** (Red/Yellow/Green)
- **Real-time updates** simulation
- **Responsive design** (mobile-friendly)

## 🔧 Build for Production

```powershell
npm run build
```

Preview production build:
```powershell
npm run preview
```

## 📝 Notes

- **No authentication** - Frontend only
- **Mock data** included in Zustand store
- **Sample images** from Unsplash
- **Port 4000** configured in `vite.config.js`

## 🤝 Contributing

This is a demonstration project. For production use:
- Add backend API integration
- Implement authentication
- Use real RFID/EMR data feeds
- Add comprehensive testing

## 📄 License

MIT License - Free to use and modify

---

**Built with ❤️ for Hospital Infection Control Teams**

🏥 **Stay Safe. Track Smart. Save Lives.**
