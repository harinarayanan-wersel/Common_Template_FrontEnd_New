/**
 * WebSocket service (placeholder for future implementation)
 */

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(url, token) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.socket = new WebSocket(`${url}?token=${token}`);

      this.socket.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.onOpen?.();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage?.(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.onError?.(error);
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
        this.onClose?.();
        this.attemptReconnect(url, token);
      };
    } catch (error) {
      console.error("Error connecting WebSocket:", error);
    }
  }

  attemptReconnect(url, token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect(url, token);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    console.warn("WebSocket is not connected");
    return false;
  }

  onOpen(callback) {
    this.onOpen = callback;
  }

  onMessage(callback) {
    this.onMessage = callback;
  }

  onError(callback) {
    this.onError = callback;
  }

  onClose(callback) {
    this.onClose = callback;
  }
}

export const socketService = new SocketService();

