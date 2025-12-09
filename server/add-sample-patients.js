// Script to add sample patients with MDR reports for testing
const mongoose = require('mongoose');
const { Patient } = require('./src/models/mongodb');

const samplePatients = [
  {
    fullName: 'John Doe',
    fatherHusbandName: 'Robert Doe',
    gender: 'Male',
    age: 45,
    address: '123 Main St, City',
    mobileNumber: '9876543210',
    aadharNumber: '123456789012',
    ward: 'Ward A',
    bedNumber: '101',
    report: {
      mdrStatus: 'active',
      mdrPositive: true,
      hasSymptoms: true,
      symptomSeverity: 'severe',
      hasFracture: false,
      fractureInfectionRisk: 'low'
    }
  },
  {
    fullName: 'Jane Smith',
    fatherHusbandName: 'Michael Smith',
    gender: 'Female',
    age: 32,
    address: '456 Oak Ave, City',
    mobileNumber: '9876543211',
    aadharNumber: '123456789013',
    ward: 'Ward B',
    bedNumber: '202',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: true,
      hasSymptoms: false,
      symptomSeverity: 'none',
      hasFracture: true,
      fractureInfectionRisk: 'high'
    }
  },
  {
    fullName: 'Bob Johnson',
    fatherHusbandName: 'David Johnson',
    gender: 'Male',
    age: 28,
    address: '789 Pine Rd, City',
    mobileNumber: '9876543212',
    aadharNumber: '123456789014',
    ward: 'Ward A',
    bedNumber: '103',
    report: {
      mdrStatus: 'cleared',
      mdrPositive: false,
      hasSymptoms: true,
      symptomSeverity: 'mild',
      hasFracture: false,
      fractureInfectionRisk: 'low'
    }
  },
  {
    fullName: 'Alice Brown',
    fatherHusbandName: 'Tom Brown',
    gender: 'Female',
    age: 55,
    address: '321 Elm St, City',
    mobileNumber: '9876543213',
    aadharNumber: '123456789015',
    ward: 'Ward C',
    bedNumber: '301',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: false,
      hasSymptoms: false,
      symptomSeverity: 'none',
      hasFracture: true,
      fractureInfectionRisk: 'medium'
    }
  }
];

async function addSamplePatients() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect('mongodb://localhost:27017/medwatch');

    console.log('Connected to MongoDB');

    // Clear existing patients
    await Patient.deleteMany({});
    console.log('Cleared existing patients');

    // Add sample patients
    for (const patientData of samplePatients) {
      const patient = new Patient(patientData);
      await patient.save();
      console.log(`Added patient: ${patient.fullName}`);
    }

    console.log('Sample patients added successfully');

    // Test flag computation
    const patients = await Patient.find({});
    patients.forEach(patient => {
      const flags = patient.computeFlags();
      console.log(`${patient.fullName} flags:`, flags);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSamplePatients();