# MedWatch MongoDB Database Setup

This document explains how to set up and use MongoDB for the MedWatch MDR Contact Tracing System.

## 📋 Prerequisites

1. **Install MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Install MongoDB Compass** (Optional - GUI tool)
   - Download from: https://www.mongodb.com/products/compass

## 🚀 Quick Start

### 1. Start MongoDB Service

**Windows:**
```powershell
# Start MongoDB service
net start MongoDB

# Or if installed manually:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
# or
mongod --dbpath /data/db
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment

Update `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/medwatch
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medwatch
```

### 4. Seed the Database

```bash
npm run seed:mongo
```

This will create:
- 5 Hospitals
- 30 Departments
- 600+ Rooms
- 155 Users (admins, doctors, nurses)
- 400 Persons (RFID tracked)
- 1000 Raw Events
- 500 Contact Edges
- 30 MDR Cases
- 100 Alerts

### 5. Start the Server

```bash
# Using MongoDB + MySQL
node server-mongo.js

# Or with nodemon
nodemon server-mongo.js
```

## 📊 Database Schema

### Collections Overview

1. **hospitals** - Hospital facilities
2. **departments** - Hospital departments
3. **rooms** - Hospital rooms
4. **users** - System users (admins, doctors, nurses)
5. **persons** - RFID tracked individuals
6. **rawevents** - RFID entry/exit tracking
7. **contactedges** - Contact tracing graph
8. **mdrcases** - MDR infection cases
9. **contacttraces** - Contact tracing results
10. **alerts** - System notifications
11. **patientvisits** - Patient admission records
12. **infectionreports** - Infection statistics
13. **roomassignments** - Room allocation
14. **equipmentchecks** - Equipment maintenance

### Key Relationships

```
Hospital (1) -----> (N) Department
Department (1) ---> (N) Room
Hospital (1) -----> (N) User
Hospital (1) -----> (N) Person
Person (1) -------> (N) RawEvent
RawEvent (N) -----> (N) ContactEdge
Person (1) -------> (N) MdrCase
MdrCase (1) ------> (N) ContactTrace
```

## 🔧 Using MongoDB in Your Code

### Import Models

```javascript
const {
  Hospital,
  Department,
  Room,
  User,
  Person,
  RawEvent,
  ContactEdge,
  MdrCase,
  Alert
} = require('./src/models/mongodb');
```

### Example Queries

```javascript
// Find all active hospitals
const hospitals = await Hospital.find({ status: 'active' });

// Find patients with high risk
const highRiskPatients = await Person.find({
  profile: 'patient',
  riskLevel: { $in: ['high', 'critical'] }
});

// Find recent MDR cases
const recentCases = await MdrCase.find({
  detectedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
}).populate('hospitalId').sort({ detectedAt: -1 });

// Find contacts for a person
const contacts = await ContactEdge.find({
  $or: [
    { personAUid: 'PAT-00001' },
    { personBUid: 'PAT-00001' }
  ]
}).sort({ overlapStart: -1 });

// Create an alert
const alert = await Alert.create({
  type: 'mdr_detection',
  message: 'New MDR case detected in ICU',
  severity: 'critical',
  priority: 5,
  hospitalId: hospitalId,
  actionRequired: true
});
```

### Aggregation Examples

```javascript
// Count patients by risk level
const riskStats = await Person.aggregate([
  { $match: { profile: 'patient', active: true } },
  { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// MDR cases by hospital
const casesByHospital = await MdrCase.aggregate([
  { $match: { status: 'active' } },
  { $group: { 
      _id: '$hospitalId', 
      totalCases: { $sum: 1 },
      criticalCases: {
        $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
      }
    }
  },
  { $lookup: {
      from: 'hospitals',
      localField: '_id',
      foreignField: '_id',
      as: 'hospital'
    }
  }
]);

// Contact tracing for MDR case
const traceContacts = async (sourceUid, levels = 2) => {
  const contacts = [];
  let currentLevel = [sourceUid];
  
  for (let i = 0; i < levels; i++) {
    const nextLevel = await ContactEdge.find({
      $or: [
        { personAUid: { $in: currentLevel } },
        { personBUid: { $in: currentLevel } }
      ]
    });
    
    const newContacts = nextLevel.map(c => 
      c.personAUid !== sourceUid ? c.personAUid : c.personBUid
    );
    
    contacts.push(...newContacts);
    currentLevel = newContacts;
  }
  
  return [...new Set(contacts)];
};
```

## 🛠️ MongoDB Compass Queries

### View Active MDR Cases
```javascript
{
  status: "active",
  severity: { $in: ["severe", "critical"] }
}
```

### Find Recent Contacts (Last 24 hours)
```javascript
{
  overlapStart: {
    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
}
```

### High Priority Unresolved Alerts
```javascript
{
  resolved: false,
  priority: { $gte: 3 }
}
```

## 📈 Performance Optimization

### Indexes
All critical fields have indexes:
- `uid` fields for quick person lookups
- `entryTime`, `exitTime` for temporal queries
- `room` for location-based queries
- `status`, `severity`, `riskLevel` for filtering

### Query Tips

```javascript
// Use lean() for read-only queries (faster)
const patients = await Person.find({ profile: 'patient' }).lean();

// Use select() to limit fields
const names = await Person.find().select('name uid profile').lean();

// Use pagination
const page = 1;
const limit = 20;
const patients = await Person.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

## 🔄 Migration from MySQL

If you're migrating from MySQL:

1. Both databases can run simultaneously
2. Use `server-mongo.js` for dual database support
3. Gradually migrate routes to use MongoDB models
4. MySQL data remains accessible through Sequelize

## 🐛 Troubleshooting

### Connection Issues

```javascript
// Check MongoDB status
mongosh
> db.adminCommand({ ping: 1 })
```

### Clear Database
```bash
mongosh medwatch
> db.dropDatabase()
# Then re-seed
npm run seed:mongo
```

### View Logs
```javascript
// Enable debug mode
mongoose.set('debug', true);
```

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud hosting

## 🔐 Production Considerations

1. **Authentication**
   ```env
   MONGO_URI=mongodb://username:password@host:27017/medwatch?authSource=admin
   ```

2. **Replica Sets** - For high availability
3. **Sharding** - For large-scale deployments
4. **Backup Strategy** - Regular automated backups
5. **Monitoring** - Use MongoDB Atlas or custom monitoring

## 🎯 Sample Data

Default credentials after seeding:
- Admin: `admin1` / `admin123`
- Doctor: `doctor1` / `admin123`
- Nurse: `nurse1` / `admin123`

Sample UIDs:
- Doctors: `DOC-00001` to `DOC-00050`
- Nurses: `NUR-00001` to `NUR-00100`
- Patients: `PAT-00001` to `PAT-00200`
- Visitors: `VIS-00001` to `VIS-00050`

## 📞 Support

For issues or questions:
1. Check MongoDB logs
2. Verify connection string
3. Ensure MongoDB service is running
4. Check firewall settings (port 27017)
