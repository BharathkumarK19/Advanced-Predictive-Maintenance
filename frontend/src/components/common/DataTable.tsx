import clsx from "clsx";
import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
};

type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  emptyState?: string;
  getRowKey?: (row: T, rowIndex: number) => string | number;
};

export const DataTable = <T extends object>({
  columns,
  data,
  emptyState = "No records found.",
  getRowKey,
}: DataTableProps<T>) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/60">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900/95 text-slate-400 backdrop-blur">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className={clsx("px-4 py-3 font-medium uppercase tracking-[0.18em]", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={getRowKey ? getRowKey(row, rowIndex) : rowIndex} className="transition-colors hover:bg-slate-900/70">
                  {columns.map((column) => (
                    <td key={column.header} className={clsx("px-4 py-3 text-slate-200", column.className)}>
                      {typeof column.accessor === "function" ? column.accessor(row) : (row[column.accessor] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-slate-400" colSpan={columns.length}>
                  {emptyState}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
