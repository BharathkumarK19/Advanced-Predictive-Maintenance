export interface TelemetryMessage {
  machineID: number;
  volt: number;
  rotate: number;
  pressure: number;
  vibration: number;
  age: number;
  model: string;
  error_flag: number;

  anomaly: boolean;
  anomaly_label: number;
  anomaly_score: number;
  risk_level: string;

  timestamp: string;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Array<(data: TelemetryMessage) => void> = [];
  private statusListeners: Array<(isConnected: boolean) => void> = [];
  private reconnectTimer: number | null = null;
  private connected = false;

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket = new WebSocket("ws://localhost:8000/ws");

    this.socket.onopen = () => {
      this.connected = true;
      this.notifyStatus();
      console.log("WebSocket Connected");
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TelemetryMessage;

        for (const listener of this.listeners) {
          listener(data);
        }
      } catch (error) {
        console.error("Failed to parse websocket message", error);
      }
    };

    this.socket.onclose = () => {
      this.connected = false;
      this.notifyStatus();
      this.socket = null;
      console.log("WebSocket Closed");

      if (this.listeners.length > 0 || this.statusListeners.length > 0) {
        this.reconnectTimer = window.setTimeout(() => {
          this.reconnectTimer = null;
          this.connect();
        }, 3000);
      }
    };

    this.socket.onerror = (err) => {
      console.error(err);
    };
  }

  subscribe(listener: (data: TelemetryMessage) => void) {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
    this.connect();
  }

  unsubscribe(listener: (data: TelemetryMessage) => void) {
    this.listeners = this.listeners.filter((current) => current !== listener);
    this.cleanupIfIdle();
  }

  subscribeStatus(listener: (isConnected: boolean) => void) {
    if (!this.statusListeners.includes(listener)) {
      this.statusListeners.push(listener);
    }
    listener(this.connected);
    this.connect();
  }

  unsubscribeStatus(listener: (isConnected: boolean) => void) {
    this.statusListeners = this.statusListeners.filter((current) => current !== listener);
    this.cleanupIfIdle();
  }

  isConnected() {
    return this.connected;
  }

  private notifyStatus() {
    for (const listener of this.statusListeners) {
      listener(this.connected);
    }
  }

  private cleanupIfIdle() {
    if (this.listeners.length > 0 || this.statusListeners.length > 0) {
      return;
    }

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket && this.socket.readyState !== WebSocket.CLOSED && this.socket.readyState !== WebSocket.CLOSING) {
      this.socket.close();
    }

    this.socket = null;
    this.connected = false;
  }

}

export const websocketService = new WebSocketService();
