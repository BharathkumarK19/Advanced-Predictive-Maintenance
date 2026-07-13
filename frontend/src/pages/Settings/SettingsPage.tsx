import { useAppSettings } from "../../context/AppSettingsContext";
import { PageHeader } from "../../components/common/PageHeader";
import { HealthIndicator } from "../../components/common/HealthIndicator";
import { useHealth } from "../../hooks/useHealth";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const SettingsPage = () => {
  const { theme, setTheme, refreshInterval, setRefreshInterval, notificationsEnabled, setNotificationsEnabled } =
    useAppSettings();
  const { data: health, responseTimeMs, lastHeartbeatAt } = useHealth();
  const connected = health?.status.toLowerCase() === "healthy";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Tune theme, refresh cadence, and notification preferences for the industrial dashboard."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card-surface space-y-5 p-5">
          <div>
            <p className="section-title">Theme</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  theme === "dark" ? "bg-industrial-600 text-white" : "bg-slate-800 text-slate-200"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  theme === "light" ? "bg-industrial-600 text-white" : "bg-slate-800 text-slate-200"
                }`}
              >
                Light
              </button>
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-slate-300">Refresh Interval</span>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={refreshInterval}
              onChange={(event) => setRefreshInterval(Number(event.target.value))}
              className="mt-3 w-full accent-industrial-500"
            />
            <div className="mt-2 text-sm text-slate-400">{refreshInterval} seconds</div>
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
            <span className="text-sm text-slate-300">Notification Toggle</span>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.target.checked)}
              className="h-5 w-5 accent-industrial-500"
            />
          </label>
        </section>

        <section className="space-y-4">
          <HealthIndicator
            title="Integration Mode"
            isConnected={connected}
            lastHeartbeatAt={lastHeartbeatAt}
            responseTimeMs={responseTimeMs}
            refreshIntervalSeconds={refreshInterval}
            apiVersion="v1.0.0"
          />
          <div className="card-surface p-5">
            <p className="section-title">System Information</p>
            <div className="mt-5 space-y-4">
              <div className="surface-muted p-4">
                <div className="text-sm text-slate-400">Project Name</div>
                <div className="mt-1 text-base font-semibold text-white">Advanced Predictive Maintenance Dashboard</div>
              </div>
              <div className="surface-muted p-4">
                <div className="text-sm text-slate-400">Backend URL</div>
                <div className="mt-1 break-all text-base font-semibold text-white">http://localhost:8000</div>
              </div>
              <div className="surface-muted p-4">
                <div className="text-sm text-slate-400">Current API Base URL</div>
                <div className="mt-1 break-all text-base font-semibold text-white">{apiBaseUrl}</div>
              </div>
              <div className="surface-muted p-4">
                <div className="text-sm text-slate-400">Connection Status</div>
                <div className="mt-1 text-base font-semibold text-white">{connected ? "Connected" : "Disconnected"}</div>
              </div>
              <div className="surface-muted p-4">
                <div className="text-sm text-slate-400">API Version</div>
                <div className="mt-1 text-base font-semibold text-white">v1.0.0</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
