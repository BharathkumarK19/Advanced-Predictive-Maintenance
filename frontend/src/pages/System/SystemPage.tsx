import { ShieldCheck, TriangleAlert } from "lucide-react";
import { ErrorCard } from "../../components/common/ErrorCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { HealthIndicator } from "../../components/common/HealthIndicator";
import { useHealth } from "../../hooks/useHealth";

export const SystemPage = () => {
  const { data: health, error, isLoading, refetch, responseTimeMs, lastHeartbeatAt } = useHealth();

  if (error) return <ErrorCard message={error.message} onRetry={() => void refetch()} />;
  if (isLoading || !health) return <LoadingSpinner />;

  const backendHealthy = health.status.toLowerCase() === "healthy";

  return (
    <div className="space-y-6">
      <PageHeader title="System Status" description="FastAPI health and model loading status from the live backend." />

      <HealthIndicator
        title="Backend"
        isConnected={backendHealthy}
        lastHeartbeatAt={lastHeartbeatAt}
        responseTimeMs={responseTimeMs}
        refreshIntervalSeconds={10}
        apiVersion="v1.0.0"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-5">
          <p className="section-title">Model Status</p>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge label={health.model_loaded ? "Model Loaded" : "Model Missing"} tone={health.model_loaded ? "success" : "danger"} />
          </div>
        </div>
        <div className="card-surface p-5">
          <p className="section-title">Scaler</p>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge label={health.scaler_loaded ? "Scaler Loaded" : "Scaler Missing"} tone={health.scaler_loaded ? "success" : "danger"} />
          </div>
        </div>
        <div className="card-surface p-5">
          <p className="section-title">Feature Pipeline</p>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge
              label={health.features_loaded ? "Loaded" : "Missing"}
              tone={health.features_loaded ? "success" : "danger"}
            />
          </div>
        </div>
      </div>
      <div className="card-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-title">Health Payload</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              API status: <span className="font-medium text-white">{health.status}</span>
            </p>
          </div>
          {backendHealthy ? <ShieldCheck className="h-5 w-5 text-emerald-400" /> : <TriangleAlert className="h-5 w-5 text-amber-400" />}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="surface-muted p-4">
            <div className="text-sm text-slate-400">Backend</div>
            <div className="mt-1 text-base font-semibold text-white">{backendHealthy ? "Online" : "Offline"}</div>
          </div>
          <div className="surface-muted p-4">
            <div className="text-sm text-slate-400">Model Loaded</div>
            <div className="mt-1 text-base font-semibold text-white">{String(health.model_loaded)}</div>
          </div>
          <div className="surface-muted p-4">
            <div className="text-sm text-slate-400">Scalers / Features</div>
            <div className="mt-1 text-base font-semibold text-white">
              {String(health.scaler_loaded)} / {String(health.features_loaded)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
