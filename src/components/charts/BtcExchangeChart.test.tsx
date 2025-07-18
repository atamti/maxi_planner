import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../../config/defaults";
import { FormData } from "../../types";
import { BtcExchangeChart } from "./BtcExchangeChart";

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(({ data, options, ...props }) => (
    <div data-testid="line-chart" {...props}>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
}));

describe("BtcExchangeChart", () => {
  const defaultFormData: FormData = {
    ...DEFAULT_FORM_DATA,
    timeHorizon: 5,
    exchangeRate: 100000, // $100k starting price
    btcPriceCustomRates: [20, 15, 10, 8, 5], // Decreasing appreciation rates
  };

  describe("Rendering", () => {
    it("should render Line chart component", () => {
      render(<BtcExchangeChart formData={defaultFormData} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();
    });

    it("should render chart with data and options", () => {
      render(<BtcExchangeChart formData={defaultFormData} />);

      const chartData = screen.getByTestId("chart-data");
      const chartOptions = screen.getByTestId("chart-options");

      expect(chartData).toBeInTheDocument();
      expect(chartOptions).toBeInTheDocument();
    });
  });

  describe("BTC Price Calculations", () => {
    it("should calculate BTC prices correctly with appreciation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        exchangeRate: 50000,
        btcPriceCustomRates: [100, 50, 25], // 100%, 50%, 25% appreciation
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $50,000
      // Year 1: $50,000 * 2.00 = $100,000
      // Year 2: $100,000 * 1.50 = $150,000
      // Year 3: $150,000 * 1.25 = $187,500
      const expectedPrices = [50000, 100000, 150000, 187500];

      const actualPrices = chartData.datasets[0].data;
      expect(actualPrices).toHaveLength(expectedPrices.length);
      expectedPrices.forEach((expected, index) => {
        expect(actualPrices[index]).toBeCloseTo(expected, 0);
      });
    });

    it("should handle zero appreciation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        exchangeRate: 75000,
        btcPriceCustomRates: [0, 0, 0], // No appreciation
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // With 0% appreciation, price should remain the same
      const expectedPrices = [75000, 75000, 75000, 75000];

      expect(chartData.datasets[0].data).toEqual(expectedPrices);
    });

    it("should handle missing appreciation rates by using 0", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 5,
        exchangeRate: 60000,
        btcPriceCustomRates: [10, 20], // Only 2 rates, but timeHorizon is 5
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $60,000
      // Year 1: $60,000 * 1.10 = $66,000
      // Year 2: $66,000 * 1.20 = $79,200
      // Year 3: $79,200 * 1.00 = $79,200 (missing rate = 0%)
      // Year 4: $79,200 * 1.00 = $79,200
      // Year 5: $79,200 * 1.00 = $79,200
      const expectedPrices = [60000, 66000, 79200, 79200, 79200, 79200];

      const actualPrices = chartData.datasets[0].data;
      expectedPrices.forEach((expected, index) => {
        expect(actualPrices[index]).toBeCloseTo(expected, 0);
      });
    });

    it("should handle negative appreciation rates (price decline)", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        exchangeRate: 100000,
        btcPriceCustomRates: [-20, -10], // -20%, -10% decline
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $100,000
      // Year 1: $100,000 * 0.80 = $80,000
      // Year 2: $80,000 * 0.90 = $72,000
      const expectedPrices = [100000, 80000, 72000];

      const actualPrices = chartData.datasets[0].data;
      expectedPrices.forEach((expected, index) => {
        expect(actualPrices[index]).toBeCloseTo(expected, 0);
      });
    });

    it("should handle very high appreciation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        exchangeRate: 10000,
        btcPriceCustomRates: [300, 400], // 300%, 400% appreciation
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $10,000
      // Year 1: $10,000 * 4.00 = $40,000
      // Year 2: $40,000 * 5.00 = $200,000
      const expectedPrices = [10000, 40000, 200000];

      const actualPrices = chartData.datasets[0].data;
      expectedPrices.forEach((expected, index) => {
        expect(actualPrices[index]).toBeCloseTo(expected, 0);
      });
    });
  });

  describe("Chart Configuration", () => {
    it("should generate correct labels for timeHorizon", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 4,
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const expectedLabels = ["Year 0", "Year 1", "Year 2", "Year 3", "Year 4"];
      expect(chartData.labels).toEqual(expectedLabels);
    });

    it("should configure chart dataset with correct properties", () => {
      render(<BtcExchangeChart formData={defaultFormData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      const dataset = chartData.datasets[0];
      expect(dataset.label).toBe("BTC / USD ($Ms)");
      expect(dataset.borderColor).toBe("#F7931A");
      expect(dataset.backgroundColor).toBe("rgba(247, 147, 26, 0.1)");
      expect(dataset.fill).toBe(true);
      expect(dataset.tension).toBe(0.4);
    });
  });

  describe("Chart Options", () => {
    it("should configure chart options correctly", () => {
      render(<BtcExchangeChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.maintainAspectRatio).toBe(false);
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.scales.y.beginAtZero).toBe(false);
      expect(chartOptions.scales.y.title.display).toBe(true);
      expect(chartOptions.scales.y.title.text).toBe("USD  /  BTC  ($Ms)");
      expect(chartOptions.scales.x.title.display).toBe(true);
      expect(chartOptions.scales.x.title.text).toBe("Years");
    });

    it("should configure plugins correctly", () => {
      render(<BtcExchangeChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      expect(chartOptions.plugins.title.display).toBe(false);
      expect(chartOptions.plugins.title.text).toBe(
        "Projected USD Exchange Rate",
      );
      expect(chartOptions.plugins.legend.display).toBe(false);
      expect(chartOptions.plugins.legend.position).toBe("bottom");
    });

    it("should include tick configuration for y-axis", () => {
      render(<BtcExchangeChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tick configuration exists (function will be lost in JSON serialization)
      expect(chartOptions.scales.y.ticks).toBeDefined();
    });

    it("should include tooltip configuration", () => {
      render(<BtcExchangeChart formData={defaultFormData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tooltip configuration structure exists (functions are lost in JSON serialization)
      expect(chartOptions.plugins.tooltip).toBeDefined();
      expect(chartOptions.plugins.tooltip.callbacks).toBeDefined();
    });
  });

  describe("Price Formatting Functions", () => {
    it("should handle prices in millions range", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        exchangeRate: 2000000, // $2M
        btcPriceCustomRates: [0],
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tick configuration exists
      expect(chartOptions.scales.y.ticks).toBeDefined();
    });

    it("should handle prices in thousands range", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        exchangeRate: 75000, // $75K
        btcPriceCustomRates: [0],
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tick configuration exists
      expect(chartOptions.scales.y.ticks).toBeDefined();
    });

    it("should handle prices under thousands", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        exchangeRate: 500, // $500
        btcPriceCustomRates: [0],
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartOptionsElement = screen.getByTestId("chart-options");
      const chartOptions = JSON.parse(chartOptionsElement.textContent || "{}");

      // Test that tick configuration exists
      expect(chartOptions.scales.y.ticks).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle timeHorizon of 0", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 0,
        exchangeRate: 50000,
        btcPriceCustomRates: [],
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should have only the starting year
      expect(chartData.datasets[0].data).toEqual([50000]);
      expect(chartData.labels).toEqual(["Year 0"]);
    });

    it("should handle very small exchange rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        exchangeRate: 1, // $1 starting price
        btcPriceCustomRates: [100, 200], // 100%, 200% appreciation
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $1
      // Year 1: $1 * 2.00 = $2
      // Year 2: $2 * 3.00 = $6
      const expectedPrices = [1, 2, 6];

      expect(chartData.datasets[0].data).toEqual(expectedPrices);
    });

    it("should handle very large exchange rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 1,
        exchangeRate: 10000000, // $10M starting price
        btcPriceCustomRates: [10], // 10% appreciation
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $10,000,000
      // Year 1: $10,000,000 * 1.10 = $11,000,000
      const expectedPrices = [10000000, 11000000];

      expect(chartData.datasets[0].data).toEqual(expectedPrices);
    });

    it("should handle extreme negative appreciation (approaching zero)", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 2,
        exchangeRate: 100000,
        btcPriceCustomRates: [-90, -50], // -90%, -50% decline
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Year 0: $100,000
      // Year 1: $100,000 * 0.10 = $10,000
      // Year 2: $10,000 * 0.50 = $5,000
      const expectedPrices = [100000, 10000, 5000];

      const actualPrices = chartData.datasets[0].data;
      expectedPrices.forEach((expected, index) => {
        expect(actualPrices[index]).toBeCloseTo(expected, 0);
      });
    });
  });

  describe("Integration", () => {
    it("should work with realistic form data", () => {
      const realisticFormData = {
        ...defaultFormData,
        timeHorizon: 20,
        exchangeRate: 45000, // Current realistic BTC price
        btcPriceCustomRates: Array(20)
          .fill(0)
          .map((_, i) => 25 - i), // 25% to 6% appreciation
      };

      render(<BtcExchangeChart formData={realisticFormData} />);

      const chart = screen.getByTestId("line-chart");
      expect(chart).toBeInTheDocument();

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Should have 21 data points (years 0-20)
      expect(chartData.datasets[0].data).toHaveLength(21);
      expect(chartData.labels).toHaveLength(21);

      // First value should be the exchange rate
      expect(chartData.datasets[0].data[0]).toBe(45000);

      // Last value should be much higher due to compound appreciation
      expect(chartData.datasets[0].data[20]).toBeGreaterThan(45000);
    });

    it("should handle compound growth correctly over long periods", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 10,
        exchangeRate: 50000,
        btcPriceCustomRates: Array(10).fill(20), // Consistent 20% appreciation
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // With 20% annual appreciation, after 10 years: 50000 * (1.2)^10 ≈ 309,587
      const finalPrice = chartData.datasets[0].data[10];
      expect(finalPrice).toBeCloseTo(309587, -2); // Allow some rounding difference
    });

    it("should maintain precision with decimal appreciation rates", () => {
      const formData = {
        ...defaultFormData,
        timeHorizon: 3,
        exchangeRate: 100000,
        btcPriceCustomRates: [12.5, 7.75, 15.25], // Decimal appreciation rates
      };

      render(<BtcExchangeChart formData={formData} />);

      const chartDataElement = screen.getByTestId("chart-data");
      const chartData = JSON.parse(chartDataElement.textContent || "{}");

      // Let's verify the calculation is working properly by checking the progression
      const actualPrices = chartData.datasets[0].data;

      // Year 0: $100,000
      expect(actualPrices[0]).toBe(100000);

      // Year 1: $100,000 * 1.125 = $112,500
      expect(actualPrices[1]).toBeCloseTo(112500, 0);

      // Year 2: $112,500 * 1.0775 = $121,218.75
      expect(actualPrices[2]).toBeCloseTo(121218.75, 0);

      // Year 3: Check that it follows the compound growth pattern
      expect(actualPrices[3]).toBeGreaterThan(121218.75);
      expect(actualPrices[3]).toBeCloseTo(139704.609375, 0); // Use the actual calculated value
    });
  });
});
