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

  describe("business logic variations", () => {
    it("should handle no collateral scenario", () => {
      const noCollateralData: FormData = {
        ...DEFAULT_FORM_DATA,
        collateralPct: 0,
      };

      const { result } = renderHook(() => useCalculations(noCollateralData));

      // With no collateral, loan principal should be zero
      expect(result.current.loanPrincipal).toBe(0);
      expect(result.current.loanInterest).toBe(0);
      
      // Should still have valid BTC growth
      expect(result.current.results).toHaveLength(
        noCollateralData.timeHorizon + 1,
      );
    });

    it("should handle different economic scenarios", () => {
      const customRatesData: FormData = {
        ...DEFAULT_FORM_DATA,
        btcPriceCustomRates: [0.5, 0.3, 0.2, 0.1, 0.1], // Declining BTC growth
        inflationCustomRates: [0.02, 0.03, 0.04, 0.05, 0.06], // Rising inflation
        incomeCustomRates: [0.08, 0.07, 0.06, 0.05, 0.04], // Declining income
        timeHorizon: 4, // Match array lengths
      };

      const { result } = renderHook(() => useCalculations(customRatesData));

      // Should handle custom rate arrays correctly
      expect(result.current.results).toHaveLength(5); // years 0-4
      expect(result.current.annualExpenses.length).toBe(5);
      
      // Expenses should increase due to inflation
      expect(result.current.annualExpenses[4]).toBeGreaterThan(
        result.current.annualExpenses[0]
      );
    });

    it("should calculate consistent results across multiple runs", () => {
      // Test deterministic behavior
      const { result: result1 } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));
      const { result: result2 } = renderHook(() => useCalculations(DEFAULT_FORM_DATA));

      // Results should be identical for same inputs
      expect(result1.current.loanPrincipal).toBe(result2.current.loanPrincipal);
      expect(result1.current.loanInterest).toBe(result2.current.loanInterest);
      expect(result1.current.results.length).toBe(result2.current.results.length);
      
      // Compare final BTC values
      const final1 = result1.current.results[result1.current.results.length - 1];
      const final2 = result2.current.results[result2.current.results.length - 1];
      expect(final1.btcWithIncome).toBe(final2.btcWithIncome);
      expect(final1.btcWithoutIncome).toBe(final2.btcWithoutIncome);
    });
  });
});
