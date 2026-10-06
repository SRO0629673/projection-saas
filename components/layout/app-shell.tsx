import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reports", href: "/dashboard/reports" },
  { label: "Projection", href: "/projection/new" },
  { label: "CMA", href: "/cma" },
  { label: "Subscription", href: "/subscription" },
  { label: "Profile", href: "/profile" },
  { label: "Support", href: "/support" },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
          <div className="flex items-center gap-3 px-2 pb-6 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              P
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                ProjectionPro
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-slate-200 pt-4">
            <Link
              href="/logout"
              className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Logout
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Workspace</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1>
                {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/projection/new"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-950 px-4 text-sm font-medium text-white transition-colors hover:bg-sky-900"
                >
                  Create Projection Report
                </Link>
              </div>
            </div>
          </header>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
