import useAuthStore from '../store/useAuthStore';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = [];
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const user = useAuthStore.getState().user;
    if (!user || !user.id) {
      console.log('❌ Cannot connect WebSocket: No user found');
      return;
    }

    // Prevent multiple connections
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    try {
      console.log(`🔌 Connecting WebSocket for user ${user.id}...`);
      this.ws = new WebSocket(`ws://localhost:5000/api/notifications/live?userId=${user.id}`);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.reconnectAttempts = 0;
        
        // Show connection toast (optional)
        this.notifyListeners({
          type: 'connection',
          status: 'connected'
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📩 WebSocket message received:', data);
          
          // Notify all listeners
          this.notifyListeners(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected', event.code, event.reason);
        
        this.notifyListeners({
          type: 'connection',
          status: 'disconnected'
        });

        // Attempt to reconnect
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached. Giving up.');
      return;
    }

    // Clear existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s

    console.log(`⏳ Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      console.log(`✅ New listener subscribed. Total: ${this.listeners.length}`);
    }
  }

  unsubscribe(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
    console.log(`❌ Listener unsubscribed. Total: ${this.listeners.length}`);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Error in WebSocket listener:', error);
      }
    });
  }

  disconnect() {
    console.log('🔌 Manually disconnecting WebSocket...');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }

    this.listeners = [];
    this.reconnectAttempts = 0;
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      console.log('📤 WebSocket message sent:', data);
    } else {
      console.error('❌ Cannot send message: WebSocket not connected');
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export default new WebSocketService();
