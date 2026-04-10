// Create Admin Account
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('./src/models/mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medwatch';

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Admin account details
    const adminData = {
      username: 'admin',
      password: 'admin123',  // Change this to a secure password
      role: 'admin',
      hospital: 'myhospital',
      email: 'admin@medwatch.com',
      fullName: 'System Administrator',
      phone: '1234567890'
    };

    // Check if admin already exists
    const existing = await User.findOne({ username: adminData.username });
    if (existing) {
      console.log('⚠️  Admin user already exists!');
      console.log(`Username: ${existing.username}`);
      console.log(`Role: ${existing.role}`);
      console.log(`Hospital: ${existing.hospital}`);
      
      // Ask if you want to reset password
      console.log('\n🔄 Resetting admin password to: admin123');
      const passwordHash = await bcrypt.hash(adminData.password, 10);
      existing.passwordHash = passwordHash;
      existing.active = true;
      existing.failedLoginAttempts = 0;
      existing.lockedUntil = null;
      await existing.save();
      console.log('✅ Admin password reset successfully!');
    } else {
      // Create new admin
      console.log('📝 Creating new admin account...');
      const passwordHash = await bcrypt.hash(adminData.password, 10);
      
      const admin = await User.create({
        username: adminData.username.toLowerCase(),
        passwordHash,
        role: adminData.role,
        email: adminData.email,
        hospital: adminData.hospital,
        fullName: adminData.fullName,
        phone: adminData.phone,
        active: true
      });

      console.log('✅ Admin account created successfully!');
      console.log(`\n📋 Admin Login Details:`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Hospital: ${admin.hospital}`);
    }

    console.log('\n🎯 You can now login at: http://localhost:4002/login');
    console.log('   Select "Admin/Hospital" tab and use the credentials above');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

createAdmin();
