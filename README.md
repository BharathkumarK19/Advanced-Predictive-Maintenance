# 🏭 Advanced Predictive Maintenance Platform

### Real-Time Industrial IoT Predictive Maintenance using Machine Learning, MQTT, FastAPI, Kubernetes, Prometheus & Grafana

<p align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?logo=kubernetes)
![MQTT](https://img.shields.io/badge/MQTT-HiveMQ-660066)
![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus-E6522C?logo=prometheus)
![Grafana](https://img.shields.io/badge/Visualization-Grafana-F46800?logo=grafana)
![License](https://img.shields.io/badge/License-MIT-green)

</p>

---

## 📌 Overview

Advanced Predictive Maintenance Platform is a **cloud-native Industrial IoT solution** that performs **real-time anomaly detection and machine health monitoring** using live sensor data streamed through MQTT. The platform combines Machine Learning, containerization, orchestration, and observability to simulate a production-ready predictive maintenance system.

The system continuously receives sensor readings from industrial machines, performs feature engineering, predicts anomalies using an Isolation Forest model, stores predictions in PostgreSQL, visualizes machine health through a React dashboard, and exposes operational metrics through Prometheus and Grafana.

---

## 🎯 Project Objectives

- Detect abnormal machine behaviour before equipment failure.
- Simulate a real Industrial IoT environment.
- Build a production-style Machine Learning deployment pipeline.
- Demonstrate cloud-native deployment using Kubernetes.
- Monitor the entire system using Prometheus and Grafana.
- Store historical sensor readings and predictions for analysis.

---

## ✨ Key Highlights

- 🚀 Real-time Industrial IoT Predictive Maintenance Platform
- 📡 Live MQTT sensor streaming using HiveMQ Cloud
- 🤖 Isolation Forest-based anomaly detection
- ⚙️ Online feature engineering pipeline
- ⚡ FastAPI REST API with automatic prediction pipeline
- 🗄 PostgreSQL storage for sensor history and prediction history
- 📊 Interactive React dashboard for live monitoring
- 🐳 Fully containerized using Docker
- ☸️ Kubernetes deployment with Minikube
- 📈 Prometheus metrics integration
- 📉 Grafana dashboards for system monitoring
- 🧪 Configurable Industrial IoT simulator with anomaly injection
- 🔄 One-command startup and shutdown automation scripts

---
# 🏗️ System Architecture

The Advanced Predictive Maintenance Platform is designed as a cloud-native, event-driven Industrial IoT system. It continuously streams machine telemetry through MQTT, performs real-time anomaly detection using Machine Learning, stores historical data, exposes REST APIs, and provides complete observability using Prometheus and Grafana.

---

##  Architecture

> **(Professional Architecture Diagram Here)**

```
                    ┌────────────────────────────┐
                    │   Industrial Machines      │
                    │  (Sensor Simulator)        │
                    └─────────────┬──────────────┘
                                  │
                           MQTT Messages
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │        HiveMQ Cloud        │
                    │      MQTT Broker           │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                ┌─────────────────────────────────┐
                │      FastAPI Prediction API      │
                │                                 │
                │ • MQTT Subscriber              │
                │ • Feature Engineering          │
                │ • Isolation Forest Prediction  │
                │ • Risk Level Classification    │
                │ • REST APIs                    │
                │ • Prometheus Metrics           │
                └─────────────┬──────────────────┘
                              │
                ┌─────────────┴──────────────┐
                ▼                            ▼
      ┌────────────────┐           ┌─────────────────┐
      │ PostgreSQL DB  │           │ React Dashboard │
      │                │           │                 │
      │ Sensor History │           │ Live Monitoring │
      │ Predictions    │           │ Machine Status  │
      └────────────────┘           └─────────────────┘
                                             │
                              ┌──────────────┴─────────────┐
                              ▼                            ▼
                    ┌────────────────┐          ┌────────────────┐
                    │ Prometheus     │          │ Grafana        │
                    │ Metrics        │          │ Dashboards     │
                    └────────────────┘          └────────────────┘
```

---

# Data Flow

The complete prediction pipeline follows these steps:

1. The Industrial IoT Simulator generates realistic machine sensor readings.

2. The simulator publishes telemetry to HiveMQ Cloud using MQTT.

3. FastAPI subscribes to the MQTT topic and receives sensor data.

4. Incoming data undergoes online feature engineering.

5. The trained Isolation Forest model predicts whether the machine is operating normally or anomalously.

6. A risk level is assigned based on the anomaly score.

7. Sensor readings and prediction results are stored in PostgreSQL.

8. The React dashboard retrieves historical predictions through REST APIs.

9. Prometheus continuously scrapes backend metrics.

10. Grafana visualizes system health and operational metrics.

---

# System Characteristics

- Event-Driven Architecture
- Real-Time Streaming Pipeline
- Machine Learning Inference Service
- Cloud-Native Deployment
- Containerized Microservices
- Observability-First Design
- Kubernetes Orchestration
- Persistent Data Storage

# 📖 Project Overview

Unexpected equipment failures in industrial environments lead to production downtime, increased maintenance costs, and reduced operational efficiency. Traditional maintenance strategies such as reactive maintenance (repair after failure) and preventive maintenance (scheduled servicing) are often inefficient because they either react too late or replace healthy components unnecessarily.

This project addresses these challenges by implementing a real-time Predictive Maintenance Platform capable of continuously monitoring machine telemetry, detecting abnormal behavior using Machine Learning, and providing actionable insights before failures occur.

Unlike traditional machine learning projects that focus only on model development, this project demonstrates the complete lifecycle of deploying an AI model into a production-style Industrial IoT environment.

The platform simulates industrial sensor data, streams it through MQTT, performs online feature engineering, predicts anomalies using an Isolation Forest model, stores historical information in PostgreSQL, visualizes machine health through a React dashboard, and exposes operational metrics through Prometheus and Grafana.

The result is a complete cloud-native Predictive Maintenance solution built using modern DevOps, MLOps, and cloud-native technologies.

# ✨ Features

## Industrial IoT

- Industrial machine simulator
- Real-time MQTT communication
- HiveMQ Cloud integration
- Configurable machine profiles
- Configurable anomaly generation
- Configurable publishing interval

---

## Machine Learning

- Isolation Forest anomaly detection
- Online feature engineering
- Rolling statistics
- Lag features
- Percentage change features
- Z-score features
- Machine health risk classification

---

## Backend

- FastAPI REST API
- MQTT subscriber
- Automatic prediction pipeline
- Prediction history API
- Health endpoint
- Prometheus metrics endpoint

---

## Database

- PostgreSQL
- Sensor history storage
- Prediction history storage
- Risk level persistence

---

## Frontend

- React Dashboard
- Live machine monitoring
- Historical predictions
- Machine status visualization

---

## DevOps

- Docker
- Kubernetes
- Minikube
- PowerShell automation

---

## Monitoring

- Prometheus
- Grafana
- HTTP metrics
- Prediction metrics
- Anomaly metrics

# 🛠 Technology Stack

| Category | Technologies |
|-----------|--------------|
| Programming Language | Python 3.11 |
| Machine Learning | Scikit-learn (Isolation Forest) |
| Backend | FastAPI |
| Frontend | React |
| Database | PostgreSQL |
| Messaging | MQTT (HiveMQ Cloud) |
| Containerization | Docker |
| Orchestration | Kubernetes (Minikube) |
| Monitoring | Prometheus |
| Visualization | Grafana |
| API Documentation | Swagger UI |
| Version Control | Git & GitHub |

# 📂 Repository Structure

```
Advanced-Predictive-Maintenance/

├── api/
├── frontend/
├── simulator/
├── models/
├── monitoring/
│   ├── grafana/
│   ├── prometheus.yml
│   ├── prometheus-deployment.yaml
│   └── prometheus-service.yaml
├── deployment/
├── scripts/
│   ├── start_project.ps1
│   └── stop_project.ps1
├── notebooks/
├── requirements.txt
├── README.md
└── LICENSE
```
# 🤖 Machine Learning Pipeline

The prediction pipeline performs the following operations for every incoming sensor reading:

1. Receive MQTT message
2. Validate incoming payload
3. Apply online feature engineering
4. Normalize input features
5. Perform Isolation Forest inference
6. Compute anomaly score
7. Assign anomaly label
8. Calculate machine risk level
9. Store results in PostgreSQL
10. Update dashboard
11. Update Prometheus metrics

# 🔄 System Workflow

```
Simulator
      │
      ▼
HiveMQ Cloud
      │
      ▼
FastAPI
      │
Feature Engineering
      │
Isolation Forest
      │
Risk Level
      │
 ┌────┴────┐
 ▼         ▼
Database  Dashboard
      │
 ┌────┴─────┐
 ▼          ▼
Prometheus Grafana
```
# 🌐 REST APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/health | GET | API health check |
| /api/history/{machine_id} | GET | Machine prediction history |
| /metrics | GET | Prometheus metrics |
| /docs | GET | Swagger API documentation |

# 📈 Monitoring & Observability

The platform exposes operational metrics using Prometheus.

Collected metrics include:

- HTTP Requests
- Request Duration
- Prediction Requests
- Anomaly Predictions

Grafana provides dashboards for:

- Prediction throughput
- HTTP requests
- API latency
- System monitoring

# 🚀 Installation

## Clone Repository

```bash
git clone <repository-url>
cd Advanced-Predictive-Maintenance
```

## Build Images

```bash
docker build ...
```

## Deploy Kubernetes

```bash
kubectl apply -f deployment/
```

## Start Project

```powershell
.\scripts\start_project.ps1
```

## Stop Project

```powershell
.\scripts\stop_project.ps1
```
# ✅ Testing

The platform has been validated for:

- MQTT communication
- Machine learning inference
- PostgreSQL persistence
- REST APIs
- Kubernetes deployment
- Docker containers
- Prometheus metrics
- Grafana dashboards
- End-to-end real-time prediction pipeline
# 📊 Results

The platform successfully demonstrates:

- Real-time Industrial IoT simulation
- Streaming anomaly detection
- Automated feature engineering
- Persistent prediction history
- Cloud-native deployment
- Live monitoring
- Automated startup and shutdown
# 🚀 Future Enhancements

- JWT Authentication
- Role-Based Access Control
- Email Alerts
- SMS Notifications
- Redis Cache
- Apache Kafka Integration
- CI/CD Pipeline
- Helm Charts
- Cloud Deployment (GKE, AKS, EKS)
- Automatic Model Retraining

# 👨‍💻 Author

**Bharath Karanam**

AI / ML Engineer

Specializations

- Machine Learning
- Deep Learning
- NLP
- MLOps
- Generative AI
- Cloud-Native AI Systems
# 📜 License

This project is licensed under the MIT License.
