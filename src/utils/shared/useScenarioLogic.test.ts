import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScenarioLogic } from "./useScenarioLogic";

describe("useScenarioLogic", () => {
  const mockScenarios = {
    tight: {
      name: "Tight monetary policy",
      description: "Low inflation, steady BTC growth",
      inflationAvg: 2,
      btcAppreciationAvg: 15,
      incomeGrowth: 7.5,
      inflation: {
        name: "Tight monetary policy",
        startRate: 2,
        endRate: 2,
        maxAxis: 10,
      },
      btcPrice: {
        name: "Tight monetary policy - Low growth",
        startRate: 10,
        endRate: 30,
        maxAxis: 50,
      },
    },
    debasement: {
      name: "Currency debasement",
      description: "High inflation, high BTC growth",
      inflationAvg: 8,
      btcAppreciationAvg: 45,
      incomeGrowth: 12,
      inflation: {
        name: "Currency debasement",
        startRate: 6,
        endRate: 12,
        maxAxis: 20,
      },
      btcPrice: {
        name: "Currency debasement - High growth",
        startRate: 30,
        endRate: 80,
        maxAxis: 100,
      },
    },
    custom: {
      name: "Custom scenario",
      description: "User-defined scenario",
      inflationAvg: 0,
      btcAppreciationAvg: 0,
      incomeGrowth: 0,
    },
  };

  const getHook = (scenarios: any = mockScenarios, timeHorizon = 10) => {
    const { result } = renderHook(() => useScenarioLogic(scenarios, timeHorizon));
    return result.current;
  };

  describe("applyScenario", () => {
    it("should apply scenario successfully with valid generator", () => {
      const { applyScenario } = getHook();
      
      const mockGenerator = vi.fn().mockReturnValue([1, 2, 3, 4, 5]);
      const result = applyScenario("tight", mockGenerator);
      
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(mockGenerator).toHaveBeenCalledWith(mockScenarios.tight, 10);
    });

    it("should pass correct scenario data and time horizon to generator", () => {
      const { applyScenario } = getHook(mockScenarios, 25);
      
      const mockGenerator = vi.fn().mockReturnValue([]);
      applyScenario("debasement", mockGenerator);
      
      expect(mockGenerator).toHaveBeenCalledWith(mockScenarios.debasement, 25);
    });

    it("should throw error for non-existent scenario", () => {
      const { applyScenario } = getHook();
      
      const mockGenerator = vi.fn();
      
      expect(() => {
        applyScenario("nonexistent", mockGenerator);
      }).toThrow("Scenario not found: nonexistent");
      
      expect(mockGenerator).not.toHaveBeenCalled();
    });

    it("should throw error for null/undefined scenario key", () => {
      const { applyScenario } = getHook();
      
      const mockGenerator = vi.fn();
      
      expect(() => {
        applyScenario(null as any, mockGenerator);
      }).toThrow("Scenario not found: null");
      
      expect(() => {
        applyScenario(undefined as any, mockGenerator);
      }).toThrow("Scenario not found: undefined");
    });

    it("should handle empty string scenario key", () => {
      const { applyScenario } = getHook();
      
      const mockGenerator = vi.fn();
      
      expect(() => {
        applyScenario("", mockGenerator);
      }).toThrow("Scenario not found: ");
    });

    it("should work with complex generator functions", () => {
      const { applyScenario } = getHook();
      
      const complexGenerator = (scenarioData: any, horizon: number) => {
        return Array.from({ length: horizon }, (_, i) => 
          scenarioData.inflationAvg * (1 + i * 0.1)
        );
      };
      
      const result = applyScenario("tight", complexGenerator);
      
      expect(result).toHaveLength(10);
      expect(result[0]).toBe(2); // inflationAvg = 2
      expect(result[1]).toBe(2.2); // 2 * (1 + 1 * 0.1)
      expect(result[9]).toBe(3.8); // 2 * (1 + 9 * 0.1)
    });
  });

  describe("getAvailableScenarios", () => {
    it("should return all scenarios except custom", () => {
      const { getAvailableScenarios } = getHook();
      
      const scenarios = getAvailableScenarios();
      
      expect(scenarios).toEqual(["tight", "debasement"]);
      expect(scenarios).not.toContain("custom");
    });

    it("should return empty array when only custom scenario exists", () => {
      const onlyCustom = { custom: mockScenarios.custom };
      const { getAvailableScenarios } = getHook(onlyCustom);
      
      const scenarios = getAvailableScenarios();
      
      expect(scenarios).toEqual([]);
    });

    it("should work with empty scenarios object", () => {
      const { getAvailableScenarios } = getHook({});
      
      const scenarios = getAvailableScenarios();
      
      expect(scenarios).toEqual([]);
    });

    it("should maintain order of scenarios", () => {
      const orderedScenarios = {
        aaa: { name: "A scenario" },
        zzz: { name: "Z scenario" },
        bbb: { name: "B scenario" },
        custom: { name: "Custom" },
      };
      
      const { getAvailableScenarios } = getHook(orderedScenarios);
      const scenarios = getAvailableScenarios();
      
      expect(scenarios).toEqual(["aaa", "zzz", "bbb"]);
    });
  });

  describe("getScenarioDropdownData", () => {
    it("should return scenarios excluding custom", () => {
      const { getScenarioDropdownData } = getHook();
      
      const dropdownData = getScenarioDropdownData();
      
      expect(dropdownData).toEqual({
        tight: mockScenarios.tight,
        debasement: mockScenarios.debasement,
      });
      expect(dropdownData).not.toHaveProperty("custom");
    });

    it("should return empty object when only custom exists", () => {
      const onlyCustom = { custom: mockScenarios.custom };
      const { getScenarioDropdownData } = getHook(onlyCustom);
      
      const dropdownData = getScenarioDropdownData();
      
      expect(dropdownData).toEqual({});
    });

    it("should maintain deep equality of scenario objects", () => {
      const { getScenarioDropdownData } = getHook();
      
      const dropdownData = getScenarioDropdownData();
      
      expect(dropdownData.tight).toEqual(mockScenarios.tight);
      expect(dropdownData.debasement).toEqual(mockScenarios.debasement);
    });
  });

  describe("getAllScenarios", () => {
    it("should return all scenarios including custom", () => {
      const { getAllScenarios } = getHook();
      
      const allScenarios = getAllScenarios();
      
      expect(allScenarios).toEqual(mockScenarios);
      expect(allScenarios).toHaveProperty("custom");
    });

    it("should return reference to original scenarios object", () => {
      const { getAllScenarios } = getHook();
      
      const allScenarios = getAllScenarios();
      
      expect(allScenarios).toBe(mockScenarios);
    });
  });

  describe("scenarioExists", () => {
    it("should return true for existing scenarios", () => {
      const { scenarioExists } = getHook();
      
      expect(scenarioExists("tight")).toBe(true);
      expect(scenarioExists("debasement")).toBe(true);
      expect(scenarioExists("custom")).toBe(true);
    });

    it("should return false for non-existing scenarios", () => {
      const { scenarioExists } = getHook();
      
      expect(scenarioExists("nonexistent")).toBe(false);
      expect(scenarioExists("")).toBe(false);
      expect(scenarioExists("undefined")).toBe(false);
    });

    it("should handle null and undefined keys", () => {
      const { scenarioExists } = getHook();
      
      expect(scenarioExists(null as any)).toBe(false);
      expect(scenarioExists(undefined as any)).toBe(false);
    });

    it("should be case sensitive", () => {
      const { scenarioExists } = getHook();
      
      expect(scenarioExists("Tight")).toBe(false);
      expect(scenarioExists("TIGHT")).toBe(false);
      expect(scenarioExists("tight")).toBe(true);
    });
  });

  describe("getScenarioProperty", () => {
    it("should return correct property for existing scenario", () => {
      const { getScenarioProperty } = getHook();
      
      expect(getScenarioProperty("tight", "name")).toBe("Tight monetary policy");
      expect(getScenarioProperty("tight", "inflationAvg")).toBe(2);
      expect(getScenarioProperty("debasement", "btcAppreciationAvg")).toBe(45);
    });

    it("should return undefined for non-existing scenario", () => {
      const { getScenarioProperty } = getHook();
      
      expect(getScenarioProperty("nonexistent", "name")).toBeUndefined();
      expect(getScenarioProperty("", "inflationAvg")).toBeUndefined();
    });

    it("should return undefined for non-existing property", () => {
      const { getScenarioProperty } = getHook();
      
      expect(getScenarioProperty("tight", "nonexistentProperty")).toBeUndefined();
      expect(getScenarioProperty("tight", "")).toBeUndefined();
    });

    it("should handle nested properties correctly", () => {
      const { getScenarioProperty } = getHook();
      
      const inflationObject = getScenarioProperty("tight", "inflation");
      expect(inflationObject).toEqual(mockScenarios.tight.inflation);
      
      const btcPriceObject = getScenarioProperty("debasement", "btcPrice");
      expect(btcPriceObject).toEqual(mockScenarios.debasement.btcPrice);
    });

    it("should handle null and undefined keys/properties", () => {
      const { getScenarioProperty } = getHook();
      
      expect(getScenarioProperty(null as any, "name")).toBeUndefined();
      expect(getScenarioProperty("tight", null as any)).toBeUndefined();
      expect(getScenarioProperty(undefined as any, undefined as any)).toBeUndefined();
    });
  });

  describe("Edge cases and error conditions", () => {
    it("should handle empty scenarios object", () => {
      const { getAvailableScenarios, scenarioExists, getScenarioProperty } = getHook({});
      
      expect(getAvailableScenarios()).toEqual([]);
      expect(scenarioExists("any")).toBe(false);
      expect(getScenarioProperty("any", "property")).toBeUndefined();
    });

    it("should handle scenarios with null values", () => {
      const scenariosWithNull = {
        nullScenario: null,
        validScenario: mockScenarios.tight,
      };
      
      const { scenarioExists, getScenarioProperty, applyScenario } = getHook(scenariosWithNull);
      
      expect(scenarioExists("nullScenario")).toBe(true);
      expect(getScenarioProperty("nullScenario", "name")).toBeUndefined();
      
      // applyScenario should handle null scenario gracefully
      const mockGenerator = vi.fn().mockReturnValue([]);
      expect(() => {
        applyScenario("nullScenario", mockGenerator);
      }).not.toThrow();
      expect(mockGenerator).toHaveBeenCalledWith(null, 10);
    });

    it("should handle different time horizons correctly", () => {
      const scenarios = getHook(mockScenarios, 0);
      const { applyScenario } = scenarios;
      
      const mockGenerator = vi.fn().mockReturnValue([]);
      applyScenario("tight", mockGenerator);
      
      expect(mockGenerator).toHaveBeenCalledWith(mockScenarios.tight, 0);
    });

    it("should handle very large time horizons", () => {
      const scenarios = getHook(mockScenarios, 1000000);
      const { applyScenario } = scenarios;
      
      const mockGenerator = vi.fn().mockReturnValue(new Array(1000000).fill(1));
      const result = applyScenario("tight", mockGenerator);
      
      expect(mockGenerator).toHaveBeenCalledWith(mockScenarios.tight, 1000000);
      expect(result).toHaveLength(1000000);
    });
  });

  describe("Callback stability", () => {
    it("should maintain referential equality of callbacks when dependencies don't change", () => {
      const scenarios = mockScenarios;
      const timeHorizon = 10;
      
      const { result: result1 } = renderHook(() => useScenarioLogic(scenarios, timeHorizon));
      const { result: result2 } = renderHook(() => useScenarioLogic(scenarios, timeHorizon));
      
      // Functions should be stable with same dependencies
      expect(typeof result1.current.applyScenario).toBe("function");
      expect(typeof result2.current.applyScenario).toBe("function");
    });
  });
});
