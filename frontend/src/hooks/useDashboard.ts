import { useEffect, useRef } from "react";
import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useTelemetry } from "./useTelemetry";
import { predictionService } from "../services/predictionService";
import type { ApiError, DashboardSummary, HistoryViewRecord, Metric, RiskLevel } from "../types";
import { showApiErrorToast } from "../utils/apiError";
import { derivePredictionView } from "../utils/domain";
import { formatShortTime } from "../utils/format";
import type { TelemetryMessage } from "../services/websocket";

const MAX_HISTORY_ROWS = 50;
const MAX_CHART_POINTS = 30;

const telemetryToHistoryRow = (telemetry: TelemetryMessage): HistoryViewRecord => {
  const derivedPrediction = derivePredictionView(
    {
      anomaly: telemetry.anomaly,
      anomaly_label: telemetry.anomaly_label,
      anomaly_score: telemetry.anomaly_score,
      risk_level: telemetry.risk_level,
    },
    telemetry,
    telemetry.machineID,
  );

  return {
    id: derivedPrediction.id,
    timestamp: telemetry.timestamp,
    machineID: telemetry.machineID,
    volt: telemetry.volt,
    rotate: telemetry.rotate,
    pressure: telemetry.pressure,
    vibration: telemetry.vibration,
    age: telemetry.age,
    model: telemetry.model,
    error_flag: telemetry.error_flag,
    riskLevel: derivedPrediction.riskLevel,
    score: derivedPrediction.anomalyScore,
    status: derivedPrediction.status,
    responseTimeMs: derivedPrediction.responseTimeMs,
    recommendation: derivedPrediction.maintenanceRecommendation,
  };
};

const average = (values: number[]) =>
  values.length > 0 ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)) : 0;

const updateMetric = (metrics: Metric[], label: string, value: number): Metric[] =>
  metrics.map((metric) => (metric.label === label ? { ...metric, value } : metric));

const buildRiskDistribution = (rows: HistoryViewRecord[]) => {
  const counts: Record<RiskLevel, number> = {
    Healthy: 0,
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  for (const row of rows) {
    counts[row.riskLevel] += 1;
  }

  return Object.entries(counts).map(([name, value]) => ({
    name: name as RiskLevel,
    value,
  }));
};

const buildMachineHealth = (rows: HistoryViewRecord[]) => {
  const counts = rows.reduce(
    (acc, row) => {
      switch (row.riskLevel) {
        case "Healthy":
        case "Low":
          acc.Healthy += 1;
          break;
        case "Medium":
          acc.Monitor += 1;
          break;
        case "High":
          acc["At Risk"] += 1;
          break;
        case "Critical":
          acc.Critical += 1;
          break;
      }

      return acc;
    },
    {
      Healthy: 0,
      Monitor: 0,
      "At Risk": 0,
      Critical: 0,
    },
  );

  return [
    { name: "Healthy", value: counts.Healthy },
    { name: "Monitor", value: counts.Monitor },
    { name: "At Risk", value: counts["At Risk"] },
    { name: "Critical", value: counts.Critical },
  ];
};

const mergeDashboardSummary = (current: DashboardSummary, telemetry: TelemetryMessage): DashboardSummary => {
  const latestRow = telemetryToHistoryRow(telemetry);
  const recentPredictions = [latestRow, ...current.recentPredictions].slice(0, MAX_HISTORY_ROWS);
  const timeline = recentPredictions.slice().reverse().slice(-MAX_CHART_POINTS);
  const latestRisk = latestRow.riskLevel;
  const latestPredictionCount = (current.metrics.find((metric) => metric.label === "Prediction Requests Today")?.value ?? 0) + 1;
  const averageAnomalyScore = average(recentPredictions.map((row) => row.score));
  const averageResponseTime = average(recentPredictions.map((row) => row.responseTimeMs));

  return {
    ...current,
    metrics: updateMetric(
      updateMetric(
        updateMetric(
          updateMetric(
            updateMetric(
              updateMetric(
                updateMetric(current.metrics, "Total Machines", current.metrics.find((metric) => metric.label === "Total Machines")?.value ?? 1),
                "Healthy Machines",
                latestRisk === "Healthy" || latestRisk === "Low" ? 1 : 0,
              ),
              "High Risk Machines",
              latestRisk === "High" ? 1 : 0,
            ),
            "Critical Machines",
            latestRisk === "Critical" ? 1 : 0,
          ),
          "Prediction Requests Today",
          latestPredictionCount,
        ),
        "Average Anomaly Score",
        averageAnomalyScore,
      ),
      "Average Response Time",
      averageResponseTime,
    ),
    predictionsOverTime: timeline.map((row, index) => ({
      time: formatShortTime(row.timestamp),
      predictions: index + 1,
      anomalies: row.error_flag ? 1 : 0,
    })),
    riskDistribution: buildRiskDistribution(recentPredictions),
    machineHealth: buildMachineHealth(recentPredictions),
    recentPredictions,
  };
};

export type DashboardQueryResult = UseQueryResult<DashboardSummary, ApiError> & {
  isTelemetryConnected: boolean;
};

export const useDashboard = (machineID = 1): DashboardQueryResult => {
  const query = useQuery<DashboardSummary, ApiError>({
    queryKey: ["dashboard", machineID],
    queryFn: () => predictionService.getDashboardSummary(machineID),
    staleTime: Infinity,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const queryClient = useQueryClient();
  const { telemetry, isConnected } = useTelemetry(query.isSuccess);
  const lastTelemetryKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error);
    }
  }, [query.error]);

  useEffect(() => {
    if (!telemetry || telemetry.machineID !== machineID || !query.data) {
      return;
    }

    const telemetryKey = `${telemetry.machineID}-${telemetry.timestamp}-${telemetry.anomaly_score}-${telemetry.risk_level}`;

    if (lastTelemetryKeyRef.current === telemetryKey) {
      return;
    }

    lastTelemetryKeyRef.current = telemetryKey;

    queryClient.setQueryData<DashboardSummary>(["dashboard", machineID], (current) => {
      if (!current) {
        return current;
      }

      return mergeDashboardSummary(current, telemetry);
    });
  }, [machineID, query.data, queryClient, telemetry]);

  return {
    ...query,
    isTelemetryConnected: isConnected,
  };
};
