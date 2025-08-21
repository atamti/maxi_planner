import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { render } from "../../test/testUtils";
import { FormDataSubset } from "../../types";
import { AllocationEvolutionChart } from "./AllocationEvolutionChart";

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Bar: ({ data, options }: any) => (
    <div data-testid="allocation-evolution-chart">
      <div data-testid="chart-title">{options?.plugins?.title?.text}</div>
      <div data-testid="chart-datasets-count">
        {data?.datasets?.length || 0}
      </div>
      <div data-testid="chart-labels-count">{data?.labels?.length || 0}</div>
      {data?.datasets?.map((dataset: any, index: number) => (
        <div key={index} data-testid={`dataset-${index}`}>
          <span data-testid={`dataset-${index}-label`}>{dataset.label}</span>
          <span data-testid={`dataset-${index}-data-length`}>
            {dataset.data?.length || 0}
          </span>
          <span data-testid={`dataset-${index}-first-value`}>
            {dataset.data?.[0] || 0}
          </span>
        </div>
      ))}
    </div>
  ),
}));

const createMockFormData = (
  overrides: Partial<FormDataSubset> = {},
): FormDataSubset => ({
  timeHorizon: 10,
  exchangeRate: 65000,
  priceCrash: 80,
  speculationPct: 25,
  collateralPct: 60,
  ltvRatio: 50,
  loanRate: 8,
  loanTermYears: 10,
  interestOnly: false,
  investmentsStartYield: 15,
  investmentsEndYield: 8,
  speculationStartYield: 25,
  speculationEndYield: 12,
  activationYear: 5,
  btcPriceCustomRates: Array(11).fill(20),
  inflationCustomRates: Array(11).fill(3),
  incomeCustomRates: Array(11).fill(5),
  startingExpenses: 50000,
  savingsPct: 50,
  investmentsPct: 30,
  btcStack: 10,
  incomeAllocationPct: 25,
  enableAnnualReallocation: true,
  ...overrides,
});

describe("AllocationEvolutionChart", () => {
  it("should render the chart with correct title", () => {
    const formData = createMockFormData();
    render(<AllocationEvolutionChart formData={formData} />);

    expect(
      screen.getByText("📊 BTC ALLOCATION EVOLUTION OVER TIME"),
    ).toBeInTheDocument();
  });

  it("should display three datasets for savings, investments, and speculation", () => {
    const formData = createMockFormData();
    render(<AllocationEvolutionChart formData={formData} />);

    expect(screen.getByTestId("chart-datasets-count")).toHaveTextContent("3");
    expect(screen.getByTestId("dataset-0-label")).toHaveTextContent("Savings");
    expect(screen.getByTestId("dataset-1-label")).toHaveTextContent(
      "Investments",
    );
    expect(screen.getByTestId("dataset-2-label")).toHaveTextContent(
      "Speculation",
    );
  });

  it("should calculate correct initial allocation values with full stack", () => {
    const formData = createMockFormData({
      btcStack: 10,
      savingsPct: 50,
      investmentsPct: 30,
      speculationPct: 20,
    });
    render(<AllocationEvolutionChart formData={formData} />);

    // Uses full stack for allocation (income allocation happens at activation, not allocation planning)
    // Initial savings: 10 * 0.5 = 5
    expect(screen.getByTestId("dataset-0-first-value")).toHaveTextContent("5");
    // Initial investments: 10 * 0.3 = 3
    expect(screen.getByTestId("dataset-1-first-value")).toHaveTextContent("3");
    // Initial speculation: 10 * 0.2 = 2
    expect(screen.getByTestId("dataset-2-first-value")).toHaveTextContent("2");
  });

  it("should calculate correct initial allocation values with zero income allocation", () => {
    const formData = createMockFormData({
      btcStack: 10,
      savingsPct: 50,
      investmentsPct: 30,
      speculationPct: 20,
      incomeAllocationPct: 0, // No income allocation
    });
    render(<AllocationEvolutionChart formData={formData} />);

    // Full stack available for allocation: 10 BTC
    // Initial savings: 10 * 0.5 = 5
    expect(screen.getByTestId("dataset-0-first-value")).toHaveTextContent("5");
    // Initial investments: 10 * 0.3 = 3
    expect(screen.getByTestId("dataset-1-first-value")).toHaveTextContent("3");
    // Initial speculation: 10 * 0.2 = 2
    expect(screen.getByTestId("dataset-2-first-value")).toHaveTextContent("2");
  });

  it("should generate correct number of data points based on time horizon", () => {
    const formData = createMockFormData({ timeHorizon: 5 });
    render(<AllocationEvolutionChart formData={formData} />);

    // Should have 6 labels (years 0-5)
    expect(screen.getByTestId("chart-labels-count")).toHaveTextContent("6");
    // Each dataset should have 6 data points
    expect(screen.getByTestId("dataset-0-data-length")).toHaveTextContent("6");
    expect(screen.getByTestId("dataset-1-data-length")).toHaveTextContent("6");
    expect(screen.getByTestId("dataset-2-data-length")).toHaveTextContent("6");
  });

  it("should handle edge case with zero time horizon", () => {
    const formData = createMockFormData({ timeHorizon: 0 });
    render(<AllocationEvolutionChart formData={formData} />);

    // Should have 1 label (year 0 only)
    expect(screen.getByTestId("chart-labels-count")).toHaveTextContent("1");
    // Each dataset should have 1 data point
    expect(screen.getByTestId("dataset-0-data-length")).toHaveTextContent("1");
  });

  it("should apply custom className", () => {
    const formData = createMockFormData();
    render(
      <AllocationEvolutionChart formData={formData} className="custom-class" />,
    );

    const container = screen
      .getByTestId("allocation-evolution-chart")
      .closest(".custom-class");
    expect(container).toBeInTheDocument();
  });
});
