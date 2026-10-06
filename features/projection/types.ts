export type ProjectionStatus = "draft" | "completed";

export type SectorAssumption = {
  sectorName: string;
  salesGrowth: number;
  depreciation: number;
  materialCostPct: number;
  wagesPct: number;
  powerFuelPct: number;
  overheadPct: number;
  fixedAssetSharePct: number;
  debtorDays: number;
  creditorDays: number;
  stockDays: number;
};

export type ProjectionInput = {
  businessName: string;
  applicantName: string;
  pan: string;
  designation: string;
  fathersName: string;
  placeOfBusiness: string;
  natureOfProject: string;
  sector: string;
  assumptions: SectorAssumption;
  finance: {
    loanAmount: number;
    subsidy: number;
    promoterContribution: number;
    interestRate: number;
    loanTenureYears: number;
    projectionYears: number;
    firstYearTurnover: number;
    displayUnit: string;
  };
  existingGoldLoan?: {
    outstandingAmount: number;
    interestRate: number;
    tenureYears: number;
  };
  existingTermLoan?: {
    outstandingAmount: number;
    interestRate: number;
    remainingRepaymentYears: number;
  };
};

export type ProjectionResult = {
  businessName: string;
  status: ProjectionStatus;
  notes: string[];
  loanAmount: number;
  projectCost: number;
  monthlyEmi: number;
  averageDscr: number;
  years: ProjectionYear[];
  monthlyTermLoanSchedule: LoanScheduleMonth[];
};

export type LoanScheduleMonth = {
  month: number;
  opening: number;
  emi: number;
  interest: number;
  principal: number;
  closing: number;
};

export type ProjectionYear = {
  year: number;
  sales: number;
  material: number;
  wages: number;
  powerFuel: number;
  overheads: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  termLoanInterest: number;
  termLoanPrincipal: number;
  termLoanClosing: number;
  goldLoanInterest: number;
  goldLoanPrincipal: number;
  goldLoanClosing: number;
  existingLoanInterest: number;
  existingLoanPrincipal: number;
  existingLoanClosing: number;
  pbt: number;
  pat: number;
  netWorth: number;
  fixedAssets: number;
  creditors: number;
  inventory: number;
  debtors: number;
  cash: number;
  totalEquityAndLiabilities: number;
  totalAssets: number;
  balanceCheck: number;
  cashFromOperations: number;
  netCashFlow: number;
  closingCash: number;
  dscr: number;
  iscr: number;
  currentRatio: number;
  debtEquityRatio: number;
  breakEvenPct: number;
  marginOfSafetyPct: number;
};
