const bcrypt = require('bcrypt');
const {
  Hospital,
  Department,
  Room,
  User,
  Person,
  RawEvent,
  ContactEdge,
  MdrCase,
  ContactTrace,
  Alert
} = require('../models/mongodb');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      Hospital.deleteMany({}),
      Department.deleteMany({}),
      Room.deleteMany({}),
      User.deleteMany({}),
      Person.deleteMany({}),
      RawEvent.deleteMany({}),
      ContactEdge.deleteMany({}),
      MdrCase.deleteMany({}),
      ContactTrace.deleteMany({}),
      Alert.deleteMany({})
    ]);
    
    console.log('✅ Cleared existing data');

    // 1. Create Hospitals
    const hospitals = await Hospital.insertMany([
      {
        name: 'AIIMS Delhi',
        code: 'AIIMS-DEL',
        address: 'Ansari Nagar, New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        phone: '+91-11-26588500',
        email: 'info@aiims.edu',
        capacity: 2500,
        type: 'government',
        status: 'active'
      },
      {
        name: 'Apollo Hospital',
        code: 'APOLLO-DEL',
        address: 'Sarita Vihar, New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        phone: '+91-11-26925858',
        email: 'contact@apollohospitals.com',
        capacity: 700,
        type: 'private',
        status: 'active'
      },
      {
        name: 'Fortis Healthcare',
        code: 'FORTIS-GGN',
        address: 'Sector 44, Gurugram',
        city: 'Gurugram',
        state: 'Haryana',
        phone: '+91-124-4962200',
        email: 'info@fortishealthcare.com',
        capacity: 550,
        type: 'private',
        status: 'active'
      },
      {
        name: 'Max Hospital',
        code: 'MAX-DEL',
        address: 'Saket, New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        phone: '+91-11-26515050',
        email: 'contact@maxhealthcare.com',
        capacity: 500,
        type: 'private',
        status: 'active'
      },
      {
        name: 'Medanta Hospital',
        code: 'MEDANTA-GGN',
        address: 'Sector 38, Gurugram',
        city: 'Gurugram',
        state: 'Haryana',
        phone: '+91-124-4141414',
        email: 'info@medanta.org',
        capacity: 1600,
        type: 'private',
        status: 'active'
      }
    ]);
    
    console.log(`✅ Created ${hospitals.length} hospitals`);

    // 2. Create Departments
    const departments = [];
    const deptTypes = ['emergency', 'icu', 'general', 'surgery', 'pediatrics', 'cardiology'];
    
    for (const hospital of hospitals) {
      for (let i = 0; i < deptTypes.length; i++) {
        const deptType = deptTypes[i];
        departments.push({
          hospitalId: hospital._id,
          name: `${deptType.charAt(0).toUpperCase() + deptType.slice(1)} Department`,
          code: `${hospital.code}-${deptType.toUpperCase().slice(0, 3)}`,
          floor: Math.floor(i / 2) + 1,
          capacity: deptType === 'icu' ? 30 : deptType === 'emergency' ? 50 : 40,
          type: deptType,
          status: 'active'
        });
      }
    }
    
    const createdDepts = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepts.length} departments`);

    // 3. Create Rooms
    const rooms = [];
    for (const dept of createdDepts) {
      const roomCount = dept.type === 'emergency' ? 15 : dept.type === 'icu' ? 10 : 20;
      for (let i = 1; i <= roomCount; i++) {
        rooms.push({
          roomNumber: `${dept.code}-R${i.toString().padStart(3, '0')}`,
          departmentId: dept._id,
          name: `Room ${i}`,
          type: dept.type === 'icu' ? 'icu' : dept.type === 'surgery' ? 'operation_theater' : 'patient_room',
          capacity: dept.type === 'emergency' ? 2 : 1,
          currentOccupancy: Math.random() > 0.5 ? 1 : 0,
          floor: dept.floor,
          isolationLevel: Math.random() > 0.8 ? 'airborne' : 'none',
          status: Math.random() > 0.7 ? 'occupied' : 'available',
          lastCleaned: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Created ${createdRooms.length} rooms`);

    // 4. Create Users
    const passwordHash = await bcrypt.hash('admin123', 10);
    const users = [];
    
    // Admin users
    for (let i = 1; i <= 5; i++) {
      users.push({
        username: `admin${i}`,
        passwordHash,
        role: 'admin',
        email: `admin${i}@hospital.com`,
        phone: `+91-98765432${i}0`,
        hospital: hospitals[i-1].name,
        hospitalId: hospitals[i-1]._id,
        fullName: `Admin User ${i}`,
        employeeId: `EMP-A-${1000 + i}`,
        active: true
      });
    }
    
    // Doctors
    for (let i = 1; i <= 50; i++) {
      const hospIdx = (i - 1) % hospitals.length;
      const deptIdx = (i - 1) % 6;
      const depts = createdDepts.filter(d => d.hospitalId.equals(hospitals[hospIdx]._id));
      
      users.push({
        username: `doctor${i}`,
        passwordHash,
        role: 'doctor',
        email: `doctor${i}@hospital.com`,
        phone: `+91-98${i.toString().padStart(8, '0')}`,
        hospital: hospitals[hospIdx].name,
        hospitalId: hospitals[hospIdx]._id,
        departmentId: depts[deptIdx]?._id,
        fullName: `Dr. ${['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta'][i % 5]} ${i}`,
        employeeId: `EMP-D-${2000 + i}`,
        specialization: ['Cardiology', 'Neurology', 'Pediatrics', 'Surgery', 'Oncology'][i % 5],
        licenseNumber: `MED-${10000 + i}`,
        active: true
      });
    }
    
    // Nurses
    for (let i = 1; i <= 100; i++) {
      const hospIdx = (i - 1) % hospitals.length;
      const deptIdx = (i - 1) % 6;
      const depts = createdDepts.filter(d => d.hospitalId.equals(hospitals[hospIdx]._id));
      
      users.push({
        username: `nurse${i}`,
        passwordHash,
        role: 'nurse',
        email: `nurse${i}@hospital.com`,
        phone: `+91-97${i.toString().padStart(8, '0')}`,
        hospital: hospitals[hospIdx].name,
        hospitalId: hospitals[hospIdx]._id,
        departmentId: depts[deptIdx]?._id,
        fullName: `Nurse ${['Mary', 'Sarah', 'Priya', 'Anjali', 'Neha'][i % 5]} ${i}`,
        employeeId: `EMP-N-${3000 + i}`,
        active: true
      });
    }
    
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // 5. Create Persons (RFID tracked)
    const persons = [];
    
    // Doctors as persons
    for (let i = 1; i <= 50; i++) {
      const hospIdx = (i - 1) % hospitals.length;
      persons.push({
        uid: `DOC-${i.toString().padStart(5, '0')}`,
        name: `Dr. ${['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta'][i % 5]} ${i}`,
        profile: 'doctor',
        hospitalId: hospitals[hospIdx]._id,
        age: 30 + (i % 30),
        gender: i % 3 === 0 ? 'female' : 'male',
        contactNumber: `+91-98${i.toString().padStart(8, '0')}`,
        riskLevel: 'low',
        healthStatus: 'healthy',
        active: true
      });
    }
    
    // Nurses as persons
    for (let i = 1; i <= 100; i++) {
      const hospIdx = (i - 1) % hospitals.length;
      persons.push({
        uid: `NUR-${i.toString().padStart(5, '0')}`,
        name: `Nurse ${['Mary', 'Sarah', 'Priya', 'Anjali', 'Neha'][i % 5]} ${i}`,
        profile: 'nurse',
        hospitalId: hospitals[hospIdx]._id,
        age: 25 + (i % 25),
        gender: i % 4 === 0 ? 'male' : 'female',
        contactNumber: `+91-97${i.toString().padStart(8, '0')}`,
        riskLevel: 'low',
        healthStatus: 'healthy',
        active: true
      });
    }
    
    // Patients
    for (let i = 1; i <= 200; i++) {
      const hospIdx = (i - 1) % hospitals.length;
      const deptIdx = (i - 1) % 6;
      const depts = createdDepts.filter(d => d.hospitalId.equals(hospitals[hospIdx]._id));
      
      const riskLevels = ['low', 'low', 'medium', 'high', 'critical'];
      const healthStatuses = ['stable', 'stable', 'stable', 'critical', 'infected'];
      
      persons.push({
        uid: `PAT-${i.toString().padStart(5, '0')}`,
        name: `Patient ${['John', 'Jane', 'Raj', 'Priya', 'Amit'][i % 5]} ${i}`,
        profile: 'patient',
        hospitalId: hospitals[hospIdx]._id,
        departmentId: depts[deptIdx]?._id,
        age: 20 + (i % 60),
        gender: i % 2 === 0 ? 'male' : 'female',
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][i % 8],
        contactNumber: `+91-96${i.toString().padStart(8, '0')}`,
        emergencyContact: `+91-95${i.toString().padStart(8, '0')}`,
        admissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        riskLevel: riskLevels[i % 5],
        healthStatus: healthStatuses[i % 5],
        active: true
      });
    }
    
    // Visitors
    for (let i = 1; i <= 50; i++) {
      const hospIdx = (i - 1) % hospitals.length;
      persons.push({
        uid: `VIS-${i.toString().padStart(5, '0')}`,
        name: `Visitor ${i}`,
        profile: 'visitor',
        hospitalId: hospitals[hospIdx]._id,
        age: 25 + (i % 50),
        gender: i % 2 === 0 ? 'male' : 'female',
        contactNumber: `+91-94${i.toString().padStart(8, '0')}`,
        riskLevel: 'low',
        healthStatus: 'healthy',
        active: true
      });
    }
    
    const createdPersons = await Person.insertMany(persons);
    console.log(`✅ Created ${createdPersons.length} persons`);

    // 6. Create Raw Events (RFID tracking data)
    const rawEvents = [];
    const now = new Date();
    
    for (let i = 0; i < 1000; i++) {
      const person = createdPersons[Math.floor(Math.random() * createdPersons.length)];
      const room = createdRooms[Math.floor(Math.random() * createdRooms.length)];
      const entryTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 180) + 15; // 15-195 minutes
      const exitTime = new Date(entryTime.getTime() + duration * 60 * 1000);
      
      rawEvents.push({
        uid: person.uid,
        profile: person.profile,
        room: room.roomNumber,
        roomId: room._id,
        eventType: 'entry',
        entryTime,
        exitTime: exitTime < now ? exitTime : null,
        durationMinutes: exitTime < now ? duration : null,
        temperature: 36.5 + Math.random() * 1.5,
        maskCompliance: Math.random() > 0.1,
        sanitizationDone: Math.random() > 0.2
      });
    }
    
    const createdEvents = await RawEvent.insertMany(rawEvents);
    console.log(`✅ Created ${createdEvents.length} raw events`);

    // 7. Create Contact Edges
    const contactEdges = [];
    
    for (let i = 0; i < 500; i++) {
      const event1 = createdEvents[Math.floor(Math.random() * createdEvents.length)];
      const event2 = createdEvents.find(e => 
        e.room === event1.room && 
        e.uid !== event1.uid &&
        e.entryTime <= event1.exitTime &&
        e.exitTime >= event1.entryTime
      );
      
      if (event2) {
        const overlapStart = new Date(Math.max(event1.entryTime, event2.entryTime));
        const overlapEnd = new Date(Math.min(event1.exitTime || now, event2.exitTime || now));
        const duration = Math.floor((overlapEnd - overlapStart) / 60000);
        
        if (duration > 0) {
          contactEdges.push({
            personAUid: event1.uid,
            personBUid: event2.uid,
            room: event1.room,
            roomId: event1.roomId,
            overlapStart,
            overlapEnd,
            durationMinutes: duration,
            weight: duration / 60,
            distanceEstimate: ['close', 'moderate', 'far'][Math.floor(Math.random() * 3)],
            contactType: ['direct', 'indirect'][Math.floor(Math.random() * 2)],
            riskScore: Math.random() * 10
          });
        }
      }
    }
    
    const createdContacts = await ContactEdge.insertMany(contactEdges);
    console.log(`✅ Created ${createdContacts.length} contact edges`);

    // 8. Create MDR Cases
    const mdrCases = [];
    const organisms = ['MRSA', 'VRE', 'CRE', 'ESBL', 'MDR-TB', 'Pseudomonas aeruginosa'];
    
    for (let i = 1; i <= 30; i++) {
      const patient = createdPersons.find(p => p.profile === 'patient' && p.riskLevel !== 'low');
      if (patient) {
        mdrCases.push({
          uid: patient.uid,
          personId: patient._id,
          hospitalId: patient.hospitalId,
          departmentId: patient.departmentId,
          organism: organisms[i % organisms.length],
          infectionType: ['Bloodstream', 'Respiratory', 'Urinary Tract', 'Surgical Site'][i % 4],
          detectedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
          sampleDate: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
          labReportNumber: `LAB-${Date.now()}-${i}`,
          severity: ['moderate', 'severe', 'critical'][Math.floor(Math.random() * 3)],
          status: ['active', 'monitoring', 'treated'][Math.floor(Math.random() * 3)],
          isolationRequired: true,
          antibioticsResistant: ['Methicillin', 'Vancomycin', 'Carbapenem'].slice(0, Math.floor(Math.random() * 3) + 1)
        });
      }
    }
    
    const createdCases = await MdrCase.insertMany(mdrCases);
    console.log(`✅ Created ${createdCases.length} MDR cases`);

    // 9. Create Alerts
    const alerts = [];
    
    for (let i = 1; i <= 100; i++) {
      const types = ['general', 'critical', 'warning', 'mdr_detection', 'contact_trace'];
      const type = types[i % types.length];
      const hospital = hospitals[i % hospitals.length];
      
      alerts.push({
        type,
        message: type === 'mdr_detection' 
          ? `New MDR case detected: ${organisms[i % organisms.length]}`
          : type === 'contact_trace'
          ? `High-risk contact identified for patient PAT-${i.toString().padStart(5, '0')}`
          : `System alert: ${['Low supplies', 'Equipment check due', 'Staff shortage'][i % 3]}`,
        priority: type === 'critical' ? 5 : type === 'warning' ? 3 : 1,
        severity: type === 'critical' ? 'critical' : type === 'warning' ? 'high' : 'medium',
        hospitalId: hospital._id,
        targetRole: type === 'mdr_detection' ? 'doctor' : 'admin',
        actionRequired: type === 'critical' || type === 'mdr_detection',
        resolved: Math.random() > 0.5,
        read: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    const createdAlerts = await Alert.insertMany(alerts);
    console.log(`✅ Created ${createdAlerts.length} alerts`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${hospitals.length} Hospitals`);
    console.log(`   - ${createdDepts.length} Departments`);
    console.log(`   - ${createdRooms.length} Rooms`);
    console.log(`   - ${createdUsers.length} Users`);
    console.log(`   - ${createdPersons.length} Persons`);
    console.log(`   - ${createdEvents.length} Raw Events`);
    console.log(`   - ${createdContacts.length} Contact Edges`);
    console.log(`   - ${createdCases.length} MDR Cases`);
    console.log(`   - ${createdAlerts.length} Alerts`);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

module.exports = seedDatabase;
