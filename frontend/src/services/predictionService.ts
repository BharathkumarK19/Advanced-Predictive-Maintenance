import { api } from "./api";
import type {
  DashboardSummary,
  HealthResponse,
  HistoryRecord,
  PredictionRequest,
  PredictionResponse,
  PredictionViewData,
} from "../types";
import {
  buildDashboardSummary,
  derivePredictionView,
} from "../utils/domain";

export const predictionService = {
  async predictMachine(request: PredictionRequest): Promise<PredictionViewData> {
    const response = await api.post<PredictionResponse>("/predict", request);
    return derivePredictionView(response.data, request);
  },

  async getDashboardSummary(machineID = 1): Promise<DashboardSummary> {
    const [metricsResponse, healthResponse, historyResponse] = await Promise.all([
      api.get<string>("/metrics", { responseType: "text" }),
      api.get<HealthResponse>("/health"),
      api.get<{ machineID: number; history_size: number; history: HistoryRecord[] }>(`/history/${machineID}`),
    ]);

    return buildDashboardSummary({
      metricsText: metricsResponse.data,
      health: healthResponse.data,
      history: historyResponse.data.history ?? [],
      machineID,
    });
  },
};
