"""
simulator.py

Industrial IoT Device Simulator

This program continuously generates sensor telemetry
for multiple machines and publishes it to HiveMQ Cloud.

Author: Bharath Karanam
"""

from __future__ import annotations

import signal
import sys
import time
import logging
from pathlib import Path

try:
    from .sensor_generator import SensorGenerator
    from .mqtt_client import MQTTClient
except ImportError:
    # Make the repository root importable when this file is run directly.
    PROJECT_ROOT = Path(__file__).resolve().parents[1]
    if str(PROJECT_ROOT) not in sys.path:
        sys.path.insert(0, str(PROJECT_ROOT))

    from sensor_generator import SensorGenerator
    from mqtt_client import MQTTClient

# ---------------------------------------------------------
# Logger
# ---------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("device-simulator")


# ---------------------------------------------------------
# Device Simulator
# ---------------------------------------------------------

class DeviceSimulator:

    def __init__(self):

        self.generator = SensorGenerator()

        self.mqtt = MQTTClient()

        self.running = True

    # -----------------------------------------------------

    def start(self):

        logger.info("=" * 70)
        logger.info("Industrial IoT Device Simulator Started")
        logger.info("=" * 70)

        self.mqtt.connect()

        # Give MQTT time to establish connection
        time.sleep(2)

        while self.running:

            try:

                for machine_id in range(1, 5):

                    reading = self.generator.generate(machine_id)

                    logger.info("-" * 60)
                    logger.info("Publishing Machine %s", machine_id)
                    logger.info(reading)

                    self.mqtt.publish(reading)

                    # Small gap between machine publishes
                    time.sleep(1)

                logger.info("=" * 70)
                logger.info("Waiting for next telemetry cycle...")
                logger.info("=" * 70)

                # Publish every 5 seconds
                time.sleep(5)

            except Exception as ex:

                logger.exception(ex)

                time.sleep(5)

    # -----------------------------------------------------

    def stop(self):

        logger.info("Stopping Simulator...")

        self.running = False

        self.mqtt.disconnect()

        logger.info("Simulator Stopped")


# ---------------------------------------------------------
# Graceful Shutdown
# ---------------------------------------------------------

simulator = DeviceSimulator()


def shutdown(signum, frame):

    simulator.stop()

    sys.exit(0)


signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)


# ---------------------------------------------------------
# Main
# ---------------------------------------------------------

if __name__ == "__main__":

    simulator.start()
