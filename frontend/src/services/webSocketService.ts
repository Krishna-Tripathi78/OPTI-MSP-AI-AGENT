class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // For demo purposes, we'll simulate WebSocket with localStorage events
      // In production, this would be: new WebSocket('ws://your-server.com/ws')
      this.simulateWebSocket();
    } catch (error) {
      console.log('WebSocket connection failed, using fallback');
      this.simulateWebSocket();
    }
  }

  private simulateWebSocket() {
    // Listen for storage changes across tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key === 'loginLogs' && e.newValue) {
        const logs = JSON.parse(e.newValue);
        this.emit('loginUpdate', logs);
      }
    });

    // Simulate connection established
    setTimeout(() => {
      this.emit('connected');
    }, 100);
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  sendLoginEvent(loginData: any) {
    // In real implementation, this would send to WebSocket server
    // For demo, we'll broadcast to all tabs via localStorage
    const event = new CustomEvent('loginEvent', { detail: loginData });
    window.dispatchEvent(event);
    
    // Also trigger storage event for cross-tab communication
    const logs = JSON.parse(localStorage.getItem('loginLogs') || '[]');
    logs.push(loginData);
    localStorage.setItem('loginLogs', JSON.stringify(logs));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    window.removeEventListener('storage', () => {});
  }
}

export const webSocketService = new WebSocketService();