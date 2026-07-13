import { ChartContainer } from "../../components/common/ChartContainer";
import { ErrorCard } from "../../components/common/ErrorCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { MetricCard } from "../../components/common/MetricCard";
import { PageHeader } from "../../components/common/PageHeader";
import { MonitoringCharts } from "../../components/charts/OverviewCharts";
import { useAppSettings } from "../../context/AppSettingsContext";
import { useMonitoring } from "../../hooks/useMonitoring";
import { RefreshCw } from "lucide-react";

export const MonitoringPage = () => {
  const { refreshInterval } = useAppSettings();
  const { data: snapshot, error, isLoading, refetch } = useMonitoring();

  if (error) return <ErrorCard message={error.message} onRetry={() => void refetch()} />;
  if (isLoading || !snapshot) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring"
        description="Industrial runtime observability for request volume, anomalies, and latency from the metrics endpoint."
        actions={[
          <div key="refresh" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
            <RefreshCw className="h-4 w-4 animate-spin-slow text-industrial-300" />
            Auto Refresh {refreshInterval} sec
          </div>,
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} precision={metric.value < 1 ? 2 : 0} />
        ))}
      </div>

      <MonitoringCharts data={snapshot} />

      <ChartContainer title="System Notes" description="Monitoring remains fully disconnected from FastAPI for now.">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
          This monitoring view is powered by the Prometheus-style metrics endpoint. When the backend evolves, the
          service layer can keep the same page contract.
        </div>
      </ChartContainer>
    </div>
  );
};
