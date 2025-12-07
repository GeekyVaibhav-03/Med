// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_super_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
const SALT_ROUNDS = 10;

// Helper to sign token
function signToken(user) {
  const payload = { id: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Register route
// Rules:
// - If there are NO users in the DB, allow creating an admin freely (first-time bootstrap).
// - After at least one user exists, creating an admin requires an existing admin token in Authorization header.
router.post('/register', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        ok: false,
        error: 'username, password and role are required'
      });
    }

    const wantedRole = role.toLowerCase();

    if (!['admin', 'doctor', 'staff'].includes(wantedRole)) {
      return res.status(400).json({
        ok: false,
        error: 'role must be admin, doctor, or staff'
      });
    }

    // ✅ Prevent duplicate users
    const found = await User.findOne({ where: { username } });
    if (found) {
      return res.status(409).json({
        ok: false,
        error: 'username already exists'
      });
    }

    // ✅ Hash password securely
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // ✅ Create user
    const newUser = await User.create({
      username,
      passwordHash,
      role: wantedRole
    });

    return res.json({
      ok: true,
      createdBy: req.user.username,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('secure register error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ ok: false, error: 'username and password required' });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ ok: false, error: 'invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ ok: false, error: 'invalid credentials' });

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    return res.json({ ok: true, user: { id: user.id, username: user.username, role: user.role }, token });
  } catch (err) {
    console.error('auth.login error', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Public Signup - allows anyone to create account
router.post('/signup', async (req, res) => {
  try {
    const { username, password, role, hospital, email } = req.body;

    if (!username || !password || !role || !hospital) {
      return res.status(400).json({
        ok: false,
        error: 'username, password, role, and hospital are required'
      });
    }

    const wantedRole = role.toLowerCase();

    if (!['admin', 'doctor', 'staff'].includes(wantedRole)) {
      return res.status(400).json({
        ok: false,
        error: 'role must be admin, doctor, or staff'
      });
    }

    // Check if username already exists
    const found = await User.findOne({ where: { username } });
    if (found) {
      return res.status(409).json({
        ok: false,
        error: 'username already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await User.create({
      username,
      passwordHash,
      role: wantedRole,
      hospital,
      email: email || null
    });

    return res.json({
      ok: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        hospital: newUser.hospital
      }
    });
  } catch (err) {
    console.error('auth.signup error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

module.exports = router;
