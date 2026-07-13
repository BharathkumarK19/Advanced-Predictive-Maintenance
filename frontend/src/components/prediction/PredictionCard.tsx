import type { PredictionViewData } from "../../types";
import { formatDateTimeWithSeconds, formatNumber, riskTone } from "../../utils/format";
import { StatusBadge } from "../common/StatusBadge";
import clsx from "clsx";

type PredictionCardProps = {
  prediction: PredictionViewData;
};

const riskLabelTone = (risk: PredictionViewData["riskLevel"]) => riskTone(risk);

export const PredictionCard = ({ prediction }: PredictionCardProps) => (
  <div className="card-surface animate-fade-in-up p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="section-title">Prediction Result</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Machine {prediction.machineID}</h3>
        <p className="mt-1 text-sm text-slate-400">
          Last Prediction <span className="text-slate-200">{formatDateTimeWithSeconds(prediction.timestamp)}</span>
        </p>
      </div>
      <StatusBadge label={prediction.riskLevel} tone={riskLabelTone(prediction.riskLevel)} />
    </div>

    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      <div className="surface-muted p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk Level</p>
        <p className="mt-2 text-lg font-semibold text-white">{prediction.riskLevel}</p>
      </div>
      <div className="surface-muted p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Anomaly Score</p>
        <p className="mt-2 text-lg font-semibold text-white">{formatNumber(prediction.anomalyScore, 2)}</p>
      </div>
      <div className="surface-muted p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Response Time</p>
        <p className={clsx("mt-2 text-lg font-semibold text-white", "transition-all duration-300")}>{prediction.responseTimeMs} ms</p>
      </div>
    </div>

    <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Maintenance Recommendation</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{prediction.maintenanceRecommendation}</p>
      <p className="mt-4 text-sm text-slate-400">
        Estimated failure window: <span className="font-medium text-white">{prediction.predictedFailureWindow}</span>
      </p>
    </div>
  </div>
);
