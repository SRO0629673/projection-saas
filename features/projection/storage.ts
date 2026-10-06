import type { ProjectionInput, ProjectionResult } from "@/features/projection/types";

export type SavedProjection = {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: ProjectionInput;
  result: ProjectionResult;
};

const STORAGE_KEY = "projectionpro.reports.v1";
const UPDATE_EVENT = "projectionpro:reports-updated";
const emptyReports: SavedProjection[] = [];
let cachedReports: SavedProjection[] | undefined;

function loadFromStorage(): SavedProjection[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? (stored as SavedProjection[]) : [];
  } catch {
    return [];
  }
}

export function readSavedProjections(): SavedProjection[] {
  if (typeof window === "undefined") return [];
  cachedReports ??= loadFromStorage();
  return cachedReports;
}

export function subscribeToSavedProjections(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const refresh = () => {
    cachedReports = loadFromStorage();
    onChange();
  };
  window.addEventListener(UPDATE_EVENT, refresh);
  window.addEventListener("storage", refresh);
  return () => {
    window.removeEventListener(UPDATE_EVENT, refresh);
    window.removeEventListener("storage", refresh);
  };
}

export function getSavedProjectionSnapshot() {
  return typeof window === "undefined" ? emptyReports : readSavedProjections();
}

export function findSavedProjection(id: string) {
  return readSavedProjections().find((report) => report.id === id) ?? null;
}

export function saveProjection(input: ProjectionInput, result: ProjectionResult, id = crypto.randomUUID()) {
  const existing = readSavedProjections();
  const now = new Date().toISOString();
    const prior = existing.find((savedReport) => savedReport.id === id);
  const report: SavedProjection = {
    id,
      createdAt: prior?.createdAt ?? now,
    updatedAt: now,
    input,
    result,
  };
    const updatedReports = [report, ...existing.filter((savedReport) => savedReport.id !== id)];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    cachedReports = updatedReports;
  window.dispatchEvent(new Event(UPDATE_EVENT));
  return report;
}

export function mergeSavedProjections(reports: SavedProjection[]) {
  const byId = new Map(readSavedProjections().map((report) => [report.id, report]));
  for (const report of reports) byId.set(report.id, report);
  const merged = [...byId.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  cachedReports = merged;
  window.dispatchEvent(new Event(UPDATE_EVENT));
}