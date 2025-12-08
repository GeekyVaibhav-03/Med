// src/routes/notifications.js
/**
 * Notification API Routes
 * - Get unread notifications
 * - Mark as read
 * - Delete notifications
 */

const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { cleanupOldNotifications } = require('../services/notificationService');

// ✅ GET /api/notifications/unread
// Get all unread notifications for current user
router.get('/unread', requireAuth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const hospital = req.user.hospital || 'General Hospital';

    const notifications = await Notification.findAll({
      where: {
        recipient_role: userRole,
        recipient_hospital: hospital,
        is_read: false
      },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return res.json({
      ok: true,
      notifications,
      unreadCount: notifications.length
    });
  } catch (err) {
    console.error('Get unread notifications error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// ✅ GET /api/notifications/all
// Get all notifications (read + unread)
router.get('/all', requireAuth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const hospital = req.user.hospital || 'General Hospital';
    const limit = parseInt(req.query.limit || '100', 10);

    const notifications = await Notification.findAll({
      where: {
        recipient_role: userRole,
        recipient_hospital: hospital
      },
      order: [['created_at', 'DESC']],
      limit
    });

    return res.json({
      ok: true,
      notifications,
      count: notifications.length
    });
  } catch (err) {
    console.error('Get all notifications error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// ✅ PUT /api/notifications/:id/read
// Mark notification as read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.update(
      { is_read: true },
      { where: { id } }
    );

    return res.json({ ok: true, message: 'Marked as read' });
  } catch (err) {
    console.error('Mark as read error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// ✅ DELETE /api/notifications/:id
// Delete a notification
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.destroy({ where: { id } });

    return res.json({ ok: true, message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete notification error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// ✅ DELETE /api/notifications/cleanup
// Admin only: cleanup old notifications
router.delete('/cleanup/old', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Admin only' });
    }

    const deleted = await cleanupOldNotifications();

    return res.json({
      ok: true,
      message: `Deleted ${deleted} old notifications`,
      count: deleted
    });
  } catch (err) {
    console.error('Cleanup error', err);
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

module.exports = router;
