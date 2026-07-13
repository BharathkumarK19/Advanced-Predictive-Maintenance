import clsx from "clsx";
import type { ReactNode } from "react";
import { AnimatedNumber } from "./AnimatedNumber";

type MetricCardProps = {
  label: string;
  value: number;
  unit?: string;
  delta?: number;
  trend?: "up" | "down" | "flat";
  icon?: ReactNode;
  precision?: number;
};

export const MetricCard = ({ label, value, unit, delta, trend, icon, precision = 0 }: MetricCardProps) => {
  const deltaTone =
    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-slate-400";

  return (
    <div className="card-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-industrial-500/30 hover:shadow-industrial-950/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-white">
              <AnimatedNumber value={value} precision={precision} />
              {unit ? <span className="text-base text-slate-400">{unit}</span> : null}
            </span>
          </div>
          {typeof delta === "number" ? (
            <p className={clsx("mt-2 text-xs font-medium", deltaTone)}>
              {trend === "down" ? "↓" : trend === "up" ? "↑" : "•"} {Math.abs(delta)} change
            </p>
          ) : null}
        </div>
        {icon ? <div className="rounded-xl bg-slate-800/70 p-2 text-industrial-300">{icon}</div> : null}
      </div>
    </div>
  );
};
