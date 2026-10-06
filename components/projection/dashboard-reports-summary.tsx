"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { getSavedProjectionSnapshot, subscribeToSavedProjections } from "@/features/projection/storage";

export function DashboardReportsSummary() {
  const reports = useSyncExternalStore(subscribeToSavedProjections, getSavedProjectionSnapshot, getSavedProjectionSnapshot);
  const completed = reports.filter((report) => report.result.status === "completed").length;
  const drafts = reports.length - completed;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[["Total reports", reports.length], ["Draft reports", drafts], ["Completed reports", completed]].map(([label, value]) => (
          <div className="border-y border-slate-200 py-4" key={label}><p className="text-sm font-medium text-slate-600">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p></div>
        ))}
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950">Recent reports</h2><Link href="/dashboard/reports" className="text-sm font-medium text-sky-800 underline">All reports</Link></div>
        {reports.length === 0 ? <p className="border-y border-slate-200 py-6 text-sm text-slate-600">No reports in this browser yet. <Link className="font-semibold text-sky-800 underline" href="/projection/new">Create a projection</Link>.</p> : (
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {reports.slice(0, 5).map((report) => <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium text-slate-900">{report.input.businessName}</p><p className="mt-1 text-sm text-slate-500">{report.input.sector} · {new Date(report.updatedAt).toLocaleDateString("en-IN")}</p></div><Link href={`/projection/report?id=${encodeURIComponent(report.id)}`} className="text-sm font-medium text-sky-800 underline">Open report</Link></div>)}
          </div>
        )}
      </section>
    </div>
  );
}