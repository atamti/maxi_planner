import { describe, expect, it } from "vitest";
import { FormDataSubset } from "../types";
import { createValidationService } from "./validationService";

describe("ValidationService", () => {
  const validationService = createValidationService();

  const validFormData: FormDataSubset = {
    timeHorizon: 20,
    btcStack: 5,
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

  describe("validateFormData", () => {
    it("should return valid result for correct form data", () => {
      const result = validationService.validateFormData(validFormData);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
      expect(Object.keys(result.warnings)).toHaveLength(0);
    });

    it("should validate allocation percentages sum to 100", () => {
      const invalidAllocationData = {
        ...validFormData,
        savingsPct: 70,
        investmentsPct: 20,
        speculationPct: 5, // Total = 95%
      };

      const result = validationService.validateFormData(invalidAllocationData);

      expect(result.isValid).toBe(false);
      expect(result.errors.allocation).toContain("95%");
      expect(result.errors.allocation).toContain("100%");
    });

    it("should validate time horizon", () => {
      const invalidTimeHorizonData = {
        ...validFormData,
        timeHorizon: 0,
      };

      const result = validationService.validateFormData(invalidTimeHorizonData);

      expect(result.isValid).toBe(false);
      expect(result.errors.timeHorizon).toBe(
        "Time horizon must be at least 1 year",
      );
    });

    it("should validate BTC stack", () => {
      const invalidBtcStackData = {
        ...validFormData,
        btcStack: 0,
      };

      const result = validationService.validateFormData(invalidBtcStackData);

      expect(result.isValid).toBe(false);
      expect(result.errors.btcStack).toBe("BTC stack must be greater than 0");
    });

    it("should validate investment yield rates", () => {
      const invalidInvestmentYieldData = {
        ...validFormData,
        investmentsStartYield: -5,
      };

      const result = validationService.validateFormData(
        invalidInvestmentYieldData,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.investmentYield).toBe(
        "Start yield cannot be negative",
      );
    });

    it("should validate speculation yield rates", () => {
      const invalidSpeculationYieldData = {
        ...validFormData,
        speculationEndYield: 1500,
      };

      const result = validationService.validateFormData(
        invalidSpeculationYieldData,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.speculationYield).toBe(
        "End yield cannot exceed 1000%",
      );
    });

    it("should generate warnings for edge cases", () => {
      const warningData = {
        ...validFormData,
        activationYear: 20, // Same as timeHorizon
        startingExpenses: 0,
        exchangeRate: -1000,
      };

      const result = validationService.validateFormData(warningData);

      expect(result.warnings.activationYear).toContain(
        "before the end of time horizon",
      );
      expect(result.warnings.startingExpenses).toContain("greater than 0");
      expect(result.warnings.exchangeRate).toContain("greater than 0");
    });

    it("should handle multiple validation errors", () => {
      const multipleErrorsData = {
        ...validFormData,
        timeHorizon: 150, // Too high
        btcStack: -5, // Negative
        savingsPct: 50,
        investmentsPct: 30,
        speculationPct: 30, // Total = 110%
      };

      const result = validationService.validateFormData(multipleErrorsData);

      expect(result.isValid).toBe(false);
      expect(result.errors.timeHorizon).toContain("exceed 100 years");
      expect(result.errors.btcStack).toContain("greater than 0");
      expect(result.errors.allocation).toContain("110%");
    });
  });

  describe("validateTimeHorizon", () => {
    it("should accept valid time horizons", () => {
      expect(validationService.validateTimeHorizon(1).isValid).toBe(true);
      expect(validationService.validateTimeHorizon(20).isValid).toBe(true);
      expect(validationService.validateTimeHorizon(100).isValid).toBe(true);
    });

    it("should reject time horizons below 1", () => {
      const result = validationService.validateTimeHorizon(0);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Time horizon must be at least 1 year");
    });

    it("should reject time horizons above 100", () => {
      const result = validationService.validateTimeHorizon(101);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Time horizon cannot exceed 100 years");
    });
  });

  describe("validateBtcStack", () => {
    it("should accept valid BTC stacks", () => {
      expect(validationService.validateBtcStack(0.1).isValid).toBe(true);
      expect(validationService.validateBtcStack(5).isValid).toBe(true);
      expect(validationService.validateBtcStack(1000).isValid).toBe(true);
    });

    it("should reject zero or negative BTC stacks", () => {
      const result = validationService.validateBtcStack(0);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("BTC stack must be greater than 0");
    });

    it("should reject extremely large BTC stacks", () => {
      const result = validationService.validateBtcStack(1000001);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("BTC stack cannot exceed 1,000,000 BTC");
    });
  });

  describe("validateYieldRates", () => {
    it("should accept valid yield rates", () => {
      expect(validationService.validateYieldRates(0, 0).isValid).toBe(true);
      expect(validationService.validateYieldRates(30, 10).isValid).toBe(true);
      expect(validationService.validateYieldRates(100, 50).isValid).toBe(true);
      expect(validationService.validateYieldRates(1000, 1000).isValid).toBe(
        true,
      );
    });

    it("should reject negative start yield", () => {
      const result = validationService.validateYieldRates(-5, 10);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Start yield cannot be negative");
    });

    it("should reject negative end yield", () => {
      const result = validationService.validateYieldRates(10, -5);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("End yield cannot be negative");
    });

    it("should reject start yield above 1000%", () => {
      const result = validationService.validateYieldRates(1001, 10);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Start yield cannot exceed 1000%");
    });

    it("should reject end yield above 1000%", () => {
      const result = validationService.validateYieldRates(10, 1001);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("End yield cannot exceed 1000%");
    });

    it("should handle edge case of exactly 1000%", () => {
      const result = validationService.validateYieldRates(1000, 1000);
      expect(result.isValid).toBe(true);
    });
  });
});
