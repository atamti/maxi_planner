import { describe, expect, it } from "vitest";
import economicScenarios, { ScenarioKey } from "./economicScenarios";

describe("economicScenarios", () => {
  const expectedScenarios: ScenarioKey[] = [
    "tight",
    "debasement",
    "crisis",
    "spiral",
    "custom",
  ];

  it("should contain all expected scenario keys", () => {
    expectedScenarios.forEach((key) => {
      expect(economicScenarios[key]).toBeDefined();
    });
  });

  it("should have proper structure for each scenario", () => {
    expectedScenarios.forEach((key) => {
      const scenario = economicScenarios[key];

      expect(scenario).toHaveProperty("name");
      expect(scenario).toHaveProperty("description");
      expect(scenario).toHaveProperty("inflationAvg");
      expect(scenario).toHaveProperty("btcAppreciationAvg");
      expect(scenario).toHaveProperty("incomeGrowth");
      expect(scenario).toHaveProperty("inflation");
      expect(scenario).toHaveProperty("btcPrice");
      expect(scenario).toHaveProperty("incomeYield");

      expect(typeof scenario.name).toBe("string");
      expect(typeof scenario.description).toBe("string");
      expect(typeof scenario.inflationAvg).toBe("number");
      expect(typeof scenario.btcAppreciationAvg).toBe("number");
      expect(typeof scenario.incomeGrowth).toBe("number");
    });
  });

  it("should have proper preset structure for inflation, btcPrice, and incomeYield", () => {
    expectedScenarios.forEach((key) => {
      const scenario = economicScenarios[key];

      ["inflation", "btcPrice", "incomeYield"].forEach((preset) => {
        const presetData = scenario[preset as keyof typeof scenario] as any;

        expect(presetData).toHaveProperty("name");
        expect(presetData).toHaveProperty("startRate");
        expect(presetData).toHaveProperty("endRate");
        expect(presetData).toHaveProperty("maxAxis");

        expect(typeof presetData.name).toBe("string");
        expect(typeof presetData.startRate).toBe("number");
        expect(typeof presetData.endRate).toBe("number");
        expect(typeof presetData.maxAxis).toBe("number");
      });
    });
  });

  it("should have sensible rate values", () => {
    expectedScenarios.forEach((key) => {
      const scenario = economicScenarios[key];

      // Inflation rates should be reasonable (typically 0-50%)
      expect(scenario.inflation.startRate).toBeGreaterThanOrEqual(0);
      expect(scenario.inflation.endRate).toBeGreaterThanOrEqual(0);
      expect(scenario.inflation.startRate).toBeLessThanOrEqual(100);
      expect(scenario.inflation.endRate).toBeLessThanOrEqual(100);

      // BTC appreciation rates should be positive (can be very high)
      expect(scenario.btcPrice.startRate).toBeGreaterThanOrEqual(0);
      expect(scenario.btcPrice.endRate).toBeGreaterThanOrEqual(0);

      // Income yield rates should be reasonable (typically 0-50%, but can be higher in extreme scenarios)
      expect(scenario.incomeYield.startRate).toBeGreaterThanOrEqual(0);
      expect(scenario.incomeYield.endRate).toBeGreaterThanOrEqual(0);
      expect(scenario.incomeYield.startRate).toBeLessThanOrEqual(250); // Allow higher rates for extreme scenarios
      expect(scenario.incomeYield.endRate).toBeLessThanOrEqual(250);
    });
  });

  it("should have maxAxis values that accommodate the rate ranges", () => {
    expectedScenarios.forEach((key) => {
      const scenario = economicScenarios[key];

      expect(scenario.inflation.maxAxis).toBeGreaterThanOrEqual(
        Math.max(scenario.inflation.startRate, scenario.inflation.endRate),
      );

      expect(scenario.btcPrice.maxAxis).toBeGreaterThanOrEqual(
        Math.max(scenario.btcPrice.startRate, scenario.btcPrice.endRate),
      );

      expect(scenario.incomeYield.maxAxis).toBeGreaterThanOrEqual(
        Math.max(scenario.incomeYield.startRate, scenario.incomeYield.endRate),
      );
    });
  });

  describe("specific scenario characteristics", () => {
    it("tight scenario should have low inflation", () => {
      const tight = economicScenarios.tight;
      expect(tight.inflationAvg).toBeLessThan(5);
      expect(tight.inflation.startRate).toBeLessThan(10);
      expect(tight.inflation.endRate).toBeLessThan(10);
    });

    it("debasement scenario should have moderate to high inflation", () => {
      const debasement = economicScenarios.debasement;
      expect(debasement.inflationAvg).toBeGreaterThanOrEqual(5);
    });

    it("crisis scenario should have very high inflation", () => {
      const crisis = economicScenarios.crisis;
      expect(crisis.inflationAvg).toBeGreaterThan(10);
    });

    it("spiral scenario should have extreme inflation", () => {
      const spiral = economicScenarios.spiral;
      expect(spiral.inflationAvg).toBeGreaterThan(20);
    });

    it("custom scenario should exist", () => {
      const custom = economicScenarios.custom;
      expect(custom).toBeDefined();
      expect(custom.name).toBe("Manual configuration");
    });
  });

  it("should have meaningful scenario names and descriptions", () => {
    expectedScenarios.forEach((key) => {
      const scenario = economicScenarios[key];

      expect(scenario.name.length).toBeGreaterThan(0);
      expect(scenario.description.length).toBeGreaterThan(0);
      expect(scenario.name).not.toBe(scenario.description);
    });
  });

  it("should have consistent units across scenarios", () => {
    // All inflation rates should use the same units (percentages)
    // All BTC appreciation rates should use the same units (percentages)
    // All income yield rates should use the same units (percentages)

    expectedScenarios.forEach((key) => {
      const scenario = economicScenarios[key];

      // Check that rates are in reasonable percentage ranges
      expect(scenario.inflationAvg).toBeLessThan(200); // Less than 200%
      expect(scenario.btcAppreciationAvg).toBeGreaterThanOrEqual(0);
      expect(scenario.incomeGrowth).toBeGreaterThanOrEqual(0);
    });
  });
});
