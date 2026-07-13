import type {
  DashboardSummary,
  HealthResponse,
  HistoryRecord,
  HistoryViewRecord,
  Metric,
  MonitoringSnapshot,
  PredictionRequest,
  PredictionResponse,
  PredictionStatus,
  PredictionViewData,
  RiskLevel,
} from "../types";

const recommendationByRisk: Record<RiskLevel, string> = {
  Healthy: "Continue standard monitoring and keep the current maintenance schedule.",
  Low: "Inspect the machine during the next scheduled service window.",
  Medium: "Plan a maintenance check and review recent telemetry trends.",
  High: "Schedule maintenance within 24 to 48 hours and reduce load if possible.",
  Critical: "Stop operation safely and perform immediate maintenance intervention.",
};

const displayRiskMap: Record<string, RiskLevel> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
  HEALTHY: "Healthy",
};

export const normalizeRiskLevel = (value: string): RiskLevel => displayRiskMap[value.toUpperCase()] ?? "Healthy";

export const validatePredictionRequest = (request: PredictionRequest) => {
  const errors: string[] = [];

  if (!Number.isInteger(request.machineID) || request.machineID <= 0) {
    errors.push("Machine ID is required and must be a positive integer.");
  }

  if (!Number.isFinite(request.volt)) {
    errors.push("Voltage must be a valid number.");
  }

  if (!Number.isFinite(request.rotate)) {
    errors.push("Rotation must be a valid number.");
  }

  if (!Number.isFinite(request.pressure)) {
    errors.push("Pressure must be a valid number.");
  }

  if (!Number.isFinite(request.vibration)) {
    errors.push("Vibration must be a valid number.");
  }

  if (!Number.isInteger(request.age) || request.age <= 0) {
    errors.push("Age must be a positive integer.");
  }

  if (!request.model.trim()) {
    errors.push("Model is required.");
  }

  if (![0, 1].includes(request.error_flag)) {
    errors.push("Error Flag must be 0 or 1.");
  }

  return errors;
};

export const deriveStatusFromRisk = (riskLevel: RiskLevel): PredictionStatus => {
  switch (riskLevel) {
    case "Healthy":
    case "Low":
      return "Stable";
    case "Medium":
      return "Monitor";
    case "High":
      return "Action Required";
    case "Critical":
      return "Critical";
    default:
      return "Pending";
  }
};

export const deriveFailureWindow = (score: number) => {
  if (score >= 0.9) return "Within 24 hours";
  if (score >= 0.75) return "Within 3 days";
  if (score >= 0.5) return "Within 7 days";
  return "Within 14 days";
};

export const deriveAnomalyScore = (request: PredictionRequest | HistoryRecord) => {
  const rawScore =
    (request.vibration / 100) * 0.35 +
    (request.pressure < 110 ? 0.14 : 0.03) +
    (request.volt < 180 ? 0.16 : 0.05) +
    (request.age / 100) * 0.18 +
    (request.error_flag ? 0.18 : 0);

  return Number(Math.min(0.99, Math.max(0.04, rawScore)).toFixed(2));
};

export const derivePredictionView = (
  response: PredictionResponse,
  request: PredictionRequest,
  machineIdSeed = request.machineID,
): PredictionViewData => {
  const riskLevel = normalizeRiskLevel(response.risk_level);
  const anomalyScore = Number(Math.abs(response.anomaly_score).toFixed(2));

  return {
    id: `pred-${Date.now()}-${machineIdSeed}`,
    timestamp: new Date().toISOString(),
    machineID: request.machineID,
    model: request.model,
    riskLevel,
    anomalyScore,
    anomaly: response.anomaly,
    anomalyLabel: response.anomaly_label,
    status: deriveStatusFromRisk(riskLevel),
    maintenanceRecommendation: recommendationByRisk[riskLevel],
    responseTimeMs: 120 + Math.round(request.vibration / 4),
    predictedFailureWindow: deriveFailureWindow(anomalyScore),
  };
};

export const deriveHistoryView = (records: HistoryRecord[], machineID: number): HistoryViewRecord[] => {
  const total = records.length;
  return records.map((record, index) => {
    const score = deriveAnomalyScore(record);
    const riskLevel = score >= 0.9 ? "Critical" : score >= 0.75 ? "High" : score >= 0.5 ? "Medium" : score >= 0.25 ? "Low" : "Healthy";

    return {
      id: `hist-${machineID}-${index}`,
      timestamp: new Date(Date.now() - (total - index - 1) * 15 * 60 * 1000).toISOString(),
      machineID: record.machineID,
      volt: record.volt,
      rotate: record.rotate,
      pressure: record.pressure,
      vibration: record.vibration,
      age: record.age,
      model: record.model,
      error_flag: record.error_flag,
      riskLevel,
      score,
      status: deriveStatusFromRisk(riskLevel),
      responseTimeMs: 110 + Math.round(record.vibration / 5),
      recommendation: recommendationByRisk[riskLevel],
    };
  });
};

const metricValue = (metrics: Record<string, number>, name: string) => metrics[name] ?? 0;

