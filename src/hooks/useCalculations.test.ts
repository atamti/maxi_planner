import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { useCalculations } from "../hooks/useCalculations";
import { FormData } from "../types";

/**
 * useCalculations Core Functionality Tests
 *
 * This test suite covers the basic functionality, return structure,
 * and standard use cases of the useCalculations hook.
 *
 * Coverage areas:
 * - Return structure validation
 * - Basic calculation accuracy
 * - Standard parameter variations
 * - Integration with default configuration
 */
describe("useCalculations - Core Functionality", () => {
  describe("Return Structure & Basic Validation", () => {
    it("should return all required properties with correct types", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      // Validate return structure
      expect(result.current).toHaveProperty("results");
      expect(result.current).toHaveProperty("usdIncome");
      expect(result.current).toHaveProperty("usdIncomeWithLeverage");
      expect(result.current).toHaveProperty("btcIncome");
      expect(result.current).toHaveProperty("annualExpenses");
      expect(result.current).toHaveProperty("incomeAtActivationYears");
      expect(result.current).toHaveProperty(
        "incomeAtActivationYearsWithLeverage",
      );
      expect(result.current).toHaveProperty("expensesAtActivationYears");
      expect(result.current).toHaveProperty("loanPrincipal");
      expect(result.current).toHaveProperty("loanInterest");

      // Validate array properties
      expect(Array.isArray(result.current.results)).toBe(true);
      expect(Array.isArray(result.current.usdIncome)).toBe(true);
      expect(Array.isArray(result.current.usdIncomeWithLeverage)).toBe(true);
      expect(Array.isArray(result.current.btcIncome)).toBe(true);
      expect(Array.isArray(result.current.annualExpenses)).toBe(true);
      expect(Array.isArray(result.current.incomeAtActivationYears)).toBe(true);
      expect(
        Array.isArray(result.current.incomeAtActivationYearsWithLeverage),
      ).toBe(true);
      expect(Array.isArray(result.current.expensesAtActivationYears)).toBe(
        true,
      );

      // Validate numeric properties
      expect(typeof result.current.loanPrincipal).toBe("number");
      expect(typeof result.current.loanInterest).toBe("number");
    });

    it("should calculate arrays with correct time horizon length", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      const expectedLength = DEFAULT_FORM_DATA.timeHorizon + 1; // 0 through timeHorizon (inclusive)

      expect(result.current.results).toHaveLength(expectedLength);
      expect(result.current.usdIncome).toHaveLength(expectedLength);
      expect(result.current.usdIncomeWithLeverage).toHaveLength(expectedLength);
      expect(result.current.btcIncome).toHaveLength(expectedLength);
      expect(result.current.annualExpenses).toHaveLength(expectedLength);
      expect(result.current.incomeAtActivationYears).toHaveLength(
        expectedLength,
      );
      expect(result.current.incomeAtActivationYearsWithLeverage).toHaveLength(
        expectedLength,
      );
      expect(result.current.expensesAtActivationYears).toHaveLength(
        expectedLength,
      );
    });

    it("should have proper year indexing in results array", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      result.current.results.forEach((yearResult, index) => {
        expect(yearResult.year).toBe(index);
        expect(yearResult.btcWithIncome).toBeGreaterThanOrEqual(0);
        expect(yearResult.btcWithoutIncome).toBeGreaterThanOrEqual(0);
        expect(typeof yearResult.btcWithIncome).toBe("number");
        expect(typeof yearResult.btcWithoutIncome).toBe("number");
      });
    });
  });

  describe("BTC Stack Calculations", () => {
    it("should handle different BTC stack sizes proportionally", () => {
      const smallStackData: FormData = { ...DEFAULT_FORM_DATA, btcStack: 1 };
      const largeStackData: FormData = { ...DEFAULT_FORM_DATA, btcStack: 10 };

      const { result: smallResult } = renderHook(() =>
        useCalculations(smallStackData),
      );
      const { result: largeResult } = renderHook(() =>
        useCalculations(largeStackData),
      );

      const smallFinalBtc =
        smallResult.current.results[smallResult.current.results.length - 1]
          .btcWithIncome;
      const largeFinalBtc =
        largeResult.current.results[largeResult.current.results.length - 1]
          .btcWithIncome;

      // Large stack should have proportionally larger final value
      expect(largeFinalBtc).toBeGreaterThan(smallFinalBtc);
      expect(largeFinalBtc / smallFinalBtc).toBeCloseTo(10, 1); // Should be close to 10x ratio
    });

    it("should handle different time horizons correctly", () => {
      const shortTermData: FormData = { ...DEFAULT_FORM_DATA, timeHorizon: 5 };
      const longTermData: FormData = { ...DEFAULT_FORM_DATA, timeHorizon: 30 };

      const { result: shortResult } = renderHook(() =>
        useCalculations(shortTermData),
      );
      const { result: longResult } = renderHook(() =>
        useCalculations(longTermData),
      );

      expect(shortResult.current.results).toHaveLength(6); // years 0-5
      expect(longResult.current.results).toHaveLength(31); // years 0-30

      // Longer time horizon should generally result in larger BTC stack due to compound growth
      const shortFinalBtc = shortResult.current.results[5].btcWithIncome;
      const longFinalBtc = longResult.current.results[30].btcWithIncome;
      expect(longFinalBtc).toBeGreaterThan(shortFinalBtc);
    });

    it("should handle different portfolio allocations", () => {
      const conservativeData: FormData = {
        ...DEFAULT_FORM_DATA,
        savingsPct: 90,
        investmentsPct: 10,
        speculationPct: 0,
      };

      const balancedData: FormData = {
        ...DEFAULT_FORM_DATA,
        savingsPct: 60,
        investmentsPct: 30,
        speculationPct: 10,
      };

      const aggressiveData: FormData = {
        ...DEFAULT_FORM_DATA,
        savingsPct: 40,
        investmentsPct: 30,
        speculationPct: 30,
      };

      const { result: conservativeResult } = renderHook(() =>
        useCalculations(conservativeData),
      );
      const { result: balancedResult } = renderHook(() =>
        useCalculations(balancedData),
      );
      const { result: aggressiveResult } = renderHook(() =>
        useCalculations(aggressiveData),
      );

      // All should produce valid results
      expect(conservativeResult.current.results).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );
      expect(balancedResult.current.results).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );
      expect(aggressiveResult.current.results).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );

      // Results should reflect different growth patterns
      const conservativeFinal =
        conservativeResult.current.results[
          conservativeResult.current.results.length - 1
        ];
      const balancedFinal =
        balancedResult.current.results[
          balancedResult.current.results.length - 1
        ];
      const aggressiveFinal =
        aggressiveResult.current.results[
          aggressiveResult.current.results.length - 1
        ];

      expect(conservativeFinal.btcWithIncome).toBeGreaterThan(0);
      expect(balancedFinal.btcWithIncome).toBeGreaterThan(0);
      expect(aggressiveFinal.btcWithIncome).toBeGreaterThan(0);
    });
  });

  describe("Loan Calculations", () => {
    it("should calculate loan details correctly with default configuration", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      expect(result.current.loanPrincipal).toBeGreaterThanOrEqual(0);
      expect(result.current.loanInterest).toBeGreaterThanOrEqual(0);
      expect(isFinite(result.current.loanPrincipal)).toBe(true);
      expect(isFinite(result.current.loanInterest)).toBe(true);
    });

    it("should handle interest-only vs amortizing loans", () => {
      const interestOnlyData: FormData = {
        ...DEFAULT_FORM_DATA,
        interestOnly: true,
      };
      const amortizingData: FormData = {
        ...DEFAULT_FORM_DATA,
        interestOnly: false,
      };

      const { result: interestOnlyResult } = renderHook(() =>
        useCalculations(interestOnlyData),
      );
      const { result: amortizingResult } = renderHook(() =>
        useCalculations(amortizingData),
      );

      // Both should have valid loan calculations
      expect(typeof interestOnlyResult.current.loanPrincipal).toBe("number");
      expect(typeof amortizingResult.current.loanPrincipal).toBe("number");
      expect(interestOnlyResult.current.loanInterest).toBeGreaterThanOrEqual(0);
      expect(amortizingResult.current.loanInterest).toBeGreaterThanOrEqual(0);
    });

    it("should handle no collateral scenario", () => {
      const noCollateralData: FormData = {
        ...DEFAULT_FORM_DATA,
        collateralPct: 0,
      };
      const { result } = renderHook(() => useCalculations(noCollateralData));

      // With no collateral, loan values should be zero
      expect(result.current.loanPrincipal).toBe(0);
      expect(result.current.loanInterest).toBe(0);

      // Should still have valid BTC growth calculations
      expect(result.current.results).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );
      result.current.results.forEach((yearResult) => {
        expect(yearResult.btcWithIncome).toBeGreaterThanOrEqual(0);
        expect(yearResult.btcWithoutIncome).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Income Generation", () => {
    it("should handle income allocation and generation", () => {
      const incomeData: FormData = {
        ...DEFAULT_FORM_DATA,
        incomeAllocationPct: 25,
        activationYear: 2,
      };

      const { result } = renderHook(() => useCalculations(incomeData));

      // Before activation year, no income should be generated
      expect(result.current.usdIncome[0]).toBe(0);
      expect(result.current.usdIncome[1]).toBe(0);

      // From activation year onwards, income should be generated (if yield > 0)
      if (
        DEFAULT_FORM_DATA.incomeCustomRates.length > 0 ||
        DEFAULT_FORM_DATA.incomeFlat > 0
      ) {
        expect(result.current.usdIncome[2]).toBeGreaterThanOrEqual(0);
      }
    });

    it("should handle income reinvestment", () => {
      const reinvestmentData: FormData = {
        ...DEFAULT_FORM_DATA,
        incomeAllocationPct: 30,
        incomeReinvestmentPct: 50,
        activationYear: 1,
      };

      const { result } = renderHook(() => useCalculations(reinvestmentData));

      // Income arrays should be properly calculated
      expect(result.current.usdIncome).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );
      expect(result.current.usdIncomeWithLeverage).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );
    });
  });

  describe("Economic Scenarios & Custom Rates", () => {
    it("should handle custom rate arrays", () => {
      const customRatesData: FormData = {
        ...DEFAULT_FORM_DATA,
        btcPriceCustomRates: [0.5, 0.3, 0.2, 0.1, 0.1], // Declining BTC growth
        inflationCustomRates: [0.02, 0.03, 0.04, 0.05, 0.06], // Rising inflation
        incomeCustomRates: [0.08, 0.07, 0.06, 0.05, 0.04], // Declining income
        timeHorizon: 4, // Match array lengths
      };

      const { result } = renderHook(() => useCalculations(customRatesData));

      expect(result.current.results).toHaveLength(5); // years 0-4
      expect(result.current.annualExpenses.length).toBe(5);

      // Expenses should increase due to inflation
      expect(result.current.annualExpenses[4]).toBeGreaterThan(
        result.current.annualExpenses[0],
      );
    });
  });

  describe("Deterministic Behavior", () => {
    it("should produce consistent results across multiple runs", () => {
      const { result: result1 } = renderHook(() =>
        useCalculations(DEFAULT_FORM_DATA),
      );
      const { result: result2 } = renderHook(() =>
        useCalculations(DEFAULT_FORM_DATA),
      );

      // Core values should be identical
      expect(result1.current.loanPrincipal).toBe(result2.current.loanPrincipal);
      expect(result1.current.loanInterest).toBe(result2.current.loanInterest);
      expect(result1.current.results.length).toBe(
        result2.current.results.length,
      );

      // Final BTC values should be identical
      const final1 =
        result1.current.results[result1.current.results.length - 1];
      const final2 =
        result2.current.results[result2.current.results.length - 1];
      expect(final1.btcWithIncome).toBe(final2.btcWithIncome);
      expect(final1.btcWithoutIncome).toBe(final2.btcWithoutIncome);

      // All array values should be identical
      result1.current.usdIncome.forEach((income, index) => {
        expect(income).toBe(result2.current.usdIncome[index]);
      });
    });
  });
});
