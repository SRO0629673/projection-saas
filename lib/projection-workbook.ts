import ExcelJS from "exceljs";

import { DEFAULT_SECTOR_ASSUMPTIONS } from "@/features/projection/engine/assumptions";
import type { ProjectionInput, ProjectionResult } from "@/features/projection/types";

export type ProjectionExport = {
  input: ProjectionInput;
  result: ProjectionResult;
};

function appendSheet(workbook: ExcelJS.Workbook, name: string, rows: Array<Record<string, string | number>>) {
  const sheet = workbook.addWorksheet(name);
  const headers = Object.keys(rows[0] ?? {});
  sheet.columns = headers.map((header) => ({ header, key: header, width: Math.max(14, Math.min(40, header.length + 3)) }));
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: `${sheet.getColumn(headers.length).letter}1` };
}

export function createIndustryLibraryWorkbook() {
  const workbook = new ExcelJS.Workbook();
  const rows = Object.values(DEFAULT_SECTOR_ASSUMPTIONS).map((assumption) => ({
    Sector: assumption.sectorName,
    "Sales growth": assumption.salesGrowth,
    "Material % of sales": assumption.materialCostPct,
    "Wages % of sales": assumption.wagesPct,
    "Power & fuel % of sales": assumption.powerFuelPct,
    "Other overheads % of sales": assumption.overheadPct,
    "Depreciation (WDV)": assumption.depreciation,
    "Fixed-asset share": assumption.fixedAssetSharePct,
    "Debtor days": assumption.debtorDays,
    "Creditor days": assumption.creditorDays,
    "Stock days": assumption.stockDays,
  }));
  appendSheet(workbook, "Industry Library", rows);
  const sheet = workbook.getWorksheet("Industry Library");
  if (sheet) {
    sheet.getColumn(1).width = 43;
    for (let column = 2; column <= 8; column += 1) {
      sheet.getColumn(column).numFmt = "0.0%";
      sheet.getColumn(column).width = 22;
    }
  }
  return workbook;
}

export function createProjectionWorkbook({ input, result }: ProjectionExport) {
  const workbook = new ExcelJS.Workbook();
  appendSheet(workbook, "Project Report", [
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
  appendSheet(workbook, "Assumptions", Object.entries(input.assumptions).map(([key, value]) => ({ Assumption: key, Value: value })));
  appendSheet(workbook, "P&L", result.years.map((year) => ({
    Year: year.year, Sales: year.sales, "Material consumed": year.material, Wages: year.wages,
    "Power and fuel": year.powerFuel, "Other overheads": year.overheads, EBITDA: year.ebitda,
    Depreciation: year.depreciation, EBIT: year.ebit, "Term loan interest": year.termLoanInterest,
    "Existing loan interest": year.existingLoanInterest, "Gold loan interest": year.goldLoanInterest,
    PBT: year.pbt, PAT: year.pat,
  })));
  appendSheet(workbook, "Balance Sheet", result.years.map((year) => ({
    Year: year.year, "Promoter capital": input.finance.promoterContribution,
    "Capital subsidy": input.finance.subsidy,
    "Reserves and surplus": year.netWorth - input.finance.promoterContribution - input.finance.subsidy,
    "Net worth": year.netWorth, "Term loan": year.termLoanClosing,
    "Existing term loan": year.existingLoanClosing, "Gold loan": year.goldLoanClosing,
    Creditors: year.creditors, "Net fixed assets": year.fixedAssets,
    Inventory: year.inventory, Debtors: year.debtors, "Cash and bank": year.cash,
    "Total equity and liabilities": year.totalEquityAndLiabilities,
    "Total assets": year.totalAssets, "Balance check": year.balanceCheck,
  })));
  appendSheet(workbook, "Cash Flow", result.years.map((year) => ({
    Year: year.year, "Cash from operations": year.cashFromOperations,
    "Term loan principal": -year.termLoanPrincipal,
    "Existing loan principal": -year.existingLoanPrincipal,
    "Gold loan principal": -year.goldLoanPrincipal,
    "Net cash flow": year.netCashFlow, "Closing cash balance": year.closingCash,
  })));
  appendSheet(workbook, "Ratios", result.years.map((year) => ({
    Year: year.year, DSCR: year.dscr, ISCR: year.iscr, "Current ratio": year.currentRatio,
    "Debt-equity ratio": year.debtEquityRatio, "Break-even (% sales)": year.breakEvenPct,
    "Margin of safety": year.marginOfSafetyPct,
  })));
  appendSheet(workbook, "Loan Schedule", result.monthlyTermLoanSchedule.map((month) => ({
    Month: month.month, Opening: month.opening, EMI: month.emi,
    Interest: month.interest, Principal: month.principal, Closing: month.closing,
  })));
  appendSheet(workbook, "Industry Library", Object.values(DEFAULT_SECTOR_ASSUMPTIONS).map((assumption) => ({
    Sector: assumption.sectorName, "Sales growth": assumption.salesGrowth,
    "Material % of sales": assumption.materialCostPct, "Wages % of sales": assumption.wagesPct,
    "Power & fuel % of sales": assumption.powerFuelPct,
    "Other overheads % of sales": assumption.overheadPct,
    "Depreciation (WDV)": assumption.depreciation,
    "Fixed-asset share": assumption.fixedAssetSharePct,
    "Debtor days": assumption.debtorDays, "Creditor days": assumption.creditorDays,
    "Stock days": assumption.stockDays,
  })));
  const library = workbook.getWorksheet("Industry Library");
  if (library) {
    library.getColumn(1).width = 43;
    for (let column = 2; column <= 8; column += 1) {
      library.getColumn(column).numFmt = "0.0%";
      library.getColumn(column).width = 22;
    }
  }
  return workbook;
}