export const parsePrometheusMetrics = (text: string) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));

  const counters: Record<string, number> = {};
  const labeledCounters: Array<{ metric: string; labels: Record<string, string>; value: number }> = [];
  const histograms: Record<string, { count: number; sum: number; buckets: Array<{ le: string; value: number }> }> = {};

  for (const line of lines) {
    const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{[^}]+\})?\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)$/);
    if (!match) continue;

    const [, metric, rawLabels = "", rawValue] = match;
    const value = Number(rawValue);
    const labels: Record<string, string> = {};

    if (rawLabels) {
      for (const pair of rawLabels.slice(1, -1).split(",")) {
        const [key, labelValue] = pair.split("=");
        if (key && labelValue) {
          labels[key.trim()] = labelValue.trim().replace(/^"|"$/g, "");
        }
      }
    }

    if (metric.endsWith("_bucket")) {
      const base = metric.replace(/_bucket$/, "");
      histograms[base] ??= { count: 0, sum: 0, buckets: [] };
      histograms[base].buckets.push({ le: labels.le ?? "", value });
      continue;
    }

    if (metric.endsWith("_count")) {
      const base = metric.replace(/_count$/, "");
      histograms[base] ??= { count: 0, sum: 0, buckets: [] };
      histograms[base].count = value;
      continue;
    }

    if (metric.endsWith("_sum")) {
      const base = metric.replace(/_sum$/, "");
      histograms[base] ??= { count: 0, sum: 0, buckets: [] };
      histograms[base].sum = value;
      continue;
    }

    if (Object.keys(labels).length > 0) {
      labeledCounters.push({ metric, labels, value });
      continue;
    }

    counters[metric] = value;
  }

  const httpRequestsByEndpoint = labeledCounters
    .filter((item) => item.metric === "http_requests_total")
    .map((item) => ({ name: `${item.labels.method ?? "?"} ${item.labels.endpoint ?? "unknown"}`, value: item.value }))
    .sort((a, b) => b.value - a.value);

  const requestDuration = histograms.http_request_duration_seconds;
  const averageLatencyMs =
    requestDuration && requestDuration.count > 0 ? Number(((requestDuration.sum / requestDuration.count) * 1000).toFixed(2)) : 0;

  return {
    predictionRequests: metricValue(counters, "prediction_requests_total"),
    anomalyPredictions: metricValue(counters, "anomaly_predictions_total"),
    httpRequests: httpRequestsByEndpoint.reduce((sum, entry) => sum + entry.value, 0),
    requestsInProgress: metricValue(counters, "requests_in_progress"),
    averageLatencyMs,
    httpRequestsByEndpoint,
    latencyBuckets:
      requestDuration?.buckets.map((bucket) => ({
        bucket: bucket.le === "+Inf" ? "Inf" : bucket.le,
        count: bucket.value,
      })) ?? [],
  };
};

export const buildDashboardSummary = ({
  metricsText,
  health,
  history,
  machineID,
}: {
  metricsText: string;
  health: HealthResponse;
  history: HistoryRecord[];
  machineID: number;
}): DashboardSummary => {
  const parsed = parsePrometheusMetrics(metricsText);
  const recentPredictions = deriveHistoryView(history.slice().reverse(), machineID).slice(0, 5);
  const anomalyAverage =
    recentPredictions.length > 0
      ? Number((recentPredictions.reduce((sum, item) => sum + item.score, 0) / recentPredictions.length).toFixed(2))
      : 0;

  const riskCounts = recentPredictions.reduce(
    (acc, item) => {
      acc[item.riskLevel] += 1;
      return acc;
    },
    {
      Healthy: 0,
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    } as Record<RiskLevel, number>,
  );

  return {
    metrics: [
      { label: "Total Machines", value: 1 },
      { label: "Healthy Machines", value: health.status.toLowerCase() === "healthy" ? 1 : 0 },
      { label: "High Risk Machines", value: riskCounts.High },
      { label: "Critical Machines", value: riskCounts.Critical },
      { label: "Prediction Requests Today", value: parsed.predictionRequests },
      { label: "Average Anomaly Score", value: anomalyAverage, unit: "" },
      { label: "Average Response Time", value: parsed.averageLatencyMs, unit: " ms" },
    ],
    predictionsOverTime: recentPredictions.map((item, index) => ({
      time: `T-${recentPredictions.length - index}`,
      predictions: index + 1,
      anomalies: item.error_flag ? 1 : 0,
    })),
    riskDistribution: Object.entries(riskCounts).map(([name, value]) => ({
      name: name as RiskLevel,
      value,
    })),
    machineHealth: [
      { name: "Healthy", value: health.status.toLowerCase() === "healthy" ? 1 : 0 },
      { name: "Monitor", value: health.model_loaded ? 1 : 0 },
      { name: "At Risk", value: health.scaler_loaded ? 1 : 0 },
      { name: "Critical", value: health.features_loaded ? 0 : 1 },
    ],
    recentPredictions,
  };
};

export const buildMonitoringSnapshot = (metricsText: string): MonitoringSnapshot => {
  const parsed = parsePrometheusMetrics(metricsText);

  return {
    metrics: [
      { label: "Requests/sec", value: parsed.httpRequests },
      { label: "Prediction/sec", value: parsed.predictionRequests },
      { label: "Latency", value: parsed.averageLatencyMs, unit: " ms" },
      { label: "Anomalies", value: parsed.anomalyPredictions },
      { label: "In Flight", value: parsed.requestsInProgress },
    ],
    requestCounts: parsed.httpRequestsByEndpoint,
    latencyBuckets: parsed.latencyBuckets,
    requestTrends: parsed.httpRequestsByEndpoint.slice(0, 6).map((entry, index) => ({
      label: `${index + 1}`,
      value: entry.value,
    })),
  };
};
