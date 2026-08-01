"""
simulator.py

Industrial IoT Device Simulator

This program continuously generates sensor telemetry
for multiple machines and publishes it to HiveMQ Cloud.

Author: Bharath Karanam
"""

from __future__ import annotations
import os
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
# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("device-simulator")
# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------


PUBLISH_INTERVAL = int(
    os.getenv("PUBLISH_INTERVAL", "10")
)

NUM_MACHINES = int(
    os.getenv("NUM_MACHINES", "4")
)

ANOMALY_PROBABILITY = float(
    os.getenv("ANOMALY_PROBABILITY", "0.10")
)

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

        logger.info("Machines              : %s", NUM_MACHINES)
        logger.info("Publish Interval      : %s sec", PUBLISH_INTERVAL)
        logger.info("Anomaly Probability   : %.0f%%", ANOMALY_PROBABILITY * 100)
        logger.info("MQTT Broker           : HiveMQ Cloud")

        logger.info("=" * 70)

        self.mqtt.connect()

        # Give MQTT time to establish connection
        time.sleep(2)

        while self.running:

            try:

                for machine_id in range(1, NUM_MACHINES + 1):

                    reading = self.generator.generate(machine_id)

                    logger.info("-" * 60)
                    logger.info("Publishing Machine %s", machine_id)
                    logger.info(reading)

                    self.mqtt.publish(reading)

                    # Small gap between machine publishes

                logger.info("=" * 70)
                logger.info(
                    "Waiting %s seconds for next telemetry cycle...",
                     PUBLISH_INTERVAL
                      )
                logger.info("=" * 70)

                time.sleep(PUBLISH_INTERVAL)

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
