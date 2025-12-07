require('dotenv').config();
const { User } = require('./src/models');

async function listUsers() {
  try {
    const users = await User.findAll();
    console.log('\n=== All Users ===');
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Hospital: ${user.hospital || 'Not set'}`);
        console.log(`  Email: ${user.email || 'Not set'}`);
        console.log('---');
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

listUsers();
