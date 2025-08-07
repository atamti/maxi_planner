import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormData } from "../types";
import { useCalculations } from "./useCalculations";

describe("useCalculations - Mathematical Precision & Business Logic", () => {
  // Simplified scenario for precise calculation validation
  const createPrecisionTestData = (overrides: Partial<FormData> = {}): FormData => ({
    btcStack: 1,
    exchangeRate: 100000, // $100k per BTC for easy math
    timeHorizon: 3,
    activationYear: 1,
    priceCrash: 0,

    // Portfolio: 100% savings allocation for predictability
    savingsPct: 100,
    investmentsPct: 0,
    speculationPct: 0,
    collateralPct: 50, // 50% of savings for collateral

    // Loan: Interest-only for mathematical clarity
    loanRate: 6, // 6% for easy calculations
    loanTermYears: 10,
    interestOnly: true,
    ltvRatio: 50, // 50% LTV

    // Zero yields for mathematical predictability
    investmentsStartYield: 0,
    investmentsEndYield: 0,
    speculationStartYield: 0,
    speculationEndYield: 0,
    incomeYield: 0,
    incomeReinvestmentPct: 0,

    // No income allocation for baseline tests
    incomeAllocationPct: 0,
    startingExpenses: 0,

    // Economic scenario
    economicScenario: "tight",
    followEconomicScenarioInflation: false,
    followEconomicScenarioBtc: false,
    followEconomicScenarioIncome: false,

    // Zero rates for mathematical predictability
    inflationMode: "simple",
    inflationInputType: "flat",
    inflationFlat: 0,
    inflationStart: 0,
    inflationEnd: 0,
    inflationPreset: "tight",
    inflationCustomRates: [],
    inflationManualMode: false,

    btcPriceMode: "simple",
    btcPriceInputType: "flat", 
    btcPriceFlat: 0,
    btcPriceStart: 0,
    btcPriceEnd: 0,
    btcPricePreset: "tight",
    btcPriceCustomRates: [],
    btcPriceManualMode: false,

    incomeMode: "simple",
    incomeInputType: "flat",
    incomeFlat: 0,
    incomeStart: 0,
    incomeEnd: 0,
    incomePreset: "tight",
    incomeCustomRates: [],
    incomeManualMode: false,

    ...overrides,
  });

  describe("Loan Mathematical Precision", () => {
    it("should calculate exact loan principal: 1 BTC × $100k × 50% collateral × 50% LTV = $25k", () => {
      const formData = createPrecisionTestData();
      const { result } = renderHook(() => useCalculations(formData));

      // Mathematical expectation: 1 BTC × $100,000 × 50% collateral × 50% LTV = $25,000
      expect(result.current.loanPrincipal).toBe(25000);
    });

    it("should calculate exact loan interest: $25k loan × 6% rate = $1.5k annual", () => {
      const formData = createPrecisionTestData();
      const { result } = renderHook(() => useCalculations(formData));

      // Mathematical expectation: $25,000 × 6% = $1,500
      expect(result.current.loanInterest).toBe(1500);
    });

    it("should calculate different LTV ratios precisely", () => {
      const ltv25Data = createPrecisionTestData({ ltvRatio: 25 });
      const ltv75Data = createPrecisionTestData({ ltvRatio: 75 });

      const { result: ltv25Result } = renderHook(() => useCalculations(ltv25Data));
      const { result: ltv75Result } = renderHook(() => useCalculations(ltv75Data));

      // 25% LTV: 1 BTC × $100k × 50% collateral × 25% = $12.5k
      expect(ltv25Result.current.loanPrincipal).toBe(12500);
      
      // 75% LTV: 1 BTC × $100k × 50% collateral × 75% = $37.5k  
      expect(ltv75Result.current.loanPrincipal).toBe(37500);
      
      // Loan interest should scale proportionally
      expect(ltv25Result.current.loanInterest).toBe(750);  // $12.5k × 6%
      expect(ltv75Result.current.loanInterest).toBe(2250); // $37.5k × 6%
    });

    it("should calculate amortizing vs interest-only loans correctly", () => {
      const interestOnlyData = createPrecisionTestData({ 
        interestOnly: true,
        loanTermYears: 10,
        loanRate: 6,
      });
      
      const amortizingData = createPrecisionTestData({ 
        interestOnly: false,
        loanTermYears: 10,
        loanRate: 6,
      });

      const { result: interestResult } = renderHook(() => useCalculations(interestOnlyData));
      const { result: amortizingResult } = renderHook(() => useCalculations(amortizingData));

      // Interest-only: just the annual interest
      expect(interestResult.current.loanInterest).toBe(1500); // $25k × 6%
      
      // Amortizing: higher payment (principal + interest)
      expect(amortizingResult.current.loanInterest).toBeGreaterThan(1500);
      
      // Verify amortization formula: P * [r(1+r)^n] / [(1+r)^n - 1]
      // Where P=$25k, r=0.06, n=10
      const expectedAmortization = 25000 * (0.06 * Math.pow(1.06, 10)) / (Math.pow(1.06, 10) - 1);
      expect(Math.abs(amortizingResult.current.loanInterest - expectedAmortization)).toBeLessThan(0.01);
    });
  });

  describe("BTC Stack Growth Precision", () => {
    it("should maintain exact BTC amounts with zero growth", () => {
      const formData = createPrecisionTestData();
      const { result } = renderHook(() => useCalculations(formData));

      // With 0% yields and 0% BTC growth, stack should remain constant
      result.current.results.forEach((yearResult) => {
        expect(yearResult.btcWithIncome).toBe(1);
        expect(yearResult.btcWithoutIncome).toBe(1);
      });
    });

    it("should calculate BTC growth with precise yields", () => {
      const growthData = createPrecisionTestData({
        investmentsStartYield: 10, // 10% flat yield
        investmentsEndYield: 10,
        investmentsPct: 50, // 50% in investments
        savingsPct: 50,     // 50% in savings (0% yield)
      });

      const { result } = renderHook(() => useCalculations(growthData));

      // Year 0: 1 BTC
      expect(result.current.results[0].btcWithIncome).toBe(1);
      
      // Year 1: 0.5 BTC (savings) + 0.5 BTC × 1.1 (investments) = 1.05 BTC
      expect(result.current.results[1].btcWithIncome).toBeCloseTo(1.05, 10);
      
      // Year 2: 0.525 BTC (savings from 1.05) + 0.525 × 1.1 (investments) = 1.1025 BTC
      expect(result.current.results[2].btcWithIncome).toBeCloseTo(1.1025, 10);
    });

    it("should handle price crash calculations precisely", () => {
      const crashData = createPrecisionTestData({
        priceCrash: 20, // 20% crash
      });

      const { result } = renderHook(() => useCalculations(crashData));

      // All BTC amounts should be reduced by 20% (multiplied by 0.8)
      result.current.results.forEach((yearResult) => {
        expect(yearResult.btcWithIncome).toBeCloseTo(0.8, 10);
        expect(yearResult.btcWithoutIncome).toBeCloseTo(0.8, 10);
      });
    });
  });

  describe("Income Generation Precision", () => {
    it("should generate precise income with allocation", () => {
      const incomeData = createPrecisionTestData({
        incomeAllocationPct: 25, // 25% allocation
        incomeYield: 8, // 8% income yield
        incomeReinvestmentPct: 0, // No reinvestment
      });

      const { result } = renderHook(() => useCalculations(incomeData));

      // At activation year (year 1):
      // - 1 BTC × 25% allocation = 0.25 BTC allocated
      // - 0.25 BTC × $100k = $25k USD pool
      // - $25k × 8% yield = $2k annual income
      
      expect(result.current.usdIncome[0]).toBe(0); // Year 0: no income
      expect(result.current.usdIncome[1]).toBeCloseTo(2000, 1); // Year 1: $2k income
    });

    it("should calculate leveraged income precisely", () => {
      const leveragedData = createPrecisionTestData({
        incomeAllocationPct: 50, // 50% allocation  
        incomeYield: 6, // 6% income yield
        incomeReinvestmentPct: 0,
        collateralPct: 100, // Use all savings as collateral
        ltvRatio: 50,
      });

      const { result } = renderHook(() => useCalculations(leveragedData));

      // Base pool: 1 BTC × 50% = 0.5 BTC × $100k = $50k
      // Loan: 1 BTC × 100% collateral × 50% LTV × $100k = $50k loan
      // Total leveraged pool: $50k + $50k = $100k
      // Income: $100k × 6% = $6k
      // Debt service: $50k × 6% = $3k
      // Net leveraged income: $6k - $3k = $3k
      
      expect(result.current.usdIncomeWithLeverage[1]).toBeCloseTo(3000, 1);
    });

    it("should handle income reinvestment mathematics", () => {
      const reinvestmentData = createPrecisionTestData({
        incomeAllocationPct: 40, // 40% allocation
        incomeYield: 10, // 10% yield for easy math
        incomeReinvestmentPct: 50, // 50% reinvestment
      });

      const { result } = renderHook(() => useCalculations(reinvestmentData));

      // Base pool: 1 BTC × 40% = 0.4 BTC × $100k = $40k
      // Total yield: $40k × 10% = $4k
      // Reinvestment: $4k × 50% = $2k
      // Net income: $4k - $2k = $2k
      
      expect(result.current.usdIncome[1]).toBeCloseTo(2000, 1);
    });
  });

  describe("Multi-Year Compound Growth", () => {
    it("should calculate compound BTC growth correctly over multiple years", () => {
      const compoundData = createPrecisionTestData({
        timeHorizon: 5,
        investmentsStartYield: 20, // 20% annual yield
        investmentsEndYield: 20,
        investmentsPct: 100, // 100% in investments
        savingsPct: 0,
      });

      const { result } = renderHook(() => useCalculations(compoundData));

      // Year 0: 1 BTC
      expect(result.current.results[0].btcWithIncome).toBe(1);
      
      // Year 1: 1 × 1.2 = 1.2 BTC
      expect(result.current.results[1].btcWithIncome).toBeCloseTo(1.2, 10);
      
      // Year 2: 1.2 × 1.2 = 1.44 BTC
      expect(result.current.results[2].btcWithIncome).toBeCloseTo(1.44, 10);
      
      // Year 5: 1 × 1.2^5 = 2.48832 BTC
      expect(result.current.results[5].btcWithIncome).toBeCloseTo(2.48832, 4);
    });

    it("should calculate inflation impact on expenses precisely", () => {
      const inflationData = createPrecisionTestData({
        startingExpenses: 50000, // $50k starting expenses
        inflationFlat: 3, // 3% inflation
        timeHorizon: 4,
      });

      const { result } = renderHook(() => useCalculations(inflationData));

      // Year 0: $50k
      expect(result.current.annualExpenses[0]).toBe(50000);
      
      // Year 1: $50k × 1.03 = $51.5k
      expect(result.current.annualExpenses[1]).toBeCloseTo(51500, 1);
      
      // Year 2: $51.5k × 1.03 = $53.045k
      expect(result.current.annualExpenses[2]).toBeCloseTo(53045, 1);
      
      // Year 4: $50k × 1.03^4 = $56,272.76
      expect(result.current.annualExpenses[4]).toBeCloseTo(56272.76, 1);
    });
  });

  describe("Complex Scenario Integration", () => {
    it("should handle realistic portfolio scenario with all components", () => {
      const realisticData = createPrecisionTestData({
        btcStack: 5, // 5 BTC
        exchangeRate: 75000, // $75k per BTC
        timeHorizon: 10,
        activationYear: 3,
        
        // Diversified portfolio
        savingsPct: 60,
        investmentsPct: 30,
        speculationPct: 10,
        
        // Investment yields
        investmentsStartYield: 8,
        investmentsEndYield: 5,
        speculationStartYield: 25,
        speculationEndYield: 10,
        
        // Income generation
        incomeAllocationPct: 20,
        incomeYield: 7,
        incomeReinvestmentPct: 30,
        
        // Loan parameters
        collateralPct: 40,
        ltvRatio: 60,
        loanRate: 5,
        interestOnly: false,
        loanTermYears: 15,
        
        // Economic environment
        startingExpenses: 75000,
        inflationFlat: 2.5,
        priceCrash: 10, // 10% crash scenario
      });

      const { result } = renderHook(() => useCalculations(realisticData));

      // Validate structure and non-negative values
      expect(result.current.results).toHaveLength(11); // 0-10 years
      expect(result.current.loanPrincipal).toBeGreaterThan(0);
      expect(result.current.loanInterest).toBeGreaterThan(0);
      
      // All BTC values should be positive but reduced by crash
      result.current.results.forEach((yearResult) => {
        expect(yearResult.btcWithIncome).toBeGreaterThan(0);
        expect(yearResult.btcWithoutIncome).toBeGreaterThan(0);
        // Values should be less than non-crashed scenario due to 10% crash
        expect(yearResult.btcWithIncome).toBeLessThan(yearResult.btcWithoutIncome * 1.2);
      });
      
      // Income should be generated from activation year onwards
      expect(result.current.usdIncome[2]).toBe(0); // Before activation
      expect(result.current.usdIncome[3]).toBeGreaterThan(0); // At activation
      expect(result.current.usdIncomeWithLeverage[3]).toBeGreaterThan(result.current.usdIncome[3]); // Leverage effect
    });
  });
});
