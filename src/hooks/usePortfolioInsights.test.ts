import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { CalculationResults } from "../types";
import * as loanCalculationsModule from "./useLoanCalculations";
import * as portfolioAnalysisModule from "./usePortfolioAnalysis";
import { usePortfolioInsights } from "./usePortfolioInsights";

// Mock the dependencies
vi.mock("./useLoanCalculations");
vi.mock("./usePortfolioAnalysis");

describe("usePortfolioInsights", () => {
  const mockResults: CalculationResults = {
    results: [
      { year: 0, btcWithIncome: 10, btcWithoutIncome: 10 },
      { year: 1, btcWithIncome: 12, btcWithoutIncome: 13 },
      { year: 2, btcWithIncome: 15, btcWithoutIncome: 17 },
      { year: 3, btcWithIncome: 18, btcWithoutIncome: 22 },
      { year: 4, btcWithIncome: 22, btcWithoutIncome: 28 },
      { year: 5, btcWithIncome: 25, btcWithoutIncome: 35 },
    ],
    usdIncome: [0, 0, 0, 50000, 55000, 60000],
    usdIncomeWithLeverage: [0, 0, 0, 75000, 80000, 85000],
    btcIncome: [0, 0, 0, 0, 0, 0],
    annualExpenses: [40000, 42000, 44000, 46000, 48000, 50000],
    incomeAtActivationYears: [0, 10000, 20000, 30000, 40000, 50000],
    incomeAtActivationYearsWithLeverage: [0, 15000, 30000, 45000, 60000, 75000],
    expensesAtActivationYears: [40000, 42000, 44000, 46000, 48000, 50000],
    loanPrincipal: 200000,
    loanInterest: 14000,
  };

  const mockFormData = {
    ...DEFAULT_FORM_DATA,
    btcStack: 10,
    timeHorizon: 5,
    activationYear: 3,
    savingsPct: 70,
    investmentsPct: 20,
    speculationPct: 10,
    collateralPct: 30,
    investmentsStartYield: 30,
    investmentsEndYield: 10,
    speculationStartYield: 40,
    speculationEndYield: 5,
  };

  const mockGetBtcPrice = vi.fn((year: number) => {
    // Mock BTC price: starts at $50k, grows to $200k over 5 years
    const basePrice = 50000;
    const growthRate = 0.32; // ~32% CAGR
    return basePrice * Math.pow(1 + growthRate, year);
  });

  const mockCalculateLoanDetails = vi.fn();
  const mockCalculateLiquidationBuffer = vi.fn();
  const mockCalculateAdditionalCollateralPotential = vi.fn();
  const mockCalculateBtcStackAtActivation = vi.fn();
  const mockCalculateCashflows = vi.fn();
  const mockCalculatePortfolioGrowth = vi.fn();
  const mockCalculatePortfolioMixEvolution = vi.fn();
  const mockFormatCashflow = vi.fn();
  const mockGetGrowthCategory = vi.fn();
  const mockGetRiskLevel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup loan calculations mock
    vi.mocked(loanCalculationsModule.useLoanCalculations).mockReturnValue({
      calculateLoanDetails: mockCalculateLoanDetails,
      calculateLiquidationBuffer: mockCalculateLiquidationBuffer,
      calculateAdditionalCollateralPotential:
        mockCalculateAdditionalCollateralPotential,
      calculateBtcStackAtActivation: mockCalculateBtcStackAtActivation,
    });

    // Setup portfolio analysis mock
    vi.mocked(portfolioAnalysisModule.usePortfolioAnalysis).mockReturnValue({
      calculateCashflows: mockCalculateCashflows,
      calculatePortfolioGrowth: mockCalculatePortfolioGrowth,
      calculatePortfolioMixEvolution: mockCalculatePortfolioMixEvolution,
      formatCashflow: mockFormatCashflow,
      getGrowthCategory: mockGetGrowthCategory,
      getRiskLevel: mockGetRiskLevel,
    });

    // Default mock returns
    mockCalculatePortfolioGrowth.mockReturnValue({
      btcGrowthWithIncome: 150, // 25 BTC final vs 10 BTC initial = 150% growth
      btcGrowthWithoutIncome: 250, // 35 BTC final vs 10 BTC initial = 250% growth
      finalBtcWithIncome: 25,
      finalBtcWithoutIncome: 35,
    });

    mockCalculateCashflows.mockReturnValue({
      activationYear: {
        withoutLeverage: 4000,
        withLeverage: 29000,
      },
    });

    mockCalculateLoanDetails.mockReturnValue({
      liquidationPrice: 41593.75, // Mock liquidation price
      loanPrincipal: 99825,
      annualPayments: 7986,
      collateralBtc: 3,
      btcStackAtActivation: 5,
    });
  });

  describe("Basic Portfolio Insights", () => {
    it("should calculate basic BTC growth metrics correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.btcGrowthWithIncome).toBe(150);
      expect(insights.btcGrowthWithoutIncome).toBe(250);
      expect(insights.finalBtcWithIncome).toBe(25);
      expect(insights.finalBtcWithoutIncome).toBe(35);
      expect(insights.btcGrowthDifference).toBe(100); // 250% - 150%
    });

    it("should include cashflow data", () => {
      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.cashflows).toEqual({
        activationYear: {
          withoutLeverage: 4000,
          withLeverage: 29000,
        },
      });
    });
  });

  describe("Liquidation Risk Analysis", () => {
    it("should calculate liquidation data when collateral is used", () => {
      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.liquidationData).toBeDefined();
      expect(insights.liquidationData!.liquidationPrice).toBe(41593.75);
      expect(insights.liquidationData!.minBtcPrice).toBeCloseTo(114998, 0); // Year 3 price (activation year)
      expect(insights.liquidationData!.maxBtcPrice).toBeCloseTo(200373, 0); // Year 5 price
      expect(insights.liquidationData!.liquidationBuffer).toBeCloseTo(176.5, 1); // Much higher buffer
    });

    it("should not calculate liquidation data when no collateral is used", () => {
      const formDataNoCollateral = {
        ...mockFormData,
        collateralPct: 0,
      };

      const { result } = renderHook(() =>
        usePortfolioInsights(
          mockResults,
          formDataNoCollateral,
          mockGetBtcPrice,
        ),
      );

      const insights = result.current;

      expect(insights.liquidationData).toBeUndefined();
    });

    it("should handle case when loan details are not available", () => {
      mockCalculateLoanDetails.mockReturnValue(null);

      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.liquidationData).toBeUndefined();
    });

    it("should handle extreme liquidation scenarios", () => {
      // Mock a dangerous liquidation scenario
      mockCalculateLoanDetails.mockReturnValue({
        liquidationPrice: 180000, // Very high liquidation price
        loanPrincipal: 99825,
        annualPayments: 7986,
        collateralBtc: 3,
        btcStackAtActivation: 5,
      });

      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.liquidationData!.liquidationPrice).toBe(180000);
      expect(insights.liquidationData!.liquidationBuffer).toBeLessThan(0); // Negative buffer = danger
    });
  });

  describe("Portfolio Mix Evolution", () => {
    it("should calculate portfolio mix evolution for diversified portfolio", () => {
      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.portfolioMix).toBeDefined();
      expect(insights.portfolioMix!.finalSavingsPct).toBeGreaterThan(0);
      expect(insights.portfolioMix!.finalInvestmentsPct).toBeGreaterThan(0);
      expect(insights.portfolioMix!.finalSpeculationPct).toBeGreaterThan(0);

      // Total should be 100%
      const total =
        insights.portfolioMix!.finalSavingsPct +
        insights.portfolioMix!.finalInvestmentsPct +
        insights.portfolioMix!.finalSpeculationPct;
      expect(total).toBeCloseTo(100, 1);

      expect(insights.portfolioMix!.mixChange).toBeGreaterThanOrEqual(0);
    });

    it("should not calculate portfolio mix for 100% savings portfolio", () => {
      const formData100Savings = {
        ...mockFormData,
        savingsPct: 100,
        investmentsPct: 0,
        speculationPct: 0,
      };

      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, formData100Savings, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.portfolioMix).toBeUndefined();
    });

    it("should handle high-yield investment scenarios", () => {
      const highYieldFormData = {
        ...mockFormData,
        investmentsStartYield: 50, // Very high starting yield
        investmentsEndYield: 30, // Still high ending yield
        speculationStartYield: 100, // Extreme speculation yield
        speculationEndYield: 20,
      };

      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, highYieldFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.portfolioMix).toBeDefined();
      // With very high yields, investments and speculation should dominate
      expect(insights.portfolioMix!.finalSavingsPct).toBeLessThan(
        mockFormData.savingsPct,
      );
      expect(insights.portfolioMix!.mixChange).toBeGreaterThan(0);
    });

    it("should handle zero-yield scenarios", () => {
      const zeroYieldFormData = {
        ...mockFormData,
        investmentsStartYield: 0,
        investmentsEndYield: 0,
        speculationStartYield: 0,
        speculationEndYield: 0,
      };

      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, zeroYieldFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      expect(insights.portfolioMix).toBeDefined();
      // With zero yields, portfolio mix should remain the same
      expect(insights.portfolioMix!.finalSavingsPct).toBeCloseTo(
        mockFormData.savingsPct,
        1,
      );
      expect(insights.portfolioMix!.finalInvestmentsPct).toBeCloseTo(
        mockFormData.investmentsPct,
        1,
      );
      expect(insights.portfolioMix!.finalSpeculationPct).toBeCloseTo(
        mockFormData.speculationPct,
        1,
      );
      expect(insights.portfolioMix!.mixChange).toBeCloseTo(0, 1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero time horizon", () => {
      const zeroTimeFormData = {
        ...mockFormData,
        timeHorizon: 0,
      };

      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, zeroTimeFormData, mockGetBtcPrice),
      );

      const insights = result.current;

      // Should still return valid insights
      expect(insights.btcGrowthWithIncome).toBeDefined();
      expect(insights.btcGrowthWithoutIncome).toBeDefined();
    });

    it("should handle activation year beyond time horizon", () => {
      const lateActivationFormData = {
        ...mockFormData,
        activationYear: 10, // Beyond 5-year time horizon
      };

      const { result } = renderHook(() =>
        usePortfolioInsights(
          mockResults,
          lateActivationFormData,
          mockGetBtcPrice,
        ),
      );

      const insights = result.current;

      // Should still calculate liquidation data if collateral is used
      if (insights.liquidationData) {
        expect(insights.liquidationData.liquidationPrice).toBeDefined();
      }
    });

    it("should handle extreme BTC price volatility", () => {
      const volatileBtcPrice = vi.fn((year: number) => {
        // Simulate extreme volatility: crash then recovery
        // For activation year 3 to time horizon 5
        if (year <= 3) return 30000; // Crash at activation
        return 500000; // Extreme recovery
      });

      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, volatileBtcPrice),
      );

      const insights = result.current;

      if (insights.liquidationData) {
        expect(insights.liquidationData.minBtcPrice).toBe(30000); // Minimum from activation year
        expect(insights.liquidationData.maxBtcPrice).toBe(500000); // Maximum from later years

        // Liquidation buffer could be very negative during crash
        expect(insights.liquidationData.liquidationBuffer).toBeDefined();
      }
    });

    it("should handle NaN values in BTC price function", () => {
      const nanBtcPrice = vi.fn(() => NaN);

      const { result } = renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, nanBtcPrice),
      );

      const insights = result.current;

      // Should handle NaN gracefully - liquidation data should be undefined or handle NaN
      if (insights.liquidationData) {
        // If liquidation data exists, it should handle NaN values appropriately
        expect(typeof insights.liquidationData.minBtcPrice).toBe("number");
        expect(typeof insights.liquidationData.maxBtcPrice).toBe("number");
      }
    });
  });

  describe("Memoization", () => {
    it("should memoize results when inputs don't change", () => {
      const { result, rerender } = renderHook(
        ({ results, formData, getBtcPrice }) =>
          usePortfolioInsights(results, formData, getBtcPrice),
        {
          initialProps: {
            results: mockResults,
            formData: mockFormData,
            getBtcPrice: mockGetBtcPrice,
          },
        },
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({
        results: mockResults,
        formData: mockFormData,
        getBtcPrice: mockGetBtcPrice,
      });

      const secondResult = result.current;

      // Should be the same object reference due to memoization
      expect(firstResult).toBe(secondResult);
    });

    it("should recalculate when form data changes", () => {
      const { result, rerender } = renderHook(
        ({ results, formData, getBtcPrice }) =>
          usePortfolioInsights(results, formData, getBtcPrice),
        {
          initialProps: {
            results: mockResults,
            formData: mockFormData,
            getBtcPrice: mockGetBtcPrice,
          },
        },
      );

      const firstResult = result.current;

      // Change form data
      const newFormData = {
        ...mockFormData,
        collateralPct: 50, // Increase collateral
      };

      rerender({
        results: mockResults,
        formData: newFormData,
        getBtcPrice: mockGetBtcPrice,
      });

      const secondResult = result.current;

      // Should be different object reference
      expect(firstResult).not.toBe(secondResult);
    });
  });

  describe("Integration with Dependencies", () => {
    it("should call loan calculations with correct parameters", () => {
      renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      expect(mockCalculateLoanDetails).toHaveBeenCalledWith(
        mockFormData.activationYear,
      );
    });

    it("should call portfolio analysis methods", () => {
      renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      expect(mockCalculatePortfolioGrowth).toHaveBeenCalled();
      expect(mockCalculateCashflows).toHaveBeenCalled();
    });

    it("should call BTC price function for each year in liquidation analysis", () => {
      renderHook(() =>
        usePortfolioInsights(mockResults, mockFormData, mockGetBtcPrice),
      );

      // Should call for years 3, 4, 5 (activation year to time horizon)
      expect(mockGetBtcPrice).toHaveBeenCalledWith(3);
      expect(mockGetBtcPrice).toHaveBeenCalledWith(4);
      expect(mockGetBtcPrice).toHaveBeenCalledWith(5);
    });
  });
});
