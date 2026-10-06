"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { IndustryLibraryDownload } from "@/components/projection/industry-library-download";
import { DEFAULT_SECTOR_ASSUMPTIONS, getSectorDefaults } from "@/features/projection/engine/assumptions";
import { calculateProjection } from "@/features/projection/engine/calculateProjection";
import {
  getSavedProjectionSnapshot,
  mergeSavedProjections,
  saveProjection,
  subscribeToSavedProjections,
  type SavedProjection,
} from "@/features/projection/storage";
import type { ProjectionInput, SectorAssumption } from "@/features/projection/types";
import { createClient } from "@/lib/supabase/client";

const sectors = Object.keys(DEFAULT_SECTOR_ASSUMPTIONS);

const initialForm: ProjectionInput = {
  businessName: "",
  applicantName: "",
  pan: "",
  designation: "Proprietor",
  fathersName: "",
  placeOfBusiness: "",
  natureOfProject: "",
  sector: sectors[0],
  assumptions: getSectorDefaults(sectors[0]),
  finance: {
    loanAmount: 500000,
    subsidy: 0,
    promoterContribution: 100000,
    interestRate: 0.11,
    loanTenureYears: 5,
    projectionYears: 5,
    firstYearTurnover: 2000000,
    displayUnit: "Rupees",
  },
};

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
  step?: number | "any";
};

function NumberField({ label, value, onChange, suffix, min = 0, step = "any" }: NumberFieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {suffix ? <span className="ml-1 text-slate-400">({suffix})</span> : null}
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-700/15"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-700/15"
      />
    </label>
  );
}

export function ProjectionBuilder({ reportId, duplicateId }: { reportId?: string; duplicateId?: string }) {
  const reports = useSyncExternalStore(subscribeToSavedProjections, getSavedProjectionSnapshot, getSavedProjectionSnapshot);
  const sourceId = reportId ?? duplicateId;
  const source = reports.find((report) => report.id === sourceId);

  useEffect(() => {
    if (!sourceId || source) return;
    void fetch(`/api/projections?id=${encodeURIComponent(sourceId)}`)
      .then(async (response) => response.ok ? response.json() as Promise<{ reports: Record<string, unknown> | null }> : null)
      .then((data) => {
        if (!data?.reports) return;
        const row = data.reports;
        mergeSavedProjections([{
          id: row.id as string,
          input: row.input as SavedProjection["input"],
          result: row.result as SavedProjection["result"],
          createdAt: row.created_at as string,
          updatedAt: row.updated_at as string,
        }]);
      })
      .catch(() => undefined);
  }, [source, sourceId]);

  if (sourceId && !source) return <p className="py-8 text-sm text-slate-600">Loading saved projection inputs...</p>;

  return (
    <ProjectionBuilderForm
      key={`${source?.id ?? "new"}-${source?.updatedAt ?? ""}`}
      initialInput={source?.input ?? initialForm}
      reportId={reportId ? source?.id : undefined}
    />
  );
}

