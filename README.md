🏥 Hospital MDR Contact Tracing System ( MedWatch )

A frontend-only React application for tracking and managing Multi-Drug Resistant (MDR) infection contacts in hospitals.
Built for real-time visualization, patient tracing, and infection control teams.

🚀 Features
👨‍💼 Admin Panel

Hospital Map Configuration – Upload floor plans & mark RFID-enabled rooms

User & Role Management – Add staff (supports bulk CSV import/export)

Automated Alert Rules – Configure triggers for MDR events

Compliance & Audit Reports – Export PDF/Excel with charts

System Health Dashboard – Monitor EMR/Lab/RFID integrations

👨‍⚕️ Doctor Dashboard

Patient Tracing Search – Search by name/ID, check MDR risk

Real-Time Interactive Map – Live floor visualization

Contact Network Graph – Using Cytoscape.js

Equipment Exposure Detection

MDR Protocol Checklist – Isolation procedure tracking

🛠️ Tech Stack

React 18 + Vite

Tailwind CSS – Styling

GSAP – Animations

React Router – Routing

Zustand – State management

papaparse / xlsx – CSV & Excel parsing

jsPDF + SheetJS – PDF & Excel exporting

recharts – Charts

cytoscape.js – Graph networks

react-konva – Canvas-based floor maps

Remixicon + MUI Icons

Poppins Font (Google Fonts)

🎨 Color Palette
Purpose	Color
Primary Teal (Header)	#0E8B86
CTA Green (Buttons)	#28B99A
Light Teal (Cards)	#E6F7F5
Background Pale Blue	#DFF6FB
Accent Blue (Icons)	#4AA3C3
Dark Text	#102026
Light Grey (Dividers)	#F5F7F8
📦 Installation
Prerequisites

Node.js 18+

npm

Steps
# Navigate to project directory
cd "C:\Users\bhara\Desktop\Medwatch"

# Install dependencies
npm install

# Run development server (Port 4000)
npm run dev


Open in browser:
👉 http://localhost:4000

📂 Project Structure
hospital-mdr-frontend/
├── package.json
├── vite.config.js (port 4000)
├── tailwind.config.cjs
├── postcss.config.cjs
├── index.html
├── src/
│   ├── main.jsx
│   ├── index.css
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
│       └── useAppStore.js
└── README.md

🧮 Contact Tracing Logic
Direct Contact

✔ Same room
✔ Overlapping time

Indirect Contact

✔ Shared equipment
✔ Shared staff interactions

RFID vs Non-RFID Hospitals

RFID Enabled: Real-time room entry/exit logs

Non-RFID: Uses shift schedules + manual timestamps

Equipment Exposure Rule

If equipment used by MDR patient → flag all users within 24–72 hours

Color Status Codes

🟥 Red – Confirmed MDR

🟨 Yellow – Contact/Risk

🟩 Green – Safe

📊 Data Format (CSV/Excel)
personId, personName, roomId, timeIn, timeOut, equipmentIds
P001, Ramesh Kumar, R101, 2025-11-10T08:00:00, 2025-11-10T09:00:00, EQ001|EQ003
P002, Sunita Devi, R102, 2025-11-10T08:30:00, 2025-11-10T10:00:00, EQ002


➡️ Import via Doctor Dashboard → Patient Search → Import CSV/Excel

💾 Mock Services
EMR/Lab Adapter

Injects mock MDR lab results every 60 seconds

WebSocket Mock

Simulates people movement in real-time

Reports Service

Generates compliance PDFs & Excel reports

🎯 Usage Guide
Admin Workflow

Go to /admin

Upload floor blueprint

Draw rooms & mark RFID zones

Add staff (CSV import supported)

Configure MDR alert rules

Generate compliance reports

Doctor Workflow

Go to /doctor

Import CSV/Excel patient logs

Search patient and view risk status

View live map tracking

Generate contact graph

Perform equipment exposure check

Complete MDR checklist

🌐 Routes
Doctor
/doctor
/doctor/search
/doctor/map
/doctor/network
/doctor/equipment
/doctor/checklist

Admin
/admin
/admin/map-editor
/admin/users
/admin/alerts
/admin/reports
/admin/system

✅ Acceptance Checklist

 Admin uploads blueprint & draws rooms

 Doctor imports CSV and traces contacts

 Real-time map updates via WebSocket mock

 Equipment exposure detection works

 Alerts configuration works

 Compliance PDF/Excel exports

 App runs on http://localhost:4000

🎨 UI/UX Highlights

Bilingual microcopy (Hindi + English)

Smooth GSAP animations

Real-time indicators (pulsing markers)

Color-coded risk levels

Fully responsive layout

🔧 Build for Production
npm run build
npm run preview

📝 Notes

No authentication (demo-only)

Data stored in Zustand store

Uses mock EMR/RFID services

Port 4000 set in Vite config

🤝 Contributing

This is a demonstration project. For production readiness:
✔ Add backend API
✔ Add authentication
✔ Connect to real EMR/RFID sources
✔ Implement tests & monitoring

📄 License

MIT License – Free to use & modify

Built with ❤️ for Hospital Infection Control Teams

🏥 Stay Safe. Track Smart. Save Lives.
