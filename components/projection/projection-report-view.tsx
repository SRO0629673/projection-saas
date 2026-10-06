"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import ExcelJS from "exceljs";

import { DEFAULT_SECTOR_ASSUMPTIONS } from "@/features/projection/engine/assumptions";
import {
  findSavedProjection,
  mergeSavedProjections,
  subscribeToSavedProjections,
  type SavedProjection,
} from "@/features/projection/storage";

function formatMoney(value: number, displayUnit: string) {
  const amount = displayUnit === "Lakhs" ? value / 100000 : value;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: displayUnit === "Lakhs" ? 2 : 0,
    maximumFractionDigits: displayUnit === "Lakhs" ? 2 : 0,
  }).format(amount);
}

function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function ReportTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: Array<{ label: string; values: string[]; emphasis?: boolean }>;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 border-l-4 border-teal-700 pl-3 text-sm font-semibold uppercase text-slate-800">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right text-xs">
          <thead className="bg-[#1f3864] text-white">
            <tr><th className="p-2 text-left">Particulars</th>{headers.map((header) => <th className="p-2" key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className={row.emphasis ? "bg-slate-100 font-semibold" : "odd:bg-white even:bg-slate-50"} key={row.label}>
                <td className="p-2 text-left">{row.label}</td>
                {row.values.map((value, index) => <td className="p-2" key={`${row.label}-${index}`}>{value}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function createWorkbook(report: SavedProjection) {
  const { input, result } = report;
  const workbook = new ExcelJS.Workbook();
  const append = (name: string, rows: Array<Record<string, string | number>>) => {
    const sheet = workbook.addWorksheet(name);
    const headers = Object.keys(rows[0] ?? {});
    sheet.columns = headers.map((header) => ({ header, key: header, width: Math.max(14, Math.min(34, header.length + 3)) }));
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } };
  };

  append("Project Report", [
    { Particulars: "Business name", Value: input.businessName },
    { Particulars: "Applicant", Value: input.applicantName },
    { Particulars: "PAN", Value: input.pan },
    { Particulars: "Designation", Value: input.designation },
    { Particulars: "Father's name", Value: input.fathersName },
    { Particulars: "Place of business", Value: input.placeOfBusiness },
    { Particulars: "Nature of project", Value: input.natureOfProject },
    { Particulars: "Sector", Value: input.sector },
    { Particulars: "Loan amount", Value: input.finance.loanAmount },
    { Particulars: "Subsidy", Value: input.finance.subsidy },
    { Particulars: "Promoter contribution", Value: input.finance.promoterContribution },
    { Particulars: "Project cost", Value: result.projectCost },
    { Particulars: "Monthly EMI", Value: result.monthlyEmi },
    { Particulars: "Average DSCR", Value: result.averageDscr },
  ]);
  append("Assumptions", Object.entries(input.assumptions).map(([key, value]) => ({ Assumption: key, Value: value })));
  append("P&L", result.years.map((year) => ({
    Year: year.year, Sales: year.sales, "Material consumed": year.material, Wages: year.wages,
    "Power and fuel": year.powerFuel, "Other overheads": year.overheads, EBITDA: year.ebitda,
    Depreciation: year.depreciation, EBIT: year.ebit, "Term loan interest": year.termLoanInterest,
    "Existing loan interest": year.existingLoanInterest, "Gold loan interest": year.goldLoanInterest,
    PBT: year.pbt, PAT: year.pat,
  })));
  append("Balance Sheet", result.years.map((year) => ({
    Year: year.year,
    "Promoter capital": input.finance.promoterContribution,
    "Capital subsidy": input.finance.subsidy,
    "Reserves and surplus": year.netWorth - input.finance.promoterContribution - input.finance.subsidy,
    "Net worth": year.netWorth, "Term loan": year.termLoanClosing,
    "Existing term loan": year.existingLoanClosing, "Gold loan": year.goldLoanClosing,
    Creditors: year.creditors, "Net fixed assets": year.fixedAssets,
    Inventory: year.inventory, Debtors: year.debtors, "Cash and bank": year.cash,
    "Total equity and liabilities": year.totalEquityAndLiabilities,
    "Total assets": year.totalAssets,
    "Balance check": year.balanceCheck,
  })));
  append("Cash Flow", result.years.map((year) => ({
    Year: year.year, "Cash from operations": year.cashFromOperations,
    "Term loan principal": -year.termLoanPrincipal,
    "Existing loan principal": -year.existingLoanPrincipal,
    "Gold loan principal": -year.goldLoanPrincipal, "Net cash flow": year.netCashFlow,
    "Closing cash balance": year.closingCash,
  })));
  append("Ratios", result.years.map((year) => ({
    Year: year.year, DSCR: year.dscr, ISCR: year.iscr, "Current ratio": year.currentRatio,
    "Debt-equity ratio": year.debtEquityRatio, "Break-even (% sales)": year.breakEvenPct,
    "Margin of safety": year.marginOfSafetyPct,
  })));

  append("Loan Schedule", result.monthlyTermLoanSchedule.map((month) => ({
    Month: month.month, Opening: month.opening, EMI: month.emi,
    Interest: month.interest, Principal: month.principal, Closing: month.closing,
  })));
  append("Industry Library", Object.values(DEFAULT_SECTOR_ASSUMPTIONS).map((assumption) => ({
    Sector: assumption.sectorName, "Sales growth": assumption.salesGrowth,
    "Material % of sales": assumption.materialCostPct, "Wages % of sales": assumption.wagesPct,
    "Power & fuel % of sales": assumption.powerFuelPct,
    "Other overheads % of sales": assumption.overheadPct,
    "Depreciation (WDV)": assumption.depreciation,
    "Fixed-asset share": assumption.fixedAssetSharePct,
    "Debtor days": assumption.debtorDays, "Creditor days": assumption.creditorDays,
    "Stock days": assumption.stockDays,
  })));
  return workbook;
}

async function downloadWorkbook(report: SavedProjection) {
  let blob: Blob;
  try {
    const response = await fetch("/api/exports/projection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: report.id, input: report.input }),
    });
    if (!response.ok) throw new Error("Server export is unavailable.");
    blob = await response.blob();
  } catch {
    const buffer = await createWorkbook(report).xlsx.writeBuffer();
    blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Projection_${report.input.businessName.replace(/[^a-z0-9]+/gi, "_")}.xlsx`;
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ProjectionReportView({ id }: { id: string }) {
  const report = useSyncExternalStore(
    subscribeToSavedProjections,
    () => findSavedProjection(id),
    () => null,
  );
  useEffect(() => {
    if (findSavedProjection(id)) return;
    void fetch(`/api/projections?id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ reports: Record<string, unknown> | null }>;
      })
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
  }, [id]);
  if (!report) return <div className="space-y-4"><p className="text-slate-700">This report is not available in this browser.</p><Link className="text-sky-800 underline" href="/projection/new">Create a projection</Link></div>;

  const { input, result } = report;
  const years = result.years.map((year) => `Year ${year.year}`);
  const money = (value: number) => formatMoney(value, input.finance.displayUnit);
  const statementRows = [
    { label: "Sales / receipts", values: result.years.map((year) => money(year.sales)), emphasis: true },
    { label: "Less: Material consumed", values: result.years.map((year) => money(year.material)) },
    { label: "Less: Wages", values: result.years.map((year) => money(year.wages)) },
    { label: "Less: Power & fuel", values: result.years.map((year) => money(year.powerFuel)) },
    { label: "Less: Other overheads", values: result.years.map((year) => money(year.overheads)) },
    { label: "EBITDA", values: result.years.map((year) => money(year.ebitda)), emphasis: true },
    { label: "Less: Depreciation (WDV)", values: result.years.map((year) => money(year.depreciation)) },
    { label: "EBIT", values: result.years.map((year) => money(year.ebit)), emphasis: true },
    { label: "Term loan interest", values: result.years.map((year) => money(year.termLoanInterest)) },
    { label: "Existing term loan interest", values: result.years.map((year) => money(year.existingLoanInterest)) },
    { label: "Gold loan interest", values: result.years.map((year) => money(year.goldLoanInterest)) },
    { label: "Profit before tax", values: result.years.map((year) => money(year.pbt)), emphasis: true },
    { label: "Income tax (excluded)", values: result.years.map(() => money(0)) },
    { label: "Profit after tax", values: result.years.map((year) => money(year.pat)), emphasis: true },
  ];
  const balanceRows = [
    { label: "Promoter's capital", values: result.years.map(() => money(input.finance.promoterContribution)) },
    { label: "Capital subsidy reserve", values: result.years.map(() => money(input.finance.subsidy)) },
    { label: "Reserves & surplus", values: result.years.map((year) => money(year.netWorth - input.finance.promoterContribution - input.finance.subsidy)) },
    { label: "Net worth", values: result.years.map((year) => money(year.netWorth)), emphasis: true },
    { label: "Term loan", values: result.years.map((year) => money(year.termLoanClosing)) },
    { label: "Existing term loan", values: result.years.map((year) => money(year.existingLoanClosing)) },
    { label: "Gold loan", values: result.years.map((year) => money(year.goldLoanClosing)) },
    { label: "Creditors", values: result.years.map((year) => money(year.creditors)) },
    { label: "Net fixed assets", values: result.years.map((year) => money(year.fixedAssets)) },
    { label: "Inventory", values: result.years.map((year) => money(year.inventory)) },
    { label: "Sundry debtors", values: result.years.map((year) => money(year.debtors)) },
    { label: "Cash & bank (balancing)", values: result.years.map((year) => money(year.cash)) },
    { label: "Total equity & liabilities", values: result.years.map((year) => money(year.totalEquityAndLiabilities)), emphasis: true },
    { label: "Total assets", values: result.years.map((year) => money(year.totalAssets)), emphasis: true },
    { label: "Balance check", values: result.years.map((year) => money(year.balanceCheck)) },
  ];
  const cashRows = [
    { label: "Cash from operations", values: result.years.map((year) => money(year.cashFromOperations)) },
    { label: "Term loan principal", values: result.years.map((year) => money(-year.termLoanPrincipal)) },
    { label: "Existing term loan principal", values: result.years.map((year) => money(-year.existingLoanPrincipal)) },
    { label: "Gold loan principal", values: result.years.map((year) => money(-year.goldLoanPrincipal)) },
    { label: "Net cash flow", values: result.years.map((year) => money(year.netCashFlow)), emphasis: true },
    { label: "Closing cash balance", values: result.years.map((year) => money(year.closingCash)), emphasis: true },
  ];
  const ratioRows = [
    { label: "DSCR", values: result.years.map((year) => `${year.dscr.toFixed(2)}x`) },
    { label: "ISCR", values: result.years.map((year) => `${year.iscr.toFixed(2)}x`) },
    { label: "Current ratio", values: result.years.map((year) => `${year.currentRatio.toFixed(2)}x`) },
    { label: "Debt-equity ratio", values: result.years.map((year) => `${year.debtEquityRatio.toFixed(2)}x`) },
    { label: "Break-even (% of sales)", values: result.years.map((year) => percent(year.breakEvenPct)) },
    { label: "Margin of safety", values: result.years.map((year) => percent(year.marginOfSafetyPct)) },
  ];
  const termLoanRows = [
    { label: "Opening balance", values: result.years.map((year) => money(year.year === 1 ? input.finance.loanAmount : result.years[year.year - 2]?.termLoanClosing ?? 0)) },
    { label: "Interest", values: result.years.map((year) => money(year.termLoanInterest)) },
    { label: "Principal", values: result.years.map((year) => money(year.termLoanPrincipal)) },
    { label: "Closing balance", values: result.years.map((year) => money(year.termLoanClosing)), emphasis: true },
  ];
  const goldLoanRows = [
    { label: "Opening balance", values: result.years.map((year) => money(year.year === 1 ? input.existingGoldLoan?.outstandingAmount ?? 0 : result.years[year.year - 2]?.goldLoanClosing ?? 0)) },
    { label: "Interest", values: result.years.map((year) => money(year.goldLoanInterest)) },
    { label: "Principal", values: result.years.map((year) => money(year.goldLoanPrincipal)) },
    { label: "Closing balance", values: result.years.map((year) => money(year.goldLoanClosing)), emphasis: true },
  ];
  const existingLoanRows = [
    { label: "Opening balance", values: result.years.map((year) => money(year.year === 1 ? input.existingTermLoan?.outstandingAmount ?? 0 : result.years[year.year - 2]?.existingLoanClosing ?? 0)) },
    { label: "Interest", values: result.years.map((year) => money(year.existingLoanInterest)) },
    { label: "Principal", values: result.years.map((year) => money(year.existingLoanPrincipal)) },
    { label: "Closing balance", values: result.years.map((year) => money(year.existingLoanClosing)), emphasis: true },
  ];
  const monthlyLoanRows = result.monthlyTermLoanSchedule.map((month) => ({
    label: `Month ${month.month}`,
    values: [money(month.opening), money(month.emi), money(month.interest), money(month.principal), money(month.closing)],
  }));

  return (
    <>
      <div className="no-print mb-5 flex flex-wrap justify-end gap-3">
        <Link href={`/projection/new?id=${encodeURIComponent(report.id)}`} className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Edit inputs</Link>
        <Link href={`/projection/new?duplicate=${encodeURIComponent(report.id)}`} className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Duplicate report</Link>
        <button type="button" onClick={() => window.print()} className="min-h-10 rounded-md bg-sky-950 px-4 text-sm font-semibold text-white hover:bg-sky-900">Print / Save PDF</button>
        <button type="button" onClick={() => void downloadWorkbook(report)} className="min-h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Download Excel workbook</button>
      </div>
      <article id="print-report" className="bg-white p-5 text-slate-900 sm:p-8 print:p-0">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b-[3px] border-[#1f3864] pb-4">
          <div><h1 className="text-2xl font-extrabold text-[#1f3864]">{input.businessName}</h1><p className="mt-1 text-sm text-slate-600">{input.designation}: {input.applicantName} | {input.placeOfBusiness}</p></div>
          <div className="text-left text-sm text-slate-600 sm:text-right"><p>Projected Financial Statements</p><p className="font-semibold text-[#2e5496]">{input.sector}</p><p>{input.natureOfProject}</p></div>
        </header>
        <section className="mt-6">
          <h2 className="mb-3 border-l-4 border-teal-700 pl-3 text-sm font-semibold uppercase text-slate-800">Project Report</h2>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {[["Applicant", input.applicantName], ["PAN", input.pan], ["Designation", input.designation], ["Father's name", input.fathersName], ["Business", input.businessName], ["Place", input.placeOfBusiness], ["Project", input.natureOfProject], ["Sector", input.sector], ["Loan amount", money(input.finance.loanAmount)], ["Subsidy", money(input.finance.subsidy)], ["Promoter contribution", money(input.finance.promoterContribution)], ["Project cost", money(result.projectCost)], ["Rate of interest", percent(input.finance.interestRate)], ["Loan tenure", `${input.finance.loanTenureYears} years`]].map(([label, value]) => <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5" key={label}><dt className="font-medium text-slate-600">{label}</dt><dd className="text-right">{value}</dd></div>)}
          </dl>
        </section>
        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[["Average DSCR", `${result.averageDscr.toFixed(2)}x`], ["Monthly EMI", money(result.monthlyEmi)], [`Net worth (Year ${result.years.length})`, money(result.years.at(-1)?.netWorth ?? 0)], [`PAT (Year ${result.years.length})`, money(result.years.at(-1)?.pat ?? 0)]].map(([label, value]) => <div className="border border-slate-200 bg-slate-50 p-3" key={label}><p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-[#1f3864]">{value}</p></div>)}
        </div>
        <ReportTable title="Projected Profit & Loss" headers={years} rows={statementRows} />
        <ReportTable title="Projected Balance Sheet" headers={years} rows={balanceRows} />
        <ReportTable title="Projected Cash Flow" headers={years} rows={cashRows} />
        <ReportTable title="Key Ratios" headers={years} rows={ratioRows} />
        <ReportTable title="Term Loan Repayment Schedule" headers={years} rows={termLoanRows} />
        {input.existingGoldLoan ? <ReportTable title="Gold Loan Schedule (Interest-only, Bullet)" headers={years} rows={goldLoanRows} /> : null}
        {input.existingTermLoan ? <ReportTable title="Existing Term Loan Schedule" headers={years} rows={existingLoanRows} /> : null}
        <ReportTable title="Monthly Term Loan Schedule" headers={["Opening", "EMI", "Interest", "Principal", "Closing"]} rows={monthlyLoanRows} />
        <section className="mt-8 break-inside-avoid">
          <h2 className="mb-3 border-l-4 border-teal-700 pl-3 text-sm font-semibold uppercase text-slate-800">Assumptions Applied</h2>
          <p className="border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">{input.sector}: material {percent(input.assumptions.materialCostPct)}, wages {percent(input.assumptions.wagesPct)}, power {percent(input.assumptions.powerFuelPct)}, overheads {percent(input.assumptions.overheadPct)}, growth {percent(input.assumptions.salesGrowth)}, depreciation {percent(input.assumptions.depreciation)} (WDV), fixed-asset share {percent(input.assumptions.fixedAssetSharePct)}, debtors {input.assumptions.debtorDays} days, creditors {input.assumptions.creditorDays} days, stock {input.assumptions.stockDays} days.</p>
        </section>
        <footer className="mt-8 border-t border-slate-200 pt-3 text-[10px] leading-4 text-slate-500">Figures are based on information and assumptions provided by the user and should be independently verified. Income tax is excluded; PAT equals PBT. Generated {new Date(report.createdAt).toLocaleDateString("en-IN")}.</footer>
      </article>
    </>
  );
}