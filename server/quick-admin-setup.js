// Quick Admin Creator - Standalone Script
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/medwatch';

// User Schema (defined inline for standalone use)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'doctor', 'nurse', 'pharmacist', 'visitor'] },
  hospital: String,
  email: String,
  fullName: String,
  phone: String,
  active: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function quickCreateAdmin() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MongoDB at:', MONGO_URI);
    connection = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected successfully!');
    
    const User = mongoose.model('User', userSchema);
    
    // Create admin
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    // Check existing
    const existing = await User.findOne({ username: adminUsername });
    
    if (existing) {
      console.log('\n⚠️  Admin account already exists!');
      console.log('🔄 Resetting password...');
      
      const hash = await bcrypt.hash(adminPassword, 10);
      existing.passwordHash = hash;
      existing.active = true;
      existing.failedLoginAttempts = 0;
      existing.lockedUntil = null;
      await existing.save();
      
      console.log('✅ Password reset complete!');
    } else {
      console.log('\n📝 Creating new admin account...');
      
      const hash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        username: adminUsername,
        passwordHash: hash,
        role: 'admin',
        hospital: 'myhospital',
        email: 'admin@medwatch.com',
        fullName: 'System Administrator',
        active: true
      });
      
      console.log('✅ Admin account created!');
    }
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║       ADMIN LOGIN CREDENTIALS          ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║  Username: admin                       ║');
    console.log('║  Password: admin123                    ║');
    console.log('║  Role:     admin                       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n🌐 Login at: http://localhost:4002/login');
    console.log('   (Use the "Admin/Hospital" tab)');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n⚠️  MongoDB is not running!');
      console.log('\nTo start MongoDB:');
      console.log('  • Windows: Start-Service MongoDB (in PowerShell as Admin)');
      console.log('  • Or: Start MongoDB from Services');
    }
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log('\n🔌 Disconnected from MongoDB\n');
    }
    process.exit(0);
  }
}

// Run it
quickCreateAdmin();
