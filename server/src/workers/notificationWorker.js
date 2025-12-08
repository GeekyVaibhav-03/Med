// ============================================================================
// NOTIFICATION WORKER - Background Job Processor
// ============================================================================
// Listens to message queue and processes notification jobs
// Sends push notifications, SMS, emails, etc.

const Redis = require('ioredis');
const notificationService = require('./notificationService');
const db = require('../config/database');

class NotificationWorker {
  constructor() {
    this.redis = null;
    this.isRunning = false;
  }

  // ==========================================================================
  // START WORKER
  // ==========================================================================
  async start() {
    console.log('🚀 Starting notification worker...');

    try {
      // Connect to Redis
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis worker error:', error.message);
      });

      // Subscribe to MDR alerts channel
      this.redis.subscribe('mdr:alerts', (err, count) => {
        if (err) {
          console.error('❌ Subscribe error:', err);
        } else {
          console.log(`✅ Subscribed to ${count} channel(s)`);
        }
      });

      // Listen for messages
      this.redis.on('message', async (channel, message) => {
        console.log(`📨 Received message from ${channel}`);
        await this.processMessage(channel, message);
      });

      // Also poll the queue for any missed messages
      this.isRunning = true;
      this.pollQueue();

      console.log('✅ Notification worker is running');

    } catch (error) {
      console.error('❌ Worker start failed:', error);
    }
  }

  // ==========================================================================
  // PROCESS MESSAGE FROM QUEUE
  // ==========================================================================
  async processMessage(channel, message) {
    try {
      const event = JSON.parse(message);
      console.log('🔄 Processing event:', event.type);

      if (event.type === 'mdr.alert.triggered') {
        await this.processMDRAlert(event.data);
      } else if (event.type === 'notification.created') {
        await this.processNotification(event.data);
      }

    } catch (error) {
      console.error('❌ Message processing error:', error);
    }
  }

  // ==========================================================================
  // PROCESS MDR ALERT
  // ==========================================================================
  async processMDRAlert(alertData) {
    console.log('🚨 Processing MDR Alert:', alertData.organism);

    try {
      // Get notification record from database
      const [notifications] = await db.query(`
        SELECT * FROM notifications
        WHERE patient_id = ? AND flag_id = ? AND sent = FALSE
        ORDER BY created_at DESC
        LIMIT 1
      `, [alertData.patientId, alertData.flagId]);

      if (notifications.length === 0) {
        console.log('⚠️  No pending notification found');
        return;
      }

      const notification = notifications[0];

      // Get recipients based on roles
      const recipients = await this.getRecipients(notification);
      console.log(`👥 Found ${recipients.length} recipients`);

      // Send through all channels
      const results = await notificationService.sendMultiChannel(notification, recipients);

      // Update notification status
      await db.query(`
        UPDATE notifications
        SET sent = TRUE, sent_at = NOW()
        WHERE notif_id = ?
      `, [notification.notif_id]);

      console.log('✅ MDR Alert processed successfully');

    } catch (error) {
      console.error('❌ MDR Alert processing failed:', error);

      // Increment retry count
      await db.query(`
        UPDATE notifications
        SET retry_count = retry_count + 1, error_message = ?
        WHERE patient_id = ? AND flag_id = ?
      `, [error.message, alertData.patientId, alertData.flagId]);
    }
  }

  // ==========================================================================
  // GET NOTIFICATION RECIPIENTS
  // ==========================================================================
  async getRecipients(notification) {
    const recipientRoles = JSON.parse(notification.recipient_roles || '[]');
    const recipientUsers = JSON.parse(notification.recipient_users || '[]');

    const recipients = [];

    // Get users by role
    if (recipientRoles.length > 0) {
      const placeholders = recipientRoles.map(() => '?').join(',');
      const [users] = await db.query(`
        SELECT u.id AS userId, u.username, u.email, u.role,
               ns.fcm_token, ns.phone
        FROM users u
        LEFT JOIN notification_subscriptions ns ON u.id = ns.user_id
        WHERE u.role IN (${placeholders})
          AND u.active = TRUE
      `, recipientRoles);

      recipients.push(...users);
    }

    // Get specific users
    if (recipientUsers.length > 0) {
      const placeholders = recipientUsers.map(() => '?').join(',');
      const [users] = await db.query(`
        SELECT u.id AS userId, u.username, u.email, u.role,
               ns.fcm_token, ns.phone
        FROM users u
        LEFT JOIN notification_subscriptions ns ON u.id = ns.user_id
        WHERE u.id IN (${placeholders})
          AND u.active = TRUE
      `, recipientUsers);

      recipients.push(...users);
    }

    return recipients;
  }

  // ==========================================================================
  // POLL QUEUE FOR MISSED MESSAGES
  // ==========================================================================
  async pollQueue() {
    while (this.isRunning) {
      try {
        // Block for up to 5 seconds waiting for a message
        const result = await this.redis.brpop('mdr:alert:queue', 5);

        if (result) {
          const [queue, message] = result;
          await this.processMessage('mdr:alerts', message);
        }

      } catch (error) {
        console.error('❌ Queue poll error:', error);
        await this.sleep(5000); // Wait 5 seconds before retrying
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================================================
  // PROCESS GENERAL NOTIFICATION
  // ==========================================================================
  async processNotification(notificationData) {
    console.log('📧 Processing general notification');
    // Implement general notification handling
  }

  // ==========================================================================
  // STOP WORKER
  // ==========================================================================
  async stop() {
    console.log('🛑 Stopping notification worker...');
    this.isRunning = false;

    if (this.redis) {
      await this.redis.quit();
    }

    console.log('✅ Worker stopped');
  }
}

// Run worker if executed directly
if (require.main === module) {
  const worker = new NotificationWorker();
  worker.start();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await worker.stop();
    process.exit(0);
  });
}

module.exports = NotificationWorker;
