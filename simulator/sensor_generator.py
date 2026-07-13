"""
sensor_generator.py

Generates realistic Industrial IoT sensor readings
for Predictive Maintenance.

Author: Bharath Karanam
"""

from __future__ import annotations

import random
from datetime import datetime
from typing import Dict


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

        if random.random() < 0.10:

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

        reading = {

            "machineID": machine_id,

            "volt": self._normal_variation(
                profile["volt"],
                3
            ),

            "rotate": self._normal_variation(
                profile["rotate"],
                6
            ),

            "pressure": self._normal_variation(
                profile["pressure"],
                2
            ),

            "vibration": self._normal_variation(
                profile["vibration"],
                1.5
            ),

            "age": profile["age"],

            "model": profile["model"],

            "error_flag": 0,

            "timestamp": datetime.utcnow().isoformat()
        }

        reading = self._inject_anomaly(reading)

        return reading


# -------------------------------------------------------------
# Standalone Testing
# -------------------------------------------------------------

if __name__ == "__main__":

    generator = SensorGenerator()

    for machine in range(1, 5):

        print("=" * 60)

        print(generator.generate(machine))