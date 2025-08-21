import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../../config/defaults";
import { render } from "../../test/testUtils";
import { FormData } from "../../types";
import { YieldChart } from "./YieldChart";

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

describe("YieldChart", () => {
  const defaultFormData: FormData = {
    ...DEFAULT_FORM_DATA,
    timeHorizon: 5,
    investmentsStartYield: 30,
    investmentsEndYield: 10,
    speculationStartYield: 40,
    speculationEndYield: 5,
  };

  describe("Rendering", () => {
    it("should render Line chart component", () => {
      render(<YieldChart formData={defaultFormData} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();
    });

    it("should render chart with data and options", () => {
      render(<YieldChart formData={defaultFormData} />);

      const chartData = screen.getByTestId("chart-data");
      const chartOptions = screen.getByTestId("chart-options");

      expect(chartData).toBeInTheDocument();
      expect(chartOptions).toBeInTheDocument();
    });
  });

  describe("Yield Calculations", () => {
    it("should calculate investment yields correctly with linear interpolation", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 4,
        investmentsStartYield: 40,
        investmentsEndYield: 20,
        speculationStartYield: 50,
        speculationEndYield: 10,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Investment yields: 40 -> 35 -> 30 -> 25 -> 20 (linear interpolation over 4 years)
      const expectedInvestmentYields = ["40.0", "35.0", "30.0", "25.0", "20.0"];
      // Speculation yields: 50 -> 40 -> 30 -> 20 -> 10 (linear interpolation over 4 years)
      const expectedSpeculationYields = [
        "50.0",
        "40.0",
        "30.0",
        "20.0",
        "10.0",
      ];

      const investmentDataset = chartData.datasets[0];
      const speculationDataset = chartData.datasets[1];

      expect(investmentDataset.data).toEqual(expectedInvestmentYields);
      expect(speculationDataset.data).toEqual(expectedSpeculationYields);
    });

    it("should handle zero timeHorizon", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 0,
        investmentsStartYield: 25,
        investmentsEndYield: 15,
        speculationStartYield: 35,
        speculationEndYield: 10,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // With timeHorizon=0, division by zero occurs (i/timeHorizon), resulting in NaN
      // The component shows this edge case behavior
      expect(chartData.datasets[0].data).toEqual(["NaN"]);
      expect(chartData.datasets[1].data).toEqual(["NaN"]);
      expect(chartData.labels).toEqual([0]);
    });

    it("should handle same start and end yields", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        investmentsStartYield: 20,
        investmentsEndYield: 20, // Same as start
        speculationStartYield: 30,
        speculationEndYield: 30, // Same as start
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Yields should remain constant
      const expectedConstantYields = ["20.0", "20.0", "20.0", "20.0"];
      const expectedSpeculationYields = ["30.0", "30.0", "30.0", "30.0"];

      expect(chartData.datasets[0].data).toEqual(expectedConstantYields);
      expect(chartData.datasets[1].data).toEqual(expectedSpeculationYields);
    });

    it("should handle increasing yields (end > start)", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        investmentsStartYield: 10,
        investmentsEndYield: 20, // Increasing
        speculationStartYield: 15,
        speculationEndYield: 25, // Increasing
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Investment yields: 10 -> 15 -> 20
      const expectedInvestmentYields = ["10.0", "15.0", "20.0"];
      // Speculation yields: 15 -> 20 -> 25
      const expectedSpeculationYields = ["15.0", "20.0", "25.0"];

      expect(chartData.datasets[0].data).toEqual(expectedInvestmentYields);
      expect(chartData.datasets[1].data).toEqual(expectedSpeculationYields);
    });

    it("should handle decimal yields with proper rounding", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        investmentsStartYield: 33.333,
        investmentsEndYield: 22.222,
        speculationStartYield: 44.444,
        speculationEndYield: 11.111,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should be rounded to 1 decimal place
      const investmentYields = chartData.datasets[0].data;
      const speculationYields = chartData.datasets[1].data;

      // Each value should be a string with 1 decimal place
      investmentYields.forEach((yieldValue: string) => {
        expect(yieldValue).toMatch(/^\d+\.\d$/);
      });
      speculationYields.forEach((yieldValue: string) => {
        expect(yieldValue).toMatch(/^\d+\.\d$/);
      });

      // First values should match start yields
      expect(investmentYields[0]).toBe("33.3");
      expect(speculationYields[0]).toBe("44.4");

      // Last values should match end yields
      expect(investmentYields[3]).toBe("22.2");
      expect(speculationYields[3]).toBe("11.1");
    });
  });

  describe("Chart Configuration", () => {
    it("should generate correct labels for timeHorizon", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const expectedLabels = [0, 1, 2, 3];
      expect(chartData.labels).toEqual(expectedLabels);
    });

    it("should configure investment dataset with correct properties", () => {
      render(<YieldChart formData={defaultFormData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const investmentDataset = chartData.datasets[0];
      expect(investmentDataset.label).toBe("Investments Yield (BTC %)");
      expect(investmentDataset.borderColor).toBe("#F59E0B");
      expect(investmentDataset.backgroundColor).toBe("rgba(245, 158, 11, 0.2)");
      expect(investmentDataset.fill).toBe(false);
    });

    it("should configure speculation dataset with correct properties", () => {
      render(<YieldChart formData={defaultFormData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const speculationDataset = chartData.datasets[1];
      expect(speculationDataset.label).toBe("Speculation Yield (BTC %)");
      expect(speculationDataset.borderColor).toBe("#22C55E");
      expect(speculationDataset.backgroundColor).toBe("rgba(34, 197, 94, 0.2)");
      expect(speculationDataset.fill).toBe(false);
    });
  });

  describe("Chart Options", () => {
    it("should configure chart options correctly", () => {
      render(<YieldChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.maintainAspectRatio).toBe(false);
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.scales.y.beginAtZero).toBe(true);
      expect(chartOptions.scales.y.title.display).toBe(true);
      expect(chartOptions.scales.y.title.text).toBe("Yield %");
      expect(chartOptions.scales.x.title.display).toBe(true);
      expect(chartOptions.scales.x.title.text).toBe("Years");
    });

    it("should configure plugins correctly", () => {
      render(<YieldChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.plugins.title.display).toBe(true);
      expect(chartOptions.plugins.title.text).toBe(
        "Yield projections over time",
      );
      expect(chartOptions.plugins.legend.position).toBe("bottom");
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative yields", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        investmentsStartYield: -5,
        investmentsEndYield: -15,
        speculationStartYield: -10,
        speculationEndYield: -20,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should handle negative values correctly
      const expectedInvestmentYields = ["-5.0", "-10.0", "-15.0"];
      const expectedSpeculationYields = ["-10.0", "-15.0", "-20.0"];

      expect(chartData.datasets[0].data).toEqual(expectedInvestmentYields);
      expect(chartData.datasets[1].data).toEqual(expectedSpeculationYields);
    });

    it("should handle very large yields", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        investmentsStartYield: 1000,
        investmentsEndYield: 2000,
        speculationStartYield: 5000,
        speculationEndYield: 10000,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const expectedInvestmentYields = ["1000.0", "2000.0"];
      const expectedSpeculationYields = ["5000.0", "10000.0"];

      expect(chartData.datasets[0].data).toEqual(expectedInvestmentYields);
      expect(chartData.datasets[1].data).toEqual(expectedSpeculationYields);
    });

    it("should handle very small decimal yields", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        investmentsStartYield: 0.1,
        investmentsEndYield: 0.05,
        speculationStartYield: 0.2,
        speculationEndYield: 0.01,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should preserve precision to 1 decimal place
      const expectedInvestmentYields = ["0.1", "0.1", "0.1"]; // 0.1 -> 0.075 -> 0.05, rounded to 1 decimal
      const expectedSpeculationYields = ["0.2", "0.1", "0.0"]; // 0.2 -> 0.105 -> 0.01, rounded to 1 decimal

      expect(chartData.datasets[0].data).toEqual(expectedInvestmentYields);
      expect(chartData.datasets[1].data).toEqual(expectedSpeculationYields);
    });

    it("should handle very long timeHorizon", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 100,
        investmentsStartYield: 100,
        investmentsEndYield: 0,
        speculationStartYield: 50,
        speculationEndYield: 25,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should have 101 data points (years 0-100)
      expect(chartData.datasets[0].data).toHaveLength(101);
      expect(chartData.datasets[1].data).toHaveLength(101);
      expect(chartData.labels).toHaveLength(101);

      // First values should be start yields
      expect(chartData.datasets[0].data[0]).toBe("100.0");
      expect(chartData.datasets[1].data[0]).toBe("50.0");

      // Last values should be end yields
      expect(chartData.datasets[0].data[100]).toBe("0.0");
      expect(chartData.datasets[1].data[100]).toBe("25.0");
    });
  });

  describe("Linear Interpolation Accuracy", () => {
    it("should calculate linear interpolation correctly for investments", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 4,
        investmentsStartYield: 20,
        investmentsEndYield: 0,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Linear interpolation: 20 -> 15 -> 10 -> 5 -> 0
      const expectedValues = ["20.0", "15.0", "10.0", "5.0", "0.0"];
      expect(chartData.datasets[0].data).toEqual(expectedValues);
    });

    it("should calculate linear interpolation correctly for speculation", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 6,
        speculationStartYield: 30,
        speculationEndYield: 0,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Linear interpolation: 30 -> 25 -> 20 -> 15 -> 10 -> 5 -> 0
      const expectedValues = [
        "30.0",
        "25.0",
        "20.0",
        "15.0",
        "10.0",
        "5.0",
        "0.0",
      ];
      expect(chartData.datasets[1].data).toEqual(expectedValues);
    });

    it("should handle non-integer interpolation steps", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        investmentsStartYield: 10,
        investmentsEndYield: 1,
        speculationStartYield: 12,
        speculationEndYield: 3,
      };

      render(<YieldChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Investment: 10 -> 7 -> 4 -> 1
      const expectedInvestmentValues = ["10.0", "7.0", "4.0", "1.0"];
      // Speculation: 12 -> 9 -> 6 -> 3
      const expectedSpeculationValues = ["12.0", "9.0", "6.0", "3.0"];

      expect(chartData.datasets[0].data).toEqual(expectedInvestmentValues);
      expect(chartData.datasets[1].data).toEqual(expectedSpeculationValues);
    });
  });

  describe("Integration", () => {
    it("should work with realistic form data", () => {
      const realisticFormData = {
        ...defaultFormData,
        timeHorizon: 20,
        investmentsStartYield: 50,
        investmentsEndYield: 5,
        speculationStartYield: 80,
        speculationEndYield: 10,
      };

      render(<YieldChart formData={realisticFormData} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should have 21 data points (years 0-20)
      expect(chartData.datasets[0].data).toHaveLength(21);
      expect(chartData.datasets[1].data).toHaveLength(21);
      expect(chartData.labels).toHaveLength(21);

      // First values should be start yields
      expect(chartData.datasets[0].data[0]).toBe("50.0");
      expect(chartData.datasets[1].data[0]).toBe("80.0");

      // Last values should be end yields
      expect(chartData.datasets[0].data[20]).toBe("5.0");
      expect(chartData.datasets[1].data[20]).toBe("10.0");

      // Midpoint values should be interpolated correctly
      expect(chartData.datasets[0].data[10]).toBe("27.5"); // (50 + 5) / 2
      expect(chartData.datasets[1].data[10]).toBe("45.0"); // (80 + 10) / 2
    });

    it("should handle default form data correctly", () => {
      render(<YieldChart formData={DEFAULT_FORM_DATA} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should render without errors
      expect(chartData.datasets).toHaveLength(2);
      expect(chartData.datasets[0].label).toBe("Investments Yield (BTC %)");
      expect(chartData.datasets[1].label).toBe("Speculation Yield (BTC %)");
    });
  });
});
