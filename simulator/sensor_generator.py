"""
sensor_generator.py

Generates realistic Industrial IoT sensor readings
for Predictive Maintenance.

Author: Bharath Karanam
"""

from __future__ import annotations
import os
import random
from datetime import datetime
from typing import Dict
import logging
ANOMALY_PROBABILITY = float(
    os.getenv("ANOMALY_PROBABILITY", "0.10")
)
class SensorGenerator:
    """
    Simulates sensor telemetry for multiple industrial machines.

    Features
    --------
    • Machine-specific baseline values
    • Normal operating variation
    • Occasional anomaly generation
    • Realistic timestamps
    """

    def __init__(self):

      self.machine_profiles = {
        1: {
            "model": "model1",
            "age": 10,
            "volt": 170,
            "rotate": 450,
            "pressure": 100,
            "vibration": 38,
        },
        2: {
            "model": "model2",
            "age": 6,
            "volt": 165,
            "rotate": 470,
            "pressure": 95,
            "vibration": 35,
        },
        3: {
            "model": "model3",
            "age": 14,
            "volt": 180,
            "rotate": 430,
            "pressure": 105,
            "vibration": 42,
        },
        4: {
            "model": "model4",
            "age": 8,
            "volt": 175,
            "rotate": 460,
            "pressure": 98,
            "vibration": 37,
        },
    }

      self.machine_state = {}
      self.machine_health = {}

      INITIAL_HEALTH = float(
        os.getenv("INITIAL_HEALTH", "100")
    )

      for machine_id, profile in self.machine_profiles.items():

        self.machine_state[machine_id] = {
            "volt": profile["volt"],
            "rotate": profile["rotate"],
            "pressure": profile["pressure"],
            "vibration": profile["vibration"],
        }

        self.machine_health[machine_id] = INITIAL_HEALTH
    # ---------------------------------------------------------

    def _normal_variation(self, value: float, variation: float):

        return round(
            random.uniform(
                value - variation,
                value + variation
            ),
            2
        )

    # ---------------------------------------------------------

    def _inject_anomaly(self, reading: Dict):

        """
        Creates abnormal sensor behaviour.

        Only 10% probability.
        """

        if random.random() < ANOMALY_PROBABILITY:

            anomaly = random.choice([
                "vibration",
                "pressure",
                "volt",
                "rotate"
            ])

            if anomaly == "vibration":
                reading["vibration"] += random.uniform(15, 30)

            elif anomaly == "pressure":
                reading["pressure"] += random.uniform(20, 40)

            elif anomaly == "volt":
                reading["volt"] += random.uniform(15, 30)

            elif anomaly == "rotate":
                reading["rotate"] -= random.uniform(80, 150)

            reading["error_flag"] = 1

        return reading

    # ---------------------------------------------------------

    def generate(self, machine_id: int):

      if machine_id not in self.machine_profiles:
        raise ValueError(
            f"Unknown Machine ID : {machine_id}"
        )

      profile = self.machine_profiles[machine_id]
      state = self.machine_state[machine_id]
      health = self.machine_health[machine_id]

      # Slowly wear the machine
      health -= random.uniform(0.02, 0.08)

      health = max(0, health)
      # ---------------------------------------------------------
      # Maintenance Cycle
# ---------------------------------------------------------

      if health <= 20:
        logger = logging.getLogger("maintanance")
        logger.info(
         "Maintenance completed for Machine %s",
        machine_id
        )

        self.machine_health[machine_id] = 100.0

        self.machine_state[machine_id] = {

        "volt": profile["volt"],

        "rotate": profile["rotate"],

        "pressure": profile["pressure"],

        "vibration": profile["vibration"]

    }

        health = 100.0

        state = self.machine_state[machine_id]

        self.machine_health[machine_id] = health

    # ---------------------------------------------------------
    # Gradually update machine state
    # ---------------------------------------------------------

      state["volt"] += random.uniform(-0.5, 0.5)

      state["rotate"] += random.uniform(-1,1)
      state["rotate"] -= (100 - health) * 0.05

      state["pressure"] += random.uniform(-0.3, 0.3)
      state["pressure"] += (100 - health) * 0.01
      state["vibration"] += random.uniform(-0.2, 0.2)
      # More wear = more vibration
      state["vibration"] += (100 - health) * 0.02

    # ---------------------------------------------------------
    # Create telemetry reading
    # ---------------------------------------------------------

      reading = {

        "machineID": machine_id,

        "volt": round(state["volt"], 2),

        "rotate": round(state["rotate"], 2),

        "pressure": round(state["pressure"], 2),

        "vibration": round(state["vibration"], 2),

        "age": profile["age"],

        "model": profile["model"],

        "error_flag": 0,

        "timestamp": datetime.utcnow().isoformat()

    }

    # Inject anomaly if required
      reading = self._inject_anomaly(reading)
      reading["health"] = round(health, 2)
      return reading
# -------------------------------------------------------------
# Standalone Testing
# -------------------------------------------------------------

if __name__ == "__main__":

    generator = SensorGenerator()

    for machine in range(1, 5):

        print("=" * 60)

        print(generator.generate(machine))