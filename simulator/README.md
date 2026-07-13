# Industrial IoT Device Simulator

This simulator is part of the **Advanced Predictive Maintenance** project.

It simulates industrial machine telemetry and publishes sensor readings to **HiveMQ Cloud** using MQTT.

---

# Architecture

```
Industrial Machines (Simulator)
            │
            ▼
     Sensor Generator
            │
            ▼
      MQTT Publisher
            │
            ▼
        HiveMQ Cloud
            │
            ▼
     FastAPI Subscriber
            │
            ▼
    Isolation Forest Model
            │
            ▼
     React Dashboard
```

---

# Features

- Simulates multiple industrial machines.
- Generates realistic sensor values.
- Machine-specific profiles.
- Automatic anomaly generation.
- Publishes telemetry every few seconds.
- Secure MQTT connection using TLS.
- Compatible with FastAPI MQTT Subscriber.

---

# Project Structure

```
simulator/

│── sensor_generator.py

│── mqtt_client.py

│── simulator.py

│── requirements.txt

└── README.md
```

---

# Machine Profiles

| Machine | Model | Age |
|----------|--------|-----|
| 1 | model1 | 10 |
| 2 | model2 | 6 |
| 3 | model3 | 14 |
| 4 | model4 | 8 |

Each machine has different baseline values for

- Voltage
- Rotation
- Pressure
- Vibration

---

# Telemetry Format

```json
{
    "machineID": 1,
    "volt": 170.5,
    "rotate": 451.3,
    "pressure": 100.1,
    "vibration": 38.4,
    "age": 10,
    "model": "model1",
    "error_flag": 0,
    "timestamp": "2026-07-11T20:15:25Z"
}
```

---

# MQTT Topic

```
predictive-maintenance/machine-data
```

---

# Installation

Install dependencies

```bash
pip install -r requirements.txt
```

---

# Running the Simulator

```bash
python simulator.py
```

or

```bash
python simulator/simulator.py
```

---

# Expected Console Output

```
Connected Successfully

Publishing Machine 1

Published Successfully

Publishing Machine 2

Published Successfully

Waiting for next telemetry cycle...
```

---

# HiveMQ Verification

Open the HiveMQ Web Client.

Subscribe to

```
predictive-maintenance/machine-data
```

You should see live JSON telemetry every few seconds.

---

# Future Enhancements

- Temperature sensor simulation
- Failure event simulation
- Machine shutdown simulation
- Configurable publishing interval
- Configurable number of machines
- Historical replay mode

---

# Author

Bharath Karanam

Advanced Predictive Maintenance

Industrial IoT + MLOps + Kubernetes