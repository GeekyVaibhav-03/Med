// MongoDB-based authentication routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/mongodb');
const { requireAuth, requireRole } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_super_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
const SALT_ROUNDS = 10;

function signToken(user) {
  const payload = { 
    id: user._id, 
    username: user.username, 
    role: user.role,
    hospital: user.hospital 
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'username and password required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(403).json({ ok: false, error: 'Account is deactivated' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      }
      await user.save();
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    // Check if locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Account temporarily locked due to failed login attempts' 
      });
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        hospital: user.hospital,
        email: user.email
      }
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Register (admin only, or first user)
router.post('/register', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, role, email, hospital } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        ok: false,
        error: 'username, password and role are required'
      });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(409).json({ ok: false, error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      username: username.toLowerCase(),
      passwordHash,
      role: role.toLowerCase(),
      email,
      hospital,
      active: true
    });

    res.status(201).json({
      ok: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        hospital: user.hospital
      }
    });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Public signup (for new users - creates doctor/nurse accounts)
router.post('/signup', async (req, res) => {
  try {
    const { username, password, role, email, hospital, fullName, phone } = req.body;

    if (!username || !password || !hospital) {
      return res.status(400).json({
        ok: false,
        error: 'username, password and hospital are required'
      });
    }

    // Only allow doctor, nurse, pharmacist, visitor roles via public signup
    const allowedRoles = ['doctor', 'nurse', 'pharmacist', 'visitor'];
    const userRole = (role || 'doctor').toLowerCase();
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        ok: false, 
        error: 'Invalid role. Please contact an administrator.' 
      });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(409).json({ ok: false, error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      username: username.toLowerCase(),
      passwordHash,
      role: userRole,
      email,
      hospital,
      fullName,
      phone,
      active: true
    });

    res.status(201).json({
      ok: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        hospital: user.hospital,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (err) {
    console.error('signup error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
