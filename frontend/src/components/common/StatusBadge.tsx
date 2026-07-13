import clsx from "clsx";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "orange";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-300 ring-amber-500/20",
  danger: "bg-rose-500/15 text-rose-300 ring-rose-500/20",
  info: "bg-sky-500/15 text-sky-300 ring-sky-500/20",
  neutral: "bg-slate-500/15 text-slate-300 ring-slate-500/20",
  orange: "bg-orange-500/15 text-orange-300 ring-orange-500/20",
};

type StatusBadgeProps = {
  label: string;
  tone: BadgeTone;
};

export const StatusBadge = ({ label, tone }: StatusBadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition-colors",
      toneClasses[tone],
    )}
  >
    {label}
  </span>
);
