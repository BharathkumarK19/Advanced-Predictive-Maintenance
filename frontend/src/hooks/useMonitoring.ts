import { useEffect } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAppSettings } from "../context/AppSettingsContext";
import { monitoringService } from "../services/monitoringService";
import type { ApiError, MonitoringSnapshot } from "../types";
import { showApiErrorToast } from "../utils/apiError";

export const useMonitoring = (): UseQueryResult<MonitoringSnapshot, ApiError> => {
  const { refreshInterval } = useAppSettings();
  const query = useQuery<MonitoringSnapshot, ApiError>({
    queryKey: ["monitoring"],
    queryFn: () => monitoringService.getMonitoringSnapshot(),
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
