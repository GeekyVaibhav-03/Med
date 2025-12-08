# 🚀 MedWatch - Quick Start Guide

## ✅ SYSTEM IS NOW RUNNING!

### Current Status:
- ✅ Backend: http://localhost:5000 (MongoDB + MySQL)
- ✅ Frontend: http://localhost:4000
- ✅ All APIs working
- ✅ Authentication ready
- ✅ 155 users seeded
- ✅ 30 MDR cases seeded
- ✅ 100 alerts seeded

---

## 🔐 Test Login Credentials

### Admin Account
- Username: `admin1`
- Password: `admin123`
- Access: Full system access

### Doctor Account
- Username: `doctor1`
- Password: `doctor123`
- Access: Patient tracking, MDR cases

### Nurse Account
- Username: `nurse1`
- Password: `nurse123`

### Other Accounts (doctor2, doctor3... doctor30, nurse2... nurse30, etc.)
- Password: Same pattern (role + 123)

---

## 🌐 Application URLs

| Page | URL | Description |
|------|-----|-------------|
| Login | http://localhost:4000/login | Sign in to your account |
| Signup | http://localhost:4000/signup | Create new account (Doctor/Nurse/Pharmacist/Visitor) |
| Admin Dashboard | http://localhost:4000/admin | Admin-only features |
| Doctor Dashboard | http://localhost:4000/doctor | Doctor features |

---

## 🛠️ How to Start (If Servers Are Stopped)

### Method 1: PowerShell Commands
```powershell
# Start Backend (Terminal 1)
cd C:\Users\bhara\Desktop\SIH\server
node server.js

# Start Frontend (Terminal 2 - New Window)
cd C:\Users\bhara\Desktop\SIH\client
npm run dev
```

### Method 2: Quick Restart Script
```powershell
# Kill all node processes and restart
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep 3

# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\bhara\Desktop\SIH\server; node server.js"

# Wait 3 seconds for backend to start
Start-Sleep 3

# Start frontend
cd C:\Users\bhara\Desktop\SIH\client
npm run dev
```

---

## 🔧 Troubleshooting

### Problem: Port 5000 already in use
```powershell
# Find and kill process on port 5000
$proc = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($proc) { Stop-Process -Id $proc.OwningProcess -Force }
```

### Problem: Port 4000 already in use
```powershell
# Find and kill process on port 4000
$proc = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($proc) { Stop-Process -Id $proc.OwningProcess -Force }
```

### Problem: MongoDB not connected
```powershell
# Start MongoDB service
net start MongoDB
```

### Problem: MySQL not connected
```powershell
# Start MySQL service
net start MySQL80
```

---

## 📊 Available Features

### ✅ Working Features:
1. **Authentication**
   - Login with 155 seeded users
   - Signup for new doctors/nurses/pharmacists/visitors
   - JWT token-based auth
   - Auto-redirect based on role

2. **Admin Dashboard**
   - System health monitoring
   - User management (155 users)
   - MDR case management (30 cases)
   - Alert management (100 alerts)
   - Reports and analytics

3. **Doctor Dashboard**
   - Patient search
   - Real-time map
   - Network graph
   - Equipment check
   - Checklist

4. **Database**
   - MongoDB: Users, Alerts, MDR Cases, Contacts
   - MySQL: RFID Tracking Data
   - 1500+ seeded records

5. **Real-time Features**
   - Socket.IO ready
   - Live alert notifications
   - Real-time updates

---

## 🎯 Quick Test Workflow

1. **Open Login Page**: http://localhost:4000/login
2. **Login as Admin**: `admin1` / `admin123`
3. **View Dashboard**: See 155 users, 30 MDR cases, 100 alerts
4. **Check System Health**: Real MongoDB statistics
5. **View Reports**: Patient risk distribution, MDR organisms
6. **Test Signup**: Create new doctor/nurse account
7. **Logout and Login**: Test new account

---

## 📝 Important Notes

- **Backend must start first** (port 5000)
- **Frontend starts after** (port 4000)
- **MongoDB required** for users/alerts/MDR cases
- **MySQL required** for RFID tracking
- **Don't close terminal windows** while servers are running

---

## 🆘 Need Help?

Check these files for detailed information:
- `API_FIXES.md` - Recent API fixes
- `MONGODB_README.md` - MongoDB setup guide
- `SIGNIN_SIGNUP_GUIDE.md` - Authentication guide

---

**Last Updated**: December 8, 2025
**Status**: ✅ ALL SYSTEMS OPERATIONAL
