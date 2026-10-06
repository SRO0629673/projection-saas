import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brandConfig } from "@/config/brand";

const features = [
  "Structured financial projections",
  "Sector-based assumptions",
  "Loan and repayment logic",
  "Professional PDF output",
  "Save, edit and duplicate reports",
  "Secure workspace for finance professionals",
];

const workflow = [
  "Enter business details",
  "Set sector assumptions",
  "Add finance inputs",
  "Generate projection report",
];

const faqs = [
  {
    question: "What is included?",
    answer:
      "Users receive access to the projection report workspace, saveable reports, duplication tools, and professional PDF output inside their plan validity period.",
  },
  {
    question: "Can I create multiple reports?",
    answer:
      "Yes. The plan includes unlimited projection reports during the active access period.",
  },
  {
    question: "Can I edit previous reports?",
    answer:
      "Yes. Saved reports can be resumed, updated, and regenerated within the active access window.",
  },
  {
    question: "How long does my plan remain active?",
    answer:
      "The 30-day plan is valid for 30 days from the verified payment timestamp. The annual plan is valid for 365 days.",
  },
  {
    question: "Is CMA available?",
    answer:
      "CMA functionality is currently under development and is presented as Coming Soon in the product experience.",
  },
  {
    question: "What happens after plan expiry?",
    answer:
      "Users can still view historical reports and renew access. New report creation requires an active paid access period.",
  },
  {
    question: "Can I view old reports?",
    answer:
      "Yes. Historical reports remain available for viewing after expiry, while new creation is restricted until access is renewed.",
  },
  {
    question: "How do payments work?",
    answer:
      "Payment is processed securely through Razorpay in test mode during development and will be verified server-side before access is granted.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />

      <main>
        <section id="overview" className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Badge>Premium projection workflow</Badge>
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Professional Financial Projections. Prepared Faster.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Finance professionals can prepare structured projection reports without repeatedly rebuilding spreadsheets for every client conversation.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-sky-950 px-5 text-base font-medium text-white transition-colors hover:bg-sky-900"
                >
                  Create Free Account
                </Link>
                <Link
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-base font-medium text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Explore Features
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <span>Unlimited reports</span>
                <span>Professional PDF</span>
                <span>Secure workspace</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    Report Builder
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Business</div>
                    <div className="mt-2 text-xl font-semibold text-slate-900">ABC Traders</div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Sales</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">₹1.8 Cr</div>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Growth</div>
                      <div className="mt-2 text-lg font-semibold text-slate-900">12.0%</div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-900 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Projected EBITDA</span>
                      <span className="text-xl font-semibold">₹34.9 L</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Debt</div>
                      <div className="mt-2 text-base font-semibold text-slate-900">₹72.5 L</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Term</div>
                      <div className="mt-2 text-base font-semibold text-slate-900">7 Years</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Built for a faster, cleaner reporting workflow
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature} className="border-slate-200 bg-slate-50">
                  <CardContent className="pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">✓</div>
                    <p className="mt-4 text-lg font-medium text-slate-900">{feature}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              From inputs to a client-ready projection in a few steps
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {workflow.map((step, index) => (
              <Card key={step} className="border-slate-200 bg-white">
                <CardContent className="pt-6">
                  <div className="text-sm font-semibold text-sky-700">0{index + 1}</div>
                  <p className="mt-3 text-lg font-medium text-slate-900">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">Projection</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Professional projection reports for client-facing conversations
                </h2>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-700 p-4">
                    <div className="text-sm text-slate-300">Applicant</div>
                    <div className="mt-2 text-lg font-semibold">Rajesh Mehta</div>
                  </div>
                  <div className="rounded-2xl bg-slate-700 p-4">
                    <div className="text-sm text-slate-300">Financial year</div>
                    <div className="mt-2 text-lg font-semibold">2026-27</div>
                  </div>
                  <div className="rounded-2xl bg-slate-700 p-4">
                    <div className="text-sm text-slate-300">Assumptions</div>
                    <div className="mt-2 text-lg font-semibold">15 sectors</div>
                  </div>
                  <div className="rounded-2xl bg-slate-700 p-4">
                    <div className="text-sm text-slate-300">Output</div>
                    <div className="mt-2 text-lg font-semibold">PDF report</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">CMA</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  CMA Reports — Coming Soon
                </h2>
              </div>
              <Badge className="border-slate-200 bg-slate-100 text-slate-700">Planned</Badge>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-slate-100 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">Pricing</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Simple access, clear value
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl">30-Day Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  <div className="text-4xl font-semibold text-slate-950">
                    ₹99 <span className="text-base font-medium text-slate-500">/ 30 days</span>
                  </div>
                  <ul className="space-y-3 text-slate-600">
                    <li>• Unlimited Projection Reports</li>
                    <li>• Save and edit reports</li>
                    <li>• Duplicate reports</li>
                    <li>• Professional PDF</li>
                    <li>• 30-day access</li>
                  </ul>
                  <Link
                    href="/register"
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-base font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    Get 30 Days Access
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-sky-200 bg-sky-50 shadow-[0_16px_40px_rgba(14,165,233,0.12)]">
                <div className="flex justify-end p-4">
                  <Badge className="border-sky-200 bg-sky-100 text-sky-900">Best Value</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Annual Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  <div className="text-4xl font-semibold text-slate-950">
                    ₹999 <span className="text-base font-medium text-slate-500">/ 365 days</span>
                  </div>
                  <ul className="space-y-3 text-slate-600">
                    <li>• Unlimited Projection Reports</li>
                    <li>• Save and edit reports</li>
                    <li>• Duplicate reports</li>
                    <li>• Professional PDF</li>
                    <li>• 365-day access</li>
                  </ul>
                  <Link
                    href="/register"
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-sky-950 px-5 text-base font-medium text-white transition-colors hover:bg-sky-900"
                  >
                    Get Annual Access
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <Card key={item.question} className="border-slate-200 bg-white">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
                  <p className="mt-3 text-slate-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm text-slate-600 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                P
              </div>
              <div className="text-base font-semibold text-slate-900">{brandConfig.platformName}</div>
            </div>
            <p className="mt-4 max-w-sm leading-6">
              Professional projection tools for finance professionals who need a faster, cleaner client workflow.
            </p>
          </div>

          <div>
            <div className="font-semibold text-slate-900">Company</div>
            <ul className="mt-4 space-y-3">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy">Refund/Cancellation Policy</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900">Resources</div>
            <ul className="mt-4 space-y-3">
              <li><Link href="#features">Features</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="#faq">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900">Support</div>
            <ul className="mt-4 space-y-3">
              <li><Link href="/disclaimer">Disclaimer</Link></li>
              <li><a href={`mailto:${brandConfig.email}`}>{brandConfig.email}</a></li>
              <li><Link href="/login">Login</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
