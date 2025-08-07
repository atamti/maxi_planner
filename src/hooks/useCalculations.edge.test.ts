// Extreme edge case tests - hunting for mathematical bugs and system robustness
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { FormData } from "../types";
import { useCalculations } from "./useCalculations";
import { useLoanCalculations } from "./useLoanCalculations";

describe("Calculation Robustness & Edge Case Bug Hunt", () => {
  // Helper to create test form data
  const createTestFormData = (overrides: Partial<FormData> = {}): FormData => ({
    ...DEFAULT_FORM_DATA,
    ...overrides,
  });

  describe("System Robustness - Should Not Crash", () => {
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

      expect(result.current.results.every((r) => r.btcWithIncome === 0)).toBe(
        true,
      );
      expect(
        result.current.results.every((r) => r.btcWithoutIncome === 0),
      ).toBe(true);
      expect(result.current.loanPrincipal).toBe(0);
    });

    it("should handle activation year beyond time horizon", () => {
      const formData = createTestFormData({
        timeHorizon: 5,
        activationYear: 10, // Beyond time horizon
      });

      const { result } = renderHook(() => useCalculations(formData));

      expect(result.current.usdIncome.every((income) => income === 0)).toBe(
        true,
      );
      expect(
        result.current.usdIncomeWithLeverage.every((income) => income === 0),
      ).toBe(true);
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
      const finalResult =
        result.current.results[result.current.results.length - 1];
      expect(isFinite(finalResult.btcWithIncome)).toBe(true);
      expect(isFinite(finalResult.btcWithoutIncome)).toBe(true);
    });
  });

  describe("Mathematical Edge Cases", () => {
    it("should fix negative exchange rate bug", () => {
      const formData = createTestFormData({
        exchangeRate: -50000, // Negative exchange rate
      });

      const { result } = renderHook(() => useCalculations(formData));

      // Should now be protected from negative loan principals
      expect(result.current.loanPrincipal).toBeGreaterThanOrEqual(0);
    });

    it("should handle extreme BTC appreciation rates", () => {
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

    it("should fix extreme negative yields causing negative BTC", () => {
      const formData = createTestFormData({
        investmentsStartYield: -200, // -200% yield (more than 100% loss)
        investmentsEndYield: -200,
        investmentsPct: 100, // All investments
        savingsPct: 0,
        speculationPct: 0,
      });

      const { result } = renderHook(() => useCalculations(formData));

      // Should be protected from negative BTC amounts
      expect(result.current.results.every((r) => r.btcWithIncome >= 0)).toBe(
        true,
      );
      expect(result.current.results.every((r) => r.btcWithoutIncome >= 0)).toBe(
        true,
      );
    });

    it("should fix extreme positive crash values creating negative BTC", () => {
      const formData = createTestFormData({
        priceCrash: 500, // 500% crash (mathematically impossible)
      });

      const { result } = renderHook(() => useCalculations(formData));

      // Should be protected from negative BTC values
      expect(result.current.results.every((r) => r.btcWithIncome >= 0)).toBe(
        true,
      );
      expect(result.current.results.every((r) => r.btcWithoutIncome >= 0)).toBe(
        true,
      );
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
    });

    it("should handle 100% price crash (BTC goes to zero)", () => {
      const formData = createTestFormData({ priceCrash: 100 });
      const { result } = renderHook(() => useCalculations(formData));

      expect(result.current.results.every((r) => r.btcWithIncome === 0)).toBe(
        true,
      );
      expect(
        result.current.results.every((r) => r.btcWithoutIncome === 0),
      ).toBe(true);
    });

    it("should handle negative price crash (price increase)", () => {
      const formData = createTestFormData({ priceCrash: -50 });
      const { result } = renderHook(() => useCalculations(formData));

      // Negative crash should increase BTC values (crashMultiplier = 1.5)
      const originalBtc = DEFAULT_FORM_DATA.btcStack;
      const finalBtc =
        result.current.results[result.current.results.length - 1];
      expect(finalBtc.btcWithoutIncome).toBeGreaterThan(originalBtc);
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
    });

    it("should handle negative income reinvestment", () => {
      const formData = createTestFormData({
        incomeReinvestmentPct: -50, // Negative reinvestment
        incomeAllocationPct: 50,
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(result.current.results).toBeDefined();
    });
  });

  describe("Precision & Boundary Testing", () => {
    it("should handle very small BTC amounts", () => {
      const formData = createTestFormData({
        btcStack: 0.00000001, // 1 satoshi in BTC
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(
        result.current.results.every((r) => isFinite(r.btcWithIncome)),
      ).toBe(true);
      expect(
        result.current.results.every((r) => isFinite(r.btcWithoutIncome)),
      ).toBe(true);
    });

    it("should handle very large BTC amounts", () => {
      const formData = createTestFormData({
        btcStack: 21000000, // All Bitcoin that will ever exist
      });

      const { result } = renderHook(() => useCalculations(formData));
      expect(
        result.current.results.every((r) => isFinite(r.btcWithIncome)),
      ).toBe(true);
      expect(
        result.current.results.every((r) => isFinite(r.btcWithoutIncome)),
      ).toBe(true);
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

      const liquidationBuffer = result.current.calculateLiquidationBuffer(
        2,
        10,
      );

      if (liquidationBuffer !== null) {
        expect(typeof liquidationBuffer).toBe("number");
        expect(isFinite(liquidationBuffer)).toBe(true);
      }
    });
  });
});
