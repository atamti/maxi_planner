import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "../../config/defaults";
import { CalculationResults, FormDataSubset } from "../../types";
import { FinalYearCard } from "./FinalYearCard";

describe("FinalYearCard", () => {
  const mockFormData: FormDataSubset = {
    timeHorizon: 20,
    activationYear: 10,
    exchangeRate: 100000,
    btcStack: 5,
    startingExpenses: 50000,
    priceCrash: DEFAULT_FORM_DATA.priceCrash,
    speculationPct: DEFAULT_FORM_DATA.speculationPct,
    collateralPct: DEFAULT_FORM_DATA.collateralPct,
    ltvRatio: DEFAULT_FORM_DATA.ltvRatio,
    loanRate: DEFAULT_FORM_DATA.loanRate,
    loanTermYears: DEFAULT_FORM_DATA.loanTermYears,
    interestOnly: DEFAULT_FORM_DATA.interestOnly,
    investmentsStartYield: DEFAULT_FORM_DATA.investmentsStartYield,
    investmentsEndYield: DEFAULT_FORM_DATA.investmentsEndYield,
    speculationStartYield: DEFAULT_FORM_DATA.speculationStartYield,
    speculationEndYield: DEFAULT_FORM_DATA.speculationEndYield,
    btcPriceCustomRates: DEFAULT_FORM_DATA.btcPriceCustomRates,
    inflationCustomRates: DEFAULT_FORM_DATA.inflationCustomRates,
    incomeCustomRates: DEFAULT_FORM_DATA.incomeCustomRates,
    savingsPct: DEFAULT_FORM_DATA.savingsPct,
    investmentsPct: DEFAULT_FORM_DATA.investmentsPct,
    incomeAllocationPct: DEFAULT_FORM_DATA.incomeAllocationPct,
    enableAnnualReallocation: false,
  };

  const mockResults: CalculationResults = {
    results: [],
    usdIncome: Array(21)
      .fill(0)
      .map((_, i) => i * 1000), // Growing income
    usdIncomeWithLeverage: Array(21)
      .fill(0)
      .map((_, i) => i * 1500), // Higher leveraged income
    btcIncome: Array(21)
      .fill(0)
      .map((_, i) => i * 0.1), // Growing BTC income
    annualExpenses: Array(21)
      .fill(0)
      .map((_, i) => 50000 + i * 2000), // Growing expenses
    incomeAtActivationYears: [],
    incomeAtActivationYearsWithLeverage: [],
    expensesAtActivationYears: [],
    loanPrincipal: 100000,
    loanInterest: 7000,
    btcAppreciationAverage: 45.7,
  };

  it("should render final year analysis title", () => {
    render(<FinalYearCard results={mockResults} formData={mockFormData} />);

    expect(screen.getByText(/year 20 analysis/i)).toBeInTheDocument();
  });

  it("should display final year income in USD", () => {
    render(<FinalYearCard results={mockResults} formData={mockFormData} />);

    // Final year income should be 20 * 1000 = $20,000
    expect(screen.getByText("$20,000")).toBeInTheDocument();
  });

  it("should display final year BTC income", () => {
    render(<FinalYearCard results={mockResults} formData={mockFormData} />);

    // Final year BTC income should be 20 * 0.1 = 2.000 BTC
    expect(screen.getByText("2.000 BTC")).toBeInTheDocument();
  });

  it("should display final year expenses", () => {
    render(<FinalYearCard results={mockResults} formData={mockFormData} />);

    // Final year expenses should be 50000 + 20 * 2000 = $90,000
    expect(screen.getByText("$90,000")).toBeInTheDocument();
  });

  it("should calculate and display cashflow without leverage", () => {
    render(<FinalYearCard results={mockResults} formData={mockFormData} />);

    // Cashflow = income - expenses = 20,000 - 90,000 = -70,000 (negative)
    expect(screen.getByText("($70,000)")).toBeInTheDocument();
  });

  it("should calculate and display cashflow with leverage", () => {
    render(<FinalYearCard results={mockResults} formData={mockFormData} />);

    // Leveraged cashflow = leveraged income - expenses = 30,000 - 90,000 = -60,000 (negative)
    expect(screen.getByText("($60,000)")).toBeInTheDocument();
  });

  it("should format negative cashflows in red with parentheses", () => {
    render(<FinalYearCard results={mockResults} formData={mockFormData} />);

    const negativeCashflow = screen.getByText("($70,000)");
    expect(negativeCashflow).toHaveClass("text-red-600");
  });

  it("should format positive cashflows normally", () => {
    const positiveResults: CalculationResults = {
      ...mockResults,
      usdIncome: Array(21).fill(100000), // High income
      usdIncomeWithLeverage: Array(21).fill(150000),
      annualExpenses: Array(21).fill(50000), // Lower expenses
    };

    render(<FinalYearCard results={positiveResults} formData={mockFormData} />);

    // Should show positive cashflow without parentheses
    const baseElement = screen.getByText("Base:").parentElement;
    expect(baseElement).toHaveTextContent("$50,000");
    expect(screen.queryByText("($50,000)")).not.toBeInTheDocument();
  });

  it("should handle empty arrays gracefully", () => {
    const emptyResults: CalculationResults = {
      results: [],
      usdIncome: [0], // Provide at least one value
      usdIncomeWithLeverage: [0],
      btcIncome: [0],
      annualExpenses: [0],
      incomeAtActivationYears: [],
      incomeAtActivationYearsWithLeverage: [],
      expensesAtActivationYears: [],
      loanPrincipal: 0,
      loanInterest: 0,
      btcAppreciationAverage: 0,
    };

    const customFormData = { ...mockFormData, timeHorizon: 1 };

    render(<FinalYearCard results={emptyResults} formData={customFormData} />);

    // Should display multiple $0 values for all zero inputs
    const zeroElements = screen.getAllByText("$0");
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it("should display correct time horizon in title", () => {
    const customFormData = { ...mockFormData, timeHorizon: 15 };

    render(<FinalYearCard results={mockResults} formData={customFormData} />);

    expect(screen.getByText(/year 15 analysis/i)).toBeInTheDocument();
  });

  it("should handle single value arrays", () => {
    const singleValueResults: CalculationResults = {
      ...mockResults,
      usdIncome: [5000],
      usdIncomeWithLeverage: [7500],
      btcIncome: [0.05],
      annualExpenses: [60000],
    };

    render(
      <FinalYearCard results={singleValueResults} formData={mockFormData} />,
    );

    expect(screen.getByText("$5,000")).toBeInTheDocument();
    expect(screen.getByText("0.050 BTC")).toBeInTheDocument();
    expect(screen.getByText("$60,000")).toBeInTheDocument();
  });

  it("should correctly calculate cashflow difference between leveraged and non-leveraged", () => {
    const testResults: CalculationResults = {
      ...mockResults,
      usdIncome: [80000], // $80k income
      usdIncomeWithLeverage: [120000], // $120k leveraged income
      annualExpenses: [60000], // $60k expenses
    };

    render(<FinalYearCard results={testResults} formData={mockFormData} />);

    // Non-leveraged: 80k - 60k = $20k
    const baseCashflow = screen.getByText("Base:").parentElement;
    expect(baseCashflow).toHaveTextContent("$20,000");

    // Leveraged: 120k - 60k = $60k
    const leveragedCashflow = screen.getByText("Leveraged:").parentElement;
    expect(leveragedCashflow).toHaveTextContent("$60,000");
  });
});
