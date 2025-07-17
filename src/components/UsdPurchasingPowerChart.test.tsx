import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { FormData } from "../types";
import { UsdPurchasingPowerChart } from "./UsdPurchasingPowerChart";

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Line: ({ data, options }: { data: any; options: any }) => (
    <div>
      <div data-testid="line-chart">Chart Component</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

describe("UsdPurchasingPowerChart", () => {
  const defaultFormData: FormData = {
    ...DEFAULT_FORM_DATA,
    timeHorizon: 5,
    inflationCustomRates: [3, 4, 5, 6, 7], // Progressive inflation rates
  };

  describe("Rendering", () => {
    it("should render Line chart component", () => {
      render(<UsdPurchasingPowerChart formData={defaultFormData} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();
    });

    it("should render chart with data and options", () => {
      render(<UsdPurchasingPowerChart formData={defaultFormData} />);

      const chartData = screen.getByTestId("chart-data");
      const chartOptions = screen.getByTestId("chart-options");

      expect(chartData).toBeInTheDocument();
      expect(chartOptions).toBeInTheDocument();
    });
  });

  describe("Purchasing Power Calculations", () => {
    it("should calculate purchasing power correctly with inflation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        inflationCustomRates: [10, 20, 30], // 10%, 20%, 30% inflation
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: 100%
      // Year 1: 100 / 1.10 = ~90.909%
      // Year 2: 90.909 / 1.20 = ~75.758%
      // Year 3: 75.758 / 1.30 = ~58.275%
      const expectedValues = [
        100, 90.909090909090908, 75.75757575757576, 58.27505827505828,
      ];

      const actualValues = chartData.datasets[0].data;
      expect(actualValues).toHaveLength(expectedValues.length);
      expectedValues.forEach((expected, index) => {
        expect(actualValues[index]).toBeCloseTo(expected, 2);
      });
    });

    it("should handle zero inflation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        inflationCustomRates: [0, 0, 0], // No inflation
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // With 0% inflation, purchasing power should remain at 100%
      const expectedValues = [100, 100, 100, 100];

      expect(chartData.datasets[0].data).toEqual(expectedValues);
    });

    it("should handle missing inflation rates by using 0", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 5,
        inflationCustomRates: [5, 10], // Only 2 rates, but timeHorizon is 5
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: 100%
      // Year 1: 100 / 1.05 = ~95.238%
      // Year 2: 95.238 / 1.10 = ~86.58%
      // Year 3: 86.58 / 1.00 = 86.58% (missing rate = 0%)
      // Year 4: 86.58 / 1.00 = 86.58%
      // Year 5: 86.58 / 1.00 = 86.58%
      const expectedValues = [
        100, 95.23809523809524, 86.58008658008658, 86.58008658008658,
        86.58008658008658, 86.58008658008658,
      ];

      const actualValues = chartData.datasets[0].data;
      expectedValues.forEach((expected, index) => {
        expect(actualValues[index]).toBeCloseTo(expected, 2);
      });
    });

    it("should handle very high inflation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        inflationCustomRates: [100, 200], // 100%, 200% inflation (hyperinflation)
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: 100%
      // Year 1: 100 / 2.00 = 50%
      // Year 2: 50 / 3.00 = ~16.667%
      const expectedValues = [100, 50, 16.666666666666668];

      const actualValues = chartData.datasets[0].data;
      expectedValues.forEach((expected, index) => {
        expect(actualValues[index]).toBeCloseTo(expected, 2);
      });
    });
  });

  describe("Chart Configuration", () => {
    it("should generate correct labels for timeHorizon", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        inflationCustomRates: [5, 5, 5],
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const expectedLabels = ["Year 0", "Year 1", "Year 2", "Year 3"];
      expect(chartData.labels).toEqual(expectedLabels);
    });

    it("should configure chart dataset with correct properties", () => {
      render(<UsdPurchasingPowerChart formData={defaultFormData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const dataset = chartData.datasets[0];
      expect(dataset.label).toBe("USD Purchasing Power");
      expect(dataset.borderColor).toBe("#DC2626");
      expect(dataset.backgroundColor).toBe("rgba(220, 38, 38, 0.1)");
      expect(dataset.fill).toBe(true);
      expect(dataset.tension).toBe(0.4);
    });
  });

  describe("Chart Options", () => {
    it("should configure chart options correctly", () => {
      render(<UsdPurchasingPowerChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.maintainAspectRatio).toBe(false);
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.scales.y.beginAtZero).toBe(true);
      expect(chartOptions.scales.y.max).toBe(100);
      expect(chartOptions.scales.y.title.display).toBe(true);
      expect(chartOptions.scales.y.title.text).toBe("Purchasing Power (%)");
      expect(chartOptions.scales.x.title.display).toBe(true);
      expect(chartOptions.scales.x.title.text).toBe("Years");
    });

    it("should configure plugins correctly", () => {
      render(<UsdPurchasingPowerChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.plugins.title.display).toBe(true);
      expect(chartOptions.plugins.title.text).toBe(
        "USD Purchasing Power Decay Over Time",
      );
      expect(chartOptions.plugins.legend.position).toBe("bottom");
    });

    it("should include tick configuration for y-axis", () => {
      render(<UsdPurchasingPowerChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tick configuration exists (function will be lost in JSON serialization)
      expect(chartOptions.scales.y.ticks).toBeDefined();
    });

    it("should include tooltip configuration", () => {
      render(<UsdPurchasingPowerChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.plugins.tooltip.callbacks).toBeDefined();
    });
  });

  describe("Purchasing Power Format Functions", () => {
    it("should handle high purchasing power values", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        inflationCustomRates: [0], // No inflation
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should maintain 100% purchasing power
      expect(chartData.datasets[0].data[0]).toBe(100);
      expect(chartData.datasets[0].data[1]).toBe(100);
    });

    it("should handle very low purchasing power values", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        inflationCustomRates: [900], // 900% inflation
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: 100%
      // Year 1: 100 / 10.00 = 10%
      expect(chartData.datasets[0].data[0]).toBe(100);
      expect(chartData.datasets[0].data[1]).toBe(10);
    });

    it("should handle decimal purchasing power values", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        inflationCustomRates: [12.5, 7.75], // Decimal inflation rates
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: 100%
      // Year 1: 100 / 1.125 = ~88.889%
      // Year 2: 88.889 / 1.0775 = ~82.491%
      const expectedValues = [100, 88.88888888888889, 82.49071882951654];

      const actualValues = chartData.datasets[0].data;
      expectedValues.forEach((expected, index) => {
        expect(actualValues[index]).toBeCloseTo(expected, 2);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle timeHorizon of 0", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 0,
        inflationCustomRates: [],
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should have only the starting value
      expect(chartData.datasets[0].data).toEqual([100]);
      expect(chartData.labels).toEqual(["Year 0"]);
    });

    it("should handle very small inflation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        inflationCustomRates: [0.1, 0.2], // 0.1%, 0.2% inflation
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: 100%
      // Year 1: 100 / 1.001 = ~99.9%
      // Year 2: 99.9 / 1.002 = ~99.7%
      const expectedValues = [100, 99.9000999000999, 99.70059880239521];

      const actualValues = chartData.datasets[0].data;
      expectedValues.forEach((expected, index) => {
        expect(actualValues[index]).toBeCloseTo(expected, 2);
      });
    });

    it("should handle negative inflation (deflation)", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        inflationCustomRates: [-5, -10], // -5%, -10% deflation
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: 100%
      // Year 1: 100 / 0.95 = ~105.263%
      // Year 2: 105.263 / 0.90 = ~116.959%
      const expectedValues = [100, 105.26315789473684, 116.95906432748538];

      const actualValues = chartData.datasets[0].data;
      expectedValues.forEach((expected, index) => {
        expect(actualValues[index]).toBeCloseTo(expected, 2);
      });
    });
  });

  describe("Integration", () => {
    it("should work with realistic form data", () => {
      const realisticFormData = {
        ...defaultFormData,
        timeHorizon: 20,
        inflationCustomRates: Array(20)
          .fill(0)
          .map((_, i) => 3 + i * 0.1), // 3% to 5% inflation
      };

      render(<UsdPurchasingPowerChart formData={realisticFormData} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should have 21 data points (years 0-20)
      expect(chartData.datasets[0].data).toHaveLength(21);
      expect(chartData.labels).toHaveLength(21);

      // First value should be 100%
      expect(chartData.datasets[0].data[0]).toBe(100);

      // Last value should be significantly lower due to compound inflation
      expect(chartData.datasets[0].data[20]).toBeLessThan(50);
    });

    it("should handle compound purchasing power decay correctly over long periods", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 10,
        inflationCustomRates: Array(10).fill(8), // Consistent 8% inflation
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Test compound effect: each year should be previous / 1.08
      const actualValues = chartData.datasets[0].data;

      expect(actualValues[0]).toBe(100);
      expect(actualValues[1]).toBeCloseTo(92.593, 2); // 100 / 1.08
      expect(actualValues[5]).toBeCloseTo(68.058, 2); // After 5 years
      expect(actualValues[10]).toBeCloseTo(46.319, 2); // After 10 years
    });

    it("should maintain precision with decimal inflation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        inflationCustomRates: [3.25, 4.75, 2.125], // Decimal rates
      };

      render(<UsdPurchasingPowerChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: 100%
      // Year 1: 100 / 1.0325 = ~96.854%
      // Year 2: 96.854 / 1.0475 = ~92.46%
      // Year 3: 92.46 / 1.02125 = ~90.537%
      const expectedFinalValue = 90.5368768;

      const actualValues = chartData.datasets[0].data;
      expect(actualValues[3]).toBeCloseTo(expectedFinalValue, 1);
    });
  });
});
