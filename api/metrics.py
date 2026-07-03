from prometheus_client import Counter, Histogram, Gauge

# Total HTTP Requests
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP Requests",
    ["method", "endpoint"]
)

# Request Latency
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP Request Duration",
    ["endpoint"]
)

# Prediction Requests
PREDICTION_COUNT = Counter(
    "prediction_requests_total",
    "Total Prediction Requests"
)

# Anomaly Predictions
ANOMALY_COUNT = Counter(
    "anomaly_predictions_total",
    "Total Anomaly Predictions"
)

# Requests currently being processed
IN_PROGRESS = Gauge(
    "requests_in_progress",
    "Requests currently in progress"
)