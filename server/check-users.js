require('dotenv').config();
const { User } = require('./src/models');

async function checkUsers() {
  try {
    const users = await User.findAll();
    console.log('\n=== Current Users in Database ===');
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
