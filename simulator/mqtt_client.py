"""
mqtt_client.py

MQTT Client for Industrial IoT Predictive Maintenance

Responsibilities
----------------
1. Connect to HiveMQ Cloud
2. Publish telemetry
3. Handle reconnects
4. Log MQTT events

Author: Bharath Karanam
"""

from __future__ import annotations

import json
import ssl
import uuid
import logging
import sys
from pathlib import Path
import paho.mqtt.client as mqtt

# Make the repository root importable when this module is run or imported
# directly from the simulator directory.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from configs.mqtt_config import (
    MQTT_BROKER,
    MQTT_PORT,
    MQTT_USERNAME,
    MQTT_PASSWORD,
    MQTT_TOPIC,
)

# ---------------------------------------------------------
# Logger
# ---------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("mqtt-client")


# ---------------------------------------------------------
# MQTT Publisher
# ---------------------------------------------------------

class MQTTClient:

    def __init__(self):

        self.client_id = f"simulator-{uuid.uuid4()}"

        self.client = mqtt.Client(
            client_id=self.client_id,
            protocol=mqtt.MQTTv311
        )

        # Authentication
        self.client.username_pw_set(
            MQTT_USERNAME,
            MQTT_PASSWORD
        )

        # TLS (Required by HiveMQ Cloud)
        self.client.tls_set(
            cert_reqs=ssl.CERT_REQUIRED,
            tls_version=ssl.PROTOCOL_TLS_CLIENT,
        )

        self.client.tls_insecure_set(False)

        # Callbacks
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_publish = self.on_publish

    # -----------------------------------------------------

    def connect(self):

        logger.info("=" * 60)
        logger.info("Connecting to HiveMQ Cloud...")
        logger.info("Broker : %s", MQTT_BROKER)
        logger.info("Port   : %s", MQTT_PORT)

        self.client.connect(
            MQTT_BROKER,
            MQTT_PORT,
            keepalive=60
        )

        self.client.loop_start()

    # -----------------------------------------------------

    def disconnect(self):

        logger.info("Disconnecting MQTT Client...")

        self.client.loop_stop()
        self.client.disconnect()

    # -----------------------------------------------------

    def publish(self, payload: dict):

        message = json.dumps(payload)

        result = self.client.publish(
            topic=MQTT_TOPIC,
            payload=message,
            qos=1,
            retain=False
        )

        status = result.rc

        if status != mqtt.MQTT_ERR_SUCCESS:
            logger.error(
                "Failed to publish message."
            )

    # -----------------------------------------------------
    # MQTT Callbacks
    # -----------------------------------------------------

    def on_connect(self, client, userdata, flags, rc):

        if rc == 0:

            logger.info("=" * 60)
            logger.info("Connected Successfully")
            logger.info("Client ID : %s", self.client_id)
            logger.info("Topic     : %s", MQTT_TOPIC)
            logger.info("=" * 60)

        else:

            logger.error(
                "Connection Failed. Return Code : %s",
                rc
            )

    # -----------------------------------------------------

    def on_disconnect(self, client, userdata, rc):

        logger.warning(
            "Disconnected from MQTT Broker."
        )

    # -----------------------------------------------------

    def on_publish(self, client, userdata, mid):

        logger.info(
            "Message Published Successfully (MID=%s)",
            mid
        )


# ---------------------------------------------------------
# Standalone Test
# ---------------------------------------------------------

if __name__ == "__main__":

    import time

    mqtt_client = MQTTClient()

    mqtt_client.connect()

    time.sleep(2)

    sample = {

        "machineID": 1,
        "volt": 170.5,
        "rotate": 452,
        "pressure": 100,
        "vibration": 38.4,
        "age": 10,
        "model": "model1",
        "error_flag": 0,
        "timestamp": "2026-07-11T21:00:00"
    }

    mqtt_client.publish(sample)

    time.sleep(3)

    mqtt_client.disconnect()
