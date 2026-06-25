# 🚀 Advanced Predictive Maintenance for Industrial IoT

An AI-powered Predictive Maintenance system that detects machine anomalies before component failures occur using Industrial IoT telemetry data and Machine Learning.

---

## 📌 Project Overview

Industrial machines continuously generate sensor data such as:

- Voltage
- Rotation Speed
- Pressure
- Vibration

Unexpected failures lead to production downtime and increased maintenance costs.

This project builds an **Intelligent Predictive Maintenance Pipeline** that analyzes historical IoT telemetry, engineers time-series features, detects anomalies using Machine Learning, and evaluates how early failures can be predicted.

---

# 🎯 Objectives

- Detect abnormal machine behavior
- Predict potential component failures before breakdown
- Reduce downtime
- Improve maintenance planning
- Build a production-ready ML pipeline

---

# 🛠 Tech Stack

### Programming

- Python

### Libraries

- Pandas
- NumPy
- Scikit-learn
- Joblib
- Matplotlib
- Seaborn

### Machine Learning

- Isolation Forest (Unsupervised Anomaly Detection)

### Dataset

Microsoft Azure Predictive Maintenance Dataset

Contains:

- Telemetry
- Machine Information
- Errors
- Failures
- Maintenance Logs

---

# 📂 Project Structure

```
Advanced-Predictive-Maintenance/
│
├── data/
│   ├── PdM_telemetry.csv
│   ├── PdM_errors.csv
│   ├── PdM_failures.csv
│   ├── PdM_machines.csv
│   └── PdM_maint.csv
│
├── models/
│
├── notebooks/
│
├── src/
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── train.py
│   ├── evaluate.py
│   └── main.py
│
├── experiments.csv
├── config.yaml
├── requirements.txt
├── README.md
└── .gitignore
```

---

# 📊 Dataset Information

The telemetry dataset contains hourly sensor readings.

| Feature | Description |
|----------|-------------|
| datetime | Timestamp |
| machineID | Machine Identifier |
| volt | Voltage |
| rotate | Rotation Speed |
| pressure | Pressure |
| vibration | Machine Vibration |

Additional datasets include:

- Machine metadata
- Error logs
- Maintenance history
- Component failures

---

# ⚙️ Feature Engineering

The project generates multiple time-series features to improve anomaly detection.

### ✅ Rolling Statistics

- 24-hour Rolling Mean
- 24-hour Rolling Standard Deviation

Generated for:

- Voltage
- Pressure
- Rotation
- Vibration

---

### ✅ Lag Features

Historical sensor values:

- Lag 1 Hour
- Lag 6 Hours
- Lag 24 Hours

---

### ✅ Change Features

- Absolute Change
- Percentage Change

---

### ✅ Z-Score Features

Sensor deviation from rolling mean.

Example:

```
(vibration - rolling_mean)
/ rolling_std
```

---

### ✅ Machine Information

- Machine Age
- Machine Model Encoding

---

### ✅ Error Features

Integrated machine error history into telemetry data.

---

# 🤖 Machine Learning Model

Current model:

**Isolation Forest**

Purpose:

- Learn normal machine behavior
- Detect anomalies without labeled training data

Current Parameters:

- contamination = 0.01
- random_state = 42

---

# 📈 Current Results

Current pipeline performance:

| Metric | Result |
|---------|---------|
| Total Records | 876,100 |
| Normal Records | 867,339 |
| Anomalies | 8,761 |
| Total Failures | 761 |
| Detection Rate | **74.11%** |
| Average Lead Time | **6.69 Hours** |

---

## Component-wise Detection

| Component | Detection Rate |
|-----------|---------------|
| Comp1 | 64.06% |
| Comp2 | 65.64% |
| Comp3 | 99.24% |
| Comp4 | 78.77% |

---

# ✅ Project Progress

## ✔ Completed

### Data Processing

- Dataset loading
- Data cleaning
- Data merging
- Missing value handling

---

### Feature Engineering

- Rolling Mean
- Rolling Standard Deviation
- Lag Features
- Change Features
- Z-Score Features
- Model Encoding
- Error Features

---

### Machine Learning

- Isolation Forest Training
- Model Saving
- Prediction Generation
- Anomaly Scores
- Anomaly Labels

---

### Evaluation

- Detection Rate
- Lead Time Analysis
- Component-wise Evaluation

---

### Project Structure

- Modular Python source files
- Config file
- Experiment tracking
- Git-ready structure

---

# 🚧 Upcoming Work

The following features are currently under development.

## Azure IoT Integration

- Azure IoT Hub
- Streaming Telemetry
- Real-time Data Ingestion

---

## MLOps

- MLflow
- Model Versioning
- Experiment Tracking
- CI/CD Pipeline

---

## Deployment

- FastAPI Backend
- REST API
- Docker
- Kubernetes

---

## Monitoring

- Prometheus
- Grafana

---

## Dashboard

Interactive dashboard for:

- Live Machine Status
- Failure Alerts
- Anomaly Trends
- Sensor Visualization

---

# ▶️ Running the Project

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run the pipeline

```bash
python -m src.main
```

---

# 📌 Future Goals

- Deep Learning Models (LSTM / AutoEncoder)
- Explainable AI (SHAP)
- Real-Time Streaming Predictions
- Cloud Deployment
- Automated Retraining
- Edge AI Support

---

# 📈 Project Status

🟢 **Phase 1 Complete**

✔ Data Pipeline

✔ Feature Engineering

✔ Isolation Forest Training

✔ Evaluation Pipeline

🚧 Currently working on:

- MLOps
- Cloud Integration
- Deployment
- Monitoring Dashboard

---

# 👨‍💻 Author

**Bharath Karanam**

AI/ML Engineer | Machine Learning | MLOps | Industrial IoT | Predictive Maintenance

---

## ⭐ If you found this project useful, consider giving it a Star!
