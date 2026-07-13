import asyncio
from typing import List

from fastapi import WebSocket

from src.logger import get_logger

logger = get_logger()


class ConnectionManager:

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop = None

    def set_event_loop(self, loop):
        self.loop = loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket connected | clients=%s", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket disconnected | clients=%s", len(self.active_connections))

    async def broadcast(self, data):
        connections = list(self.active_connections)
        client_count = len(connections)
        logger.info("Broadcasting to %s clients", client_count)

        disconnected = []

        for connection in connections:

            try:
                await connection.send_json(data)

            except Exception:
                logger.exception("Failed to send websocket message")
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

        logger.info("Broadcast successful | clients=%s", len(self.active_connections))

    def broadcast_from_thread(self, data):
        if not self.loop:
            logger.warning("Broadcast skipped because the event loop is not ready")
            return

        try:
            future = asyncio.run_coroutine_threadsafe(
                self.broadcast(data),
                self.loop
            )

            def _log_result(result_future):
                try:
                    result_future.result()
                except Exception:
                    logger.exception("WebSocket broadcast failed")

            future.add_done_callback(_log_result)
        except Exception:
            logger.exception("Unable to queue websocket broadcast from MQTT thread")


manager = ConnectionManager()
