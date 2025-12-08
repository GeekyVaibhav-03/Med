# Sign In & Sign Up Testing Guide

## ✅ System Status
- **Backend**: Running on http://localhost:5000
- **Frontend**: Running on http://localhost:4000
- **MongoDB**: Connected (155 users)
- **MySQL**: Connected (RFID data)

---

## 🔐 Sign In Testing

### Test with Existing Users

1. **Navigate to**: http://localhost:4000/login

2. **Admin Login**:
   - Username: `admin1`
   - Password: `admin123`
   - Access: Full system (User Management, Reports, System Health, Alerts)

3. **Doctor Login**:
   - Username: `doctor1`
   - Password: `doctor123`
   - Access: Patient Search, MDR Cases, Real-Time Map, Network Graph

4. **Nurse Login**:
   - Username: `nurse1`
   - Password: `nurse123`
   - Access: Patient Care, Equipment Checks, Checklists

### Other Available Users:
- **Pharmacists**: `pharmacist1` - `pharmacist20` (password: `pharma123`)
- **Lab Staff**: `lab1` - `lab15` (password: `lab123`)
- **Visitors**: `visitor1` - `visitor15` (password: `visitor123`)

---

## 📝 Sign Up Testing

### Create New Account

1. **Navigate to**: http://localhost:4000/signup

2. **Fill in the form**:
   - **Role**: Choose from Doctor, Nurse, Pharmacist, or Visitor
   - **Hospital**: Select from dropdown (e.g., "MY Hospital (Maharaja Yeshwantrao), Indore")
   - **Username**: Enter unique username (e.g., `newdoctor1`)
   - **Full Name**: (Optional) e.g., "Dr. John Smith"
   - **Email**: (Optional) e.g., "john.smith@hospital.com"
   - **Phone**: (Optional) e.g., "+91 98765 43210"
   - **Password**: Min 6 characters (e.g., `password123`)
   - **Confirm Password**: Must match password

3. **Submit**: Click "Create Account"

4. **Auto-Login**: System will automatically log you in after successful signup

5. **Redirect**: You'll be redirected based on your role (Doctor → `/doctor`, Admin → `/admin`)

### Important Notes:
- ✅ Public signup supports: **Doctor, Nurse, Pharmacist, Visitor**
- ❌ Admin accounts can only be created by existing administrators
- ✅ Usernames must be unique
- ✅ Password must be at least 6 characters
- ✅ All passwords are encrypted with bcrypt (10 salt rounds)

---

## 🧪 Test Scenarios

### Scenario 1: New Doctor Registration
```
Role: Doctor
Hospital: Apollo Hospital, Indore
Username: testdoctor
Full Name: Dr. Test User
Email: test.doctor@apollo.com
Phone: +91 9876543210
Password: doctor123
```
Expected: Account created → Auto-login → Redirect to /doctor dashboard

### Scenario 2: New Nurse Registration
```
Role: Nurse
Hospital: AIIMS Delhi
Username: testnurse
Password: nurse123
```
Expected: Account created → Auto-login → Redirect to /doctor dashboard (nurses use doctor interface)

### Scenario 3: Duplicate Username
```
Username: admin1 (already exists)
Password: anything
```
Expected: Error message "Username already exists"

### Scenario 4: Short Password
```
Username: newuser
Password: 12345 (only 5 characters)
```
Expected: Error message "Password must be at least 6 characters"

### Scenario 5: Password Mismatch
```
Password: password123
Confirm Password: password456
```
Expected: Error message "Passwords do not match"

### Scenario 6: Try to Create Admin
```
Role: Admin/Hospital
```
Expected: Form only shows Doctor, Nurse, Pharmacist, Visitor options with note about admin accounts

---

## 🔍 What to Check

### After Sign In:
1. ✅ User is redirected to correct dashboard (admin → `/admin`, doctor → `/doctor`)
2. ✅ User information is stored in localStorage
3. ✅ JWT token is included in API requests
4. ✅ Navigation shows correct menu items based on role
5. ✅ User can access protected pages

### After Sign Up:
1. ✅ Account is created in MongoDB
2. ✅ Password is hashed (not stored in plain text)
3. ✅ User is automatically logged in
4. ✅ User can immediately access their dashboard
5. ✅ New user appears in User Management (if logged in as admin)

---

## 🐛 Troubleshooting

### Can't Login?
- Check if backend is running (http://localhost:5000/health)
- Verify credentials are correct (case-sensitive)
- Open browser console to see error messages
- Check if MongoDB is connected (server terminal should show ✅)

### Can't Sign Up?
- Ensure unique username (not already taken)
- Password must be 6+ characters
- Hospital must be selected
- Check browser console for API errors

### API Errors?
- Verify backend is running: `http://localhost:5000/health`
- Check server terminal for error logs
- Ensure MongoDB is connected
- Try refreshing the page

---

## 📊 Database Collections

Your MongoDB database contains:
- **Users**: 155 (admins, doctors, nurses, pharmacists, lab staff, visitors)
- **Hospitals**: 5 major hospitals
- **Departments**: 30 departments
- **MDR Cases**: 30 active cases
- **Alerts**: 100 system alerts

New signups add to the Users collection automatically!

---

## ✨ Features Working

### Sign In Features:
- ✅ Username/password authentication
- ✅ Bcrypt password verification
- ✅ JWT token generation (12h expiry)
- ✅ Role-based access control
- ✅ Failed login tracking (locks after 5 attempts)
- ✅ Auto-redirect based on role
- ✅ Hospital selection for admins

### Sign Up Features:
- ✅ Public registration (doctor, nurse, pharmacist, visitor)
- ✅ Password hashing with bcrypt
- ✅ Duplicate username check
- ✅ Password strength validation
- ✅ Auto-login after signup
- ✅ MongoDB integration
- ✅ Optional fields (email, phone, fullName)

---

## 🎯 Next Steps

1. **Test Login**: Try `admin1` / `admin123`
2. **Test Signup**: Create a new doctor account
3. **Verify Dashboard**: Check if you see MongoDB data
4. **Create Users**: Try creating users with different roles
5. **Test Logout**: Click logout and sign in again

**Ready to test!** 🚀
