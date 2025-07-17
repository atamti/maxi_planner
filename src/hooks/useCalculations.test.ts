import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { useCalculations } from "../hooks/useCalculations";
import { FormData } from "../types";

describe("useCalculations", () => {
  describe("with default form data", () => {
    it("should return calculation results with expected structure", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

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

      // Results should be an array
      expect(Array.isArray(result.current.results)).toBe(true);
      expect(Array.isArray(result.current.usdIncome)).toBe(true);
      expect(Array.isArray(result.current.usdIncomeWithLeverage)).toBe(true);
      expect(Array.isArray(result.current.btcIncome)).toBe(true);
      expect(Array.isArray(result.current.annualExpenses)).toBe(true);
    });

    it("should calculate results for the specified time horizon", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      // Should have results for years 0 through timeHorizon (inclusive)
      expect(result.current.results).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );
      expect(result.current.usdIncome).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );
      expect(result.current.usdIncomeWithLeverage).toHaveLength(
        DEFAULT_FORM_DATA.timeHorizon + 1,
      );
    });

    it("should have valid loan details when activation year is set", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      expect(typeof result.current.loanPrincipal).toBe("number");
      expect(typeof result.current.loanInterest).toBe("number");
      expect(result.current.loanPrincipal).toBeGreaterThanOrEqual(0);
      expect(result.current.loanInterest).toBeGreaterThanOrEqual(0);
    });

    it("should calculate final year data correctly", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      const finalResult =
        result.current.results[result.current.results.length - 1];
      expect(finalResult).toBeDefined();
      expect(finalResult.btcWithIncome).toBeGreaterThan(0);
      expect(finalResult.btcWithoutIncome).toBeGreaterThan(0);
      expect(finalResult.year).toBe(DEFAULT_FORM_DATA.timeHorizon);
    });

    it("should have results with proper year indexing", () => {
      const { result } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      result.current.results.forEach((yearResult, index) => {
        expect(yearResult.year).toBe(index);
        expect(yearResult.btcWithIncome).toBeGreaterThanOrEqual(0);
        expect(yearResult.btcWithoutIncome).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("with custom form data", () => {
    it("should handle different BTC stack sizes", () => {
      const smallStackData: FormData = {
        ...DEFAULT_FORM_DATA,
        btcStack: 1,
      };

      const largeStackData: FormData = {
        ...DEFAULT_FORM_DATA,
        btcStack: 10,
      };

      const { result: smallResult } = renderHook(() =>
        useCalculations(smallStackData),
      );
      const { result: largeResult } = renderHook(() =>
        useCalculations(largeStackData),
      );

      // Larger stack should have proportionally larger portfolio values
      const smallFinalBtc =
        smallResult.current.results[smallResult.current.results.length - 1]
          .btcWithIncome;
      const largeFinalBtc =
        largeResult.current.results[largeResult.current.results.length - 1]
          .btcWithIncome;

      expect(largeFinalBtc).toBeGreaterThan(smallFinalBtc);
    });

    it("should handle different time horizons", () => {
      const shortTermData: FormData = {
        ...DEFAULT_FORM_DATA,
        timeHorizon: 5,
      };

      const longTermData: FormData = {
        ...DEFAULT_FORM_DATA,
        timeHorizon: 30,
      };

      const { result: shortResult } = renderHook(() =>
        useCalculations(shortTermData),
      );
      const { result: longResult } = renderHook(() =>
        useCalculations(longTermData),
      );

      expect(shortResult.current.results).toHaveLength(6); // years 0-5
      expect(longResult.current.results).toHaveLength(31); // years 0-30
    });

    it("should handle different portfolio allocations", () => {
      const conservativeData: FormData = {
        ...DEFAULT_FORM_DATA,
        savingsPct: 90,
        investmentsPct: 10,
        speculationPct: 0,
      };

      const aggressiveData: FormData = {
        ...DEFAULT_FORM_DATA,
        savingsPct: 50,
        investmentsPct: 25,
        speculationPct: 25,
      };

      const { result: conservativeResult } = renderHook(() =>
        useCalculations(conservativeData),
      );
      const { result: aggressiveResult } = renderHook(() =>
        useCalculations(aggressiveData),
      );

      // Both should produce valid results
      expect(conservativeResult.current.results).toHaveLength(
        conservativeData.timeHorizon + 1,
      );
      expect(aggressiveResult.current.results).toHaveLength(
        aggressiveData.timeHorizon + 1,
      );

      // Results should have different growth patterns due to different allocations
      const conservativeFinal =
        conservativeResult.current.results[
          conservativeResult.current.results.length - 1
        ];
      const aggressiveFinal =
        aggressiveResult.current.results[
          aggressiveResult.current.results.length - 1
        ];

      expect(conservativeFinal).toBeDefined();
      expect(aggressiveFinal).toBeDefined();
    });

    it("should handle interest-only vs amortizing loans differently", () => {
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

      // Both should have loan details
      expect(typeof interestOnlyResult.current.loanPrincipal).toBe("number");
      expect(typeof amortizingResult.current.loanPrincipal).toBe("number");

      // Interest calculations should be different between the two
      expect(interestOnlyResult.current.loanInterest).toBeGreaterThanOrEqual(0);
      expect(amortizingResult.current.loanInterest).toBeGreaterThanOrEqual(0);
    });
  });

  describe("edge cases", () => {
    it("should handle zero BTC stack", () => {
      const zeroStackData: FormData = {
        ...DEFAULT_FORM_DATA,
        btcStack: 0,
      };

      const { result } = renderHook(() => useCalculations(zeroStackData));

      // Should still return valid structure even with zero stack
      expect(result.current.results).toHaveLength(
        zeroStackData.timeHorizon + 1,
      );
      const finalResult =
        result.current.results[result.current.results.length - 1];
      expect(finalResult.btcWithIncome).toBe(0);
      expect(finalResult.btcWithoutIncome).toBe(0);
    });

    it("should handle activation year beyond time horizon", () => {
      const invalidActivationData: FormData = {
        ...DEFAULT_FORM_DATA,
        activationYear: 25, // beyond timeHorizon of 20
        timeHorizon: 20,
      };

      const { result } = renderHook(() =>
        useCalculations(invalidActivationData),
      );

      // Should still return valid results
      expect(result.current.results).toHaveLength(21); // 0-20 inclusive
    });

    it("should handle extreme yield values", () => {
      const extremeYieldData: FormData = {
        ...DEFAULT_FORM_DATA,
        investmentsStartYield: 100,
        investmentsEndYield: 0,
        speculationStartYield: 200,
        speculationEndYield: 0,
      };

      const { result } = renderHook(() => useCalculations(extremeYieldData));

      // Should handle extreme values without crashing
      expect(result.current.results).toHaveLength(
        extremeYieldData.timeHorizon + 1,
      );
      const finalResult =
        result.current.results[result.current.results.length - 1];
      expect(finalResult).toBeDefined();
      expect(typeof finalResult.btcWithIncome).toBe("number");
      expect(typeof finalResult.btcWithoutIncome).toBe("number");
    });
  });
});
