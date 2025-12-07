require('dotenv').config();
const { sequelize } = require('./src/models');

async function addColumns() {
  try {
    console.log('Adding hospital and email columns to users table...');
    
    // Add hospital column
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN hospital VARCHAR(255) NULL
      `);
      console.log('✓ hospital column added');
    } catch (err) {
      if (err.message.includes('Duplicate column') || err.message.includes('duplicate')) {
        console.log('✓ hospital column already exists');
      } else {
        throw err;
      }
    }
    
    // Add email column
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN email VARCHAR(255) NULL
      `);
      console.log('✓ email column added');
    } catch (err) {
      if (err.message.includes('Duplicate column') || err.message.includes('duplicate')) {
        console.log('✓ email column already exists');
      } else {
        throw err;
      }
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

addColumns();
