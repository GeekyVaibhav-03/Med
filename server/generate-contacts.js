// Run contact edge generation
require('dotenv').config();
const mongoose = require('mongoose');
const { generateContactEdges } = require('./src/utils/contactGenerator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medwatch';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    await generateContactEdges();

    console.log('\n✅ Contact edge generation complete!');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

run();
