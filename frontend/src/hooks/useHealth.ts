import { useEffect, useMemo, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAppSettings } from "../context/AppSettingsContext";
import { healthService } from "../services/healthService";
import type { ApiError, HealthResponse } from "../types";
import { showApiErrorToast } from "../utils/apiError";

export type HealthQueryResult = UseQueryResult<HealthResponse, ApiError> & {
  responseTimeMs: number | null;
  lastHeartbeatAt: string | null;
};

export const useHealth = (): HealthQueryResult => {
  const { refreshInterval } = useAppSettings();
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

  const query = useQuery<HealthResponse, ApiError>({
    queryKey: ["health"],
    queryFn: async () => {
      const start = performance.now();
      try {
        return await healthService.getHealth();
      } finally {
        setResponseTimeMs(Math.round(performance.now() - start));
      }
    },
    staleTime: refreshInterval * 1000,
    retry: 1,
    refetchInterval: refreshInterval * 1000,
  });

  useEffect(() => {
    if (query.error) {
      showApiErrorToast(query.error);
    }
  }, [query.error]);

  const lastHeartbeatAt = useMemo(() => (query.dataUpdatedAt ? new Date(query.dataUpdatedAt).toISOString() : null), [query.dataUpdatedAt]);

  return {
    ...query,
    responseTimeMs,
    lastHeartbeatAt,
  };
};
