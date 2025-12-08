require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  email: String
});

const User = mongoose.model('User', userSchema);

async function testDoctorLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/medwatch');
    
    const testUsername = 'doctor1';
    const testPassword = 'doctor123';
    
    console.log(`\n🔐 Testing login for: ${testUsername}`);
    console.log(`Password: ${testPassword}\n`);
    
    const user = await User.findOne({ username: testUsername });
    
    if (!user) {
      console.log('❌ User not found in database');
    } else {
      console.log('✓ User found in database');
      console.log(`  - Username: ${user.username}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Has password: ${user.password ? 'Yes' : 'No'}`);
      
      if (!user.password) {
        console.log('\n❌ Password field is EMPTY/UNDEFINED in database!');
        console.log('This user cannot login.');
      } else {
        console.log(`  - Password hash: ${user.password.substring(0, 20)}...`);
        
        // Test password
        const isMatch = await bcrypt.compare(testPassword, user.password);
        
        if (isMatch) {
          console.log('\n✅ Password is CORRECT');
          console.log(`\n📋 Login credentials:`);
          console.log(`   Username: ${testUsername}`);
          console.log(`   Password: ${testPassword}`);
          console.log(`   Role: ${user.role}`);
        } else {
          console.log('\n❌ Password is INCORRECT');
          console.log('Checking if password might be plain text...');
          if (user.password === testPassword) {
            console.log('⚠️  Password is stored as plain text!');
          }
        }
      }
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testDoctorLogin();
