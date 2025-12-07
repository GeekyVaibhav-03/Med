require('dotenv').config();
const { User } = require('./src/models');

async function updateExistingUsers() {
  try {
    console.log('Updating existing users with default hospital...');
    
    // Get all users without hospital
    const users = await User.findAll({
      where: {
        hospital: null
      }
    });

    if (users.length === 0) {
      console.log('All users already have hospital assigned');
      process.exit(0);
    }

    // Update each user with a default hospital (MY Hospital)
    for (const user of users) {
      user.hospital = 'myhospital';
      await user.save();
      console.log(`✓ Updated ${user.username} with default hospital`);
    }

    console.log(`✅ Updated ${users.length} user(s) successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateExistingUsers();
