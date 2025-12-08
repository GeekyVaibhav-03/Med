require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medwatch')
  .then(async () => {
    const Patient = mongoose.model('Patient', new mongoose.Schema({}, { strict: false }));
    const count = await Patient.countDocuments();
    console.log(`\n✅ Total patients in MongoDB: ${count}\n`);
    
    const samples = await Patient.find().limit(10);
    console.log('Sample patients:');
    samples.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.fullName} (${p.gender}, ${p.age}y) - ${p.address}`);
    });
    
    process.exit(0);
  });
