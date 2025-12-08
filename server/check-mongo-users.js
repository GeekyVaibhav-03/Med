require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  email: String,
  hospitalId: String,
  department: String
});

const User = mongoose.model('User', userSchema);

async function checkMongoUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medwatch');
    console.log('\n=== MongoDB Users ===\n');
    
    const allUsers = await User.find().limit(20);
    console.log(`Total users: ${await User.countDocuments()}\n`);
    
    console.log('--- Sample Users ---');
    allUsers.forEach(user => {
      console.log(`Username: ${user.username}, Role: ${user.role}, Email: ${user.email || 'N/A'}`);
    });
    
    console.log('\n--- Doctor Accounts ---');
    const doctors = await User.find({ role: 'doctor' }).limit(10);
    if (doctors.length === 0) {
      console.log('❌ No doctor accounts found!');
    } else {
      doctors.forEach(doc => {
        console.log(`✓ Username: ${doc.username}, Email: ${doc.email || 'N/A'}, Dept: ${doc.department || 'N/A'}`);
      });
    }
    
    console.log('\n--- Admin Accounts ---');
    const admins = await User.find({ role: 'admin' }).limit(5);
    admins.forEach(admin => {
      console.log(`✓ Username: ${admin.username}, Email: ${admin.email || 'N/A'}`);
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkMongoUsers();
