import { useEffect } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAppSettings } from "../context/AppSettingsContext";
import { historyService } from "../services/historyService";
import type { ApiError, HistoryViewRecord } from "../types";
import { showApiErrorToast } from "../utils/apiError";

export const useHistory = (machineID: number): UseQueryResult<HistoryViewRecord[], ApiError> => {
  const { refreshInterval } = useAppSettings();
  const query = useQuery<HistoryViewRecord[], ApiError>({
    queryKey: ["history", machineID],
    queryFn: () => historyService.getHistory(machineID),
    staleTime: refreshInterval * 1000,
    retry: 1,
    refetchInterval: refreshInterval * 1000,
  });

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error);
    }
  }, [query.error]);

  return query;
};
