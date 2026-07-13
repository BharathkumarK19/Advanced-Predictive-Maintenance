import type { HistoryViewRecord } from "../types";

export const toCsv = (rows: HistoryViewRecord[]) => {
  const headers = [
    "timestamp",
    "machineID",
    "volt",
    "rotate",
    "pressure",
    "vibration",
    "age",
    "model",
    "error_flag",
    "riskLevel",
    "score",
    "status",
    "responseTimeMs",
    "recommendation",
  ];

  const escapeValue = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        escapeValue(row.timestamp),
        escapeValue(row.machineID),
        escapeValue(row.volt),
        escapeValue(row.rotate),
        escapeValue(row.pressure),
        escapeValue(row.vibration),
        escapeValue(row.age),
        escapeValue(row.model),
        escapeValue(row.error_flag),
        escapeValue(row.riskLevel),
        escapeValue(row.score),
        escapeValue(row.status),
        escapeValue(row.responseTimeMs),
        escapeValue(row.recommendation),
      ].join(","),
    ),
  ];

  return lines.join("\n");
};
