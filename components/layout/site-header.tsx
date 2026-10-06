import Link from "next/link";

import { brandConfig } from "@/config/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={brandConfig.platformName}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
            P
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.14em] text-slate-500 uppercase">
              {brandConfig.shortName}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <Link href="#features" className="transition-colors hover:text-slate-900">
            Features
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-slate-900">
            Pricing
          </Link>
          <Link href="#faq" className="transition-colors hover:text-slate-900">
            FAQ
          </Link>
          <Link href="/login" className="transition-colors hover:text-slate-900">
            Login
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-sky-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-900"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
