require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./src/models');

const SALT_ROUNDS = 10;

async function resetPassword() {
  try {
    const username = 'arth';
    const newPassword = 'doctor123';
    
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      console.log(`User '${username}' not found`);
      process.exit(1);
    }
    
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordHash = passwordHash;
    await user.save();
    
    console.log(`\n✅ Password reset successful for user: ${username}`);
    console.log(`New credentials:`);
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${newPassword}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

resetPassword();
