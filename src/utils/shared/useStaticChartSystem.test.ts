import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalculationResults, FormData } from "../../types";
import { useStaticChartSystem } from "./useStaticChartSystem";

// Mock data
const mockFormData: FormData = {
  btcStack: 5,
  exchangeRate: 50000,
  timeHorizon: 20,
  activationYear: 10,
  priceCrash: 0,

  // Portfolio allocations
  savingsPct: 20,
  investmentsPct: 30,
  speculationPct: 40,
  collateralPct: 10,

  // Loan configuration
  loanRate: 5,
  loanTermYears: 10,
  interestOnly: false,
  ltvRatio: 0.3,

  // Yield settings
  investmentsStartYield: 6,
  investmentsEndYield: 8,
  speculationStartYield: 10,
  speculationEndYield: 15,
  incomeYield: 5,
  incomeReinvestmentPct: 70,

  // Income configuration
  incomeAllocationPct: 50,
  startingExpenses: 100000,

  // Economic scenario configuration
  economicScenario: "tight",
  followEconomicScenarioInflation: false,
  followEconomicScenarioBtc: false,
  followEconomicScenarioIncome: false,

  // Inflation settings
  inflationMode: "simple",
  inflationInputType: "flat",
  inflationFlat: 3,
  inflationStart: 2,
  inflationEnd: 4,
  inflationPreset: "tight",
  inflationCustomRates: [2, 3, 2.5],
  inflationManualMode: false,

  // BTC Price settings
  btcPriceMode: "simple",
  btcPriceInputType: "manual",
  btcPriceFlat: 50,
  btcPriceStart: 40,
  btcPriceEnd: 60,
  btcPricePreset: "tight",
  btcPriceCustomRates: [],
  btcPriceManualMode: true,

  // Income settings
  incomeMode: "simple",
  incomeInputType: "flat",
  incomeFlat: 5,
  incomeStart: 4,
  incomeEnd: 6,
  incomePreset: "tight",
  incomeCustomRates: [5, 6, 7],
  incomeManualMode: false,
  enableAnnualReallocation: false,
};

const mockCalculationResults: CalculationResults = {
  results: [
    { year: 0, btcWithIncome: 5, btcWithoutIncome: 5 },
    { year: 1, btcWithIncome: 5.5, btcWithoutIncome: 6 },
    { year: 2, btcWithIncome: 6, btcWithoutIncome: 7 },
  ],
  usdIncome: [50000, 55000, 60000],
  usdIncomeWithLeverage: [60000, 66000, 72000],
  btcIncome: [1, 1.1, 1.2],
  annualExpenses: [100000, 103000, 106000],
  incomeAtActivationYears: [50000],
  incomeAtActivationYearsWithLeverage: [60000],
  expensesAtActivationYears: [100000],
  loanPrincipal: 250000,
  loanInterest: 75000,
  btcAppreciationAverage: 45.7,
};

