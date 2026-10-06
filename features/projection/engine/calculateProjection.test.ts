import { describe, expect, it } from "vitest";

import { DEFAULT_SECTOR_ASSUMPTIONS } from "@/features/projection/engine/assumptions";
import { calculateProjection } from "@/features/projection/engine/calculateProjection";
import { getSectorDefaults } from "@/features/projection/engine/assumptions";
import type { ProjectionInput } from "@/features/projection/types";

function makeInput(overrides: Partial<ProjectionInput["finance"]> = {}): ProjectionInput {
  return {
    businessName: "Test Works",
    applicantName: "A. Applicant",
    pan: "",
    designation: "Proprietor",
    fathersName: "",
    placeOfBusiness: "Pune",
    natureOfProject: "Manufacturing",
    sector: "Manufacturing - General/Light",
    assumptions: getSectorDefaults("Manufacturing - General/Light"),
    finance: {
      loanAmount: 1200,
      subsidy: 0,
      promoterContribution: 100,
      interestRate: 0,
      loanTenureYears: 1,
      projectionYears: 1,
      firstYearTurnover: 10000,
      displayUnit: "Rupees",
      ...overrides,
    },
  };
}

describe("calculateProjection", () => {
  it("restores the full 38-sector legacy assumption library", () => {
    expect(Object.keys(DEFAULT_SECTOR_ASSUMPTIONS)).toHaveLength(38);
  });

  it("calculates a zero-interest monthly amortization without division errors", () => {
    const result = calculateProjection(makeInput());

    expect(result.monthlyEmi).toBe(100);
    expect(result.years[0].termLoanPrincipal).toBeCloseTo(1200);
    expect(result.years[0].termLoanInterest).toBe(0);
    expect(result.years[0].termLoanClosing).toBe(0);
  });

  it("builds the entire loan annexure and balances the projected statement", () => {
    const result = calculateProjection(makeInput({ loanTenureYears: 5, projectionYears: 1 }));

    expect(result.monthlyTermLoanSchedule).toHaveLength(60);
    expect(result.years[0].totalAssets).toBeCloseTo(result.years[0].totalEquityAndLiabilities);
    expect(result.years[0].balanceCheck).toBeCloseTo(0);
  });

  it("uses one fixed annual installment for the existing term-loan schedule", () => {
    const input = makeInput({ projectionYears: 2 });
    input.existingTermLoan = {
      outstandingAmount: 1000,
      interestRate: 0.1,
      remainingRepaymentYears: 2.4,
    };
    const [firstYear, secondYear] = calculateProjection(input).years;

    expect(firstYear.existingLoanInterest).toBeCloseTo(100);
    expect(firstYear.existingLoanPrincipal).toBeCloseTo(476.190476, 4);
    expect(secondYear.existingLoanInterest).toBeCloseTo(52.380952, 4);
    expect(secondYear.existingLoanPrincipal).toBeCloseTo(523.809524, 4);
  });

  it("repays a gold loan as interest-only with bullet principal at maturity", () => {
    const input = makeInput({ projectionYears: 2 });
    input.existingGoldLoan = { outstandingAmount: 500, interestRate: 0.12, tenureYears: 1.6 };
    const [firstYear, secondYear] = calculateProjection(input).years;

    expect(firstYear.goldLoanInterest).toBe(60);
    expect(firstYear.goldLoanPrincipal).toBe(0);
    expect(firstYear.goldLoanClosing).toBe(500);
    expect(secondYear.goldLoanInterest).toBe(60);
    expect(secondYear.goldLoanPrincipal).toBe(500);
    expect(secondYear.goldLoanClosing).toBe(0);
  });
});
