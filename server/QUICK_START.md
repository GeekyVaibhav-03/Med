# 🚀 MongoDB Quick Start Guide

## ✅ What's Ready

Your MongoDB database system is completely set up with:

- ✅ 14 Complete Database Collections
- ✅ Comprehensive Mongoose Schemas
- ✅ Automatic Data Seeding (1500+ records)
- ✅ Dual Database Support (MongoDB + MySQL)
- ✅ Production-Ready Server
- ✅ Complete Documentation

## 🏃 Quick Commands

### 1. First Time Setup

```bash
# Option A: Windows One-Click Setup
.\setup-mongodb.bat

# Option B: Manual Setup
npm install
npm run seed:mongo
node server-mongo.js
```

### 2. Daily Use

```bash
# Start server with MongoDB
node server-mongo.js

# Or with auto-reload
nodemon server-mongo.js

# Reseed database
npm run seed:mongo
```

## 📁 Files Created

```
server/
├── src/
│   ├── config/
│   │   ├── mongodb.js          # MongoDB connection
│   │   └── seedMongo.js        # Data seeding logic
│   └── models/
│       └── mongodb.js          # 14 Mongoose schemas
├── scripts/
│   └── seedMongoDB.js          # Seed command script
├── server-mongo.js             # MongoDB-enabled server
├── setup-mongodb.bat           # Windows setup script
├── MONGODB_README.md           # Complete guide
├── MONGODB_SETUP.md            # Detailed documentation
└── .env                        # Updated with MONGO_URI
```

## 🗄️ Database Collections

| Collection | Records | Description |
|------------|---------|-------------|
| hospitals | 5 | AIIMS, Apollo, Fortis, Max, Medanta |
| departments | 30 | Emergency, ICU, Surgery, etc. |
| rooms | 600+ | Patient rooms, ICU beds, labs |
| users | 155 | Admins, Doctors, Nurses |
| persons | 400 | RFID tracked individuals |
| rawevents | 1000 | Entry/exit tracking data |
| contactedges | 500 | Contact relationships |
| mdrcases | 30 | MDR infection cases |
| alerts | 100 | System notifications |

## 🔐 Login Credentials

**Admin Access:**
```
Username: admin1 (or admin2, admin3, admin4, admin5)
Password: admin123
```

**Doctor Access:**
```
Username: doctor1 (or doctor2...doctor50)
Password: admin123
```

**Nurse Access:**
```
Username: nurse1 (or nurse2...nurse100)
Password: admin123
```

## 🌐 API Endpoints

```bash
# Health Check
GET http://localhost:5000/health

# Login
POST http://localhost:5000/api/auth/login
Body: { "username": "admin1", "password": "admin123" }

# Alerts
GET http://localhost:5000/api/alerts
Header: Authorization: Bearer <token>

# MDR Cases  
GET http://localhost:5000/api/mdrcases
Header: Authorization: Bearer <token>

# Dashboard Stats
GET http://localhost:5000/api/dashboard/stats
Header: Authorization: Bearer <token>
```

## 🔍 MongoDB Queries

**Using MongoDB Compass:**
1. Connect to: `mongodb://localhost:27017`
2. Database: `medwatch`
3. Try these queries:

```javascript
// High-risk patients
{ profile: "patient", riskLevel: { $in: ["high", "critical"] } }

// Recent MDR cases
{ detectedAt: { $gte: new Date("2025-12-01") }, status: "active" }

// Unresolved alerts
{ resolved: false, severity: "critical" }

// Contacts for a person
{ $or: [{ personAUid: "PAT-00001" }, { personBUid: "PAT-00001" }] }
```

## 🛠️ Common Tasks

### Reset Database
```bash
mongosh medwatch
> db.dropDatabase()
> exit
npm run seed:mongo
```

### Check Connection
```bash
mongosh
> db.adminCommand({ ping: 1 })
```

### View Collections
```bash
mongosh medwatch
> show collections
> db.hospitals.find().pretty()
```

## 📊 Sample Data

**Hospitals:** AIIMS Delhi, Apollo Hospital, Fortis Healthcare, Max Hospital, Medanta

**Departments:** Emergency, ICU, General, Surgery, Pediatrics, Cardiology (per hospital)

**Person UIDs:**
- Doctors: `DOC-00001` to `DOC-00050`
- Nurses: `NUR-00001` to `NUR-00100`
- Patients: `PAT-00001` to `PAT-00200`
- Visitors: `VIS-00001` to `VIS-00050`

**Organisms:** MRSA, VRE, CRE, ESBL, MDR-TB, Pseudomonas aeruginosa

## 🚨 Troubleshooting

**MongoDB not starting?**
```bash
net start MongoDB
```

**Connection refused?**
- Check if MongoDB is running: `mongosh`
- Check port 27017 is open
- Verify MONGO_URI in .env

**Seed fails?**
```bash
# Clear first, then seed
mongosh medwatch --eval "db.dropDatabase()"
npm run seed:mongo
```

## 📚 Documentation

- **Quick Start**: `MONGODB_README.md`
- **Detailed Guide**: `MONGODB_SETUP.md`
- **Code Examples**: See both docs
- **API Reference**: Check route files

## 🎯 Next Steps

1. ✅ Start MongoDB: `net start MongoDB`
2. ✅ Seed database: `npm run seed:mongo`
3. ✅ Start server: `node server-mongo.js`
4. ✅ Open browser: `http://localhost:4001`
5. ✅ Login: `admin1` / `admin123`
6. ✅ Explore dashboard!

## 💡 Tips

- Use **MongoDB Compass** for visual data browsing
- Run `npm run seed:mongo` to refresh test data
- Both MySQL and MongoDB work simultaneously
- All existing routes are compatible
- Check `/health` endpoint for database status

---

**Ready to go! Start with:**
```bash
node server-mongo.js
```

Then visit: **http://localhost:4001** 🎉
