# 🏥 Hospital MDR Contact Tracing System

A comprehensive **frontend-only React application** for tracking and managing Multi-Drug Resistant (MDR) infection contacts in hospitals. Built with modern technologies for real-time visualization and contact tracing.

![Hospital MDR System](https://images.unsplash.com/photo-1581092160562-0407be19c2c5?w=1200&h=400&fit=crop)


## 🚀 Features

### 👨‍💼 Admin Panel
- **Hospital Map Configuration**: Upload floor plans and define RFID-enabled rooms
- **User & Role Management**: Manage hospital staff with bulk CSV import/export
- **Automated Alert Configuration**: Set up triggers for MDR events
- **Compliance & Audit Reporting**: Generate PDF/Excel reports with charts
- **System Health Dashboard**: Monitor EMR/Lab/RFID integrations

### 👨‍⚕️ Doctor Dashboard
- **Patient Tracing Search**: Search patients by ID/name with risk status
- **Real-Time Interactive Map**: Live floor visualization with color-coded status
- **Contact Network Graph**: Visualize contamination chains with Cytoscape
- **Equipment Exposure Check**: Track contaminated medical equipment
- **MDR Protocol Checklist**: Track isolation procedures step-by-step

## 🛠️ Tech Stack

- **React 18** + **Vite** (JavaScript)
- **TailwindCSS** - Styling
- **GSAP** - Animations
- **React Router** - Routing
- **Zustand** - State management
- **papaparse / xlsx** - CSV/Excel parsing
- **jsPDF + SheetJS** - PDF/Excel export
- **recharts** - Charts & analytics
- **cytoscape.js** - Network graphs
- **react-konva** - Canvas-based floor maps
- **Remixicon + MUI Icons** - Icon library
- **Poppins** (Google Font) - Typography

## 🎨 Color Palette

```css
Primary Teal (Header):    #0E8B86
CTA Green (Buttons):      #28B99A
Light Teal (Cards):       #E6F7F5
Background Pale Blue:     #DFF6FB
Accent Blue (Icons):      #4AA3C3
Dark Text:                #102026
Light Grey (Dividers):    #F5F7F8
```

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
