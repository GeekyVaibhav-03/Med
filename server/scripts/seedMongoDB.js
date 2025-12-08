require('dotenv').config();
const connectDB = require('../src/config/mongodb');
const seedDatabase = require('../src/config/seedMongo');

const runSeed = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await connectDB();
    
    console.log('🌱 Starting seed process...');
    await seedDatabase();
    
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

runSeed();
