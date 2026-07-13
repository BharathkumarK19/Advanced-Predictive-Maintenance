import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { ErrorCard } from "../../components/common/ErrorCard";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchBar } from "../../components/common/SearchBar";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useHistory } from "../../hooks/useHistory";
import type { HistoryViewRecord, RiskLevel } from "../../types";
import { formatDateTime, formatNumber, riskTone } from "../../utils/format";
import { toCsv } from "../../utils/csv";

const pageSize = 8;

export const HistoryPage = () => {
  const [machineID, setMachineID] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RiskLevel | "All">("All");
  const [page, setPage] = useState(1);

  const { data: records = [], error, isLoading, refetch } = useHistory(machineID);

  useEffect(() => {
    setPage(1);
  }, [machineID, search, filter]);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesSearch = `${record.machineID} ${record.model} ${record.status} ${record.recommendation}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesFilter = filter === "All" ? true : record.riskLevel === filter;
        return matchesSearch && matchesFilter;
      }),
    [filter, records, search],
  );

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pagedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const csv = toCsv(filteredRecords);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "prediction-history.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <ErrorCard message={error.message} onRetry={() => void refetch()} />;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Prediction History"
          description="Search, filter, and export the machine reading history returned by FastAPI."
        />
        <div className="card-surface overflow-hidden">
          <div className="border-b border-slate-800 px-4 py-4">
            <div className="h-4 w-48 animate-pulse rounded-full bg-slate-700/80" />
          </div>
          <div className="divide-y divide-slate-800">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid gap-4 px-4 py-4 md:grid-cols-4 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <div key={cellIndex} className="h-4 animate-pulse rounded-full bg-slate-800/80" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prediction History"
        description="Search, filter, and export the machine reading history returned by FastAPI."
        actions={[
          <button
            key="export"
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-industrial-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-industrial-500"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>,
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_180px_220px]">
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Machine ID</span>
          <input
            type="number"
            min={1}
            value={machineID}
            onChange={(event) => setMachineID(Math.max(1, Number(event.target.value || 1)))}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none"
          />
        </label>
        <SearchBar value={search} onChange={setSearch} placeholder="Search machine, model, recommendation..." />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as RiskLevel | "All")}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none"
        >
          <option value="All">All Risk Levels</option>
          <option value="Healthy">Healthy</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <DataTable<HistoryViewRecord>
        columns={[
          { header: "Timestamp", accessor: (row) => formatDateTime(row.timestamp) },
          { header: "Machine ID", accessor: "machineID" },
          { header: "Voltage", accessor: "volt" },
          { header: "Rotation", accessor: "rotate" },
          { header: "Pressure", accessor: "pressure" },
          { header: "Vibration", accessor: "vibration" },
          { header: "Model", accessor: "model" },
          { header: "Risk Level", accessor: (row) => <StatusBadge label={row.riskLevel} tone={riskTone(row.riskLevel)} /> },
          { header: "Score", accessor: (row) => formatNumber(row.score, 2) },
          { header: "Status", accessor: "status" },
          { header: "Latency", accessor: (row) => `${row.responseTimeMs} ms` },
        ]}
        data={pagedRecords}
        emptyState="No history records match the current filters."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <div>
          Showing {pagedRecords.length} of {filteredRecords.length} records
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 disabled:opacity-50"
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-200">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 disabled:opacity-50"
            disabled={page === pageCount}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
