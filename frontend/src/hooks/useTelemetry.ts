import { useEffect, useState } from "react";
import { TelemetryMessage, websocketService } from "../services/websocket";

export type TelemetryState = {
  telemetry: TelemetryMessage | null;
  isConnected: boolean;
};

export function useTelemetry(enabled = true): TelemetryState {
  const [telemetry, setTelemetry] = useState<TelemetryMessage | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(websocketService.isConnected());

  useEffect(() => {
    if (!enabled) {
      setIsConnected(websocketService.isConnected());
      return;
    }

    const listener = (data: TelemetryMessage) => {
      setTelemetry(data);
    };

    const statusListener = (connected: boolean) => {
      setIsConnected(connected);
    };

    websocketService.subscribe(listener);
    websocketService.subscribeStatus(statusListener);

    return () => {
      websocketService.unsubscribe(listener);
      websocketService.unsubscribeStatus(statusListener);
    };
  }, [enabled]);

  return { telemetry, isConnected };
}
