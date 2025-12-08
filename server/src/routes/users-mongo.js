// MongoDB-based users management routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/mongodb');

const SALT_ROUNDS = 10;

// GET /api/admin/users - List all users
router.get('/', async (req, res) => {
  try {
    const { role, hospital, active } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (hospital) filter.hospital = hospital;
    if (active !== undefined) filter.active = active === 'true';
    
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ ok: true, count: users.length, users });
  } catch (err) {
    console.error('users.get error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/users/:id - Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .lean();
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { username, password, role, email, hospital, fullName, phone } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({
        ok: false,
        error: 'username, password, and role are required'
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
      fullName,
      phone,
      active: true
    });
    
    res.status(201).json({
      ok: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
        hospital: user.hospital,
        fullName: user.fullName
      }
    });
  } catch (err) {
    console.error('users.post error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PATCH /api/admin/users/:id - Update user
router.patch('/:id', async (req, res) => {
  try {
    const { email, hospital, fullName, phone, active, password } = req.body;
    
    const update = {};
    if (email !== undefined) update.email = email;
    if (hospital !== undefined) update.hospital = hospital;
    if (fullName !== undefined) update.fullName = fullName;
    if (phone !== undefined) update.phone = phone;
    if (active !== undefined) update.active = active;
    
    if (password) {
      update.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    res.json({ ok: true, user });
  } catch (err) {
    console.error('users.patch error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('users.delete error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
