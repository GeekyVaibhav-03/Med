require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medwatch';

const patientSchema = new mongoose.Schema({
  fullName: String,
  fatherHusbandName: String,
  gender: String,
  age: Number,
  address: String,
  mobileNumber: String,
  aadharNumber: { type: String, unique: true },
  admissionDate: Date,
  status: String,
  mdrStatus: String,
  hospital: String,
  ward: String,
  bedNumber: String,
  rfidTag: String,
  mdrDetails: {
    diagnosisDate: Date,
    organism: String,
    resistancePattern: String,
    isolationRequired: Boolean,
    contactTracingInitiated: Boolean,
    treatmentStarted: Date,
    notes: String
  }
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

async function updateMDRPatients() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all patients sorted by creation date
    const patients = await Patient.find().sort({ createdAt: 1 });
    console.log(`📊 Total patients found: ${patients.length}`);

    // Select first 15 patients to make MDR positive
    const mdrPatients = patients.slice(0, 15);
    
    // MDR organisms and resistance patterns
    const organisms = [
      'MRSA (Methicillin-resistant Staphylococcus aureus)',
      'VRE (Vancomycin-resistant Enterococcus)',
      'ESBL (Extended-spectrum beta-lactamase)',
      'CRE (Carbapenem-resistant Enterobacteriaceae)',
      'MDR-TB (Multi-drug resistant Tuberculosis)',
      'MDR Pseudomonas aeruginosa',
      'MDR Acinetobacter baumannii'
    ];

    const resistancePatterns = [
      'Resistant to methicillin, oxacillin, cephalosporins',
      'Resistant to vancomycin, teicoplanin',
      'Resistant to 3rd gen cephalosporins, aztreonam',
      'Resistant to carbapenems, aminoglycosides',
      'Resistant to isoniazid, rifampicin',
      'Resistant to fluoroquinolones, aminoglycosides, carbapenems',
      'Resistant to most beta-lactams, aminoglycosides'
    ];

    // Update patients to MDR positive with detailed info
    for (let i = 0; i < mdrPatients.length; i++) {
      const patient = mdrPatients[i];
      const organismIndex = i % organisms.length;
      
      // Random diagnosis date within last 7 days
      const diagnosisDate = new Date();
      diagnosisDate.setDate(diagnosisDate.getDate() - Math.floor(Math.random() * 7));
      
      // Random treatment start date (1-3 days after diagnosis)
      const treatmentStarted = new Date(diagnosisDate);
      treatmentStarted.setDate(treatmentStarted.getDate() + Math.floor(Math.random() * 3) + 1);

      await Patient.findByIdAndUpdate(patient._id, {
        mdrStatus: 'positive',
        ward: i < 5 ? 'Isolation Ward' : (i < 10 ? 'ICU' : 'Emergency'),
        mdrDetails: {
          diagnosisDate: diagnosisDate,
          organism: organisms[organismIndex],
          resistancePattern: resistancePatterns[organismIndex],
          isolationRequired: true,
          contactTracingInitiated: true,
          treatmentStarted: treatmentStarted,
          notes: `MDR case detected via lab culture. Patient isolated and contact tracing initiated.`
        }
      });

      console.log(`🦠 Updated ${patient.fullName} to MDR+ (${organisms[organismIndex].split(' ')[0]})`);
    }

    // Verify the updates
    const mdrCount = await Patient.countDocuments({ mdrStatus: 'positive' });
    const safeCount = await Patient.countDocuments({ mdrStatus: 'negative' });

    console.log('\n✅ MDR Patient Update Complete!');
    console.log(`🔴 MDR Positive: ${mdrCount} patients`);
    console.log(`🟢 Safe/Negative: ${safeCount} patients`);

    // Show MDR patient list
    console.log('\n📋 MDR Positive Patients:');
    const updatedMDR = await Patient.find({ mdrStatus: 'positive' }).select('fullName ward mdrDetails.organism');
    updatedMDR.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.fullName} - ${p.ward} - ${p.mdrDetails?.organism?.split(' ')[0] || 'Unknown'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

updateMDRPatients();
