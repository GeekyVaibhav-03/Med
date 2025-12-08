// ============================================================================
// NOTIFICATIONS ROUTE
// ============================================================================
// WebSocket/SSE endpoint for live notifications

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// ==========================================================================
// GET /api/notifications
// ==========================================================================
// Get notifications for current user

router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;
    const userId = req.user?.id;

    let query = `
      SELECT 
        n.*,
        p.name AS patient_name,
        p.mrn
      FROM notifications n
      JOIN patients p ON n.patient_id = p.patient_id
      WHERE JSON_CONTAINS(n.recipient_users, ?)
         OR JSON_CONTAINS(n.recipient_roles, ?)
    `;

    const params = [JSON.stringify(userId), JSON.stringify(req.user?.role)];

    if (unreadOnly === 'true') {
      query += ` AND (n.read_by IS NULL OR NOT JSON_CONTAINS(n.read_by, ?))`;
      params.push(JSON.stringify(userId));
    }

    query += ` ORDER BY n.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [notifications] = await db.query(query, params);

    return res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('❌ Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
});

// ==========================================================================
// POST /api/notifications/:id/read
// ==========================================================================
// Mark notification as read

router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get current read_by list
    const [notifications] = await db.query(
      'SELECT read_by FROM notifications WHERE notif_id = ?',
      [id]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    let readBy = notifications[0].read_by ? JSON.parse(notifications[0].read_by) : [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }

    await db.query(
      'UPDATE notifications SET read_by = ? WHERE notif_id = ?',
      [JSON.stringify(readBy), id]
    );

    return res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ Mark read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// ==========================================================================
// GET /api/notifications/live (WebSocket handled in notificationService)
// ==========================================================================
// This route is handled by WebSocket server in notificationService.js
// Clients connect via: ws://localhost:5000/api/notifications/live?userId=123

// ==========================================================================
// SSE Alternative - Server-Sent Events
// ==========================================================================
router.get('/live-sse', requireAuth, (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const userId = req.user?.id;

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  // Store client for broadcasting (simplified - use Redis in production)
  const clientId = `${userId}-${Date.now()}`;

  req.on('close', () => {
    clearInterval(heartbeat);
    console.log(`SSE client disconnected: ${clientId}`);
  });
});

module.exports = router;
