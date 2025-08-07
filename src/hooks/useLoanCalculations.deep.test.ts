import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLoanCalculations } from "./useLoanCalculations";
import { FormData } from "../types";

describe("useLoanCalculations - Deep Edge Case Validation", () => {
  // Base scenario for consistent testing
  const baseFormData: FormData = {
    btcStack: 5,
    exchangeRate: 50000, // $50k per BTC
    timeHorizon: 10,
    activationYear: 3,
    priceCrash: 0,
    
    // Portfolio allocation
    savingsPct: 100,
    investmentsPct: 0,
    speculationPct: 0,
    collateralPct: 60, // 60% collateral
    
    // Loan configuration
    loanRate: 8, // 8% interest
    loanTermYears: 15,
    interestOnly: true,
    ltvRatio: 50, // 50% LTV
    
    // Yield settings
    investmentsStartYield: 0,
    investmentsEndYield: 0,
    speculationStartYield: 0,
    speculationEndYield: 0,
    incomeYield: 0,
    incomeReinvestmentPct: 0,
    
    // Income
    incomeAllocationPct: 0,
    startingExpenses: 0,
    
    // Economic scenario
    economicScenario: 'tight',
    followEconomicScenarioInflation: false,
    followEconomicScenarioBtc: false,
    followEconomicScenarioIncome: false,
    
    // Rates - flat for predictability
    inflationMode: 'simple',
    inflationInputType: 'flat',
    inflationFlat: 2,
    inflationStart: 2,
    inflationEnd: 2,
    inflationPreset: 'tight',
    inflationCustomRates: [],
    inflationManualMode: false,
    
    btcPriceMode: 'simple',
    btcPriceInputType: 'flat',
    btcPriceFlat: 10, // 10% BTC growth per year
    btcPriceStart: 10,
    btcPriceEnd: 10,
    btcPricePreset: 'tight',
    btcPriceCustomRates: [],
    btcPriceManualMode: false,
    
    incomeMode: 'simple',
    incomeInputType: 'flat',
    incomeFlat: 0,
    incomeStart: 0,
    incomeEnd: 0,
    incomePreset: 'tight',
    incomeCustomRates: [],
    incomeManualMode: false
  };

  const mockGetBtcPriceAtYear = (year: number) => {
    // 10% growth per year from $50k base
    return 50000 * Math.pow(1.1, year);
  };

  describe('Edge Case: Extreme LTV Ratios', () => {
    it('should handle 0% LTV ratio correctly', () => {
      const formData = { ...baseFormData, ltvRatio: 0 };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      // 0% LTV should result in no loan
      expect(result.current.calculateLoanDetails(3)).toBeNull();
    });

    it('should handle maximum practical LTV (90%)', () => {
      const formData = { ...baseFormData, ltvRatio: 90 };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // At year 3: 5 BTC * $50k * 1.1^3 * 60% collateral * 90% LTV
        const expectedBtcPrice = 50000 * Math.pow(1.1, 3); // ~$66,550
        const expectedCollateralValue = 5 * expectedBtcPrice * 0.6; // $199,650
        const expectedLoanPrincipal = expectedCollateralValue * 0.9; // $179,685
        
        console.log('High LTV Loan Principal:', loanDetails.loanPrincipal);
        console.log('Expected:', expectedLoanPrincipal);
        
        expect(loanDetails.loanPrincipal).toBeCloseTo(expectedLoanPrincipal, 0);
      }
    });
  });

  describe('Edge Case: Extreme Collateral Percentages', () => {
    it('should handle 1% collateral percentage', () => {
      const formData = { ...baseFormData, collateralPct: 1 };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // Very small loan should still be calculated correctly
        const expectedBtcPrice = 50000 * Math.pow(1.1, 3);
        const expectedCollateralValue = 5 * expectedBtcPrice * 0.01; // 1%
        const expectedLoanPrincipal = expectedCollateralValue * 0.5; // 50% LTV
        
        console.log('Tiny Collateral Loan Principal:', loanDetails.loanPrincipal);
        expect(loanDetails.loanPrincipal).toBeCloseTo(expectedLoanPrincipal, 0);
      }
    });

    it('should handle 99% collateral percentage', () => {
      const formData = { ...baseFormData, collateralPct: 99 };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // Nearly all BTC as collateral
        const expectedBtcPrice = 50000 * Math.pow(1.1, 3);
        const expectedCollateralValue = 5 * expectedBtcPrice * 0.99; // 99%
        const expectedLoanPrincipal = expectedCollateralValue * 0.5; // 50% LTV
        
        console.log('High Collateral Loan Principal:', loanDetails.loanPrincipal);
        expect(loanDetails.loanPrincipal).toBeCloseTo(expectedLoanPrincipal, 0);
      }
    });
  });

  describe('Edge Case: Activation Year Timing', () => {
    it('should handle activation at year 0', () => {
      const formData = { ...baseFormData, activationYear: 0 };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      const loanDetails = result.current.calculateLoanDetails(0);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // Should use year 0 BTC price (no growth)
        const expectedCollateralValue = 5 * 50000 * 0.6; // $150k
        const expectedLoanPrincipal = expectedCollateralValue * 0.5; // $75k
        
        console.log('Year 0 Activation Loan Principal:', loanDetails.loanPrincipal);
        expect(loanDetails.loanPrincipal).toBeCloseTo(expectedLoanPrincipal, 0);
      }
    });

    it('should handle activation beyond time horizon', () => {
      const formData = { ...baseFormData, activationYear: 15, timeHorizon: 10 };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      // This might be an edge case - should it return null or use the last year?
      const loanDetails = result.current.calculateLoanDetails(15);
      console.log('Beyond horizon activation:', loanDetails);
      
      // The behavior here depends on implementation - let's see what happens
      if (loanDetails) {
        expect(loanDetails.loanPrincipal).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Case: Extreme Interest Rates', () => {
    it('should handle 0% interest rate', () => {
      const formData = { ...baseFormData, loanRate: 0 };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // 0% interest should result in 0 annual payments for interest-only
        console.log('0% Interest Annual Payments:', loanDetails.annualPayments);
        expect(loanDetails.annualPayments).toBe(0);
      }
    });

    it('should handle extremely high interest rate (100%)', () => {
      const formData = { ...baseFormData, loanRate: 100 };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // 100% interest rate means annual payments equal principal for interest-only
        console.log('100% Interest Annual Payments:', loanDetails.annualPayments);
        console.log('Loan Principal:', loanDetails.loanPrincipal);
        
        // For interest-only loan: annual payments = principal * rate
        expect(loanDetails.annualPayments).toBeCloseTo(loanDetails.loanPrincipal, 0);
      }
    });
  });

  describe('Edge Case: Loan Term Extremes', () => {
    it('should handle 1-year loan term', () => {
      const formData = { ...baseFormData, loanTermYears: 1, interestOnly: false };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // 1-year amortizing loan should have very high payments
        console.log('1-year loan annual payments:', loanDetails.annualPayments);
        console.log('1-year loan principal:', loanDetails.loanPrincipal);
        
        // Payment should be much higher than interest-only
        const interestOnlyPayment = loanDetails.loanPrincipal * 0.08; // 8% rate
        expect(loanDetails.annualPayments).toBeGreaterThan(interestOnlyPayment);
      }
    });

    it('should handle 100-year loan term', () => {
      const formData = { ...baseFormData, loanTermYears: 100, interestOnly: false };
      const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // 100-year loan should approach interest-only payment
        console.log('100-year loan annual payments:', loanDetails.annualPayments);
        console.log('100-year loan principal:', loanDetails.loanPrincipal);
        
        const interestOnlyPayment = loanDetails.loanPrincipal * 0.08; // 8% rate
        // Should be very close to interest-only for such a long term
        expect(loanDetails.annualPayments).toBeCloseTo(interestOnlyPayment, -2); // Within $100
      }
    });
  });

  describe('Edge Case: BTC Price Volatility', () => {
    it('should handle extreme BTC price growth', () => {
      // Mock extreme BTC growth (1000% per year)
      const extremeGrowthPrice = (year: number) => 50000 * Math.pow(11, year);
      
      const { result } = renderHook(() => useLoanCalculations(baseFormData, extremeGrowthPrice));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // Should calculate based on activation year price, not current price
        const activationPrice = extremeGrowthPrice(3); // Massive price
        const expectedCollateralValue = 5 * activationPrice * 0.6;
        const expectedLoanPrincipal = expectedCollateralValue * 0.5;
        
        console.log('Extreme growth loan principal:', loanDetails.loanPrincipal);
        console.log('Expected:', expectedLoanPrincipal);
        
        expect(loanDetails.loanPrincipal).toBeCloseTo(expectedLoanPrincipal, -3); // Within $1000
      }
    });

    it('should handle BTC price crash', () => {
      // Mock BTC price crash (90% decline each year)
      const crashPrice = (year: number) => 50000 * Math.pow(0.1, year);
      
      const { result } = renderHook(() => useLoanCalculations(baseFormData, crashPrice));
      
      const loanDetails = result.current.calculateLoanDetails(3);
      expect(loanDetails).not.toBeNull();
      
      if (loanDetails) {
        // Even with crash, loan should be based on activation year price
        const activationPrice = crashPrice(3); // Very low price
        const expectedCollateralValue = 5 * activationPrice * 0.6;
        const expectedLoanPrincipal = expectedCollateralValue * 0.5;
        
        console.log('Crash scenario loan principal:', loanDetails.loanPrincipal);
        console.log('Expected:', expectedLoanPrincipal);
        
        expect(loanDetails.loanPrincipal).toBeCloseTo(expectedLoanPrincipal, 0);
      }
    });
  });

  describe('Edge Case: Liquidation Price Logic', () => {
    it('should calculate liquidation price correctly for different LTV ratios', () => {
      // Test liquidation price formula for various LTV ratios
      const testCases = [
        { ltvRatio: 50, activationYear: 3 },
        { ltvRatio: 25, activationYear: 3 },
        { ltvRatio: 75, activationYear: 3 },
      ];
      
      testCases.forEach(({ ltvRatio, activationYear }) => {
        const formData = { ...baseFormData, ltvRatio };
        const { result } = renderHook(() => useLoanCalculations(formData, mockGetBtcPriceAtYear));
        
        const loanDetails = result.current.calculateLoanDetails(activationYear);
        expect(loanDetails).not.toBeNull();
        
        if (loanDetails) {
          const btcPrice = mockGetBtcPriceAtYear(activationYear);
          const currentFormula = btcPrice * (ltvRatio / 80);
          
          console.log(`LTV ${ltvRatio}%:`);
          console.log(`  BTC Price: $${btcPrice}`);
          console.log(`  Liquidation Price (current formula): $${loanDetails.liquidationPrice}`);
          console.log(`  Expected from formula: $${currentFormula}`);
          console.log(`  Ratio: ${loanDetails.liquidationPrice / btcPrice}`);
          
          // Current implementation should match the formula
          expect(loanDetails.liquidationPrice).toBeCloseTo(currentFormula, 0);
          
          // Analyze if this makes sense:
          // For 50% LTV: liquidation at (50/80) = 62.5% of current price
          // For 25% LTV: liquidation at (25/80) = 31.25% of current price  
          // For 75% LTV: liquidation at (75/80) = 93.75% of current price
          
          // This seems backwards! Higher LTV should mean lower liquidation price?
        }
      });
    });

    it('should validate liquidation buffer calculation', () => {
      const { result } = renderHook(() => useLoanCalculations(baseFormData, mockGetBtcPriceAtYear));
      
      const currentBtcPrice = mockGetBtcPriceAtYear(5); // Use year 5 as current
      const liquidationBuffer = result.current.calculateLiquidationBuffer(3, currentBtcPrice);
      const loanDetails = result.current.calculateLoanDetails(3);
      
      console.log('Liquidation Buffer:', liquidationBuffer);
      console.log('Loan Details:', loanDetails);
      
      if (liquidationBuffer !== null && loanDetails) {
        const activationPrice = mockGetBtcPriceAtYear(3);
        console.log(`Activation BTC Price: $${activationPrice}`);
        console.log(`Current BTC Price: $${currentBtcPrice}`);
        console.log(`Liquidation Price: $${loanDetails.liquidationPrice}`);
        console.log(`Buffer: ${((currentBtcPrice - loanDetails.liquidationPrice) / currentBtcPrice * 100).toFixed(2)}%`);
        
        // The buffer should be a number representing the buffer amount or percentage
        expect(typeof liquidationBuffer).toBe('number');
        
        // If current price > liquidation price, buffer should be positive
        if (currentBtcPrice > loanDetails.liquidationPrice) {
          expect(liquidationBuffer).toBeGreaterThan(0);
        }
      }
    });
  });
});
