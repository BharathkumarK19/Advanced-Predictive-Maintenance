import { metricsApi } from "./api";
import type { MonitoringSnapshot } from "../types";
import { buildMonitoringSnapshot } from "../utils/domain";

export const monitoringService = {
  async getMonitoringSnapshot(): Promise<MonitoringSnapshot> {
    const response = await metricsApi.get<string>("/metrics", { responseType: "text" });
    return buildMonitoringSnapshot(response.data);
  },
};
