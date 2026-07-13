import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary, MonitoringSnapshot } from "../../types";
import { ChartContainer } from "../common/ChartContainer";

const palette = ["#10b981", "#facc15", "#f97316", "#ef4444", "#3b82f6"];

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  color: "#e2e8f0",
};

export const DashboardCharts = ({ data }: { data: DashboardSummary }) => (
  <div className="grid gap-6 xl:grid-cols-2">
    <ChartContainer title="Predictions over Time" description="Volume and anomaly trend across the shift.">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.predictionsOverTime}>
            <defs>
              <linearGradient id="predictionsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Area type="monotone" dataKey="predictions" stroke="#3b82f6" fill="url(#predictionsFill)" />
            <Area type="monotone" dataKey="anomalies" stroke="#f59e0b" fillOpacity={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>

    <ChartContainer title="Risk Distribution" description="Current fleet profile by alert severity.">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.riskDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
              {data.riskDistribution.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>

    <ChartContainer title="Machine Health" description="Operational health split across machine classes.">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Pie data={data.machineHealth} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
              {data.machineHealth.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  </div>
);

export const MonitoringCharts = ({ data }: { data: MonitoringSnapshot }) => (
  <div className="grid gap-6 xl:grid-cols-2">
    <ChartContainer title="HTTP Requests" description="Traffic volume grouped by endpoint.">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.requestCounts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]}>
              {data.requestCounts.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>

    <ChartContainer title="Latency Buckets" description="Histogram distribution from the metrics endpoint.">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.latencyBuckets}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="bucket" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={0.18} fill="#10b981" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>

    <ChartContainer title="Request Trend" description="Relative request activity across the top endpoints.">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.requestTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#f97316" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  </div>
);
