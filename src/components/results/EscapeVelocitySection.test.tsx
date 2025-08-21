import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CalculationResults, FormDataSubset } from "../../types";
import { EscapeVelocitySection } from "./EscapeVelocitySection";

const createMockResults = (
  overrides: Partial<CalculationResults> = {},
): CalculationResults => ({
  results: [],
  usdIncome: [],
  usdIncomeWithLeverage: [],
  btcIncome: [],
  annualExpenses: [],
  incomeAtActivationYears: [],
  incomeAtActivationYearsWithLeverage: [],
  expensesAtActivationYears: [],
  loanPrincipal: 0,
  loanInterest: 0,
  btcAppreciationAverage: 0,
  ...overrides,
});

const createMockFormData = (
  overrides: Partial<FormDataSubset> = {},
): FormDataSubset => ({
  timeHorizon: 20,
  exchangeRate: 100000,
  priceCrash: 0,
  speculationPct: 10,
  collateralPct: 50,
  ltvRatio: 40,
  loanRate: 7,
  loanTermYears: 10,
  interestOnly: true,
  investmentsStartYield: 30,
  investmentsEndYield: 0,
  speculationStartYield: 40,
  speculationEndYield: 0,
  activationYear: 10,
  btcPriceCustomRates: Array(30).fill(50),
  inflationCustomRates: Array(30).fill(8),
  incomeCustomRates: Array(30).fill(8),
  startingExpenses: 50000,
  savingsPct: 65,
  investmentsPct: 25,
  btcStack: 5,
  incomeAllocationPct: 10,
  enableAnnualReallocation: false,
  ...overrides,
});

