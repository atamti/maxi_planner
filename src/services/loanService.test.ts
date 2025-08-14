import { describe, expect, it } from "vitest";
import { FormDataSubset } from "../types";
import { createLoanService } from "./loanService";

describe("LoanService", () => {
  const loanService = createLoanService();

  const validFormData: FormDataSubset = {
    timeHorizon: 20,
    btcStack: 10,
    investmentsStartYield: 30,
    investmentsEndYield: 10,
    speculationStartYield: 40,
    speculationEndYield: 5,
    savingsPct: 65,
    investmentsPct: 25,
    speculationPct: 10,
    activationYear: 3,
    startingExpenses: 50000,
    exchangeRate: 45000,
    priceCrash: 0.5,
    collateralPct: 20,
    ltvRatio: 30,
    loanRate: 8,
    loanTermYears: 10,
    interestOnly: false,
    btcPriceCustomRates: [50, 100, 150],
    inflationCustomRates: [2, 3, 4],
    incomeCustomRates: [50000, 55000, 60000],
    incomeAllocationPct: 80,
    enableAnnualReallocation: false,
  };

  const mockGetBtcPriceAtYear = (year: number) => {
    // Mock BTC price at 100% growth rate: $50k -> $100k -> $200k
    return 50000 * Math.pow(2, year);
  };

  describe("calculateLoanDetails", () => {
    it("should return zero values when no collateral is used", () => {
      const noCollateralData = { ...validFormData, collateralPct: 0 };
      const result = loanService.calculateLoanDetails(
        noCollateralData,
        mockGetBtcPriceAtYear,
        3,
      );

      expect(result.loanAmount).toBe(0);
      expect(result.monthlyPayment).toBe(0);
      expect(result.liquidationPrice).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.riskLevel).toBe("low");
    });

    it("should calculate loan details correctly for standard loan", () => {
      const result = loanService.calculateLoanDetails(
        validFormData,
        mockGetBtcPriceAtYear,
        3,
      );

      // Collateral: 2 BTC (20% of 10 BTC)
      // BTC price at year 3: $400k (50k * 2^3)
      // Collateral value: 2 * $400k = $800k USD
      // Loan amount: $800k * 30% = $240k
      expect(result.loanAmount).toBe(240000);
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.liquidationPrice).toBeGreaterThan(0);
    });

    it("should calculate interest-only loan correctly", () => {
      const interestOnlyData = { ...validFormData, interestOnly: true };
      const result = loanService.calculateLoanDetails(
        interestOnlyData,
        mockGetBtcPriceAtYear,
        3,
      );

      // For interest-only: monthly payment = loanAmount * (rate/12)
      const expectedMonthlyPayment = result.loanAmount * (0.08 / 12);
      expect(result.monthlyPayment).toBeCloseTo(expectedMonthlyPayment, 2);
      expect(result.totalInterest).toBe(
        result.monthlyPayment * validFormData.loanTermYears * 12,
      );
    });

    it("should handle zero interest rate", () => {
      const zeroRateData = { ...validFormData, loanRate: 0 };
      const result = loanService.calculateLoanDetails(
        zeroRateData,
        mockGetBtcPriceAtYear,
        3,
      );

      expect(result.monthlyPayment).toBe(
        result.loanAmount / (validFormData.loanTermYears * 12),
      );
      expect(result.totalInterest).toBe(0);
    });

    it("should calculate liquidation price correctly", () => {
      const result = loanService.calculateLoanDetails(
        validFormData,
        mockGetBtcPriceAtYear,
        3,
      );

      // Liquidation price = loanAmount / collateralBtc
      // = $240,000 / 2 BTC = $120,000 per BTC
      const expectedLiquidationPrice = result.loanAmount / 2;
      expect(result.liquidationPrice).toBeCloseTo(expectedLiquidationPrice, 2);
    });

    it("should determine risk levels correctly", () => {
      // Test low risk (high buffer)
      const lowRiskResult = loanService.calculateLoanDetails(
        { ...validFormData, ltvRatio: 10 }, // Very low LTV
        mockGetBtcPriceAtYear,
        3,
      );
      expect(lowRiskResult.riskLevel).toBe("low");

      // Test high risk (low buffer)
      const highRiskResult = loanService.calculateLoanDetails(
        { ...validFormData, ltvRatio: 80 }, // High LTV
        mockGetBtcPriceAtYear,
        3,
      );
      expect(["high", "extreme"]).toContain(highRiskResult.riskLevel);
    });

    it("should handle different BTC prices", () => {
      const lowPriceYear = 1; // $100k
      const highPriceYear = 5; // $1.6M

      const lowPriceResult = loanService.calculateLoanDetails(
        validFormData,
        mockGetBtcPriceAtYear,
        lowPriceYear,
      );

      const highPriceResult = loanService.calculateLoanDetails(
        validFormData,
        mockGetBtcPriceAtYear,
        highPriceYear,
      );

      expect(highPriceResult.loanAmount).toBeGreaterThan(
        lowPriceResult.loanAmount,
      );
      expect(highPriceResult.liquidationPrice).toBeGreaterThan(
        lowPriceResult.liquidationPrice,
      );
    });

    it("should handle different exchange rates", () => {
      const highExchangeRateData = { ...validFormData, exchangeRate: 90000 };
      const result = loanService.calculateLoanDetails(
        highExchangeRateData,
        mockGetBtcPriceAtYear,
        3,
      );

      // Since we fixed the calculation to not use exchange rate for USD collateral,
      // the loan amount should be the same regardless of exchange rate
      const baseResult = loanService.calculateLoanDetails(
        validFormData,
        mockGetBtcPriceAtYear,
        3,
      );

      expect(result.loanAmount).toBe(baseResult.loanAmount);
    });
  });

  describe("validateLoanConfiguration", () => {
    it("should return valid for reasonable loan configuration", () => {
      const result = loanService.validateLoanConfiguration(validFormData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should warn about high LTV ratios", () => {
      const highLtvData = { ...validFormData, ltvRatio: 60 };
      const result = loanService.validateLoanConfiguration(highLtvData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        "LTV ratio above 50% increases liquidation risk significantly",
      );
    });

    it("should warn about very low LTV ratios", () => {
      const lowLtvData = { ...validFormData, ltvRatio: 5 };
      const result = loanService.validateLoanConfiguration(lowLtvData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        "Very low LTV ratio may limit the effectiveness of leverage",
      );
    });

    it("should warn about unusual loan rates", () => {
      const lowRateData = { ...validFormData, loanRate: 0.5 };
      const lowRateResult = loanService.validateLoanConfiguration(lowRateData);

      expect(lowRateResult.warnings).toContain(
        "Unusually low loan rate - verify this is realistic",
      );

      const highRateData = { ...validFormData, loanRate: 25 };
      const highRateResult =
        loanService.validateLoanConfiguration(highRateData);

      expect(highRateResult.warnings).toContain(
        "High loan rate significantly increases cost of leverage",
      );
    });

    it("should error on invalid loan terms", () => {
      const invalidTermData = { ...validFormData, loanTermYears: 0 };
      const result = loanService.validateLoanConfiguration(invalidTermData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Loan term must be at least 1 year");
    });

    it("should warn about very long loan terms", () => {
      const longTermData = { ...validFormData, loanTermYears: 35 };
      const result = loanService.validateLoanConfiguration(longTermData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        "Very long loan terms increase exposure to rate changes",
      );
    });

    it("should warn about high collateral percentages", () => {
      const highCollateralData = { ...validFormData, collateralPct: 90 };
      const result = loanService.validateLoanConfiguration(highCollateralData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        "Using most of your stack as collateral increases risk",
      );
    });

    it("should handle multiple warnings", () => {
      const problematicData = {
        ...validFormData,
        ltvRatio: 60, // High LTV
        loanRate: 25, // High rate
        loanTermYears: 35, // Long term
        collateralPct: 90, // High collateral
      };

      const result = loanService.validateLoanConfiguration(problematicData);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(1);
    });

    it("should not warn about low LTV when no collateral is used", () => {
      const noCollateralData = {
        ...validFormData,
        collateralPct: 0,
        ltvRatio: 5,
      };
      const result = loanService.validateLoanConfiguration(noCollateralData);

      expect(result.warnings).not.toContain(
        "Very low LTV ratio may limit the effectiveness of leverage",
      );
    });
  });
});
