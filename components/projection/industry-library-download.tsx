"use client";

import Link from "next/link";

export function IndustryLibraryDownload() {
  return (
    <Link href="/api/exports/industry-library" className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50">
      Download industry library (Excel)
    </Link>
  );
}