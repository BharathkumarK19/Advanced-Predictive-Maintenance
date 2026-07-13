import type { ReactNode } from "react";

type ChartContainerProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const ChartContainer = ({ title, description, children }: ChartContainerProps) => (
  <section className="card-surface p-4">
    <div className="mb-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
    {children}
  </section>
);

