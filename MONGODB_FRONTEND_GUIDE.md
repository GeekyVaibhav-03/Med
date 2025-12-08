# MedWatch - MongoDB Frontend Integration Guide

## 🎉 Your System is Now Running!

### Current Status
✅ **Backend Server**: Running on http://localhost:5000
✅ **Frontend Client**: Running on http://localhost:4000
✅ **MongoDB Database**: Connected with 155 users, 30 MDR cases, 100 alerts
✅ **MySQL Database**: Connected for RFID tracking

---

## 🔐 Test Credentials

The MongoDB database has been seeded with the following test users:

### Admin Users
- **Username**: `admin1`, `admin2`, `admin3`, `admin4`, `admin5`
- **Password**: `admin123`
- **Role**: Admin
- **Access**: Full system access including user management, reports, system health

### Doctor Users
- **Username**: `doctor1` through `doctor50`
- **Password**: `doctor123`
- **Role**: Doctor
- **Access**: Patient search, MDR cases, contact tracing, real-time maps

### Nurse Users
- **Username**: `nurse1` through `nurse50`
- **Password**: `nurse123`
- **Role**: Nurse
- **Access**: Patient care, equipment checks, checklists

### Other Users
- **Pharmacists**: `pharmacist1`-`pharmacist20` (password: `pharma123`)
- **Lab Staff**: `lab1`-`lab15` (password: `lab123`)
- **Visitors**: `visitor1`-`visitor15` (password: `visitor123`)

---

## 📊 What Data is Available

Your MongoDB database now contains:

1. **Hospitals**: 5 major hospitals (AIIMS, Apollo, Fortis, Max, Medanta)
2. **Departments**: 30 departments across different specialties
3. **Rooms**: 525 hospital rooms with status (occupied, available, maintenance)
4. **Users**: 155 users with different roles
5. **Persons**: 400 tracked individuals (patients, staff, visitors)
6. **RFID Events**: 1000 tracking events
7. **Contact Edges**: 10 contact relationships
8. **MDR Cases**: 30 active MDR cases with various organisms
9. **Alerts**: 100 system alerts (critical, warning, info)

---

## 🚀 How to Use the System

### 1. Login to the System
1. Open http://localhost:4000 in your browser
2. Use any of the test credentials above
3. **Example**: Username `admin1`, Password `admin123`

### 2. Admin Dashboard Features

#### User Management (`/admin/users`)
- View all 155 users in the system
- Add new users with username, password, role
- Edit existing users (email, hospital, active status)
- Delete users
- Search and filter by role, hospital
- Export user list to CSV

#### System Health (`/admin/health`)
- Real-time database statistics
- MongoDB connection status
- Collection counts (users, patients, MDR cases, alerts)
- Active user metrics
- System integrations status

#### Reports Page (`/admin/reports`)
- MDR cases statistics (30 active cases)
- Patient risk distribution charts
- MDR organisms breakdown
- Alert metrics
- Contact tracing analytics

#### Alerts Configuration (`/admin/alerts`)
- View 100 system alerts from MongoDB
- Mark alerts as read
- Filter by severity, type, status
- Real-time Socket.IO updates

### 3. Doctor Dashboard Features

#### Patient Search
- Search 400 tracked persons
- View patient profiles and risk levels
- Check RFID tracking history

#### MDR Cases
- View 30 active MDR cases
- Track organisms: MRSA, VRE, CRE, MDR-TB, etc.
- See infection types and severity
- Contact tracing with BFS algorithm

#### Real-Time Map
- Visual tracking of patients and staff
- RFID location updates
- Room occupancy status

#### Network Graph
- Contact relationship visualization
- Direct and indirect contact tracking
- Risk propagation analysis

---

## 🔄 API Endpoints Now Using MongoDB

### Authentication (`/api/auth`)
- `POST /login` - User login with bcrypt password verification
- `POST /register` - Admin-only user registration
- `GET /me` - Get current user details

