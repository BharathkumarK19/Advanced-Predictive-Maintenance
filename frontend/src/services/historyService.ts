import { api } from "./api";
import type { HistoryRecord, HistoryViewRecord } from "../types";
import { deriveHistoryView } from "../utils/domain";

type HistoryApiResponse = {
  machineID: number;
  history_size: number;
  history: HistoryRecord[];
};

export const historyService = {
  async getHistory(machineID: number): Promise<HistoryViewRecord[]> {
    const response = await api.get<HistoryApiResponse>(`/history/${machineID}`);
    return deriveHistoryView(response.data.history ?? [], response.data.machineID);
  },
};

