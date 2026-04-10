# MedWatch - Complete Setup and Start Guide

## 🚀 Quick Start (First Time Setup)

### Step 1: Create Admin Account

**Option A: Run the batch file**
```
Double-click: setup-admin.bat
```

**Option B: Run manually**
```bash
cd server
node create-admin.js
```

This will create an admin account with:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: admin
- **Hospital**: MY Hospital

### Step 2: Start the Application

**Double-click: start-app.bat**

This will:
- ✅ Clean up any stuck processes
- ✅ Start Backend Server (port 5000)
- ✅ Start Frontend Dev Server (port 4002)
- ✅ Open your browser

### Step 3: Login

1. Go to: `http://localhost:4002/login`
2. Click on the **"Admin/Hospital"** tab
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Click "Sign In"

---

## 👥 Creating Additional Accounts

### For Doctor/Nurse/Pharmacist Accounts:

1. Go to: `http://localhost:4002/signup`
2. Fill in the form:
   - Username
   - Password
   - Email
   - Full Name
   - Select Role (Doctor/Nurse/Pharmacist)
   - Select Hospital
3. Click "Create Account"

**Note**: Admin accounts CANNOT be created through the signup page for security reasons.

---

## 🔧 Troubleshooting

### Issue: "Connection failed" or "Login failed"

**Solution 1: Ensure MongoDB is running**
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# If not running, start it
Start-Service -Name MongoDB
```

**Solution 2: Restart both servers**
1. Close all Node.js terminal windows
2. Double-click `start-app.bat`

### Issue: "Port already in use"

**Solution: Kill processes on ports**
```powershell
# Kill process on port 5000 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Kill process on port 4002 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 4002).OwningProcess | Stop-Process -Force
```

### Issue: "Invalid credentials"

**Solution: Reset admin password**
```bash
cd server
node create-admin.js
```
This will reset the admin password to `admin123`

### Issue: Teal colors not showing

**Solution: Hard refresh browser**
- Press: `Ctrl + Shift + R`
- Or clear browser cache

---

## 📝 Default Accounts After Setup

| Username | Password  | Role   | Access Level |
|----------|-----------|--------|--------------|
| admin    | admin123  | Admin  | Full access to admin panel |

**⚠️ IMPORTANT**: Change the default admin password after first login!

---

## 🌐 Application URLs

- **Frontend**: http://localhost:4002
- **Backend API**: http://localhost:5000
- **Login Page**: http://localhost:4002/login
- **Signup Page**: http://localhost:4002/signup
- **Admin Dashboard**: http://localhost:4002/admin
- **Doctor Dashboard**: http://localhost:4002/doctor

---

## 🛑 Stopping the Application

**Option 1**: Close the terminal windows that opened when you ran `start-app.bat`

**Option 2**: Use Task Manager
- Press `Ctrl + Shift + Esc`
- Find "Node.js" processes
- End them

---

## 📞 Need Help?

If you continue to have issues:

1. Check that MongoDB is installed and running
2. Check that MySQL is installed and running (if using lab reports)
3. Verify `.env` file in server directory has correct database URLs
4. Check server terminal for error messages
