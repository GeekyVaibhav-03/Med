// ============================================================================
// EVENT PUBLISHER - Message Queue Integration
// ============================================================================
// Publishes events to message queue (Redis/RabbitMQ/Kafka) for async processing
// Workers consume these events to send notifications

const Redis = require('ioredis');

class EventPublisher {
  constructor() {
    this.redis = null;
    this.initializeRedis();
  }

  // ==========================================================================
  // REDIS PUBSUB SETUP
  // ==========================================================================
  initializeRedis() {
    try {
      // Connect to Redis
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected for event publishing');
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message);
      });

    } catch (error) {
      console.error('❌ Redis initialization failed:', error.message);
      console.log('⚠️  Using mock event publisher');
      this.redis = null;
    }
  }

  // ==========================================================================
  // PUBLISH MDR ALERT EVENT
  // ==========================================================================
  async publishMDRAlert(alertData) {
    const event = {
      type: 'mdr.alert.triggered',
      timestamp: new Date().toISOString(),
      data: {
        patientId: alertData.patientId,
        patientName: alertData.patientName,
        mrn: alertData.mrn,
        organism: alertData.organism,
        severity: alertData.severity,
        flagId: alertData.flagId,
        reportId: alertData.reportId,
        timestamp: alertData.timestamp
      }
    };

    if (this.redis) {
      try {
        // Publish to Redis channel
        await this.redis.publish('mdr:alerts', JSON.stringify(event));
        console.log('📢 Event published to Redis channel: mdr:alerts');

        // Also add to a Redis list for workers to process
        await this.redis.lpush('mdr:alert:queue', JSON.stringify(event));
        console.log('📋 Event added to worker queue');

        return { success: true };
      } catch (error) {
        console.error('❌ Redis publish error:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Mock mode
      console.log('📢 Mock Event Published:', event);
      return { success: true, mock: true };
    }
  }

  // ==========================================================================
  // PUBLISH GENERAL NOTIFICATION EVENT
  // ==========================================================================
  async publishNotification(notificationData) {
    const event = {
      type: 'notification.created',
      timestamp: new Date().toISOString(),
      data: notificationData
    };

    if (this.redis) {
      await this.redis.publish('notifications:general', JSON.stringify(event));
      await this.redis.lpush('notification:queue', JSON.stringify(event));
      console.log('📢 Notification event published');
    } else {
      console.log('📢 Mock Notification Event:', event);
    }

    return { success: true };
  }

  // ==========================================================================
  // ALTERNATIVE: RABBITMQ IMPLEMENTATION (COMMENTED)
  // ==========================================================================
  /*
  async initializeRabbitMQ() {
    const amqp = require('amqplib');
    
    this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    this.channel = await this.connection.createChannel();
    
    // Declare exchange
    await this.channel.assertExchange('hospital.events', 'topic', { durable: true });
    
    console.log('✅ RabbitMQ connected');
  }

  async publishToRabbitMQ(routingKey, message) {
    const exchange = 'hospital.events';
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    console.log(`📢 Published to RabbitMQ: ${routingKey}`);
  }
  */

  // ==========================================================================
  // GRACEFUL SHUTDOWN
  // ==========================================================================
  async close() {
    if (this.redis) {
      await this.redis.quit();
      console.log('👋 Redis connection closed');
    }
  }
}

module.exports = new EventPublisher();
