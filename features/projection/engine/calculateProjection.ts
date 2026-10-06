import type { ProjectionInput, ProjectionResult } from "@/features/projection/types";

function payment(rate: number, periods: number, principal: number) {
  if (periods <= 0 || principal <= 0) return 0;
  if (rate === 0) return principal / periods;
  const factor = (1 + rate) ** periods;
  return (principal * rate * factor) / (factor - 1);
}

function safeRatio(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function calculateProjection(input: ProjectionInput): ProjectionResult {
  const { finance, assumptions } = input;
  const yearsCount = Math.max(1, Math.round(finance.projectionYears));
  const loanYears = Math.max(1, Math.round(finance.loanTenureYears));
  const loanRate = finance.interestRate;
  const monthlyEmi = payment(loanRate / 12, loanYears * 12, finance.loanAmount);
  const existingLoanYears = Math.round(input.existingTermLoan?.remainingRepaymentYears ?? 0);
  const goldLoanYears = Math.round(input.existingGoldLoan?.tenureYears ?? 0);
  const existingLoanEmi = existingLoanYears > 0
    ? payment(
        input.existingTermLoan?.interestRate ?? 0,
        existingLoanYears,
        input.existingTermLoan?.outstandingAmount ?? 0,
      )
    : 0;
  const years = [];
  const monthlyTermLoanSchedule = [];
  let termBalance = finance.loanAmount;
  for (let month = 1; month <= loanYears * 12; month += 1) {
    const opening = termBalance;
    const interest = opening * loanRate / 12;
    const principal = Math.min(opening, monthlyEmi - interest);
    termBalance = Math.max(0, opening - principal);
    monthlyTermLoanSchedule.push({ month, opening, emi: monthlyEmi, interest, principal, closing: termBalance });
  }
  let existingBalance = input.existingTermLoan?.outstandingAmount ?? 0;
  let accumulatedReserves = 0;
  let fixedAssetOpening =
    (finance.loanAmount + finance.subsidy + finance.promoterContribution) *
    assumptions.fixedAssetSharePct;
  let previousInventory = 0;
  let previousDebtors = 0;
  let previousCreditors = 0;
  let closingCash =
    finance.loanAmount +
    finance.subsidy +
    finance.promoterContribution +
    (input.existingGoldLoan?.outstandingAmount ?? 0) +
    existingBalance -
    fixedAssetOpening -
    existingBalance;
  let totalDscrNumerator = 0;
  let totalDscrDenominator = 0;
  let priorSales = finance.firstYearTurnover;

  for (let year = 1; year <= yearsCount; year += 1) {
    const sales = year === 1 ? finance.firstYearTurnover : priorSales * (1 + assumptions.salesGrowth);
    const material = sales * assumptions.materialCostPct;
    const wages = sales * assumptions.wagesPct;
    const powerFuel = sales * assumptions.powerFuelPct;
    const overheads = sales * assumptions.overheadPct;
    const ebitda = sales - material - wages - powerFuel - overheads;
    const depreciation = fixedAssetOpening * assumptions.depreciation;
    const fixedAssets = fixedAssetOpening - depreciation;

    const yearlyMonths = monthlyTermLoanSchedule.slice((year - 1) * 12, year * 12);
    const termLoanInterest = yearlyMonths.reduce((sum, month) => sum + month.interest, 0);
    const termLoanPrincipal = yearlyMonths.reduce((sum, month) => sum + month.principal, 0);
    termBalance = monthlyTermLoanSchedule[Math.min(year * 12, monthlyTermLoanSchedule.length) - 1]?.closing ?? 0;

    const goldLoan = input.existingGoldLoan;
    const goldLoanInterest = goldLoan && year <= goldLoanYears
      ? goldLoan.outstandingAmount * goldLoan.interestRate
      : 0;
    const goldLoanPrincipal = goldLoan && year === goldLoanYears
      ? goldLoan.outstandingAmount
      : 0;
    const goldLoanClosing = goldLoan && year < goldLoanYears
      ? goldLoan.outstandingAmount
      : 0;

    const existingLoan = input.existingTermLoan;
    const existingLoanInterest = existingLoan && year <= existingLoanYears
      ? existingBalance * existingLoan.interestRate
      : 0;
    const existingLoanPrincipal = existingLoan && year <= existingLoanYears
      ? Math.min(existingBalance, existingLoanEmi - existingLoanInterest)
      : 0;
    existingBalance = Math.max(0, existingBalance - existingLoanPrincipal);

    const ebit = ebitda - depreciation;
    const pbt = ebit - termLoanInterest - existingLoanInterest - goldLoanInterest;
    const pat = pbt;
    accumulatedReserves += pat;
    const netWorth = finance.promoterContribution + finance.subsidy + accumulatedReserves;
    const creditors = assumptions.creditorDays / 365 * material;
    const inventory = assumptions.stockDays / 365 * material;
    const debtors = assumptions.debtorDays / 365 * sales;
    const termLoanClosing = Math.max(0, termBalance);
    const totalEquityAndLiabilities = netWorth + termLoanClosing + existingBalance + goldLoanClosing + creditors;
    const cash = totalEquityAndLiabilities - fixedAssets -
      (input.existingTermLoan?.outstandingAmount ?? 0) - inventory - debtors;
    const totalAssets = fixedAssets + (input.existingTermLoan?.outstandingAmount ?? 0) + inventory + debtors + cash;

    const cashFromOperations = pat + depreciation - (inventory - previousInventory) -
      (debtors - previousDebtors) + (creditors - previousCreditors);
    const netCashFlow = cashFromOperations - termLoanPrincipal - existingLoanPrincipal - goldLoanPrincipal;
    closingCash += netCashFlow;

    const debtService = termLoanPrincipal + termLoanInterest + existingLoanPrincipal +
      existingLoanInterest + goldLoanPrincipal + goldLoanInterest;
    const dscrNumerator = pat + depreciation + termLoanInterest + existingLoanInterest + goldLoanInterest;
    const dscr = safeRatio(dscrNumerator, debtService);
    totalDscrNumerator += dscrNumerator;
    totalDscrDenominator += debtService;
    const totalInterest = termLoanInterest + existingLoanInterest + goldLoanInterest;
    const fixedCosts = wages + overheads + depreciation + totalInterest;
    const breakEvenSales = safeRatio(fixedCosts, 1 - assumptions.materialCostPct - assumptions.powerFuelPct);
    const breakEvenPct = safeRatio(breakEvenSales, sales);

    years.push({
      year,
      sales,
      material,
      wages,
      powerFuel,
      overheads,
      ebitda,
      depreciation,
      ebit,
      termLoanInterest,
      termLoanPrincipal,
      termLoanClosing,
      goldLoanInterest,
      goldLoanPrincipal,
      goldLoanClosing,
      existingLoanInterest,
      existingLoanPrincipal,
      existingLoanClosing: existingBalance,
      pbt,
      pat,
      netWorth,
      fixedAssets,
      creditors,
      inventory,
      debtors,
      cash,
      totalEquityAndLiabilities,
      totalAssets,
      balanceCheck: totalAssets - totalEquityAndLiabilities,
      cashFromOperations,
      netCashFlow,
      closingCash,
      dscr,
      iscr: safeRatio(pbt + totalInterest, totalInterest),
      currentRatio: safeRatio(inventory + debtors + cash, creditors),
      debtEquityRatio: safeRatio(termLoanClosing + existingBalance + goldLoanClosing, netWorth),
      breakEvenPct,
      marginOfSafetyPct: 1 - breakEvenPct,
    });

    fixedAssetOpening = fixedAssets;
    previousInventory = inventory;
    previousDebtors = debtors;
    previousCreditors = creditors;
    priorSales = sales;
  }

  return {
    businessName: input.businessName,
    status: "completed",
    loanAmount: finance.loanAmount,
    projectCost: finance.loanAmount + finance.subsidy + finance.promoterContribution,
    monthlyEmi,
    averageDscr: safeRatio(totalDscrNumerator, totalDscrDenominator),
    years,
    monthlyTermLoanSchedule,
    notes: ["Income tax is excluded, as in the supplied legacy tool (PAT = PBT)."],
  };
}
