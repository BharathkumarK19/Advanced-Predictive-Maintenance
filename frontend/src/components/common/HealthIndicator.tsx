import clsx from "clsx";
import { RefreshCw } from "lucide-react";
import { formatRelativeElapsed } from "../../utils/format";
import { StatusBadge } from "./StatusBadge";

type HealthIndicatorProps = {
  title: string;
  isConnected: boolean;
  lastHeartbeatAt?: string | null;
  responseTimeMs?: number | null;
  refreshIntervalSeconds?: number;
  apiVersion?: string;
  className?: string;
};

export const HealthIndicator = ({
  title,
  isConnected,
  lastHeartbeatAt,
  responseTimeMs,
  refreshIntervalSeconds = 10,
  apiVersion,
  className,
}: HealthIndicatorProps) => {
  return (
    <div className={clsx("card-surface p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-title">{title}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className={clsx("h-2.5 w-2.5 rounded-full", isConnected ? "bg-emerald-400" : "bg-rose-400")} />
            <span className="text-sm font-semibold text-white">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
        <StatusBadge label={isConnected ? "Connected" : "Disconnected"} tone={isConnected ? "success" : "danger"} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="surface-muted p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Last heartbeat</div>
          <div className="mt-1 text-sm font-semibold text-white">
            {lastHeartbeatAt ? formatRelativeElapsed(lastHeartbeatAt) : "Waiting for health check"}
          </div>
        </div>
        <div className="surface-muted p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Backend response time</div>
          <div className="mt-1 text-sm font-semibold text-white">
            {typeof responseTimeMs === "number" ? `${responseTimeMs} ms` : "Pending"}
          </div>
        </div>
        <div className="surface-muted p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Auto refresh</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
            <RefreshCw className="h-4 w-4 animate-spin-slow text-industrial-300" />
            {refreshIntervalSeconds} sec
          </div>
        </div>
      </div>

      {apiVersion ? (
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">
          API Version <span className="ml-2 text-slate-300">{apiVersion}</span>
        </p>
      ) : null}
    </div>
  );
};
