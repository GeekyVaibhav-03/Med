const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const SALT_ROUNDS = 10;

// --- Get all users (admin only) ---
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'email', 'active'],
    });
    res.json({ ok: true, users });
  } catch (err) {
    console.error('GET /users error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Create user (admin only) ---
router.post('/', async (req, res) => {
  try {
    const { username, password, role, email, active } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ ok: false, error: 'username, password, and role are required' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ ok: false, error: 'Username already exists' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      username,
      passwordHash,
      role,
      email: email || null,
      active: active ?? true,
    });

    res.json({ ok: true, user });
  } catch (err) {
    console.error('POST /users error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Update user (admin only) ---
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role, email, active, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    if (password) {
      user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    user.username = username ?? user.username;
    user.role = role ?? user.role;
    user.email = email ?? user.email;
    user.active = active ?? user.active;

    await user.save();
    res.json({ ok: true, user });
  } catch (err) {
    console.error('PUT /users/:id error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Delete user (admin only) ---
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    await user.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /users/:id error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
