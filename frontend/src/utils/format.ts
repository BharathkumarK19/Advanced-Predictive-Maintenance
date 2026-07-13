import type { RiskLevel, SystemHealth } from "../types";

const normalizeKey = (value: string) => value.trim().toUpperCase();

export const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatDateTimeWithSeconds = (value: string) =>
  (() => {
    const date = new Date(value);
    const day = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date);
    const month = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date);
    const year = new Intl.DateTimeFormat("en-GB", { year: "numeric" }).format(date);
    const time = [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((part) => String(part).padStart(2, "0"))
      .join(":");

    return `${day} ${month} ${year} ${time}`;
  })();

export const formatShortTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const formatRelativeElapsed = (value: string) => {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (elapsedSeconds < 5) return "just now";
  if (elapsedSeconds < 60) return `${elapsedSeconds} sec ago`;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hr ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays > 1 ? "s" : ""} ago`;
};

export const riskTone = (risk: RiskLevel | string) => {
  switch (normalizeKey(risk)) {
    case "HEALTHY":
      return "success";
    case "LOW":
      return "success";
    case "MEDIUM":
      return "warning";
    case "HIGH":
      return "orange";
    case "CRITICAL":
      return "danger";
    default:
      return "neutral";
  }
};

export const systemTone = (status: SystemHealth | string) => {
  switch (normalizeKey(status)) {
    case "HEALTHY":
      return "success";
    case "WARNING":
      return "warning";
    case "OFFLINE":
      return "danger";
    default:
      return "neutral";
  }
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
