import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormData } from "../types";
import { useCalculations } from "./useCalculations";

describe("useCalculations - Deep Validation", () => {
  // Simple scenario for predictable calculation validation
  const simpleFormData: FormData = {
    btcStack: 1,
    exchangeRate: 100000, // $100k per BTC
    timeHorizon: 3,
    activationYear: 1,
    priceCrash: 0,

    // Portfolio: 100% savings allocation
    savingsPct: 100,
    investmentsPct: 0,
    speculationPct: 0,
    collateralPct: 50, // 50% of savings for collateral

    // Loan: Interest-only for simplicity
    loanRate: 6, // 6%
    loanTermYears: 10,
    interestOnly: true,
    ltvRatio: 50, // 50% LTV

    // Yield: 0% for simplicity
    investmentsStartYield: 0,
    investmentsEndYield: 0,
    speculationStartYield: 0,
    speculationEndYield: 0,
    incomeYield: 0,
    incomeReinvestmentPct: 0,

    // Income: No income for simplicity
    incomeAllocationPct: 0,
    startingExpenses: 0,

    // Economic scenario
    economicScenario: "tight",
    followEconomicScenarioInflation: false,
    followEconomicScenarioBtc: false,
    followEconomicScenarioIncome: false,

    // Inflation: Flat rates for predictability
    inflationMode: "simple",
    inflationInputType: "flat",
    inflationFlat: 0, // 0% inflation
    inflationStart: 0,
    inflationEnd: 0,
    inflationPreset: "tight",
    inflationCustomRates: [],
    inflationManualMode: false,

    // BTC Price: Flat rates for predictability
    btcPriceMode: "simple",
    btcPriceInputType: "flat",
    btcPriceFlat: 0, // 0% BTC growth
    btcPriceStart: 0,
    btcPriceEnd: 0,
    btcPricePreset: "tight",
    btcPriceCustomRates: [],
    btcPriceManualMode: false,

    // Income: Flat rates for predictability
    incomeMode: "simple",
    incomeInputType: "flat",
    incomeFlat: 0, // 0% income growth
    incomeStart: 0,
    incomeEnd: 0,
    incomePreset: "tight",
    incomeCustomRates: [],
    incomeManualMode: false,
  };

  describe("Basic Loan Calculations", () => {
    it("should calculate correct loan principal with 50% LTV", () => {
      // Expected: 1 BTC * $100k * 50% collateral * 50% LTV = $25k loan
      const { result } = renderHook(() => useCalculations(simpleFormData));

      console.log("Loan Principal:", result.current.loanPrincipal);
      expect(result.current.loanPrincipal).toBe(25000);
    });

    it("should calculate correct loan interest for interest-only loan", () => {
      // Expected: $25k loan * 6% rate = $1.5k annual interest
      const { result } = renderHook(() => useCalculations(simpleFormData));

      console.log("Loan Interest:", result.current.loanInterest);
      expect(result.current.loanInterest).toBe(1500);
    });
  });

  describe("BTC Stack Calculations", () => {
    it("should maintain correct BTC allocation without growth", () => {
      const { result } = renderHook(() => useCalculations(simpleFormData));

      console.log("Results length:", result.current.results.length);
      console.log(
        "Year 0 BTC with income:",
        result.current.results[0]?.btcWithIncome,
      );
      console.log(
        "Year 0 BTC without income:",
        result.current.results[0]?.btcWithoutIncome,
      );

      // Should have results for years 0, 1, 2, 3
      expect(result.current.results).toHaveLength(4);
      expect(result.current.results[0].btcWithIncome).toBe(1);
      expect(result.current.results[0].btcWithoutIncome).toBe(1);
    });
  });

  describe("Income Calculations", () => {
    it("should generate zero income with no income allocation", () => {
      const { result } = renderHook(() => useCalculations(simpleFormData));

      console.log("USD Income:", result.current.usdIncome);
      console.log(
        "USD Income with Leverage:",
        result.current.usdIncomeWithLeverage,
      );
      console.log("BTC Income:", result.current.btcIncome);

      // All income arrays should be zero
      result.current.usdIncome.forEach((income) => {
        expect(income).toBe(0);
      });

      result.current.usdIncomeWithLeverage.forEach((income) => {
        expect(income).toBe(0);
      });

      result.current.btcIncome.forEach((income) => {
        expect(income).toBe(0);
      });
    });

    it("should generate leveraged income only when income allocation > 0", () => {
      const leveragedFormData = {
        ...simpleFormData,
        incomeAllocationPct: 25, // 25% income allocation
      };

      const { result } = renderHook(() => useCalculations(leveragedFormData));

      console.log(
        "With 25% allocation - USD Income with Leverage:",
        result.current.usdIncomeWithLeverage,
      );

      // Should have leveraged income from year 1 onwards (activation year)
      expect(result.current.usdIncomeWithLeverage[0]).toBe(0); // Year 0
      expect(result.current.usdIncomeWithLeverage[1]).toBeGreaterThan(0); // Year 1+
    });

    it("should handle edge case with collateral but no income allocation", () => {
      const edgeCaseFormData = {
        ...simpleFormData,
        collateralPct: 75, // High collateral
        incomeAllocationPct: 0, // But no income allocation
      };

      const { result } = renderHook(() => useCalculations(edgeCaseFormData));

      // Loan should exist (higher collateral = bigger loan)
      expect(result.current.loanPrincipal).toBe(37500); // 1 BTC × $100k × 75% × 50% LTV

      // But no leveraged income should be generated
      result.current.usdIncomeWithLeverage.forEach((income) => {
        expect(income).toBe(0);
      });
    });
  });
});
