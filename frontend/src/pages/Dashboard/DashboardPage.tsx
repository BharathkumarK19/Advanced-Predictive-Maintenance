import { Activity, AlertTriangle, Factory, Gauge, RefreshCw, ShieldCheck, TimerReset } from "lucide-react";
import { ErrorCard } from "../../components/common/ErrorCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { MetricCard } from "../../components/common/MetricCard";
import { PageHeader } from "../../components/common/PageHeader";
import { HealthIndicator } from "../../components/common/HealthIndicator";
import { StatusBadge } from "../../components/common/StatusBadge";
import { DataTable } from "../../components/common/DataTable";
import { DashboardCharts } from "../../components/charts/OverviewCharts";
import { useAppSettings } from "../../context/AppSettingsContext";
import { useDashboard } from "../../hooks/useDashboard";
import { useHealth } from "../../hooks/useHealth";
import type { HistoryViewRecord } from "../../types";
import { formatDateTime, formatDateTimeWithSeconds, formatNumber, riskTone } from "../../utils/format";

export const DashboardPage = () => {
  const { refreshInterval } = useAppSettings();
  const { data: health, responseTimeMs, lastHeartbeatAt } = useHealth();
  const { data, error, isLoading, refetch, isTelemetryConnected } = useDashboard(1);

  if (error) return <ErrorCard message={error.message} onRetry={() => void refetch()} />;
  if (isLoading || !data) return <LoadingSpinner />;

  const icons = [Factory, Gauge, AlertTriangle, ShieldCheck, Activity, TimerReset, TimerReset];
  const latestPrediction = data.recentPredictions[0];
  const sensorCards = [
    { label: "Voltage", value: latestPrediction?.volt ?? 0, icon: Gauge },
    { label: "Rotation", value: latestPrediction?.rotate ?? 0, icon: Activity },
    { label: "Pressure", value: latestPrediction?.pressure ?? 0, icon: AlertTriangle },
    { label: "Vibration", value: latestPrediction?.vibration ?? 0, icon: TimerReset },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Fleet health, predictive trends, and operational throughput from the live FastAPI backend."
        actions={[
          <div key="connection" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
            <StatusBadge label={isTelemetryConnected ? "🟢 Live" : "🔴 Offline"} tone={isTelemetryConnected ? "success" : "danger"} />
          </div>,
          <div key="refresh" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
            <RefreshCw className="h-4 w-4 animate-spin-slow text-industrial-300" />
            Auto Refresh {refreshInterval} sec
          </div>,
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <HealthIndicator
          title="FastAPI Backend"
          isConnected={health?.status.toLowerCase() === "healthy"}
          lastHeartbeatAt={lastHeartbeatAt}
          responseTimeMs={responseTimeMs}
          refreshIntervalSeconds={refreshInterval}
          apiVersion="v1.0.0"
        />
        <div className="card-surface p-5">
          <p className="section-title">Operational Snapshot</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="surface-muted p-4">
              <div className="text-sm text-slate-400">Latest Prediction</div>
              <div className="mt-1 text-base font-semibold text-white">
                {latestPrediction ? formatDateTimeWithSeconds(latestPrediction.timestamp) : "Pending"}
              </div>
            </div>
            <div className="surface-muted p-4">
              <div className="text-sm text-slate-400">Machine Status</div>
              <div className="mt-1 text-base font-semibold text-white">{latestPrediction?.status ?? "Pending"}</div>
            </div>
            <div className="surface-muted p-4">
              <div className="text-sm text-slate-400">Current Risk</div>
              <div className="mt-2">
                {latestPrediction ? <StatusBadge label={latestPrediction.riskLevel} tone={riskTone(latestPrediction.riskLevel)} /> : <span className="text-base font-semibold text-white">Pending</span>}
              </div>
            </div>
            <div className="surface-muted p-4">
              <div className="text-sm text-slate-400">Anomaly Score</div>
              <div className="mt-1 text-base font-semibold text-white">{latestPrediction ? formatNumber(latestPrediction.score, 2) : "0.00"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.slice(0, 4).map((metric, index) => {
          const Icon = icons[index];
          return (
            <MetricCard
              key={metric.label}
              {...metric}
              precision={metric.value < 1 ? 2 : 0}
              icon={<Icon className="h-4 w-4" />}
            />
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.metrics.slice(4).map((metric, index) => {
          const Icon = icons[index + 4];
          return (
            <MetricCard
              key={metric.label}
              {...metric}
              precision={metric.value < 1 ? 2 : 0}
              icon={<Icon className="h-4 w-4" />}
            />
          );
        })}
      </div>

      <section className="space-y-4">
        <div>
          <p className="section-title">Live Sensor Cards</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Incoming telemetry values from WebSocket</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sensorCards.map((sensor) => {
            const Icon = sensor.icon;
            return (
              <MetricCard
                key={sensor.label}
                label={sensor.label}
                value={sensor.value}
                icon={<Icon className="h-4 w-4" />}
                precision={sensor.value < 1 ? 2 : 0}
              />
            );
          })}
        </div>
      </section>

      <DashboardCharts data={data} />

      <section className="space-y-4">
        <div>
          <p className="section-title">Recent Predictions</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Latest machine scoring events</h2>
        </div>
        <DataTable<HistoryViewRecord>
          columns={[
            { header: "Timestamp", accessor: (row) => formatDateTime(row.timestamp) },
            { header: "Machine ID", accessor: "machineID" },
            { header: "Model", accessor: "model" },
            { header: "Risk Level", accessor: (row) => <StatusBadge label={row.riskLevel} tone={riskTone(row.riskLevel)} /> },
            { header: "Score", accessor: (row) => formatNumber(row.score, 2) },
            { header: "Status", accessor: "status" },
          ]}
          data={data.recentPredictions}
          getRowKey={(row: HistoryViewRecord) => row.id}
        />
      </section>
    </div>
  );
};
