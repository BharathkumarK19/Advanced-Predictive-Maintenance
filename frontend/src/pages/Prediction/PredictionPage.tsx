import { AlertTriangle, Loader2, Play } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MetricCard } from "../../components/common/MetricCard";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PredictionCard } from "../../components/prediction/PredictionCard";
import { usePrediction } from "../../hooks/usePrediction";
import { useTelemetry } from "../../hooks/useTelemetry";
import type { TelemetryMessage } from "../../services/websocket";
import type { PredictionRequest, PredictionViewData } from "../../types";
import { derivePredictionView, validatePredictionRequest } from "../../utils/domain";
import { riskTone } from "../../utils/format";

const modelOptions = ["model1", "model2", "model3", "model4"];

const initialForm: PredictionRequest = {
  machineID: 1,
  volt: 190,
  rotate: 430,
  pressure: 115,
  vibration: 48,
  age: 18,
  model: "model3",
  error_flag: 0,
};

const numericFields = [
  { label: "Machine ID", key: "machineID" },
  { label: "Voltage", key: "volt" },
  { label: "Rotation", key: "rotate" },
  { label: "Pressure", key: "pressure" },
  { label: "Vibration", key: "vibration" },
  { label: "Age", key: "age" },
] as const;

const predictionFromTelemetry = (telemetry: TelemetryMessage): PredictionViewData => {
  const derived = derivePredictionView(
    {
      anomaly: telemetry.anomaly,
      anomaly_label: telemetry.anomaly_label,
      anomaly_score: telemetry.anomaly_score,
      risk_level: telemetry.risk_level,
    },
    telemetry,
    telemetry.machineID,
  );

  return {
    ...derived,
    id: `ws-${telemetry.machineID}-${telemetry.timestamp}`,
    timestamp: telemetry.timestamp,
  };
};

export const PredictionPage = () => {
  const [form, setForm] = useState<PredictionRequest>(initialForm);
  const [prediction, setPrediction] = useState<PredictionViewData | null>(null);
  const predictionMutation = usePrediction();
  const { telemetry, isConnected } = useTelemetry(true);

  const update = <K extends keyof PredictionRequest>(key: K, value: PredictionRequest[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const canPredict = useMemo(
    () => form.machineID > 0 && form.model.length > 0 && form.volt > 0 && form.rotate > 0,
    [form],
  );

  useEffect(() => {
    if (!telemetry) {
      return;
    }

    setForm({
      machineID: telemetry.machineID,
      volt: telemetry.volt,
      rotate: telemetry.rotate,
      pressure: telemetry.pressure,
      vibration: telemetry.vibration,
      age: telemetry.age,
      model: telemetry.model,
      error_flag: telemetry.error_flag,
    });
    setPrediction(predictionFromTelemetry(telemetry));
  }, [telemetry]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validatePredictionRequest(form);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    const response = await predictionMutation.mutateAsync(form);
    setPrediction(response);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Prediction"
        description="Enter machine telemetry to generate a live predictive maintenance result with score, risk level, and recommendation."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form className="card-surface p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {numericFields.map(({ label, key }) => (
              <label key={key} className="space-y-2">
                <span className="text-sm text-slate-300">{label}</span>
                <input
                  type="number"
                  value={form[key]}
                  onChange={(event) => update(key, Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-industrial-500"
                />
              </label>
            ))}

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Model</span>
              <select
                value={form.model}
                onChange={(event) => update("model", event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-industrial-500"
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Error Flag</span>
              <select
                value={form.error_flag}
                onChange={(event) => update("error_flag", Number(event.target.value) as 0 | 1)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-industrial-500"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canPredict || predictionMutation.isPending}
              aria-busy={predictionMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-industrial-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-industrial-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {predictionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {predictionMutation.isPending ? "Predicting..." : "Predict"}
            </button>
            <StatusBadge label={isConnected ? "Connected" : "Disconnected"} tone={isConnected ? "success" : "danger"} />
            <div className="text-sm text-slate-400">Adjust the inputs to simulate real operating conditions.</div>
          </div>
        </form>

        <div className="space-y-4">
          {prediction ? (
            <>
              <PredictionCard key={prediction.id} prediction={prediction} />
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Risk Score"
                  value={prediction.anomalyScore}
                  precision={2}
                  icon={<AlertTriangle className="h-4 w-4" />}
                />
                <div className="card-surface p-5">
                  <p className="section-title">Live Status</p>
                  <div className="mt-3 flex items-center gap-3">
                    <StatusBadge label={prediction.riskLevel} tone={riskTone(prediction.riskLevel)} />
                    <span className="text-sm text-slate-400">{prediction.status}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    The live backend scores this telemetry and the frontend enriches it with a maintenance message for
                    the operator.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="card-surface p-6">
              <p className="section-title">Prediction Output</p>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-sm text-slate-400">
                Waiting for live telemetry or a manual prediction to populate the dashboard.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
