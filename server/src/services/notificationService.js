// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================
// Handles sending notifications through various channels:
// - Push notifications (FCM)
// - WebSocket/SSE for real-time dashboard updates
// - SMS (Twilio)
// - Email

const admin = require('firebase-admin');
const WebSocket = require('ws');

class NotificationService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket connection
    this.initializeFirebase();
  }

  // ==========================================================================
  // FIREBASE CLOUD MESSAGING (FCM) SETUP
  // ==========================================================================
  initializeFirebase() {
    try {
      // Initialize Firebase Admin SDK
      // In production, use service account JSON file
      if (!admin.apps.length) {
        // For now, mock initialization
        console.log('📱 FCM Mock initialized (configure with service account in production)');
        this.fcmEnabled = false;
      }
    } catch (error) {
      console.error('❌ FCM initialization failed:', error.message);
      this.fcmEnabled = false;
    }
  }

  // ==========================================================================
  // WEBSOCKET SERVER SETUP
  // ==========================================================================
  initializeWebSocket(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/api/notifications/live' 
    });

    this.wss.on('connection', (ws, req) => {
      console.log('🔌 New WebSocket connection');

      // Extract user ID from query params or auth token
      const userId = this.extractUserId(req);
      if (userId) {
        this.clients.set(userId, ws);
        console.log(`✅ User ${userId} subscribed to live notifications`);
      }

      ws.on('close', () => {
        if (userId) {
          this.clients.delete(userId);
          console.log(`👋 User ${userId} disconnected`);
        }
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });

      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date()
      }));
    });

    console.log('✅ WebSocket server initialized at /api/notifications/live');
  }

  extractUserId(req) {
    // Extract user ID from query string or auth header
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get('userId');
  }

  // ==========================================================================
  // SEND PUSH NOTIFICATION (FCM)
  // ==========================================================================
  async sendPushNotification(notification) {
    if (!this.fcmEnabled) {
      console.log('📱 FCM Mock - Would send push:', notification.message);
      return { success: true, mock: true };
    }

    try {
      // Get user's FCM tokens from database
      const tokens = await this.getUserFCMTokens(notification.patientId);

      if (tokens.length === 0) {
        console.log('⚠️  No FCM tokens found for user');
        return { success: false, reason: 'No FCM tokens' };
      }

      // Build FCM message
      const message = {
        notification: {
          title: '🚨 MDR Alert',
          body: notification.message
        },
        data: {
          patientId: notification.patientId.toString(),
          flagId: notification.flagId?.toString() || '',
          priority: notification.priority,
          type: 'mdr_alert'
        },
        tokens: tokens
      };

      // Send via FCM
      const response = await admin.messaging().sendMulticast(message);
      console.log('✅ FCM sent:', response.successCount, 'success,', response.failureCount, 'failed');

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };

    } catch (error) {
      console.error('❌ FCM send error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserFCMTokens(userId) {
    // Query notification_subscriptions table for FCM tokens
    const db = require('../config/database');
    const [rows] = await db.query(`
      SELECT fcm_token FROM notification_subscriptions
      WHERE user_id = ? AND channel = 'push' AND enabled = TRUE AND fcm_token IS NOT NULL
    `, [userId]);

    return rows.map(r => r.fcm_token);
  }

  // ==========================================================================
  // SEND WEBSOCKET NOTIFICATION
  // ==========================================================================
  sendWebSocketNotification(userIds, notification) {
    const message = JSON.stringify({
      type: 'mdr_alert',
      data: {
        notificationId: notification.notifId,
        patientId: notification.patientId,
        flagId: notification.flagId,
        message: notification.message,
        priority: notification.priority,
        timestamp: new Date()
      }
    });

    let sentCount = 0;

    userIds.forEach(userId => {
      const ws = this.clients.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        sentCount++;
      }
    });

    console.log(`📡 WebSocket notification sent to ${sentCount}/${userIds.length} users`);
    return { success: true, sentCount };
  }

  // ==========================================================================
  // BROADCAST TO ALL CONNECTED CLIENTS
  // ==========================================================================
  broadcastToAll(notification) {
    const message = JSON.stringify({
      type: 'mdr_alert_broadcast',
      data: notification
    });

    let sentCount = 0;
    this.clients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        sentCount++;
      }
    });

    console.log(`📢 Broadcast sent to ${sentCount} connected clients`);
    return { success: true, sentCount };
  }

  // ==========================================================================
  // SEND SMS (TWILIO MOCK)
  // ==========================================================================
  async sendSMS(phoneNumber, message) {
    // Mock implementation - integrate Twilio in production
    console.log('📱 SMS Mock - Would send to', phoneNumber, ':', message);
    return { success: true, mock: true };

    /* Real Twilio implementation:
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    return { success: true, sid: response.sid };
    */
  }

  // ==========================================================================
  // SEND EMAIL (NODEMAILER MOCK)
  // ==========================================================================
  async sendEmail(email, subject, body) {
    // Mock implementation - integrate Nodemailer/SendGrid in production
    console.log('📧 Email Mock - Would send to', email);
    console.log('Subject:', subject);
    console.log('Body:', body);
    return { success: true, mock: true };

    /* Real Nodemailer implementation:
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: '"Hospital Alert System" <alerts@hospital.com>',
      to: email,
      subject: subject,
      html: body
    });

    return { success: true, messageId: info.messageId };
    */
  }

  // ==========================================================================
  // SEND MULTI-CHANNEL NOTIFICATION
  // ==========================================================================
  async sendMultiChannel(notification, recipients) {
    const results = {
      push: null,
      websocket: null,
      sms: null,
      email: null
    };

    // Send push notifications
    if (notification.channel === 'all' || notification.channel === 'push') {
      results.push = await this.sendPushNotification(notification);
    }

    // Send WebSocket notifications
    if (notification.channel === 'all' || notification.channel === 'websocket') {
      const userIds = recipients.map(r => r.userId);
      results.websocket = this.sendWebSocketNotification(userIds, notification);
    }

    // Send SMS (for critical alerts)
    if (notification.priority === 'critical' && 
        (notification.channel === 'all' || notification.channel === 'sms')) {
      for (const recipient of recipients) {
        if (recipient.phone) {
          await this.sendSMS(recipient.phone, notification.message);
        }
      }
      results.sms = { success: true };
    }

    // Send Email
    if (notification.channel === 'all' || notification.channel === 'email') {
      for (const recipient of recipients) {
        if (recipient.email) {
          await this.sendEmail(
            recipient.email,
            '🚨 MDR Alert',
            notification.message
          );
        }
      }
      results.email = { success: true };
    }

    return results;
  }
}

module.exports = new NotificationService();