function ProjectionBuilderForm({
  initialInput,
  reportId,
}: {
  initialInput: ProjectionInput;
  reportId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initialInput);
  const [goldLoanEnabled, setGoldLoanEnabled] = useState(Boolean(initialInput.existingGoldLoan));
  const [termLoanEnabled, setTermLoanEnabled] = useState(Boolean(initialInput.existingTermLoan));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateAssumption<Key extends keyof SectorAssumption>(key: Key, value: SectorAssumption[Key]) {
    setForm((current) => ({
      ...current,
      assumptions: { ...current.assumptions, [key]: value },
    }));
  }

  function updateFinance<Key extends keyof ProjectionInput["finance"]>(
    key: Key,
    value: ProjectionInput["finance"][Key],
  ) {
    setForm((current) => ({ ...current, finance: { ...current.finance, [key]: value } }));
  }

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (!form.businessName.trim() || !form.applicantName.trim()) {
      setError("Enter the business name and applicant name to generate a report.");
      return;
    }
    const input: ProjectionInput = {
      ...form,
      businessName: form.businessName.trim(),
      applicantName: form.applicantName.trim(),
      ...(goldLoanEnabled ? {} : { existingGoldLoan: undefined }),
      ...(termLoanEnabled ? {} : { existingTermLoan: undefined }),
    };
    const numericValues = [
      input.finance.loanAmount,
      input.finance.subsidy,
      input.finance.promoterContribution,
      input.finance.interestRate,
      input.finance.loanTenureYears,
      input.finance.projectionYears,
      input.finance.firstYearTurnover,
      ...Object.entries(input.assumptions).filter(([key]) => key !== "sectorName").map(([, value]) => value),
      ...(input.existingGoldLoan ? [input.existingGoldLoan.outstandingAmount, input.existingGoldLoan.interestRate, input.existingGoldLoan.tenureYears] : []),
      ...(input.existingTermLoan ? [input.existingTermLoan.outstandingAmount, input.existingTermLoan.interestRate, input.existingTermLoan.remainingRepaymentYears] : []),
    ];
    if (
      numericValues.some((value) => !Number.isFinite(value)) ||
      input.finance.loanAmount < 0 || input.finance.subsidy < 0 || input.finance.promoterContribution < 0 ||
      input.finance.firstYearTurnover < 0 || input.finance.interestRate < 0 || input.finance.interestRate > 1 ||
      input.finance.projectionYears < 1 || input.finance.projectionYears > 30 ||
      input.finance.loanTenureYears < 1 || input.finance.loanTenureYears > 50 ||
      (input.existingGoldLoan !== undefined && (
        input.existingGoldLoan.outstandingAmount < 0 || input.existingGoldLoan.interestRate < 0 ||
        input.existingGoldLoan.interestRate > 1 || input.existingGoldLoan.tenureYears < 1 || input.existingGoldLoan.tenureYears > 50
      )) ||
      (input.existingTermLoan !== undefined && (
        input.existingTermLoan.outstandingAmount < 0 || input.existingTermLoan.interestRate < 0 ||
        input.existingTermLoan.interestRate > 1 || input.existingTermLoan.remainingRepaymentYears < 1 ||
        input.existingTermLoan.remainingRepaymentYears > 50
      ))
    ) {
      setError("Check the finance inputs: amounts must be non-negative, interest rates at most 100%, projection years 1-30, and loan tenure 1-50 years.");
      return;
    }
    setSaving(true);
    try {
      const result = calculateProjection(input);
      let savedReportId = reportId;
      if (createClient()) {
        const response = await fetch("/api/projections", {
          method: reportId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: reportId, input }),
        });
        const data = await response.json() as { error?: string; report?: { id: string } };
        if (!response.ok || !data.report) throw new Error(data.error ?? "Could not save this report.");
        savedReportId = data.report.id;
      }
      const report = saveProjection(input, result, savedReportId);
      router.push(`/projection/report?id=${encodeURIComponent(report.id)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this report in this browser.");
    } finally {
      setSaving(false);
    }
  }

  const assumptionFields: Array<{ key: keyof SectorAssumption; label: string; percent?: boolean }> = [
    { key: "salesGrowth", label: "Sales growth", percent: true },
    { key: "depreciation", label: "Depreciation (WDV)", percent: true },
    { key: "materialCostPct", label: "Material % of sales", percent: true },
    { key: "wagesPct", label: "Wages % of sales", percent: true },
    { key: "powerFuelPct", label: "Power & fuel %", percent: true },
    { key: "overheadPct", label: "Other overheads %", percent: true },
    { key: "fixedAssetSharePct", label: "Fixed-asset share", percent: true },
    { key: "debtorDays", label: "Debtor days" },
    { key: "creditorDays", label: "Creditor days" },
    { key: "stockDays", label: "Stock days" },
  ];

  return (
    <form onSubmit={generate} className="space-y-6">
      <section className="border-b border-slate-200 pb-6">
        <h2 className="text-lg font-semibold text-slate-950">Applicant and business</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <TextField label="Business name" value={form.businessName} required onChange={(value) => setForm({ ...form, businessName: value })} />
          <TextField label="Applicant name" value={form.applicantName} required onChange={(value) => setForm({ ...form, applicantName: value })} />
          <TextField label="PAN" value={form.pan} onChange={(value) => setForm({ ...form, pan: value.toUpperCase() })} />
          <TextField label="Designation" value={form.designation} onChange={(value) => setForm({ ...form, designation: value })} />
          <TextField label="Father's name" value={form.fathersName} onChange={(value) => setForm({ ...form, fathersName: value })} />
          <TextField label="Place of business" value={form.placeOfBusiness} onChange={(value) => setForm({ ...form, placeOfBusiness: value })} />
          <TextField label="Nature of project" value={form.natureOfProject} onChange={(value) => setForm({ ...form, natureOfProject: value })} />
          <label className="block text-sm font-medium text-slate-700">
            Sector
            <select
              value={form.sector}
              onChange={(event) => {
                const sector = event.target.value;
                setForm((current) => ({ ...current, sector, assumptions: getSectorDefaults(sector) }));
              }}
              className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {sectors.map((sector) => <option key={sector}>{sector}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Sector assumptions</h2>
            <p className="mt-1 text-sm text-slate-500">Loaded from the recovered industry library. Values can be overridden for this report.</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, assumptions: getSectorDefaults(current.sector) }))}
            className="min-h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset defaults
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {assumptionFields.map(({ key, label, percent }) => (
            <NumberField
              key={key}
              label={label}
              suffix={percent ? "%" : undefined}
              value={percent ? Number((Number(form.assumptions[key]) * 100).toFixed(2)) : Number(form.assumptions[key])}
              step={percent ? 0.1 : 1}
              onChange={(value) => updateAssumption(key, (percent ? value / 100 : value) as never)}
            />
          ))}
        </div>
      </section>

      <section className="border-b border-slate-200 pb-6">
        <h2 className="text-lg font-semibold text-slate-950">Project finance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <NumberField label="Loan amount" value={form.finance.loanAmount} onChange={(value) => updateFinance("loanAmount", value)} />
          <NumberField label="Subsidy" value={form.finance.subsidy} onChange={(value) => updateFinance("subsidy", value)} />
          <NumberField label="Promoter contribution" value={form.finance.promoterContribution} onChange={(value) => updateFinance("promoterContribution", value)} />
          <NumberField label="Interest rate p.a." suffix="%" step={0.01} value={form.finance.interestRate * 100} onChange={(value) => updateFinance("interestRate", value / 100)} />
          <NumberField label="Loan tenure" suffix="years" step={1} min={1} value={form.finance.loanTenureYears} onChange={(value) => updateFinance("loanTenureYears", value)} />
          <NumberField label="Projection period" suffix="years" step={1} min={1} value={form.finance.projectionYears} onChange={(value) => updateFinance("projectionYears", value)} />
          <NumberField label="First-year turnover" value={form.finance.firstYearTurnover} onChange={(value) => updateFinance("firstYearTurnover", value)} />
          <label className="block text-sm font-medium text-slate-700">
            Display units
            <select value={form.finance.displayUnit} onChange={(event) => updateFinance("displayUnit", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
              <option>Rupees</option><option>Lakhs</option>
            </select>
          </label>
        </div>
      </section>

      <section className="border-b border-slate-200 pb-6">
        <h2 className="text-lg font-semibold text-slate-950">Existing facilities</h2>
        <div className="mt-4 space-y-5">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={goldLoanEnabled} onChange={(event) => {
              setGoldLoanEnabled(event.target.checked);
              setForm((current) => ({ ...current, existingGoldLoan: event.target.checked ? { outstandingAmount: 0, interestRate: 0, tenureYears: 1 } : undefined }));
            }} /> Existing gold loan (interest-only, bullet)
          </label>
          {goldLoanEnabled && form.existingGoldLoan ? <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label="Outstanding" value={form.existingGoldLoan.outstandingAmount} onChange={(value) => setForm((current) => ({ ...current, existingGoldLoan: { ...current.existingGoldLoan!, outstandingAmount: value } }))} />
            <NumberField label="Interest rate p.a." suffix="%" step={0.01} value={form.existingGoldLoan.interestRate * 100} onChange={(value) => setForm((current) => ({ ...current, existingGoldLoan: { ...current.existingGoldLoan!, interestRate: value / 100 } }))} />
            <NumberField label="Tenure" suffix="years" step={1} min={1} value={form.existingGoldLoan.tenureYears} onChange={(value) => setForm((current) => ({ ...current, existingGoldLoan: { ...current.existingGoldLoan!, tenureYears: value } }))} />
          </div> : null}
          <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={termLoanEnabled} onChange={(event) => {
              setTermLoanEnabled(event.target.checked);
              setForm((current) => ({ ...current, existingTermLoan: event.target.checked ? { outstandingAmount: 0, interestRate: 0, remainingRepaymentYears: 1 } : undefined }));
            }} /> Existing term loan
          </label>
          {termLoanEnabled && form.existingTermLoan ? <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label="Outstanding" value={form.existingTermLoan.outstandingAmount} onChange={(value) => setForm((current) => ({ ...current, existingTermLoan: { ...current.existingTermLoan!, outstandingAmount: value } }))} />
            <NumberField label="Interest rate p.a." suffix="%" step={0.01} value={form.existingTermLoan.interestRate * 100} onChange={(value) => setForm((current) => ({ ...current, existingTermLoan: { ...current.existingTermLoan!, interestRate: value / 100 } }))} />
            <NumberField label="Remaining repayment" suffix="years" step={1} min={1} value={form.existingTermLoan.remainingRepaymentYears} onChange={(value) => setForm((current) => ({ ...current, existingTermLoan: { ...current.existingTermLoan!, remainingRepaymentYears: value } }))} />
          </div> : null}
        </div>
      </section>

      {error ? <p role="alert" className="text-sm font-medium text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <IndustryLibraryDownload />
        <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-sky-950 px-5 text-sm font-semibold text-white hover:bg-sky-900 disabled:cursor-wait disabled:opacity-60">{saving ? "Saving report..." : "Generate projection report"}</button>
      </div>
    </form>
  );
}