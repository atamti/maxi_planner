import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../../config/defaults";
import { FormData } from "../../types";
import { ExpensesInflationChart } from "./ExpensesInflationChart";

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(({ data, options, ...props }) => (
    <div data-testid="line-chart" {...props}>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
}));

describe("ExpensesInflationChart", () => {
  const defaultFormData: FormData = {
    ...DEFAULT_FORM_DATA,
    timeHorizon: 10,
    activationYear: 5,
    startingExpenses: 50000,
    inflationCustomRates: [3, 3, 4, 4, 5, 5, 6, 6, 7, 7], // 10 years of inflation rates
  };

  describe("Rendering", () => {
    it("should render Line chart component", () => {
      render(<ExpensesInflationChart formData={defaultFormData} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();
    });

    it("should render chart with data and options", () => {
      render(<ExpensesInflationChart formData={defaultFormData} />);

      const chartData = screen.getByTestId("chart-data");
      const chartOptions = screen.getByTestId("chart-options");

      expect(chartData).toBeInTheDocument();
      expect(chartOptions).toBeInTheDocument();
    });
  });

  describe("Expense Calculations", () => {
    it("should calculate expenses correctly with inflation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        startingExpenses: 100000,
        inflationCustomRates: [10, 20, 30], // 10%, 20%, 30% inflation
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $100,000
      // Year 1: $100,000 * 1.10 = $110,000
      // Year 2: $110,000 * 1.20 = $132,000
      // Year 3: $132,000 * 1.30 = $171,600
      const expectedValues = [100000, 110000, 132000, 171600];

      // Use toBeCloseTo for floating point comparison
      const actualValues = chartData.datasets[0].data;
      expect(actualValues).toHaveLength(expectedValues.length);
      expectedValues.forEach((expected, index) => {
        expect(actualValues[index]).toBeCloseTo(expected, 0);
      });
    });

    it("should handle zero inflation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        startingExpenses: 50000,
        inflationCustomRates: [0, 0, 0], // No inflation
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // With 0% inflation, expenses should remain the same
      const expectedValues = [50000, 50000, 50000, 50000];

      expect(chartData.datasets[0].data).toEqual(expectedValues);
    });

    it("should use default starting expenses when not provided", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        inflationCustomRates: [5, 5], // 5% inflation
      };

      // Remove startingExpenses to test default behavior
      delete (formData as any).startingExpenses;

      render(<ExpensesInflationChart formData={formData as FormData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should use default $50,000 starting expenses
      // Year 0: $50,000
      // Year 1: $50,000 * 1.05 = $52,500
      // Year 2: $52,500 * 1.05 = $55,125
      const expectedValues = [50000, 52500, 55125];

      expect(chartData.datasets[0].data).toEqual(expectedValues);
    });

    it("should handle missing inflation rates by using 0", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 5,
        startingExpenses: 40000,
        inflationCustomRates: [2, 3], // Only 2 rates, but timeHorizon is 5
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $40,000
      // Year 1: $40,000 * 1.02 = $40,800
      // Year 2: $40,800 * 1.03 = $42,024
      // Year 3: $42,024 * 1.00 = $42,024 (missing rate = 0%)
      // Year 4: $42,024 * 1.00 = $42,024
      // Year 5: $42,024 * 1.00 = $42,024
      const expectedValues = [40000, 40800, 42024, 42024, 42024, 42024];

      expect(chartData.datasets[0].data).toEqual(expectedValues);
    });
  });

  describe("Chart Configuration", () => {
    it("should generate correct labels for timeHorizon", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 4,
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const expectedLabels = ["Year 0", "Year 1", "Year 2", "Year 3", "Year 4"];
      expect(chartData.labels).toEqual(expectedLabels);
    });

    it("should configure chart dataset with correct properties", () => {
      render(<ExpensesInflationChart formData={defaultFormData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const dataset = chartData.datasets[0];
      expect(dataset.label).toBe("Annual Expenses (USD)");
      expect(dataset.borderColor).toBe("#DC2626");
      expect(dataset.backgroundColor).toBe("rgba(220, 38, 38, 0.1)");
      expect(dataset.fill).toBe(true);
      expect(dataset.tension).toBe(0.4);
    });

    it("should highlight activation year point in chart", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 5,
        activationYear: 3,
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const dataset = chartData.datasets[0];

      // Activation year (index 3) should have special highlighting
      expect(dataset.pointBackgroundColor[3]).toBe("#F59E0B");
      expect(dataset.pointBorderColor[3]).toBe("#F59E0B");
      expect(dataset.pointRadius[3]).toBe(6);

      // Other years should have default styling
      expect(dataset.pointBackgroundColor[0]).toBe("#DC2626");
      expect(dataset.pointBorderColor[0]).toBe("#DC2626");
      expect(dataset.pointRadius[0]).toBe(3);
    });
  });

  describe("Chart Options", () => {
    it("should configure chart options correctly", () => {
      render(<ExpensesInflationChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.maintainAspectRatio).toBe(false);
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.scales.y.beginAtZero).toBe(true);
      expect(chartOptions.scales.y.title.display).toBe(true);
      expect(chartOptions.scales.y.title.text).toBe("Annual Expenses (USD)");
      expect(chartOptions.scales.x.title.display).toBe(true);
      expect(chartOptions.scales.x.title.text).toBe("Years");
    });

    it("should configure plugins correctly", () => {
      render(<ExpensesInflationChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.plugins.title.display).toBe(true);
      expect(chartOptions.plugins.title.text).toBe(
        "Projected Annual Expenses Growth",
      );
      expect(chartOptions.plugins.legend.position).toBe("bottom");
    });
  });

  describe("Format Functions", () => {
    it("should include tick configuration for y-axis", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        startingExpenses: 1500000, // $1.5M
        inflationCustomRates: [0],
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tick configuration exists (function will be lost in JSON serialization)
      expect(chartOptions.scales.y.ticks).toBeDefined();
    });

    it("should include tick configuration for values over 1K", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        startingExpenses: 75000, // $75K
        inflationCustomRates: [0],
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tick configuration exists
      expect(chartOptions.scales.y.ticks).toBeDefined();
    });

    it("should include tick configuration for values under 1K", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        startingExpenses: 500, // $500
        inflationCustomRates: [0],
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tick configuration exists
      expect(chartOptions.scales.y.ticks).toBeDefined();
    });
  });

  describe("Tooltip Configuration", () => {
    it("should configure tooltip callbacks structure", () => {
      render(<ExpensesInflationChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tooltip configuration structure exists (functions are lost in JSON serialization)
      expect(chartOptions.plugins.tooltip).toBeDefined();
      expect(chartOptions.plugins.tooltip.callbacks).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle timeHorizon of 0", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 0,
        startingExpenses: 30000,
        inflationCustomRates: [],
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should have only the starting year
      expect(chartData.datasets[0].data).toEqual([30000]);
      expect(chartData.labels).toEqual(["Year 0"]);
    });

    it("should handle very high inflation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        startingExpenses: 10000,
        inflationCustomRates: [100, 200], // 100%, 200% inflation
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $10,000
      // Year 1: $10,000 * 2.00 = $20,000
      // Year 2: $20,000 * 3.00 = $60,000
      const expectedValues = [10000, 20000, 60000];

      expect(chartData.datasets[0].data).toEqual(expectedValues);
    });

    it("should handle negative inflation rates (deflation)", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        startingExpenses: 100000,
        inflationCustomRates: [-10, -5], // -10%, -5% deflation
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $100,000
      // Year 1: $100,000 * 0.90 = $90,000
      // Year 2: $90,000 * 0.95 = $85,500
      const expectedValues = [100000, 90000, 85500];

      expect(chartData.datasets[0].data).toEqual(expectedValues);
    });

    it("should handle activation year at the beginning", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        activationYear: 0,
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const dataset = chartData.datasets[0];

      // First year (index 0) should be highlighted
      expect(dataset.pointBackgroundColor[0]).toBe("#F59E0B");
      expect(dataset.pointRadius[0]).toBe(6);
    });

    it("should handle activation year at the end", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        activationYear: 3,
      };

      render(<ExpensesInflationChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const dataset = chartData.datasets[0];

      // Last year (index 3) should be highlighted
      expect(dataset.pointBackgroundColor[3]).toBe("#F59E0B");
      expect(dataset.pointRadius[3]).toBe(6);
    });
  });

  describe("Integration", () => {
    it("should work with realistic form data", () => {
      const realisticFormData = {
        ...defaultFormData,
        timeHorizon: 20,
        activationYear: 10,
        startingExpenses: 80000,
        inflationCustomRates: Array(20)
          .fill(0)
          .map((_, i) => 2 + i * 0.1), // 2% to 4% inflation
      };

      render(<ExpensesInflationChart formData={realisticFormData} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should have 21 data points (years 0-20)
      expect(chartData.datasets[0].data).toHaveLength(21);
      expect(chartData.labels).toHaveLength(21);

      // Activation year should be highlighted
      expect(chartData.datasets[0].pointBackgroundColor[10]).toBe("#F59E0B");
    });
  });
});