### Users (`/api/admin/users`)
- `GET /` - List all users (with filters)
- `GET /:id` - Get single user
- `POST /` - Create new user
- `PATCH /:id` - Update user
- `DELETE /:id` - Delete user

### MDR Cases (`/api/mdrcases`)
- `GET /` - List all MDR cases (with filters)
- `GET /:id` - Get single case with details
- `POST /` - Create new MDR case (auto-triggers contact tracing)
- `PATCH /:id` - Update case status

### Alerts (`/api/alerts`)
- `GET /` - List alerts (with filters: resolved, type, severity)
- `POST /` - Create alert (with Socket.IO broadcast)
- `PATCH /:id` - Mark as read/resolved
- `DELETE /:id` - Delete alert

### Dashboard (`/api/dashboard`)
- `GET /stats` - Aggregated statistics
  - User counts (total, active)
  - Patient counts (total, high risk)
  - MDR cases (active, critical)
  - Alerts (unresolved, critical)
  - Risk distribution
  - MDR by organism
- `GET /activity` - Recent activity feed
- `GET /health` - System health metrics

---

## 📈 Data Structure

### MongoDB Collections

#### Users
```javascript
{
  username: "admin1",
  passwordHash: "bcrypt_hash",
  role: "admin",
  email: "admin1@hospital.com",
  hospital: "AIIMS Delhi",
  fullName: "Admin User",
  active: true,
  lastLogin: Date,
  failedLoginAttempts: 0
}
```

#### MDR Cases
```javascript
{
  uid: "RFID001",
  personId: ObjectId,
  hospitalId: ObjectId,
  departmentId: ObjectId,
  organism: "MRSA",
  infectionType: "wound",
  severity: "moderate",
  status: "active",
  isolationRequired: true,
  detectedAt: Date
}
```

#### Alerts
```javascript
{
  type: "mdr_detection",
  message: "New MDR case detected",
  severity: "critical",
  priority: 5,
  hospitalId: ObjectId,
  relatedCaseId: ObjectId,
  read: false,
  resolved: false,
  actionRequired: true
}
```

---

## 🔧 Troubleshooting

### Can't Login?
- Make sure backend is running (http://localhost:5000)
- Check credentials match exactly (case-sensitive)
- Open browser console to see error messages

### No Data Showing?
- Check browser console for API errors
- Verify MongoDB is connected (check server terminal)
- Try refreshing the page

### Need More Data?
- Run seed script again: `cd server && npm run seed:mongo`
- This will clear and recreate all data

### API Errors?
- Check server terminal for error messages
- Verify JWT token is being sent (check Network tab)
- Ensure user role has permission for the endpoint

---

## 🎯 Next Steps

1. **Test Login**: Use `admin1` / `admin123` to access admin dashboard
2. **View Users**: Navigate to User Management to see all 155 users
3. **Check System Health**: View database statistics and collection counts
4. **Explore MDR Cases**: See 30 active cases with different organisms
5. **Review Alerts**: Check 100 system alerts and mark them as read
6. **Test API**: Use Postman or browser to test `/api/dashboard/stats`

---

## 📝 Important Notes

- All passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 12 hours
- Failed login attempts are tracked (locks after 5 failures)
- Socket.IO broadcasts real-time updates for alerts and MDR cases
- MongoDB IDs are automatically mapped to `id` field for frontend compatibility
- RFID tracking still uses MySQL database (hybrid architecture)

---

## 🆘 Support

If you encounter issues:
1. Check server terminal for error logs
2. Check browser console for frontend errors
3. Verify both MongoDB and MySQL are running
4. Ensure ports 5000 (backend) and 4000 (frontend) are available

**System Status Check**: Visit http://localhost:5000/health

---

## 🎊 Success!

Your MedWatch system is now fully integrated with MongoDB! You can:
- ✅ Login with real user credentials
- ✅ View and manage 155 users
- ✅ Track 30 MDR cases
- ✅ Monitor 100 alerts
- ✅ Analyze patient risk data
- ✅ View real-time statistics

**Happy tracking!** 🏥
