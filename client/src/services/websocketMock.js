/**
 * Mock WebSocket service for real-time map updates
 * Simulates people movement in hospital rooms
 */

class WebSocketMock {
  constructor() {
    this.listeners = [];
    this.isRunning = false;
    this.interval = null;
    this.people = [
      { id: 'P001', name: 'Ramesh Kumar', status: 'red', room: 'R101' },
      { id: 'P002', name: 'Sunita Devi', status: 'yellow', room: 'R102' },
      { id: 'P003', name: 'Vikram Patel', status: 'green', room: 'R103' },
      { id: 'D001', name: 'Dr. Amit', status: 'green', room: 'R101' },
      { id: 'N001', name: 'Nurse Priya', status: 'green', room: 'R102' },
    ];
    this.rooms = ['R101', 'R102', 'R103', 'R104', 'R105'];
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Start simulating movement
   */
  start(intervalMs = 3000) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.interval = setInterval(() => {
      // Randomly move some people
      this.people.forEach((person) => {
        if (Math.random() > 0.7) {
          // 30% chance to move
          const newRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
          person.room = newRoom;
        }
      });

      // Notify all listeners
      this.listeners.forEach((callback) => {
        callback({
          type: 'movement',
          timestamp: new Date().toISOString(),
          people: [...this.people],
        });
      });
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
   * Get current state
   */
  getCurrentState() {
    return {
      people: [...this.people],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Add a person to tracking
   */
  addPerson(person) {
    this.people.push(person);
  }

  /**
   * Update person status
   */
  updatePersonStatus(personId, status) {
    const person = this.people.find((p) => p.id === personId);
    if (person) {
      person.status = status;
    }
  }
}

export default new WebSocketMock();
