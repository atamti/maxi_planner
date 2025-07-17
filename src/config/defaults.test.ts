import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "./defaults";

describe("defaults", () => {
  describe("DEFAULT_FORM_DATA", () => {
    it("should have valid default values", () => {
      expect(DEFAULT_FORM_DATA.btcStack).toBe(5);
      expect(DEFAULT_FORM_DATA.savingsPct).toBe(65);
      expect(DEFAULT_FORM_DATA.investmentsPct).toBe(25);
      expect(DEFAULT_FORM_DATA.speculationPct).toBe(10);

      // Verify allocation percentages sum to 100
      const totalAllocation =
        DEFAULT_FORM_DATA.savingsPct +
        DEFAULT_FORM_DATA.investmentsPct +
        DEFAULT_FORM_DATA.speculationPct;
      expect(totalAllocation).toBe(100);
    });

    it("should have valid loan configuration", () => {
      expect(DEFAULT_FORM_DATA.collateralPct).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.collateralPct).toBeLessThanOrEqual(100);
      expect(DEFAULT_FORM_DATA.loanRate).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.loanTermYears).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.ltvRatio).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.ltvRatio).toBeLessThanOrEqual(100);
    });

    it("should have valid yield configurations", () => {
      expect(DEFAULT_FORM_DATA.investmentsStartYield).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_FORM_DATA.investmentsEndYield).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_FORM_DATA.speculationStartYield).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_FORM_DATA.speculationEndYield).toBeGreaterThanOrEqual(0);
    });

    it("should have valid time horizon settings", () => {
      expect(DEFAULT_FORM_DATA.timeHorizon).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.activationYear).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.activationYear).toBeLessThanOrEqual(
        DEFAULT_FORM_DATA.timeHorizon,
      );
    });

    it("should have consistent economic scenario settings", () => {
      expect(DEFAULT_FORM_DATA.economicScenario).toBe("debasement");
      expect(DEFAULT_FORM_DATA.inflationPreset).toBe(
        DEFAULT_FORM_DATA.economicScenario,
      );
      expect(DEFAULT_FORM_DATA.btcPricePreset).toBe(
        DEFAULT_FORM_DATA.economicScenario,
      );
      expect(DEFAULT_FORM_DATA.followEconomicScenarioInflation).toBe(true);
      expect(DEFAULT_FORM_DATA.followEconomicScenarioBtc).toBe(true);
    });

    it("should have valid inflation configuration", () => {
      expect(DEFAULT_FORM_DATA.inflationMode).toBe("simple");
      expect(DEFAULT_FORM_DATA.inflationInputType).toBe("preset");
      expect(DEFAULT_FORM_DATA.inflationFlat).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.inflationStart).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.inflationEnd).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.inflationCustomRates).toHaveLength(30);
      expect(DEFAULT_FORM_DATA.inflationManualMode).toBe(false);
    });

    it("should have valid BTC price configuration", () => {
      expect(DEFAULT_FORM_DATA.btcPriceMode).toBe("simple");
      expect(DEFAULT_FORM_DATA.btcPriceInputType).toBe("preset");
      expect(DEFAULT_FORM_DATA.btcPriceFlat).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.btcPriceStart).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.btcPriceEnd).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.btcPriceCustomRates).toHaveLength(30);
      expect(DEFAULT_FORM_DATA.btcPriceManualMode).toBe(false);
    });

    it("should have valid income configuration", () => {
      expect(DEFAULT_FORM_DATA.incomeYield).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.incomeAllocationPct).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_FORM_DATA.incomeAllocationPct).toBeLessThanOrEqual(100);
      expect(DEFAULT_FORM_DATA.incomeReinvestmentPct).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_FORM_DATA.incomeReinvestmentPct).toBeLessThanOrEqual(100);
      expect(DEFAULT_FORM_DATA.startingExpenses).toBeGreaterThan(0);
    });

    it("should have valid exchange rate", () => {
      expect(DEFAULT_FORM_DATA.exchangeRate).toBeGreaterThan(0);
      expect(DEFAULT_FORM_DATA.priceCrash).toBeGreaterThanOrEqual(0);
    });

    it("should maintain data integrity", () => {
      // Check that all required properties exist
      const requiredProperties = [
        "btcStack",
        "savingsPct",
        "investmentsPct",
        "speculationPct",
        "collateralPct",
        "loanRate",
        "loanTermYears",
        "interestOnly",
        "ltvRatio",
        "investmentsStartYield",
        "investmentsEndYield",
        "speculationStartYield",
        "speculationEndYield",
        "priceCrash",
        "exchangeRate",
        "timeHorizon",
        "activationYear",
        "economicScenario",
        "followEconomicScenarioInflation",
        "followEconomicScenarioBtc",
      ];

      requiredProperties.forEach((prop) => {
        expect(DEFAULT_FORM_DATA).toHaveProperty(prop);
        expect(
          DEFAULT_FORM_DATA[prop as keyof typeof DEFAULT_FORM_DATA],
        ).toBeDefined();
      });
    });
  });
});
