import json
import ssl
from json import JSONDecodeError

import paho.mqtt.client as mqtt

from configs.mqtt_config import (
    MQTT_BROKER,
    MQTT_PORT,
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_TOPIC,
)
from src.logger import get_logger

logger = get_logger()


class MQTTService:
    def __init__(self):
        self.client = mqtt.Client()
        self.message_callback = None
        self._started = False
        self._reconnect_attempts = 0

        self.client.username_pw_set(
            MQTT_USERNAME,
            MQTT_PASSWORD,
        )

        # HiveMQ Cloud requires TLS on port 8883.
        self.client.tls_set(
            tls_version=ssl.PROTOCOL_TLS_CLIENT,
        )
        self.client.tls_insecure_set(False)

        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        self.client.reconnect_delay_set(min_delay=1, max_delay=30)

    def set_message_callback(self, callback):
        self.message_callback = callback

    def start(self):
        if self._started:
            logger.info("MQTT subscriber already started; skipping duplicate startup")
            return

        try:
            self.client.connect(
                MQTT_BROKER,
                MQTT_PORT,
                60,
            )
            self.client.loop_start()
            self._started = True
            self._reconnect_attempts = 0
            logger.info("MQTT subscriber started")
        except Exception:
            logger.exception("Failed to start MQTT subscriber")
            raise

    def stop(self):
        if not self._started:
            return

        try:
            self.client.loop_stop()
        except Exception:
            logger.exception("Failed to stop MQTT network loop cleanly")

        try:
            self.client.disconnect()
        except Exception:
            logger.exception("Failed to disconnect MQTT client cleanly")
        finally:
            self._started = False

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info(
                "MQTT Connected | broker=%s | port=%s",
                MQTT_BROKER,
                MQTT_PORT,
            )

            result = client.subscribe(MQTT_TOPIC)
            logger.info(
                "Subscribed to topic | topic=%s | result=%s",
                MQTT_TOPIC,
                result[0],
            )
        else:
            logger.error("MQTT Connection Failed | rc=%s", rc)

    def on_disconnect(self, client, userdata, rc):
        if rc == 0:
            logger.info("MQTT disconnected cleanly")
        else:
            logger.warning("MQTT disconnected unexpectedly | rc=%s", rc)
            if self._started:
                self._reconnect_attempts += 1
                logger.info(
                    "MQTT reconnect will be attempted automatically | attempt=%s",
                    self._reconnect_attempts,
                )

    def on_message(self, client, userdata, msg):
        try:
            raw_payload = msg.payload.decode("utf-8")
        except UnicodeDecodeError:
            logger.exception(
                "Failed to decode MQTT payload as UTF-8 | topic=%s | bytes=%s",
                msg.topic,
                msg.payload,
            )
            return

        try:
            payload = json.loads(raw_payload)
        except JSONDecodeError:
            logger.exception(
                "Failed to parse MQTT JSON payload | topic=%s | payload=%s",
                msg.topic,
                raw_payload,
            )
            return

        machine_id = payload.get("machineID")
        logger.info(
            "MQTT message received | topic=%s | machine=%s",
            msg.topic,
            machine_id,
        )

        if not callable(self.message_callback):
            logger.error(
                "MQTT message callback is not configured; dropping message | machine=%s",
                machine_id,
            )
            return

        try:
            result = self.message_callback(payload)
            if result is None:
                logger.warning(
                    "Telemetry callback returned no result | machine=%s",
                    machine_id,
                )
            else:
                logger.info(
                    "Telemetry callback completed | machine=%s",
                    machine_id,
                )
        except Exception:
            logger.exception(
                "MQTT processing pipeline failed | machine=%s",
                machine_id,
            )


mqtt_service = MQTTService()