describe("useStaticChartSystem", () => {
  describe("Basic functionality", () => {
    it("should return chart data and configurations", () => {
      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: mockFormData,
        }),
      );

      expect(result.current).toHaveProperty("resultChartData");
      expect(result.current).toHaveProperty("incomeChartData");
      expect(result.current).toHaveProperty("btcGrowthChartConfig");
      expect(result.current).toHaveProperty("usdIncomeChartConfig");
      expect(result.current).toHaveProperty("getBtcPriceAtYear");
    });

    it("should generate proper chart data structure", () => {
      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: mockFormData,
        }),
      );

      const { resultChartData } = result.current;

      expect(resultChartData).toHaveProperty("labels");
      expect(resultChartData).toHaveProperty("datasets");
      expect(resultChartData.labels).toEqual([0, 1, 2]);
      expect(resultChartData.datasets).toHaveLength(2);
      expect(resultChartData.datasets[0].label).toBe("BTC Stack (full amount)");
      expect(resultChartData.datasets[1].label).toBe(
        "BTC Stack (after income allocation)",
      );
    });

    it("should generate income chart data", () => {
      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: mockFormData,
        }),
      );

      const { incomeChartData } = result.current;

      expect(incomeChartData).toHaveProperty("labels");
      expect(incomeChartData).toHaveProperty("datasets");
      expect(incomeChartData.datasets).toHaveLength(3); // USD income, BTC income, and net income
    });
  });

  describe("BTC price calculation", () => {
    it("should calculate BTC price using custom rates", () => {
      const customFormData = {
        ...mockFormData,
        btcPriceCustomRates: [50, 30, 20],
        exchangeRate: 50000,
      };

      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: customFormData,
        }),
      );

      const { getBtcPriceAtYear } = result.current;

      // Year 0 should be base exchange rate
      expect(getBtcPriceAtYear(0)).toBe(50000);

      // Year 1 uses customRates[1] which is 30%, not customRates[0] which is 50%
      const year1Price = 50000 * Math.pow(1 + 30 / 100, 1);
      expect(getBtcPriceAtYear(1)).toBe(year1Price);
    });

    it("should use default 15% growth when no custom rates", () => {
      const formDataNoCustomRates = {
        ...mockFormData,
        btcPriceCustomRates: [],
        exchangeRate: 50000,
      };

      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: formDataNoCustomRates,
        }),
      );

      const { getBtcPriceAtYear } = result.current;

      // Should use default 15% growth
      const expectedPrice = 50000 * Math.pow(1.15, 1);
      expect(getBtcPriceAtYear(1)).toBe(expectedPrice);
    });
  });

  describe("Chart configurations", () => {
    it("should provide responsive chart configurations", () => {
      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: mockFormData,
        }),
      );

      const { btcGrowthChartConfig } = result.current;

      expect(btcGrowthChartConfig.responsive).toBe(true);
      expect(btcGrowthChartConfig.maintainAspectRatio).toBe(true);
      expect(btcGrowthChartConfig.aspectRatio).toBe(2);
    });

    it("should include proper axis configurations", () => {
      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: mockFormData,
        }),
      );

      const { btcGrowthChartConfig } = result.current;

      expect(btcGrowthChartConfig.scales?.y?.beginAtZero).toBe(true);
      expect(btcGrowthChartConfig.scales?.y?.title?.text).toBe("BTC");
      expect(btcGrowthChartConfig.scales?.x?.title?.text).toBe("Years");
    });
  });

  describe("Update handlers", () => {
    it("should handle onUpdateFormData callback", () => {
      const mockUpdateFormData = vi.fn();

      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: mockFormData,
          onUpdateFormData: mockUpdateFormData,
        }),
      );

      expect(result.current.onUpdateFormData).toBe(mockUpdateFormData);
    });

    it("should work without onUpdateFormData callback", () => {
      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: mockCalculationResults,
          formData: mockFormData,
        }),
      );

      expect(result.current.onUpdateFormData).toBeUndefined();
    });
  });

  describe("Empty data handling", () => {
    it("should handle empty calculation results", () => {
      const emptyResults: CalculationResults = {
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
      };

      const { result } = renderHook(() =>
        useStaticChartSystem({
          calculationResults: emptyResults,
          formData: mockFormData,
        }),
      );

      expect(result.current.resultChartData.labels).toEqual([]);
      expect(result.current.resultChartData.datasets[0].data).toEqual([]);
    });
  });

  describe("Memoization", () => {
    it("should not recreate data when props haven't changed", () => {
      const { result, rerender } = renderHook(
        (props) => useStaticChartSystem(props),
        {
          initialProps: {
            calculationResults: mockCalculationResults,
            formData: mockFormData,
          },
        },
      );

      const firstResult = result.current.resultChartData;

      // Rerender with same props
      rerender({
        calculationResults: mockCalculationResults,
        formData: mockFormData,
      });

      // Should be the same object reference (memoized)
      expect(result.current.resultChartData).toBe(firstResult);
    });
  });
});
