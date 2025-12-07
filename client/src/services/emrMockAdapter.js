/**
 * Mock EMR/Lab Adapter
 * Simulates automatic MDR lab result injection
 */

class EMRMockAdapter {
  constructor() {
    this.interval = null;
    this.listeners = [];
    this.isRunning = false;
    this.patientPool = [
      'Rajesh Verma',
      'Anita Kumari',
      'Sanjay Gupta',
      'Pooja Sharma',
      'Mohan Lal',
      'Kavita Devi',
    ];
  }

  /**
   * Subscribe to EMR events
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Start simulating EMR/Lab results
   */
  start(intervalMs = 60000) {
    // Default: every 60 seconds
    if (this.isRunning) return;

    this.isRunning = true;
    this.interval = setInterval(() => {
      this.injectMockResult();
    }, intervalMs);
  }

  /**
   * Stop simulation
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }

  /**
   * Inject a mock MDR lab result
   */
  injectMockResult() {
    const result = {
      type: 'MDR_RESULT',
      timestamp: new Date().toISOString(),
      patient: {
        id: `P${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        name: this.patientPool[Math.floor(Math.random() * this.patientPool.length)],
        result: Math.random() > 0.7 ? 'Positive' : 'Negative',
        organism: 'MRSA',
        testType: 'Culture',
      },
    };

    // Notify all listeners
    this.listeners.forEach((callback) => {
      callback(result);
    });

    return result;
  }

  /**
   * Manually trigger a result
   */
  triggerResult(patientData) {
    const result = {
      type: 'MDR_RESULT',
      timestamp: new Date().toISOString(),
      patient: patientData,
    };

    this.listeners.forEach((callback) => {
      callback(result);
    });

    return result;
  }

  /**
   * Simulate other EMR events
   */
  triggerEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    this.listeners.forEach((callback) => {
      callback(event);
    });

    return event;
  }
}

export default new EMRMockAdapter();
