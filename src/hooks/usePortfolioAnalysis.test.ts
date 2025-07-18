import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { CalculationResults } from "../types";
import { usePortfolioAnalysis } from "./usePortfolioAnalysis";

describe("usePortfolioAnalysis", () => {
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
    investmentsStartYield: 30,
    investmentsEndYield: 10,
    speculationStartYield: 40,
    speculationEndYield: 5,
  };

  describe("calculateCashflows", () => {
    it("should calculate cashflows correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioAnalysis(mockResults, mockFormData),
      );

      const cashflows = result.current.calculateCashflows();

      expect(cashflows.activationYear.withoutLeverage).toBe(4000); // 50000 - 46000
      expect(cashflows.activationYear.withLeverage).toBe(29000); // 75000 - 46000
      expect(cashflows.finalYear.withoutLeverage).toBe(10000); // 60000 - 50000
      expect(cashflows.finalYear.withLeverage).toBe(35000); // 85000 - 50000
    });
  });

  describe("calculatePortfolioGrowth", () => {
    it("should calculate portfolio growth correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioAnalysis(mockResults, mockFormData),
      );

      const growth = result.current.calculatePortfolioGrowth();

      expect(growth.finalBtcWithIncome).toBe(25);
      expect(growth.finalBtcWithoutIncome).toBe(35);
      expect(growth.btcGrowthWithIncome).toBe(150); // (25-10)/10 * 100
      expect(growth.btcGrowthWithoutIncome).toBe(250); // (35-10)/10 * 100
      expect(growth.btcGrowthDifference).toBe(100); // 250 - 150
    });
  });

  describe("calculatePortfolioMixEvolution", () => {
    it("should calculate portfolio mix evolution correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioAnalysis(mockResults, mockFormData),
      );

      const mixEvolution = result.current.calculatePortfolioMixEvolution();

      expect(mixEvolution.finalSavingsPct).toBeGreaterThan(0);
      expect(mixEvolution.finalInvestmentsPct).toBeGreaterThan(0);
      expect(mixEvolution.finalSpeculationPct).toBeGreaterThan(0);
      expect(
        mixEvolution.finalSavingsPct +
          mixEvolution.finalInvestmentsPct +
          mixEvolution.finalSpeculationPct,
      ).toBeCloseTo(100, 1);
      expect(mixEvolution.mixChange).toBeGreaterThanOrEqual(0);
    });
  });

  describe("formatCashflow", () => {
    it("should format positive cashflows correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioAnalysis(mockResults, mockFormData),
      );

      const formatted = result.current.formatCashflow(50000);

      expect(formatted.formatted).toBe("$50,000");
      expect(formatted.isPositive).toBe(true);
    });

    it("should format negative cashflows correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioAnalysis(mockResults, mockFormData),
      );

      const formatted = result.current.formatCashflow(-25000);

      expect(formatted.formatted).toBe("($25,000)");
      expect(formatted.isPositive).toBe(false);
    });
  });

  describe("getGrowthCategory", () => {
    it("should categorize growth correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioAnalysis(mockResults, mockFormData),
      );

      expect(result.current.getGrowthCategory(1500)).toBe("exponential");
      expect(result.current.getGrowthCategory(750)).toBe("huge");
      expect(result.current.getGrowthCategory(300)).toBe("strong");
      expect(result.current.getGrowthCategory(50)).toBe("moderate");
      expect(result.current.getGrowthCategory(-10)).toBe("decline");
    });
  });

  describe("getRiskLevel", () => {
    it("should categorize risk levels correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioAnalysis(mockResults, mockFormData),
      );

      expect(result.current.getRiskLevel(150)).toBe("low");
      expect(result.current.getRiskLevel(75)).toBe("moderate");
      expect(result.current.getRiskLevel(35)).toBe("high");
      expect(result.current.getRiskLevel(15)).toBe("extreme");
    });
  });
});
