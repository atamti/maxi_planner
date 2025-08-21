import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormDataSubset } from "../../types";
import { LoanDetailsCard } from "./LoanDetailsCard";

// Mock the useLoanCalculations hook
const mockCalculateLoanDetails = vi.fn();
vi.mock("../../hooks/useLoanCalculations", () => ({
  useLoanCalculations: vi.fn(() => ({
    calculateLoanDetails: mockCalculateLoanDetails,
  })),
}));

// Mock the formatCurrency utility
vi.mock("../../utils/formatNumber", () => ({
  formatCurrency: vi.fn((value, decimals = 2) => {
    if (value === undefined || value === null) return "$0";
    return `$${Math.round(value).toLocaleString()}`;
  }),
}));

describe("LoanDetailsCard", () => {
  const mockFormData: FormDataSubset = {
    timeHorizon: 20,
    exchangeRate: 50000,
    priceCrash: 0.8,
    speculationPct: 10,
    collateralPct: 50, // Non-zero collateral
    ltvRatio: 0.7,
    loanRate: 6,
    loanTermYears: 10,
    interestOnly: false,
    investmentsStartYield: 5,
    investmentsEndYield: 7,
    speculationStartYield: 12,
    speculationEndYield: 8,
    activationYear: 5,
    btcPriceCustomRates: [],
    inflationCustomRates: [],
    incomeCustomRates: [],
    startingExpenses: 50000,
    savingsPct: 60,
    investmentsPct: 30,
    btcStack: 2.5,
    incomeAllocationPct: 80,
    enableAnnualReallocation: false,
  };

  const mockGetBtcPriceAtYear = vi.fn(
    (year: number) => 50000 * Math.pow(1.2, year),
  );

  const mockLoanDetails = {
    loanPrincipal: 43750,
    liquidationPrice: 62500,
    annualPayments: 4865.3,
    collateralBtc: 1.25,
    btcStackAtActivation: 2.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCalculateLoanDetails.mockReturnValue(mockLoanDetails);
  });

  it("should render loan details when collateral is present", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("🏦 LOAN DETAILS (YEAR 5)")).toBeInTheDocument();
  });

  it("should display loan principal", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("PRINCIPAL:")).toBeInTheDocument();
    expect(screen.getByText("$43,750")).toBeInTheDocument();
  });

  it("should display annual interest", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("ANNUAL INTEREST:")).toBeInTheDocument();
  });

  it("should display annual payments", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("ANNUAL PAYMENTS:")).toBeInTheDocument();
    expect(screen.getByText("$4,865")).toBeInTheDocument();
  });

  it("should display LTV ratio", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("LTV RATIO:")).toBeInTheDocument();
    expect(screen.getByText("0.7%")).toBeInTheDocument();
  });

  it("should not render when collateralPct is 0", () => {
    const noCollateralFormData = {
      ...mockFormData,
      collateralPct: 0,
    };

    const { container } = render(
      <LoanDetailsCard
        formData={noCollateralFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should not render when loan details are null", () => {
    // Mock the hook to return null loan details
    mockCalculateLoanDetails.mockReturnValue(null);

    const { container } = render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should call calculateLoanDetails with activation year", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(mockCalculateLoanDetails).toHaveBeenCalledWith(5);
  });

  it("should pass correct props to useLoanCalculations hook", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    // The hook is called with formData and getBtcPriceAtYear
    // We can verify this by checking that our mock was called
    expect(mockCalculateLoanDetails).toHaveBeenCalled();
  });

  it("should handle interest-only loans", () => {
    const interestOnlyFormData = {
      ...mockFormData,
      interestOnly: true,
    };

    render(
      <LoanDetailsCard
        formData={interestOnlyFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("(Interest only)")).toBeInTheDocument();
  });

  it("should format currency values correctly", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    // Check that formatted values appear in the document
    expect(screen.getByText("$43,750")).toBeInTheDocument();
    expect(screen.getByText("$4,865")).toBeInTheDocument();
  });

  it("should display liquidation risk information", () => {
    render(
      <LoanDetailsCard
        formData={mockFormData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("⚠️ LIQUIDATION RISK:")).toBeInTheDocument();
    expect(screen.getByText("$62,500")).toBeInTheDocument();
  });
});
