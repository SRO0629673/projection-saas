"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { getSavedProjectionSnapshot, mergeSavedProjections, subscribeToSavedProjections, type SavedProjection } from "@/features/projection/storage";

export function SavedReports() {
  useEffect(() => {
    void fetch("/api/projections")
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ reports: Array<Record<string, unknown>> }>;
      })
      .then((data) => {
        if (!data || !Array.isArray(data.reports)) return;
        const reports = data.reports.map((row) => ({
          id: row.id as string,
          input: row.input as SavedProjection["input"],
          result: row.result as SavedProjection["result"],
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
        }));
        mergeSavedProjections(reports);
      })
      .catch(() => undefined);
  }, []);

  const reports = useSyncExternalStore(
    subscribeToSavedProjections,
    getSavedProjectionSnapshot,
    getSavedProjectionSnapshot,
  );

  if (reports.length === 0) {
    return <div className="border-y border-slate-200 py-8 text-sm text-slate-600">No saved reports in this browser yet. <Link className="font-semibold text-sky-800 underline" href="/projection/new">Create your first projection</Link>.</div>;
  }

  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {reports.map((report) => (
        <article key={report.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">{report.input.businessName}</h2>
            <p className="mt-1 text-sm text-slate-600">{report.input.sector} · {report.result.years.length} projected years · Average DSCR {report.result.averageDscr.toFixed(2)}x</p>
            <p className="mt-1 text-xs text-slate-500">Updated {new Date(report.updatedAt).toLocaleString("en-IN")}</p>
          </div>
          <Link href={`/projection/report?id=${encodeURIComponent(report.id)}`} className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-800 hover:bg-slate-50">Open report</Link>
        </article>
      ))}
    </div>
  );
}