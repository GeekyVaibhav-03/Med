const mongoose = require('mongoose');
const { Patient } = require('./src/models/mongodb');

// Sample training data for MDR prediction
const trainingPatients = [
  // MDR Positive cases
  {
    fullName: "Rajesh Kumar",
    fatherHusbandName: "Shyam Kumar",
    gender: "Male",
    age: 45,
    address: "Delhi, India",
    mobileNumber: "9876543210",
    aadharNumber: "123456789012",
    admissionDate: new Date('2024-01-15'),
    status: 'active',
    mdrStatus: 'positive',
    report: {
      mdrStatus: 'active',
      mdrPositive: true,
      // Clinical parameters for MDR prediction
      fever: 39.2, // High fever
      wbcCount: 15000, // Leukocytosis
      crp: 120, // High CRP
      pct: 2.5, // High PCT
      symptomDuration: 72, // Long duration
      purulence: 'purulent', // Abnormal
      systolicBP: 85, // Hypotension
      antibioticUse: 'multiple' // Multiple antibiotics
    }
  },
  {
    fullName: "Priya Sharma",
    fatherHusbandName: "Rakesh Sharma",
    gender: "Female",
    age: 38,
    address: "Mumbai, India",
    mobileNumber: "9876543211",
    aadharNumber: "123456789013",
    admissionDate: new Date('2024-02-01'),
    status: 'active',
    mdrStatus: 'positive',
    report: {
      mdrStatus: 'active',
      mdrPositive: true,
      // Clinical parameters for MDR prediction
      fever: 38.8, // High fever
      wbcCount: 13500, // Leukocytosis
      crp: 95, // High CRP
      pct: 1.8, // High PCT
      symptomDuration: 60, // Long duration
      purulence: 'foul', // Abnormal
      systolicBP: 92, // Hypotension
      antibioticUse: 'long_term' // Long-term antibiotics
    }
  },
  {
    fullName: "Amit Singh",
    fatherHusbandName: "Gurmeet Singh",
    gender: "Male",
    age: 52,
    address: "Chennai, India",
    mobileNumber: "9876543212",
    aadharNumber: "123456789014",
    admissionDate: new Date('2024-01-20'),
    status: 'active',
    mdrStatus: 'positive',
    report: {
      mdrStatus: 'active',
      mdrPositive: true,
      // Clinical parameters for MDR prediction
      fever: 39.5, // Very high fever
      wbcCount: 18000, // Severe leukocytosis
      crp: 150, // Very high CRP
      pct: 3.2, // Very high PCT
      symptomDuration: 96, // Very long duration
      purulence: 'discolored', // Abnormal
      systolicBP: 78, // Severe hypotension
      antibioticUse: 'multiple' // Multiple antibiotics
    }
  },

  // At Risk cases (can have MDR)
  {
    fullName: "Sunita Patel",
    fatherHusbandName: "Mahesh Patel",
    gender: "Female",
    age: 29,
    address: "Ahmedabad, India",
    mobileNumber: "9876543213",
    aadharNumber: "123456789015",
    admissionDate: new Date('2024-02-10'),
    status: 'active',
    mdrStatus: 'pending',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: false,
      // Clinical parameters for MDR prediction (moderate risk)
      fever: 37.8, // Mild fever
      wbcCount: 11000, // Slightly elevated WBC
      crp: 45, // Borderline CRP
      pct: 0.3, // Normal PCT
      symptomDuration: 36, // Moderate duration
      purulence: 'clear', // Normal
      systolicBP: 110, // Normal BP
      antibioticUse: 'short_term' // Short-term antibiotics
    }
  },
  {
    fullName: "Vikram Rao",
    fatherHusbandName: "Suresh Rao",
    gender: "Male",
    age: 41,
    address: "Bangalore, India",
    mobileNumber: "9876543214",
    aadharNumber: "123456789016",
    admissionDate: new Date('2024-01-25'),
    status: 'active',
    mdrStatus: 'pending',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: false,
      // Clinical parameters for MDR prediction (moderate risk)
      fever: 38.2, // Moderate fever
      wbcCount: 9500, // Normal WBC
      crp: 35, // Normal CRP
      pct: 0.4, // Borderline PCT
      symptomDuration: 28, // Moderate duration
      purulence: 'normal', // Normal
      systolicBP: 105, // Normal BP
      antibioticUse: 'short_term' // Short-term antibiotics
    }
  },
  {
    fullName: "Kavita Jain",
    fatherHusbandName: "Rajesh Jain",
    gender: "Female",
    age: 33,
    address: "Jaipur, India",
    mobileNumber: "9876543215",
    aadharNumber: "123456789017",
    admissionDate: new Date('2024-02-05'),
    status: 'active',
    mdrStatus: 'pending',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: false,
      // Clinical parameters for MDR prediction (moderate risk)
      fever: 37.2, // Normal temperature
      wbcCount: 8500, // Normal WBC
      crp: 25, // Normal CRP
      pct: 0.2, // Normal PCT
      symptomDuration: 18, // Short duration
      purulence: 'clear', // Normal
      systolicBP: 115, // Normal BP
      antibioticUse: 'none' // No antibiotics
    }
  },

  // MDR Negative cases
  {
    fullName: "Arun Kumar",
    fatherHusbandName: "Ram Kumar",
    gender: "Male",
    age: 25,
    address: "Kolkata, India",
    mobileNumber: "9876543216",
    aadharNumber: "123456789018",
    admissionDate: new Date('2024-02-15'),
    status: 'active',
    mdrStatus: 'negative',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: false,
      // Clinical parameters for MDR prediction (low risk - normal values)
      fever: 36.8, // Normal temperature
      wbcCount: 7200, // Normal WBC
      crp: 8, // Normal CRP
      pct: 0.1, // Normal PCT
      symptomDuration: 12, // Short duration
      purulence: 'clear', // Normal
      systolicBP: 125, // Normal BP
      antibioticUse: 'none' // No antibiotics
    }
  },
  {
    fullName: "Meera Iyer",
    fatherHusbandName: "Krishnan Iyer",
    gender: "Female",
    age: 22,
    address: "Chennai, India",
    mobileNumber: "9876543217",
    aadharNumber: "123456789019",
    admissionDate: new Date('2024-01-30'),
    status: 'active',
    mdrStatus: 'negative',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: false,
      // Clinical parameters for MDR prediction (low risk - normal values)
      fever: 37.0, // Normal temperature
      wbcCount: 6800, // Normal WBC
      crp: 5, // Normal CRP
      pct: 0.08, // Normal PCT
      symptomDuration: 8, // Very short duration
      purulence: 'clear', // Normal
      systolicBP: 118, // Normal BP
      antibioticUse: 'none' // No antibiotics
    }
  },
  {
    fullName: "Rohit Verma",
    fatherHusbandName: "Sanjay Verma",
    gender: "Male",
    age: 31,
    address: "Delhi, India",
    mobileNumber: "9876543218",
    aadharNumber: "123456789020",
    admissionDate: new Date('2024-02-08'),
    status: 'active',
    mdrStatus: 'negative',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: false,
      // Clinical parameters for MDR prediction (low risk - normal values)
      fever: 36.9, // Normal temperature
      wbcCount: 7800, // Normal WBC
      crp: 12, // Normal CRP
      pct: 0.15, // Normal PCT
      symptomDuration: 16, // Short duration
      purulence: 'clear', // Normal
      systolicBP: 122, // Normal BP
      antibioticUse: 'none' // No antibiotics
    }
  },
  {
    fullName: "Anjali Gupta",
    fatherHusbandName: "Vijay Gupta",
    gender: "Female",
    age: 27,
    address: "Pune, India",
    mobileNumber: "9876543219",
    aadharNumber: "123456789021",
    admissionDate: new Date('2024-01-18'),
    status: 'active',
    mdrStatus: 'negative',
    report: {
      mdrStatus: 'follow_up',
      mdrPositive: false,
      // Clinical parameters for MDR prediction (low risk - normal values)
      fever: 37.1, // Normal temperature
      wbcCount: 6500, // Normal WBC
      crp: 6, // Normal CRP
      pct: 0.09, // Normal PCT
      symptomDuration: 10, // Short duration
      purulence: 'clear', // Normal
      systolicBP: 120, // Normal BP
      antibioticUse: 'none' // No antibiotics
    }
  }
];

async function seedTrainingData() {
  try {
    console.log('🌱 Seeding MDR prediction training data...');

    // Clear existing training data
    await Patient.deleteMany({
      aadharNumber: { $in: trainingPatients.map(p => p.aadharNumber) }
    });

    // Insert new training data
    const insertedPatients = await Patient.insertMany(trainingPatients);

    console.log(`✅ Successfully seeded ${insertedPatients.length} training patients`);
    console.log('📊 Training data distribution:');
    console.log('- MDR Positive:', trainingPatients.filter(p => p.report.mdrPositive).length);
    console.log('- At Risk:', trainingPatients.filter(p => !p.report.mdrPositive && (p.report.hasSymptoms || p.report.hasFracture)).length);
    console.log('- MDR Negative:', trainingPatients.filter(p => !p.report.mdrPositive && !p.report.hasSymptoms && !p.report.hasFracture).length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding training data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const connectMongoDB = require('./src/config/mongodb');

  connectMongoDB().then(() => {
    seedTrainingData();
  }).catch(err => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
}

module.exports = { seedTrainingData, trainingPatients };