describe("EscapeVelocitySection", () => {
  const mockGetBtcPriceAtYear = (year: number) => 100000 * Math.pow(1.2, year);

  it("should render the main title and description", () => {
    const results = createMockResults();
    const formData = createMockFormData();

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("🚀 ESCAPE VELOCITY ANALYSIS")).toBeInTheDocument();
    expect(
      screen.getByText("When income exceeds expenses by activation year:"),
    ).toBeInTheDocument();
  });

  it("should show base scenario section", () => {
    const results = createMockResults();
    const formData = createMockFormData();

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("Base Scenario:")).toBeInTheDocument();
    expect(
      screen.getByText("When unleveraged income first exceeds expenses"),
    ).toBeInTheDocument();
  });

  it("should show leveraged scenario when collateral is used", () => {
    const results = createMockResults();
    const formData = createMockFormData({ collateralPct: 50 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("Leveraged Scenario:")).toBeInTheDocument();
    expect(
      screen.getByText(
        "When leveraged income (after debt service) exceeds expenses",
      ),
    ).toBeInTheDocument();
  });

  it("should not show leveraged scenario when no collateral is used", () => {
    const results = createMockResults();
    const formData = createMockFormData({ collateralPct: 0 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.queryByText("Leveraged Scenario:")).not.toBeInTheDocument();
  });

  it("should calculate and display escape velocity - base scenario achieved", () => {
    // Create arrays where index 3 has income > expenses
    const incomeArray = new Array(21).fill(50000);
    incomeArray[3] = 120000; // Year 3 income exceeds expenses
    incomeArray[4] = 150000;

    const expensesArray = new Array(21).fill(75000);

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ collateralPct: 0 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("Year 3")).toBeInTheDocument();
  });

  it('should show "Never reached" when escape velocity is not achieved', () => {
    // Create arrays where expenses always exceed income
    const incomeArray = new Array(21).fill(50000);
    const expensesArray = new Array(21).fill(80000);

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ collateralPct: 0 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("Never reached")).toBeInTheDocument();
  });

  it("should calculate escape velocity for both base and leveraged scenarios", () => {
    // Base scenario achieves at year 2, leveraged at year 1
    const incomeArray = new Array(21).fill(50000);
    incomeArray[2] = 80000; // Base achieves at year 2

    const leveragedIncomeArray = new Array(21).fill(50000);
    leveragedIncomeArray[1] = 90000; // Leveraged achieves at year 1

    const expensesArray = new Array(21).fill(75000);

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      incomeAtActivationYearsWithLeverage: leveragedIncomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ collateralPct: 50 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    // Should show both years
    const yearElements = screen.getAllByText(/Year \d+/);
    expect(yearElements).toHaveLength(2);
  });

  it("should show leverage advantage when leveraged scenario is better", () => {
    // Base achieves at year 3, leveraged at year 1
    const incomeArray = new Array(21).fill(50000);
    incomeArray[3] = 85000; // Base achieves at year 3

    const leveragedIncomeArray = new Array(21).fill(50000);
    leveragedIncomeArray[1] = 90000; // Leveraged achieves at year 1

    const expensesArray = new Array(21).fill(80000);

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      incomeAtActivationYearsWithLeverage: leveragedIncomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ collateralPct: 50 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(
      screen.getByText(/Leverage achieves escape velocity 2 year\(s\) earlier/),
    ).toBeInTheDocument();
  });

  it("should show base scenario advantage when base is better", () => {
    // Base achieves at year 1, leveraged at year 3
    const incomeArray = new Array(21).fill(50000);
    incomeArray[1] = 90000; // Base achieves at year 1

    const leveragedIncomeArray = new Array(21).fill(50000);
    leveragedIncomeArray[3] = 85000; // Leveraged achieves at year 3

    const expensesArray = new Array(21).fill(80000);

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      incomeAtActivationYearsWithLeverage: leveragedIncomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ collateralPct: 50 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(
      screen.getByText(
        /Base scenario achieves escape velocity 2 year\(s\) earlier/,
      ),
    ).toBeInTheDocument();
  });

  it("should show same year achievement when both scenarios achieve at same time", () => {
    // Both achieve at year 2
    const incomeArray = new Array(21).fill(50000);
    incomeArray[2] = 85000; // Both achieve at year 2

    const leveragedIncomeArray = new Array(21).fill(50000);
    leveragedIncomeArray[2] = 90000; // Both achieve at year 2

    const expensesArray = new Array(21).fill(80000);

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      incomeAtActivationYearsWithLeverage: leveragedIncomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ collateralPct: 50 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(
      screen.getByText(
        /Both scenarios achieve escape velocity in the same year/,
      ),
    ).toBeInTheDocument();
  });

  it("should handle edge case with no income data", () => {
    const results = createMockResults({
      incomeAtActivationYears: [],
      incomeAtActivationYearsWithLeverage: [],
      expensesAtActivationYears: [],
    });
    const formData = createMockFormData();

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getAllByText("Never reached")).toHaveLength(2);
  });

  it("should handle edge case with zero expenses", () => {
    // Any income > 0 should achieve escape velocity immediately when expenses are 0
    const incomeArray = new Array(21).fill(0);
    incomeArray[0] = 1000; // Year 0 has income

    const leveragedIncomeArray = new Array(21).fill(0);
    leveragedIncomeArray[0] = 1500; // Year 0 has leveraged income

    const expensesArray = new Array(21).fill(0); // All expenses are 0

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      incomeAtActivationYearsWithLeverage: leveragedIncomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ collateralPct: 50 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getAllByText("Year 0")).toHaveLength(2);
  });

  it("should respect time horizon in calculations", () => {
    // Income exceeds expenses only beyond time horizon
    const incomeArray = new Array(11).fill(50000); // Only 11 elements for timeHorizon 10
    const expensesArray = new Array(11).fill(65000);

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ timeHorizon: 10, collateralPct: 0 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    // Should not find escape velocity within the time horizon
    expect(screen.getByText("Never reached")).toBeInTheDocument();
  });

  it("should handle mixed scenarios where only one achieves escape velocity", () => {
    // Base achieves escape velocity, leveraged doesn't
    const incomeArray = new Array(21).fill(50000);
    incomeArray[2] = 90000; // Base achieves at year 2

    const leveragedIncomeArray = new Array(21).fill(40000); // Never exceeds expenses

    const expensesArray = new Array(21).fill(75000);

    const results = createMockResults({
      incomeAtActivationYears: incomeArray,
      incomeAtActivationYearsWithLeverage: leveragedIncomeArray,
      expensesAtActivationYears: expensesArray,
    });
    const formData = createMockFormData({ collateralPct: 50 });

    render(
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={mockGetBtcPriceAtYear}
      />,
    );

    expect(screen.getByText("Year 2")).toBeInTheDocument();
    expect(screen.getByText("Never reached")).toBeInTheDocument();
  });
});
