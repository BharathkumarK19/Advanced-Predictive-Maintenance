export type ThemeMode = "dark" | "light";
export type RiskLevel = "Healthy" | "Low" | "Medium" | "High" | "Critical";
export type SystemHealth = "Healthy" | "Warning" | "Offline";
export type PredictionStatus = "Pending" | "Stable" | "Monitor" | "Action Required" | "Critical";

export interface PredictionRequest {
  machineID: number;
  volt: number;
  rotate: number;
  pressure: number;
  vibration: number;
  age: number;
  model: string;
  error_flag: number;
}

export interface PredictionResponse {
  anomaly: boolean;
  anomaly_label: number;
  anomaly_score: number;
  risk_level: string;
}

export interface Machine {
  machineID: number;
  name: string;
  model: string;
  age: number;
  location: string;
  status: RiskLevel;
  lastMaintenance: string;
  nextMaintenance: string;
  runtimeHours: number;
}

export interface HistoryRecord {
  machineID: number;
  volt: number;
  rotate: number;
  pressure: number;
  vibration: number;
  age: number;
  model: string;
  error_flag: number;
}

export interface Metric {
  label: string;
  value: number;
  unit?: string;
  delta?: number;
  trend?: "up" | "down" | "flat";
}

export interface SystemStatus {
  name: string;
  status: SystemHealth;
  details: string;
  lastChecked: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  scaler_loaded: boolean;
  features_loaded: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export interface PredictionViewData {
  id: string;
  timestamp: string;
  machineID: number;
  model: string;
  riskLevel: RiskLevel;
  anomalyScore: number;
  anomaly: boolean;
  anomalyLabel: number;
  status: PredictionStatus;
  maintenanceRecommendation: string;
  responseTimeMs: number;
  predictedFailureWindow: string;
}

export interface HistoryViewRecord {
  id: string;
  timestamp: string;
  machineID: number;
  volt: number;
  rotate: number;
  pressure: number;
  vibration: number;
  age: number;
  model: string;
  error_flag: number;
  riskLevel: RiskLevel;
  score: number;
  status: PredictionStatus;
  responseTimeMs: number;
  recommendation: string;
}

export interface DashboardSummary {
  metrics: Metric[];
  predictionsOverTime: Array<{ time: string; predictions: number; anomalies: number }>;
  riskDistribution: Array<{ name: RiskLevel; value: number }>;
  machineHealth: Array<{ name: string; value: number }>;
  recentPredictions: HistoryViewRecord[];
}

export interface MonitoringSnapshot {
  metrics: Metric[];
  requestCounts: Array<{ name: string; value: number }>;
  latencyBuckets: Array<{ bucket: string; count: number }>;
  requestTrends: Array<{ label: string; value: number }>;
}

export interface SettingsState {
  theme: ThemeMode;
  refreshInterval: number;
  notificationsEnabled: boolean;
}

