import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { FormData } from "../types";
import { useCalculations } from "./useCalculations";
import { useLoanCalculations } from "./useLoanCalculations";

/**
 * useCalculations Edge Case & Robustness Tests
 * 
 * This test suite validates the robustness of the useCalculations hook
 * against extreme inputs, edge cases, and potential error conditions.
 * These tests ensure the system behaves gracefully under stress and
 * doesn't crash or produce invalid mathematical results.
 * 
 * Coverage areas:
 * - Extreme input values
 * - Boundary conditions
 * - Invalid input handling
 * - Mathematical edge cases
 * - Array bounds protection
 * - NaN/Infinity prevention
 * - Negative value protection
 */
describe("useCalculations - Edge Cases & Robustness", () => {
  // Helper to create test form data
  const createTestFormData = (overrides: Partial<FormData> = {}): FormData => ({
    ...DEFAULT_FORM_DATA,
    ...overrides,
  });

  describe("System Robustness - Crash Prevention", () => {
    it("should handle zero time horizon without division by zero", () => {
      const formData = createTestFormData({
        timeHorizon: 0,
        activationYear: 0,
      });

      const { result } = renderHook(() => useCalculations(formData));

      expect(result.current.results).toBeDefined();
      expect(result.current.results.length).toBe(1); // Only year 0

      // Check for NaN/Infinity values that indicate math errors
      const hasInvalidValues = result.current.results.some(
        (r) => !isFinite(r.btcWithIncome) || !isFinite(r.btcWithoutIncome),
      );
      expect(hasInvalidValues).toBe(false);
    });

    it("should handle zero BTC stack gracefully", () => {
      const formData = createTestFormData({ btcStack: 0 });
      const { result } = renderHook(() => useCalculations(formData));

      expect(result.current.results.every((r) => r.btcWithIncome === 0)).toBe(true);
      expect(result.current.results.every((r) => r.btcWithoutIncome === 0)).toBe(true);
      expect(result.current.loanPrincipal).toBe(0);
      expect(result.current.loanInterest).toBe(0);
    });

    it("should handle activation year beyond time horizon", () => {
      const formData = createTestFormData({
        timeHorizon: 5,
        activationYear: 10, // Beyond time horizon
      });

      const { result } = renderHook(() => useCalculations(formData));

      expect(result.current.usdIncome.every((income) => income === 0)).toBe(true);
      expect(result.current.usdIncomeWithLeverage.every((income) => income === 0)).toBe(true);
    });

    it("should handle extreme yield values without overflow", () => {
      const formData = createTestFormData({
        investmentsStartYield: 1000, // 1000% yield
        investmentsEndYield: 500,
        speculationStartYield: 2000,
        speculationEndYield: 100,
      });

      const { result } = renderHook(() => useCalculations(formData));

      expect(result.current.results).toHaveLength(formData.timeHorizon + 1);
      const finalResult = result.current.results[result.current.results.length - 1];
      expect(isFinite(finalResult.btcWithIncome)).toBe(true);
      expect(isFinite(finalResult.btcWithoutIncome)).toBe(true);
    });

    it("should handle very large time horizons without performance issues", () => {
      const formData = createTestFormData({
        timeHorizon: 100, // Very long time horizon
      });

      const startTime = Date.now();
      const { result } = renderHook(() => useCalculations(formData));
      const endTime = Date.now();

      expect(result.current.results).toHaveLength(101); // 0-100 years
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });

  describe("Mathematical Edge Cases", () => {
    it("should protect against negative exchange rate creating negative loan principals", () => {
      const formData = createTestFormData({
        exchangeRate: -50000, // Negative exchange rate
      });

      const { result } = renderHook(() => useCalculations(formData));

      // Should be protected from negative loan principals
      expect(result.current.loanPrincipal).toBeGreaterThanOrEqual(0);
    });

    it("should handle extreme BTC appreciation rates without overflow", () => {
      const formData = createTestFormData({
        btcPriceCustomRates: [1000, 1000, 1000, 1000, 1000], // 100,000% annual growth
        timeHorizon: 5,
      });

      const { result } = renderHook(() => useCalculations(formData));

      // Should not create Infinity values even with extreme growth
      const hasInfiniteValues = result.current.results.some(
        (r) => !isFinite(r.btcWithIncome) || !isFinite(r.btcWithoutIncome),
      );
      expect(hasInfiniteValues).toBe(false);
    });

    it("should protect against extreme negative yields causing negative BTC", () => {
      const formData = createTestFormData({
        investmentsStartYield: -200, // -200% yield (more than 100% loss)
        investmentsEndYield: -200,
        investmentsPct: 100, // All investments
        savingsPct: 0,
        speculationPct: 0,
      });

      const { result } = renderHook(() => useCalculations(formData));

      // Should be protected from negative BTC amounts
      expect(result.current.results.every((r) => r.btcWithIncome >= 0)).toBe(true);
      expect(result.current.results.every((r) => r.btcWithoutIncome >= 0)).toBe(true);
    });

    it("should protect against extreme positive crash values creating negative BTC", () => {
      const formData = createTestFormData({
        priceCrash: 500, // 500% crash (mathematically impossible)
      });

      const { result } = renderHook(() => useCalculations(formData));

      // Should be protected from negative BTC values
      expect(result.current.results.every((r) => r.btcWithIncome >= 0)).toBe(true);
      expect(result.current.results.every((r) => r.btcWithoutIncome >= 0)).toBe(true);
    });

    it("should handle 100% price crash correctly", () => {
      const formData = createTestFormData({ priceCrash: 100 });
      const { result } = renderHook(() => useCalculations(formData));

      expect(result.current.results.every((r) => r.btcWithIncome === 0)).toBe(true);
      expect(result.current.results.every((r) => r.btcWithoutIncome === 0)).toBe(true);
    });

    it("should handle negative price crash (price increase) correctly", () => {
      const formData = createTestFormData({ priceCrash: -50 });
      const { result } = renderHook(() => useCalculations(formData));

      // Negative crash should increase BTC values (crashMultiplier = 1.5)
      const originalBtc = DEFAULT_FORM_DATA.btcStack;
      const finalBtc = result.current.results[result.current.results.length - 1];
      expect(finalBtc.btcWithoutIncome).toBeGreaterThan(originalBtc);
    });
  });

  describe("Financial Edge Cases", () => {
    it("should handle zero loan rate (free money scenario)", () => {
      const formData = createTestFormData({
        loanRate: 0,
        collateralPct: 50,
        ltvRatio: 50,
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.loanInterest).toBe(0);
      expect(result.current.loanPrincipal).toBeGreaterThan(0); // Should still have principal
    });

    it("should handle extreme loan rates without mathematical errors", () => {
      const formData = createTestFormData({
        loanRate: 999, // 999% interest rate
        collateralPct: 50,
        ltvRatio: 50,
        loanTermYears: 10,
        interestOnly: false,
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(isFinite(result.current.loanInterest)).toBe(true);
      expect(isFinite(result.current.loanPrincipal)).toBe(true);
    });

    it("should handle zero LTV ratio", () => {
      const formData = createTestFormData({
        ltvRatio: 0,
        collateralPct: 50,
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.loanPrincipal).toBe(0);
      expect(result.current.loanInterest).toBe(0);
    });

    it("should handle 100% LTV ratio without liquidation issues", () => {
      const formData = createTestFormData({
        ltvRatio: 100,
        collateralPct: 50,
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(isFinite(result.current.loanPrincipal)).toBe(true);
      expect(isFinite(result.current.loanInterest)).toBe(true);
    });
  });

  describe("Input Validation & Array Bounds", () => {
    it("should handle custom rate arrays shorter than time horizon", () => {
      const formData = createTestFormData({
        timeHorizon: 10,
        btcPriceCustomRates: [0.2, 0.3], // Only 2 values for 10-year horizon
        inflationCustomRates: [0.03], // Only 1 value
        incomeCustomRates: [0.05, 0.06, 0.07], // 3 values
      });

      const { result } = renderHook(() => useCalculations(formData));

      expect(result.current.results).toBeDefined();
      expect(result.current.results.length).toBe(11); // 0 through 10
    });

    it("should handle empty custom rate arrays", () => {
      const formData = createTestFormData({
        timeHorizon: 5,
        btcPriceCustomRates: [],
        inflationCustomRates: [],
        incomeCustomRates: [],
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.results).toBeDefined();
      expect(result.current.results.length).toBe(6); // 0 through 5
    });

    it("should handle custom rate arrays with invalid values", () => {
      const formData = createTestFormData({
        timeHorizon: 3,
        btcPriceCustomRates: [Infinity, -Infinity, NaN],
        inflationCustomRates: [Infinity, -Infinity, NaN],
        incomeCustomRates: [1000000, -1000000, 0],
      });

      const { result } = renderHook(() => useCalculations(formData));

      const hasInvalidResults = result.current.results.some(
        (r) => !isFinite(r.btcWithIncome) || !isFinite(r.btcWithoutIncome),
      );
      expect(hasInvalidResults).toBe(false);
    });

    it("should handle negative income allocation", () => {
      const formData = createTestFormData({
        incomeAllocationPct: -50, // Negative allocation
      });

      const { result } = renderHook(() => useCalculations(formData));

      // Should handle gracefully without breaking the calculation
      expect(result.current.results).toBeDefined();
      expect(result.current.usdIncome.every((income) => income >= 0)).toBe(true);
    });

    it("should handle negative income reinvestment", () => {
      const formData = createTestFormData({
        incomeReinvestmentPct: -50, // Negative reinvestment
        incomeAllocationPct: 50,
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.results).toBeDefined();
    });

    it("should handle allocation percentages over 100%", () => {
      const formData = createTestFormData({
        savingsPct: 150, // Over 100%
        investmentsPct: 50,
        speculationPct: 25,
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.results).toBeDefined();
      // Should not crash even with invalid allocation percentages
    });
  });

  describe("Precision & Boundary Testing", () => {
    it("should handle very small BTC amounts", () => {
      const formData = createTestFormData({
        btcStack: 0.00000001, // 1 satoshi in BTC
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.results.every((r) => isFinite(r.btcWithIncome))).toBe(true);
      expect(result.current.results.every((r) => isFinite(r.btcWithoutIncome))).toBe(true);
    });

    it("should handle very large BTC amounts", () => {
      const formData = createTestFormData({
        btcStack: 21000000, // All Bitcoin that will ever exist
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.results.every((r) => isFinite(r.btcWithIncome))).toBe(true);
      expect(result.current.results.every((r) => isFinite(r.btcWithoutIncome))).toBe(true);
    });

    it("should handle floating point precision in allocation calculations", () => {
      const formData = createTestFormData({
        savingsPct: 33.333333,
        investmentsPct: 33.333333,
        speculationPct: 33.333334, // Should sum to 100 with floating point precision
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.results).toBeDefined();

      const year1Result = result.current.results[1];
      if (year1Result) {
        expect(isFinite(year1Result.btcWithIncome)).toBe(true);
        expect(isFinite(year1Result.btcWithoutIncome)).toBe(true);
      }
    });

    it("should handle very small percentage values", () => {
      const formData = createTestFormData({
        incomeAllocationPct: 0.001, // 0.001%
        collateralPct: 0.01, // 0.01%
        ltvRatio: 0.1, // 0.1%
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.results).toBeDefined();
      expect(isFinite(result.current.loanPrincipal)).toBe(true);
    });
  });

  describe("Loan Calculations Robustness", () => {
    const mockGetBtcPriceAtYear = (year: number) => 50000 * Math.pow(1.5, year);

    it("should handle extreme LTV ratios", () => {
      const formData = createTestFormData({
        ltvRatio: 99.99, // Nearly 100% LTV
        collateralPct: 50,
      });

      const { result } = renderHook(() =>
        useLoanCalculations(formData, mockGetBtcPriceAtYear),
      );

      const loanDetails = result.current.calculateLoanDetails(5);
      if (loanDetails) {
        expect(isFinite(loanDetails.liquidationPrice)).toBe(true);
        expect(loanDetails.liquidationPrice).toBeGreaterThan(0);
      }
    });

    it("should handle zero savings percentage with collateral", () => {
      const formData = createTestFormData({
        savingsPct: 0, // No savings
        investmentsPct: 60,
        speculationPct: 40,
        collateralPct: 50, // But trying to use collateral
      });

      const { result } = renderHook(() =>
        useLoanCalculations(formData, mockGetBtcPriceAtYear),
      );

      const loanDetails = result.current.calculateLoanDetails(5);

      // With zero savings, there should be no collateral available
      if (loanDetails) {
        expect(loanDetails.collateralBtc).toBe(0);
        expect(loanDetails.loanPrincipal).toBe(0);
      } else {
        expect(loanDetails).toBeNull();
      }
    });

    it("should handle declining BTC prices without breaking liquidation calculations", () => {
      const decliningPriceFunction = (year: number) =>
        Math.max(1000, 50000 / Math.pow(1.2, year));

      const formData = createTestFormData({
        ltvRatio: 60,
        collateralPct: 50,
        timeHorizon: 10,
      });

      const { result } = renderHook(() =>
        useLoanCalculations(formData, decliningPriceFunction),
      );

      const liquidationBuffer = result.current.calculateLiquidationBuffer(2, 10);

      if (liquidationBuffer !== null) {
        expect(typeof liquidationBuffer).toBe("number");
        expect(isFinite(liquidationBuffer)).toBe(true);
      }
    });
  });

  describe("Stress Testing", () => {
    it("should handle all extreme values simultaneously", () => {
      const extremeFormData = createTestFormData({
        btcStack: 0.00001,
        exchangeRate: 1000000,
        timeHorizon: 50,
        activationYear: 45,
        priceCrash: 99,
        savingsPct: 0.1,
        investmentsPct: 99.8,
        speculationPct: 0.1,
        collateralPct: 99.9,
        loanRate: 999,
        ltvRatio: 99.9,
        incomeAllocationPct: 99.9,
        incomeReinvestmentPct: 99.9,
        investmentsStartYield: 10000,
        investmentsEndYield: -1000,
        speculationStartYield: 50000,
        speculationEndYield: -5000,
        startingExpenses: 1000000,
        btcPriceCustomRates: [1000, -500, 2000, -1000],
        inflationCustomRates: [100, -50, 200],
        incomeCustomRates: [500, -200],
      });

      const { result } = renderHook(() => useCalculations(extremeFormData));

      // Should not crash and should produce finite results
      expect(result.current.results).toBeDefined();
      expect(result.current.results.length).toBe(51); // 0-50 years

      // All values should be finite
      expect(isFinite(result.current.loanPrincipal)).toBe(true);
      expect(isFinite(result.current.loanInterest)).toBe(true);

      result.current.results.forEach((yearResult) => {
        expect(isFinite(yearResult.btcWithIncome)).toBe(true);
        expect(isFinite(yearResult.btcWithoutIncome)).toBe(true);
        expect(yearResult.btcWithIncome).toBeGreaterThanOrEqual(0);
        expect(yearResult.btcWithoutIncome).toBeGreaterThanOrEqual(0);
      });
    });

    it("should maintain performance with rapid successive calculations", () => {
      const formData = createTestFormData();
      const startTime = Date.now();

      // Run calculations 100 times rapidly
      for (let i = 0; i < 100; i++) {
        const { result } = renderHook(() => useCalculations({
          ...formData,
          btcStack: formData.btcStack + i * 0.01, // Slight variation each time
        }));
        expect(result.current.results).toBeDefined();
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });
  });
});
