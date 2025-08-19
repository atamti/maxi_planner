// Systematic edge case testing for calculationService
// Hunting for mathematical bugs in business logic calculations
import { describe, expect, it } from "vitest";
import { CalculationResults, FormDataSubset } from "../types";
import { createCalculationService } from "./calculationService";

describe("Calculation Service - Systematic Edge Case Testing", () => {
  const service = createCalculationService();

  // Helper to create test calculation results
  const createTestResults = (
    overrides: Partial<CalculationResults> = {},
  ): CalculationResults => ({
    results: [
      { year: 0, btcWithIncome: 1, btcWithoutIncome: 1 },
      { year: 1, btcWithIncome: 1.1, btcWithoutIncome: 1.05 },
      { year: 2, btcWithIncome: 1.2, btcWithoutIncome: 1.1 },
    ],
    usdIncome: [0, 1000, 2000],
    usdIncomeWithLeverage: [0, 1500, 3000],
    btcIncome: [0, 0.01, 0.02],
    annualExpenses: [50000, 52000, 54000],
    incomeAtActivationYears: [0, 1000, 2000],
    incomeAtActivationYearsWithLeverage: [0, 1500, 3000],
    expensesAtActivationYears: [50000, 52000, 54000],
    loanPrincipal: 100000,
    loanInterest: 6000,
    btcAppreciationAverage: 45.7,
    ...overrides,
  });

  // Helper to create test form data
  const createTestFormData = (
    overrides: Partial<FormDataSubset> = {},
  ): FormDataSubset => ({
    btcStack: 1,
    timeHorizon: 2,
    activationYear: 1,
    exchangeRate: 50000,
    priceCrash: 0,
    savingsPct: 60,
    investmentsPct: 30,
    speculationPct: 10,
    collateralPct: 50,
    ltvRatio: 50,
    loanRate: 6,
    loanTermYears: 15,
    interestOnly: false,
    investmentsStartYield: 8,
    investmentsEndYield: 5,
    speculationStartYield: 25,
    speculationEndYield: 10,
    btcPriceCustomRates: [],
    inflationCustomRates: [],
    incomeCustomRates: [],
    startingExpenses: 50000,
    incomeAllocationPct: 20,
    enableAnnualReallocation: false,
    ...overrides,
  });

  describe("Portfolio Growth Calculation Edge Cases", () => {
    it("should handle empty calculation results gracefully", () => {
      const emptyResults = createTestResults({ results: [] });
      const formData = createTestFormData();

      const growth = service.calculatePortfolioGrowth(emptyResults, formData);

      expect(growth.finalBtcWithIncome).toBe(0);
      expect(growth.finalBtcWithoutIncome).toBe(0);
      expect(growth.btcGrowthWithIncome).toBe(-100); // (0 - 1) / 1 * 100
      expect(growth.btcGrowthWithoutIncome).toBe(-100);
      expect(growth.btcGrowthDifference).toBe(0);
    });

    it("should handle zero btcStack without division by zero", () => {
      const results = createTestResults();
      const zeroStackFormData = createTestFormData({ btcStack: 0 });

      const growth = service.calculatePortfolioGrowth(
        results,
        zeroStackFormData,
      );

      // Division by zero should produce Infinity, not crash
      expect(growth.btcGrowthWithIncome).toBe(Infinity);
      expect(growth.btcGrowthWithoutIncome).toBe(Infinity);
      expect(isNaN(growth.btcGrowthDifference)).toBe(true); // Infinity - Infinity = NaN
      expect(growth.finalBtcWithIncome).toBe(1.2);
      expect(growth.finalBtcWithoutIncome).toBe(1.1);
    });

    it("should handle negative btcStack gracefully", () => {
      const results = createTestResults();
      const negativeStackFormData = createTestFormData({ btcStack: -1 });

      const growth = service.calculatePortfolioGrowth(
        results,
        negativeStackFormData,
      );

      // Should calculate correctly with negative denominator
      expect(growth.btcGrowthWithIncome).toBe(-220); // (1.2 - (-1)) / (-1) * 100
      expect(growth.btcGrowthWithoutIncome).toBe(-210); // (1.1 - (-1)) / (-1) * 100
      expect(growth.btcGrowthDifference).toBe(10);
    });

    it("should handle extreme growth values without overflow", () => {
      const extremeResults = createTestResults({
        results: [
          { year: 0, btcWithIncome: 1, btcWithoutIncome: 1 },
          { year: 1, btcWithIncome: 1000000, btcWithoutIncome: 999999 },
        ],
      });
      const formData = createTestFormData();

      const growth = service.calculatePortfolioGrowth(extremeResults, formData);

      expect(isFinite(growth.btcGrowthWithIncome)).toBe(true);
      expect(isFinite(growth.btcGrowthWithoutIncome)).toBe(true);
      expect(isFinite(growth.btcGrowthDifference)).toBe(true);
      expect(growth.btcGrowthWithIncome).toBe(99999900); // (1000000 - 1) / 1 * 100
      expect(growth.btcGrowthWithoutIncome).toBe(99999800);
      expect(growth.btcGrowthDifference).toBe(-100);
    });

    it("should handle single result array", () => {
      const singleResult = createTestResults({
        results: [{ year: 0, btcWithIncome: 5, btcWithoutIncome: 4 }],
      });
      const formData = createTestFormData({ btcStack: 2 });

      const growth = service.calculatePortfolioGrowth(singleResult, formData);

      expect(growth.finalBtcWithIncome).toBe(5);
      expect(growth.finalBtcWithoutIncome).toBe(4);
      expect(growth.btcGrowthWithIncome).toBe(150); // (5 - 2) / 2 * 100
      expect(growth.btcGrowthWithoutIncome).toBe(100); // (4 - 2) / 2 * 100
      expect(growth.btcGrowthDifference).toBe(-50);
    });

    it("should handle NaN and Infinity values in results", () => {
      const invalidResults = createTestResults({
        results: [
          { year: 0, btcWithIncome: NaN, btcWithoutIncome: Infinity },
          { year: 1, btcWithIncome: -Infinity, btcWithoutIncome: 0 },
        ],
      });
      const formData = createTestFormData();

      const growth = service.calculatePortfolioGrowth(invalidResults, formData);

      // Should handle invalid values in final calculation - final result uses last element (-Infinity, 0)
      expect(growth.btcGrowthWithIncome).toBe(-Infinity); // (-Infinity - 1) / 1 * 100 = -Infinity
      expect(growth.btcGrowthWithoutIncome).toBe(-100); // (0 - 1) / 1 * 100 = -100
      expect(growth.finalBtcWithIncome).toBe(-Infinity);
      expect(growth.finalBtcWithoutIncome).toBe(0);
    });
  });

  describe("Cashflow Calculation Edge Cases", () => {
    it("should handle empty income and expense arrays", () => {
      const emptyResults = createTestResults({
        usdIncome: [],
        usdIncomeWithLeverage: [],
        annualExpenses: [],
      });
      const formData = createTestFormData({ activationYear: 0 });

      const cashflows = service.calculateCashflows(emptyResults, formData);

      expect(cashflows.activationYear.withoutLeverage).toBe(0); // 0 - 0
      expect(cashflows.activationYear.withLeverage).toBe(0);
      expect(cashflows.finalYear.withoutLeverage).toBe(0);
      expect(cashflows.finalYear.withLeverage).toBe(0);
    });

    it("should handle activation year beyond array bounds", () => {
      const results = createTestResults();
      const beyondBoundsFormData = createTestFormData({ activationYear: 10 });

      const cashflows = service.calculateCashflows(
        results,
        beyondBoundsFormData,
      );

      // Should default to 0 for out-of-bounds array access
      expect(cashflows.activationYear.withoutLeverage).toBe(0); // 0 - 0
      expect(cashflows.activationYear.withLeverage).toBe(0);
      expect(cashflows.finalYear.withoutLeverage).toBe(-52000); // 2000 - 54000
      expect(cashflows.finalYear.withLeverage).toBe(-51000); // 3000 - 54000
    });

    it("should handle negative activation year", () => {
      const results = createTestResults();
      const negativeActivationFormData = createTestFormData({
        activationYear: -1,
      });

      const cashflows = service.calculateCashflows(
        results,
        negativeActivationFormData,
      );

      // Should default to 0 for negative array access
      expect(cashflows.activationYear.withoutLeverage).toBe(0);
      expect(cashflows.activationYear.withLeverage).toBe(0);
    });

    it("should handle extreme income and expense values", () => {
      const extremeResults = createTestResults({
        usdIncome: [0, 1000000000, 2000000000],
        usdIncomeWithLeverage: [0, 1500000000, 3000000000],
        annualExpenses: [999999999, 999999999, 999999999],
      });
      const formData = createTestFormData();

      const cashflows = service.calculateCashflows(extremeResults, formData);

      expect(isFinite(cashflows.activationYear.withoutLeverage)).toBe(true);
      expect(isFinite(cashflows.activationYear.withLeverage)).toBe(true);
      expect(cashflows.activationYear.withoutLeverage).toBe(1); // 1000000000 - 999999999
      expect(cashflows.activationYear.withLeverage).toBe(500000001); // 1500000000 - 999999999
    });

    it("should handle arrays with invalid numeric values", () => {
      const invalidResults = createTestResults({
        usdIncome: [NaN, Infinity, -Infinity],
        usdIncomeWithLeverage: [-Infinity, NaN, Infinity],
        annualExpenses: [Infinity, -Infinity, NaN],
      });
      const formData = createTestFormData();

      const cashflows = service.calculateCashflows(invalidResults, formData);

      // Should handle mathematical operations with invalid values
      expect(typeof cashflows.activationYear.withoutLeverage).toBe("number");
      expect(typeof cashflows.activationYear.withLeverage).toBe("number");
      expect(typeof cashflows.finalYear.withoutLeverage).toBe("number");
      expect(typeof cashflows.finalYear.withLeverage).toBe("number");
    });
  });

  describe("Portfolio Mix Calculation Edge Cases", () => {
    it("should handle zero time horizon without division by zero", () => {
      const results = createTestResults();
      const zeroHorizonFormData = createTestFormData({ timeHorizon: 0 });

      const mix = service.calculatePortfolioMix(results, zeroHorizonFormData);

      // With zero time horizon, no yield growth should occur
      expect(mix.finalSavingsPct).toBeCloseTo(60, 5);
      expect(mix.finalInvestmentsPct).toBeCloseTo(30, 5);
      expect(mix.finalSpeculationPct).toBeCloseTo(10, 5);
      expect(mix.mixChange).toBeCloseTo(0, 5);
    });

    it("should handle negative time horizon gracefully", () => {
      const results = createTestResults();
      const negativeHorizonFormData = createTestFormData({ timeHorizon: -5 });

      const mix = service.calculatePortfolioMix(
        results,
        negativeHorizonFormData,
      );

      // Negative time horizon should not cause crashes
      expect(typeof mix.finalSavingsPct).toBe("number");
      expect(typeof mix.finalInvestmentsPct).toBe("number");
      expect(typeof mix.finalSpeculationPct).toBe("number");
      expect(isFinite(mix.mixChange)).toBe(true);
    });

    it("should handle extreme yield values without overflow", () => {
      const results = createTestResults();
      const extremeYieldFormData = createTestFormData({
        investmentsStartYield: 1000, // 1000% yield
        investmentsEndYield: 500,
        speculationStartYield: 2000,
        speculationEndYield: 100,
        timeHorizon: 10,
      });

      const mix = service.calculatePortfolioMix(results, extremeYieldFormData);

      // Should handle extreme growth without producing invalid results
      expect(isFinite(mix.finalSavingsPct)).toBe(true);
      expect(isFinite(mix.finalInvestmentsPct)).toBe(true);
      expect(isFinite(mix.finalSpeculationPct)).toBe(true);
      expect(
        mix.finalSavingsPct + mix.finalInvestmentsPct + mix.finalSpeculationPct,
      ).toBeCloseTo(100, 5);
    });

    it("should handle negative yields correctly", () => {
      const results = createTestResults();
      const negativeYieldFormData = createTestFormData({
        investmentsStartYield: -50, // -50% yield (losses)
        investmentsEndYield: -20,
        speculationStartYield: -80,
        speculationEndYield: -10,
        timeHorizon: 5,
      });

      const mix = service.calculatePortfolioMix(results, negativeYieldFormData);

      // Negative yields should reduce allocation percentages
      expect(mix.finalSavingsPct).toBeGreaterThan(60); // Should increase relative to losing investments
      expect(mix.finalInvestmentsPct).toBeLessThan(30); // Should decrease due to losses
      expect(mix.finalSpeculationPct).toBeLessThan(10); // Should decrease due to losses
      expect(isFinite(mix.mixChange)).toBe(true);
    });

    it("should handle zero allocation percentages", () => {
      const results = createTestResults();
      const zeroAllocationFormData = createTestFormData({
        savingsPct: 100,
        investmentsPct: 0,
        speculationPct: 0,
      });

      const mix = service.calculatePortfolioMix(
        results,
        zeroAllocationFormData,
      );

      // With zero investments/speculation, mix should remain unchanged
      expect(mix.finalSavingsPct).toBe(100);
      expect(mix.finalInvestmentsPct).toBe(0);
      expect(mix.finalSpeculationPct).toBe(0);
      expect(mix.mixChange).toBe(0);
    });

    it("should handle total allocation of zero without division by zero", () => {
      const results = createTestResults();
      const zeroTotalFormData = createTestFormData({
        savingsPct: 0,
        investmentsPct: 0,
        speculationPct: 0,
      });

      const mix = service.calculatePortfolioMix(results, zeroTotalFormData);

      // Division by zero should not crash
      expect(isNaN(mix.finalSavingsPct) || mix.finalSavingsPct === 0).toBe(
        true,
      );
      expect(
        isNaN(mix.finalInvestmentsPct) || mix.finalInvestmentsPct === 0,
      ).toBe(true);
      expect(
        isNaN(mix.finalSpeculationPct) || mix.finalSpeculationPct === 0,
      ).toBe(true);
    });

    it("should handle extreme allocation percentages", () => {
      const results = createTestResults();
      const extremeAllocationFormData = createTestFormData({
        savingsPct: 1000, // 1000% (mathematically invalid but should not crash)
        investmentsPct: 500,
        speculationPct: 200,
      });

      const mix = service.calculatePortfolioMix(
        results,
        extremeAllocationFormData,
      );

      expect(isFinite(mix.finalSavingsPct)).toBe(true);
      expect(isFinite(mix.finalInvestmentsPct)).toBe(true);
      expect(isFinite(mix.finalSpeculationPct)).toBe(true);
    });
  });

  describe("Currency Formatting Edge Cases", () => {
    it("should handle zero value correctly", () => {
      const result = service.formatCurrency(0);

      expect(result.formatted).toBe("$0");
      expect(result.isPositive).toBe(true);
    });

    it("should handle positive values correctly", () => {
      const result = service.formatCurrency(12345.67);

      expect(result.formatted).toBe("$12,346"); // Rounded to no fractions
      expect(result.isPositive).toBe(true);
    });

    it("should handle negative values with parentheses", () => {
      const result = service.formatCurrency(-12345.67);

      expect(result.formatted).toBe("($12,346)");
      expect(result.isPositive).toBe(false);
    });

    it("should handle extreme positive values", () => {
      const result = service.formatCurrency(999999999999.99);

      expect(result.formatted).toBe("$1,000,000,000,000");
      expect(result.isPositive).toBe(true);
    });

    it("should handle extreme negative values", () => {
      const result = service.formatCurrency(-999999999999.99);

      expect(result.formatted).toBe("($1,000,000,000,000)");
      expect(result.isPositive).toBe(false);
    });

    it("should handle very small positive values", () => {
      const result = service.formatCurrency(0.01);

      expect(result.formatted).toBe("$0");
      expect(result.isPositive).toBe(true);
    });

    it("should handle very small negative values", () => {
      const result = service.formatCurrency(-0.01);

      expect(result.formatted).toBe("($0)");
      expect(result.isPositive).toBe(false);
    });

    it("should handle Infinity values gracefully", () => {
      const positiveInfinity = service.formatCurrency(Infinity);
      const negativeInfinity = service.formatCurrency(-Infinity);

      expect(typeof positiveInfinity.formatted).toBe("string");
      expect(typeof negativeInfinity.formatted).toBe("string");
      expect(positiveInfinity.isPositive).toBe(true);
      expect(negativeInfinity.isPositive).toBe(false);
    });

    it("should handle NaN values gracefully", () => {
      const result = service.formatCurrency(NaN);

      expect(typeof result.formatted).toBe("string");
      expect(typeof result.isPositive).toBe("boolean");
    });

    it("should handle floating point precision edge cases", () => {
      // Test floating point precision issues
      const result1 = service.formatCurrency(0.1 + 0.2); // Often equals 0.30000000000000004
      const result2 = service.formatCurrency(999999.99 + 0.01); // Potential precision issue

      expect(result1.formatted).toBe("$0");
      expect(result2.formatted).toBe("$1,000,000");
      expect(result1.isPositive).toBe(true);
      expect(result2.isPositive).toBe(true);
    });
  });

  describe("Integration Testing - Multiple Function Interactions", () => {
    it("should handle consistent data flow between all calculations", () => {
      const results = createTestResults();
      const formData = createTestFormData();

      // All calculations should work together without throwing
      const growth = service.calculatePortfolioGrowth(results, formData);
      const cashflows = service.calculateCashflows(results, formData);
      const mix = service.calculatePortfolioMix(results, formData);

      // Verify all calculations produce valid results
      expect(typeof growth.btcGrowthWithIncome).toBe("number");
      expect(typeof cashflows.activationYear.withoutLeverage).toBe("number");
      expect(typeof mix.finalSavingsPct).toBe("number");

      // Test currency formatting with calculated values
      const formattedGrowth = service.formatCurrency(
        growth.finalBtcWithIncome * 100000,
      );
      expect(typeof formattedGrowth.formatted).toBe("string");
    });

    it("should handle extreme scenario with all invalid inputs", () => {
      const extremeResults = createTestResults({
        results: [
          { btcWithIncome: NaN, btcWithoutIncome: Infinity, year: 2025 },
        ],
        usdIncome: [Infinity],
        usdIncomeWithLeverage: [-Infinity],
        annualExpenses: [NaN],
      });
      const extremeFormData = createTestFormData({
        btcStack: 0,
        timeHorizon: -1,
        activationYear: 999,
        savingsPct: 0,
        investmentsPct: 0,
        speculationPct: 0,
      });

      // Should not crash even with all invalid inputs
      expect(() => {
        service.calculatePortfolioGrowth(extremeResults, extremeFormData);
        service.calculateCashflows(extremeResults, extremeFormData);
        service.calculatePortfolioMix(extremeResults, extremeFormData);
        service.formatCurrency(NaN);
      }).not.toThrow();
    });
  });
});
