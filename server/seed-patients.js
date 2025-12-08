// Seed patient data for doctor panel testing
require('dotenv').config();
const mongoose = require('mongoose');
const { Person, Hospital, Department, Room, RawEvent, MdrCase } = require('./src/models/mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medwatch';

async function seedPatients() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create hospital if not exists
    let hospital = await Hospital.findOne({ $or: [{ code: 'AIIMS001' }, { name: 'AIIMS Delhi' }] });
    if (!hospital) {
      hospital = await Hospital.create({
        name: 'AIIMS Delhi',
        code: 'AIIMS001',
        address: 'Ansari Nagar',
        city: 'New Delhi',
        state: 'Delhi',
        phone: '+91-11-26588500',
        email: 'aiims@gov.in',
        capacity: 2500,
        type: 'government',
        status: 'active'
      });
      console.log('✅ Created hospital:', hospital.name);
    } else {
      console.log('✅ Hospital exists:', hospital.name);
    }

    // Create departments
    let icuDept = await Department.findOne({ code: 'ICU', hospitalId: hospital._id });
    if (!icuDept) {
      icuDept = await Department.create({
        hospitalId: hospital._id,
        name: 'Intensive Care Unit',
        code: 'ICU',
        floor: 3,
        capacity: 50,
        type: 'icu',
        status: 'active'
      });
    }

    let generalDept = await Department.findOne({ code: 'GENERAL', hospitalId: hospital._id });
    if (!generalDept) {
      generalDept = await Department.create({
        hospitalId: hospital._id,
        name: 'General Ward',
        code: 'GENERAL',
        floor: 2,
        capacity: 200,
        type: 'general',
        status: 'active'
      });
    }

    let emergencyDept = await Department.findOne({ code: 'EMERGENCY', hospitalId: hospital._id });
    if (!emergencyDept) {
      emergencyDept = await Department.create({
        hospitalId: hospital._id,
        name: 'Emergency Department',
        code: 'EMERGENCY',
        floor: 1,
        capacity: 100,
        type: 'emergency',
        status: 'active'
      });
    }

    console.log('✅ Departments ready');

    // Create rooms
    const rooms = [];
    const roomNumbers = ['101', '102', '103', '201', '202', '203', '301', '302', '303', 'ICU-1', 'ICU-2', 'ICU-3', 'ER-1', 'ER-2'];
    
    for (const roomNum of roomNumbers) {
      const deptId = roomNum.startsWith('ICU') ? icuDept._id : 
                     roomNum.startsWith('ER') ? emergencyDept._id : 
                     generalDept._id;
      
      let room = await Room.findOne({ roomNumber: roomNum, departmentId: deptId });
      if (!room) {
        const roomType = roomNum.startsWith('ICU') ? 'icu' : 
                        roomNum.startsWith('ER') ? 'patient_room' : 
                        'patient_room';

        room = await Room.create({
          roomNumber: roomNum,
          departmentId: deptId,
          name: `Room ${roomNum}`,
          type: roomType,
          capacity: roomNum.startsWith('ICU') ? 2 : roomNum.startsWith('ER') ? 5 : 4,
          currentOccupancy: 0,
          floor: roomNum.startsWith('ICU') ? 3 : roomNum.startsWith('ER') ? 1 : 2,
          status: 'available'
        });
      }
      rooms.push(room);
    }

    console.log(`✅ Rooms ready: ${rooms.length}`);

    // Delete existing patients to avoid duplicates
    await Person.deleteMany({ profile: 'patient' });
    console.log('🗑️ Cleared existing patients');

    // Create diverse patient data
    const patients = [
      // MDR Positive Patients (High Risk - Red)
      {
        uid: 'P001',
        name: 'Rajesh Kumar',
        profile: 'patient',
        age: 45,
        gender: 'male',
        bloodGroup: 'O+',
        contactNumber: '+91-9876543210',
        emergencyContact: '+91-9876543211',
        address: 'Delhi',
        admissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        riskLevel: 'high',
        healthStatus: 'infected',
        hospitalId: hospital._id,
        departmentId: icuDept._id,
        notes: 'MDR-TB detected, isolated in ICU'
      },
      {
        uid: 'P002',
        name: 'Priya Sharma',
        profile: 'patient',
        age: 32,
        gender: 'female',
        bloodGroup: 'A+',
        contactNumber: '+91-9876543212',
        emergencyContact: '+91-9876543213',
        address: 'Noida',
        admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        riskLevel: 'critical',
        healthStatus: 'critical',
        hospitalId: hospital._id,
        departmentId: icuDept._id,
        notes: 'MDR-Acinetobacter infection, critical condition'
      },
      {
        uid: 'P003',
        name: 'Mohammed Ali',
        profile: 'patient',
        age: 58,
        gender: 'male',
        bloodGroup: 'B+',
        contactNumber: '+91-9876543214',
        emergencyContact: '+91-9876543215',
        address: 'Gurgaon',
        admissionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        riskLevel: 'high',
        healthStatus: 'infected',
        hospitalId: hospital._id,
        departmentId: icuDept._id,
        notes: 'MRSA infection, responding to treatment'
      },

      // Contact/At-Risk Patients (Medium Risk - Yellow)
      {
        uid: 'P004',
        name: 'Sunita Devi',
        profile: 'patient',
        age: 40,
        gender: 'female',
        bloodGroup: 'AB+',
        contactNumber: '+91-9876543216',
        emergencyContact: '+91-9876543217',
        address: 'Delhi',
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        riskLevel: 'medium',
        healthStatus: 'stable',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Had contact with MDR patient, under monitoring'
      },
      {
        uid: 'P005',
        name: 'Amit Verma',
        profile: 'patient',
        age: 35,
        gender: 'male',
        bloodGroup: 'O-',
        contactNumber: '+91-9876543218',
        emergencyContact: '+91-9876543219',
        address: 'Faridabad',
        admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        riskLevel: 'medium',
        healthStatus: 'stable',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Suspected contact, awaiting test results'
      },
      {
        uid: 'P006',
        name: 'Kavita Singh',
        profile: 'patient',
        age: 28,
        gender: 'female',
        bloodGroup: 'A-',
        contactNumber: '+91-9876543220',
        emergencyContact: '+91-9876543221',
        address: 'Delhi',
        admissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        riskLevel: 'medium',
        healthStatus: 'stable',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Secondary contact, quarantine protocol'
      },

      // Safe Patients (Low Risk - Green)
      {
        uid: 'P007',
        name: 'Rahul Mehta',
        profile: 'patient',
        age: 25,
        gender: 'male',
        bloodGroup: 'B-',
        contactNumber: '+91-9876543222',
        emergencyContact: '+91-9876543223',
        address: 'Delhi',
        admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        riskLevel: 'low',
        healthStatus: 'healthy',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Regular checkup, no risk'
      },
      {
        uid: 'P008',
        name: 'Anjali Gupta',
        profile: 'patient',
        age: 30,
        gender: 'female',
        bloodGroup: 'O+',
        contactNumber: '+91-9876543224',
        emergencyContact: '+91-9876543225',
        address: 'Noida',
        admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        riskLevel: 'low',
        healthStatus: 'healthy',
        hospitalId: hospital._id,
        departmentId: emergencyDept._id,
        notes: 'Minor injury, safe'
      },
      {
        uid: 'P009',
        name: 'Vikram Rao',
        profile: 'patient',
        age: 42,
        gender: 'male',
        bloodGroup: 'AB-',
        contactNumber: '+91-9876543226',
        emergencyContact: '+91-9876543227',
        address: 'Gurgaon',
        admissionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        riskLevel: 'low',
        healthStatus: 'recovered',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Post-surgery recovery, doing well'
      },
      {
        uid: 'P010',
        name: 'Meera Patel',
        profile: 'patient',
        age: 50,
        gender: 'female',
        bloodGroup: 'A+',
        contactNumber: '+91-9876543228',
        emergencyContact: '+91-9876543229',
        address: 'Delhi',
        admissionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        riskLevel: 'low',
        healthStatus: 'stable',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Routine monitoring, no concerns'
      },

      // Additional patients for testing
      {
        uid: 'P011',
        name: 'Sanjay Reddy',
        profile: 'patient',
        age: 38,
        gender: 'male',
        bloodGroup: 'B+',
        contactNumber: '+91-9876543230',
        emergencyContact: '+91-9876543231',
        address: 'Noida',
        admissionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        riskLevel: 'low',
        healthStatus: 'healthy',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Discharged soon'
      },
      {
        uid: 'P012',
        name: 'Geeta Iyer',
        profile: 'patient',
        age: 48,
        gender: 'female',
        bloodGroup: 'O-',
        contactNumber: '+91-9876543232',
        emergencyContact: '+91-9876543233',
        address: 'Delhi',
        admissionDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        riskLevel: 'medium',
        healthStatus: 'stable',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Monitoring infection risk'
      },
      {
        uid: 'P013',
        name: 'Arjun Das',
        profile: 'patient',
        age: 55,
        gender: 'male',
        bloodGroup: 'AB+',
        contactNumber: '+91-9876543234',
        emergencyContact: '+91-9876543235',
        address: 'Faridabad',
        admissionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        riskLevel: 'high',
        healthStatus: 'infected',
        hospitalId: hospital._id,
        departmentId: icuDept._id,
        notes: 'MDR-E.coli, intensive treatment'
      },
      {
        uid: 'P014',
        name: 'Lakshmi Nair',
        profile: 'patient',
        age: 62,
        gender: 'female',
        bloodGroup: 'A-',
        contactNumber: '+91-9876543236',
        emergencyContact: '+91-9876543237',
        address: 'Delhi',
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        riskLevel: 'low',
        healthStatus: 'stable',
        hospitalId: hospital._id,
        departmentId: generalDept._id,
        notes: 'Elderly care, stable condition'
      },
      {
        uid: 'P015',
        name: 'Ramesh Choudhary',
        profile: 'patient',
        age: 33,
        gender: 'male',
        bloodGroup: 'B-',
        contactNumber: '+91-9876543238',
        emergencyContact: '+91-9876543239',
        address: 'Gurgaon',
        admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        riskLevel: 'low',
        healthStatus: 'healthy',
        hospitalId: hospital._id,
        departmentId: emergencyDept._id,
        notes: 'ER admission, stable now'
      }
    ];

    const createdPatients = await Person.insertMany(patients);
    console.log(`✅ Created ${createdPatients.length} patients`);

    // Create MDR cases for high-risk patients
    const mdrCases = [
      {
        uid: 'P001',
        personId: createdPatients[0]._id,
        hospitalId: hospital._id,
        departmentId: icuDept._id,
        organism: 'Mycobacterium tuberculosis (MDR-TB)',
        infectionType: 'Respiratory',
        detectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        sampleDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        labReportNumber: 'LAB-2024-001',
        severity: 'severe',
        status: 'active',
        isolationRequired: true,
        treatmentPlan: 'Second-line anti-TB drugs',
        antibioticsResistant: ['Isoniazid', 'Rifampicin'],
        sourceLocation: 'ICU-1',
        notes: 'Patient in isolation, close monitoring required'
      },
      {
        uid: 'P002',
        personId: createdPatients[1]._id,
        hospitalId: hospital._id,
        departmentId: icuDept._id,
        organism: 'Acinetobacter baumannii (MDR)',
        infectionType: 'Bloodstream',
        detectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        sampleDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        labReportNumber: 'LAB-2024-002',
        severity: 'critical',
        status: 'active',
        isolationRequired: true,
        treatmentPlan: 'Colistin-based therapy',
        antibioticsResistant: ['Carbapenems', 'Cephalosporins', 'Fluoroquinolones'],
        sourceLocation: 'ICU-2',
        notes: 'Critical condition, requires immediate intervention'
      },
      {
        uid: 'P003',
        personId: createdPatients[2]._id,
        hospitalId: hospital._id,
        departmentId: icuDept._id,
        organism: 'Staphylococcus aureus (MRSA)',
        infectionType: 'Wound',
        detectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        sampleDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        labReportNumber: 'LAB-2024-003',
        severity: 'moderate',
        status: 'monitoring',
        isolationRequired: true,
        treatmentPlan: 'Vancomycin IV',
        antibioticsResistant: ['Methicillin', 'Penicillin'],
        sourceLocation: 'ICU-3',
        notes: 'Responding well to treatment'
      },
      {
        uid: 'P013',
        personId: createdPatients[12]._id,
        hospitalId: hospital._id,
        departmentId: icuDept._id,
        organism: 'Escherichia coli (MDR)',
        infectionType: 'Urinary Tract',
        detectedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        sampleDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        labReportNumber: 'LAB-2024-004',
        severity: 'severe',
        status: 'active',
        isolationRequired: true,
        treatmentPlan: 'Carbapenem antibiotics',
        antibioticsResistant: ['Ampicillin', 'Trimethoprim'],
        sourceLocation: 'ICU-1',
        notes: 'Extended treatment required'
      }
    ];

    await MdrCase.deleteMany({});
    const createdMdrCases = await MdrCase.insertMany(mdrCases);
    console.log(`✅ Created ${createdMdrCases.length} MDR cases`);

    // Create RFID tracking events for patients (simulating room movements)
    const events = [];
    const now = new Date();
    
    // Create events for last 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(now - day * 24 * 60 * 60 * 1000);
      
      for (const patient of createdPatients.slice(0, 10)) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const entryTime = new Date(date.getTime() + Math.random() * 12 * 60 * 60 * 1000);
        const exitTime = new Date(entryTime.getTime() + (30 + Math.random() * 180) * 60 * 1000);
        
        events.push({
          uid: patient.uid,
          profile: patient.profile,
          room: room.roomNumber,
          roomId: room._id,
          eventType: 'entry',
          entryTime: entryTime,
          exitTime: exitTime,
          durationMinutes: Math.round((exitTime - entryTime) / 60000),
          status: patient.riskLevel === 'high' || patient.riskLevel === 'critical' ? 'red' : 
                  patient.riskLevel === 'medium' ? 'yellow' : 'green',
          temperature: 36.5 + Math.random() * 2,
          maskCompliance: Math.random() > 0.2,
          sanitizationDone: Math.random() > 0.3
        });
      }
    }

    await RawEvent.deleteMany({});
    await RawEvent.insertMany(events);
    console.log(`✅ Created ${events.length} RFID tracking events`);

    console.log('\n✅ Patient data seeded successfully!');
    console.log(`
📊 Summary:
- Hospital: ${hospital.name}
- Departments: 3 (ICU, General, Emergency)
- Rooms: ${rooms.length}
- Patients: ${createdPatients.length}
  - High Risk (MDR+): 4 patients
  - Medium Risk (Contact): 3 patients
  - Low Risk (Safe): 8 patients
- MDR Cases: ${createdMdrCases.length}
- RFID Events: ${events.length}

🎯 Ready for testing doctor panel!
    `);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedPatients();
