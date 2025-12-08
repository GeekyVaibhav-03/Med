require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  email: String,
  hospitalId: String,
  department: String
});

const User = mongoose.model('User', userSchema);

async function addPasswordsToDoctors() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medwatch');
    
    console.log('\n🔐 Adding passwords to doctor accounts...\n');
    
    // Get all doctors without passwords
    const doctors = await User.find({ 
      role: 'doctor',
      $or: [{ password: { $exists: false } }, { password: null }, { password: '' }]
    });
    
    console.log(`Found ${doctors.length} doctor accounts without passwords`);
    
    if (doctors.length === 0) {
      console.log('\n✅ All doctor accounts already have passwords!');
    } else {
      const defaultPassword = 'doctor123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      let updated = 0;
      for (const doctor of doctors) {
        await User.updateOne(
          { _id: doctor._id },
          { $set: { password: hashedPassword } }
        );
        console.log(`✓ Updated password for: ${doctor.username}`);
        updated++;
      }
      
      console.log(`\n✅ Updated ${updated} doctor accounts`);
      console.log(`\n📋 Default credentials for all doctors:`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`\nYou can login with: doctor1/${defaultPassword}, doctor2/${defaultPassword}, etc.`);
    }
    
    // Also check and fix nurses
    const nurses = await User.find({ 
      role: 'nurse',
      $or: [{ password: { $exists: false } }, { password: null }, { password: '' }]
    });
    
    if (nurses.length > 0) {
      console.log(`\n\n🔐 Adding passwords to ${nurses.length} nurse accounts...\n`);
      const nursePassword = 'nurse123';
      const hashedNursePassword = await bcrypt.hash(nursePassword, 10);
      
      for (const nurse of nurses) {
        await User.updateOne(
          { _id: nurse._id },
          { $set: { password: hashedNursePassword } }
        );
        console.log(`✓ Updated password for: ${nurse.username}`);
      }
      
      console.log(`\n✅ Nurse accounts updated with password: ${nursePassword}`);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addPasswordsToDoctors();
