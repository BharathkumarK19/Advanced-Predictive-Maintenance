import { api } from "./api";
import type { HealthResponse } from "../types";

export const healthService = {
  async getHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>("/health");
    return response.data;
  },
};

