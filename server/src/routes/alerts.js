const express = require('express');
const router = express.Router();
const { Alert } = require('../models');

// GET /api/alerts?target=RFID001&limit=50&resolved=false
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.target) where.target_uid = req.query.target;
    if (req.query.resolved !== undefined) {
      where.resolved = req.query.resolved === 'true';
    }
    
    const limit = parseInt(req.query.limit || '50', 10);
    const alerts = await Alert.findAll({
      where,
      order: [['id','DESC']],
      limit
    });
    
    res.json({ ok: true, count: alerts.length, alerts });
  } catch (err) {
    console.error('alerts.get error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/alerts - Create new alert
router.post('/', async (req, res) => {
  try {
    const { type, message, priority, target_uid } = req.body;
    
    if (!message) {
      return res.status(400).json({ ok: false, error: 'Message is required' });
    }
    
    const alert = await Alert.create({
      type: type || 'general',
      message,
      priority: priority || 1,
      target_uid: target_uid || null,
      resolved: false,
      read: false
    });
    
    // Emit socket event
    try {
      const io = req.app.locals.io;
      if (io) {
        io.emit('alert:new', {
          id: alert.id,
          type: alert.type,
          message: alert.message,
          priority: alert.priority,
          target: alert.target_uid
        });
      }
    } catch (e) {
      console.warn('socket emit alert:new failed', e.message);
    }
    
    res.json({ ok: true, alert });
  } catch (err) {
    console.error('alerts.post error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PATCH /api/alerts/:id - Mark alert as read or resolved
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { read, resolved } = req.body;
    
    const alert = await Alert.findByPk(id);
    if (!alert) {
      return res.status(404).json({ ok: false, error: 'Alert not found' });
    }
    
    if (read !== undefined) alert.read = read;
    if (resolved !== undefined) alert.resolved = resolved;
    
    await alert.save();
    res.json({ ok: true, alert });
  } catch (err) {
    console.error('alerts.patch error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/alerts/:id - Delete an alert
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByPk(id);
    
    if (!alert) {
      return res.status(404).json({ ok: false, error: 'Alert not found' });
    }
    
    await alert.destroy();
    res.json({ ok: true, message: 'Alert deleted' });
  } catch (err) {
    console.error('alerts.delete error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
