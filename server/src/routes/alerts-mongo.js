// MongoDB-based alerts routes
const express = require('express');
const router = express.Router();
const { Alert } = require('../models/mongodb');

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.target) filter.targetUid = req.query.target;
    if (req.query.resolved !== undefined) {
      filter.resolved = req.query.resolved === 'true';
    }
    if (req.query.type) filter.type = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;
    
    const limit = parseInt(req.query.limit || '50', 10);
    
    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('hospitalId', 'name code')
      .populate('departmentId', 'name')
      .lean();
    
    res.json({ ok: true, count: alerts.length, alerts });
  } catch (err) {
    console.error('alerts.get error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/alerts - Create new alert
router.post('/', async (req, res) => {
  try {
    const { type, message, priority, severity, targetUid, targetRole, hospitalId } = req.body;
    
    if (!message) {
      return res.status(400).json({ ok: false, error: 'Message is required' });
    }
    
    const alert = await Alert.create({
      type: type || 'general',
      message,
      priority: priority || 1,
      severity: severity || 'medium',
      targetUid,
      targetRole,
      hospitalId,
      resolved: false,
      read: false
    });
    
    // Emit socket event
    try {
      const io = req.app.locals.io;
      if (io) {
        io.emit('alert:new', {
          id: alert._id,
          type: alert.type,
          message: alert.message,
          priority: alert.priority,
          severity: alert.severity,
          targetUid: alert.targetUid,
          createdAt: alert.createdAt
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit failed:', socketErr.message);
    }
    
    res.status(201).json({ ok: true, alert });
  } catch (err) {
    console.error('alerts.post error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PATCH /api/alerts/:id - Mark as read or resolved
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { read, resolved, resolvedBy, actionTaken } = req.body;
    
    const update = {};
    if (read !== undefined) update.read = read;
    if (resolved !== undefined) {
      update.resolved = resolved;
      if (resolved) {
        update.resolvedAt = new Date();
        if (resolvedBy) update.resolvedBy = resolvedBy;
        if (actionTaken) update.actionTaken = actionTaken;
      }
    }
    
    const alert = await Alert.findByIdAndUpdate(id, update, { new: true });
    
    if (!alert) {
      return res.status(404).json({ ok: false, error: 'Alert not found' });
    }
    
    res.json({ ok: true, alert });
  } catch (err) {
    console.error('alerts.patch error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndDelete(id);
    
    if (!alert) {
      return res.status(404).json({ ok: false, error: 'Alert not found' });
    }
    
    res.json({ ok: true, message: 'Alert deleted' });
  } catch (err) {
    console.error('alerts.delete error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
