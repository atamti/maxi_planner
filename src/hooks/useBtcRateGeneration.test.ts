import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";
import { useBtcRateGeneration } from "./useBtcRateGeneration";

// Mock the economic scenarios
vi.mock("../config/economicScenarios", () => ({
  default: {
    conservative: {
      btcPrice: { startRate: 15, endRate: 25, maxAxis: 150 },
    },
    moderate: {
      btcPrice: { startRate: 20, endRate: 35, maxAxis: 180 },
    },
    aggressive: {
      btcPrice: { startRate: 25, endRate: 50, maxAxis: 200 },
    },
    custom: {
      btcPrice: { startRate: 0, endRate: 0, maxAxis: 200 },
    },
  },
}));

describe("useBtcRateGeneration", () => {
  const mockUpdateFormData = vi.fn();

  const baseFormData: FormData = {
    ...DEFAULT_FORM_DATA,
    timeHorizon: 10,
    btcPriceInputType: "flat",
    btcPricePreset: "conservative" as ScenarioKey,
    btcPriceFlat: 30,
    btcPriceStart: 20,
    btcPriceEnd: 40,
    btcPriceCustomRates: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
    btcPriceManualMode: false,
    economicScenario: "conservative" as ScenarioKey,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Preset Scenarios", () => {
    it("should return all preset scenarios including custom", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      expect(result.current.presetScenarios).toEqual({
        conservative: { startRate: 15, endRate: 25, maxAxis: 150 },
        moderate: { startRate: 20, endRate: 35, maxAxis: 180 },
        aggressive: { startRate: 25, endRate: 50, maxAxis: 200 },
        custom: { startRate: 0, endRate: 0, maxAxis: 200 },
      });
    });

    it("should return dropdown presets excluding custom", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      expect(result.current.dropdownPresets).toEqual({
        conservative: { startRate: 15, endRate: 25, maxAxis: 150 },
        moderate: { startRate: 20, endRate: 35, maxAxis: 180 },
        aggressive: { startRate: 25, endRate: 50, maxAxis: 200 },
      });
    });
  });

  describe("Average BTC Appreciation Calculation", () => {
    it("should calculate average appreciation correctly", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      // Sum: 25+30+35+40+45+50+55+60+65+70 = 475
      // Average: 475/10 = 47.5, rounded = 48
      expect(result.current.calculateAverageBtcAppreciation).toBe(48);
    });

    it("should return 0 when no custom rates exist", () => {
      const formDataWithoutRates = {
        ...baseFormData,
        btcPriceCustomRates: [],
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(formDataWithoutRates, mockUpdateFormData),
      );

      expect(result.current.calculateAverageBtcAppreciation).toBe(0);
    });

    it("should only use rates within time horizon", () => {
      const formDataWithExtraRates = {
        ...baseFormData,
        timeHorizon: 5,
        btcPriceCustomRates: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(formDataWithExtraRates, mockUpdateFormData),
      );

      // Only first 5 rates: 10+20+30+40+50 = 150, average = 30
      expect(result.current.calculateAverageBtcAppreciation).toBe(30);
    });
  });

  describe("Generate BTC Rates", () => {
    it("should generate flat rates correctly", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      const rates = result.current.generateBtcRates("flat");
      expect(rates).toEqual([30, 30, 30, 30, 30, 30, 30, 30, 30, 30]);
      expect(rates).toHaveLength(10);
    });

    it("should generate linear rates correctly", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      const rates = result.current.generateBtcRates("linear");
      expect(rates).toHaveLength(10);
      expect(rates[0]).toBe(20); // Start rate
      expect(rates[9]).toBe(40); // End rate
      expect(rates[4]).toBe(29); // Midpoint: 20 + (40-20) * (4/9) ≈ 29
    });

    it("should generate Saylor projection rates correctly", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      const rates = result.current.generateBtcRates("saylor");
      expect(rates).toHaveLength(10);
      expect(rates[0]).toBe(37); // Start at 37%
      expect(rates[9]).toBe(21); // End at 21%

      // Check progression is declining
      expect(rates[0]).toBeGreaterThan(rates[9]);
      expect(rates[4]).toBe(30); // Midpoint: 37 - (37-21) * (4/9) ≈ 30
    });

    it("should generate preset rates with curved progression", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      const rates = result.current.generateBtcRates("preset");
      expect(rates).toHaveLength(10);

      // Should use conservative preset: startRate 15, endRate 25
      // The algorithm applies curved progression and rounds to nearest even number
      expect(rates[0]).toBe(16); // Actual rounded start rate from algorithm
      expect(rates[9]).toBe(26); // Actual rounded end rate from algorithm

      // Should be increasing progression
      expect(rates[0]).toBeLessThan(rates[9]);

      // Verify the curved progression pattern
      expect(rates).toEqual([16, 16, 16, 16, 18, 20, 20, 22, 24, 26]);
    });

    it("should fallback to flat rate when preset is custom", () => {
      const customFormData = {
        ...baseFormData,
        btcPricePreset: "custom" as ScenarioKey,
        btcPriceInputType: "preset" as const,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(customFormData, mockUpdateFormData),
      );

      const rates = result.current.generateBtcRates("preset");
      expect(rates).toEqual([30, 30, 30, 30, 30, 30, 30, 30, 30, 30]);
    });

    it("should handle single year time horizon correctly", () => {
      const singleYearData = {
        ...baseFormData,
        timeHorizon: 1,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(singleYearData, mockUpdateFormData),
      );

      const linearRates = result.current.generateBtcRates("linear");
      expect(linearRates).toEqual([20]); // Start rate when timeHorizon is 1

      const saylorRates = result.current.generateBtcRates("saylor");
      expect(saylorRates).toEqual([37]); // Start rate
    });
  });

  describe("Apply to Chart", () => {
    it("should update form data with generated rates", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      result.current.applyToChart("flat");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceCustomRates: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
      });
    });

    it("should preserve existing rates beyond generated length", () => {
      const formDataWithExtraRates = {
        ...baseFormData,
        timeHorizon: 5,
        btcPriceCustomRates: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(formDataWithExtraRates, mockUpdateFormData),
      );

      result.current.applyToChart("flat");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceCustomRates: [30, 30, 30, 30, 30, 60, 70, 80, 90, 100],
      });
    });

    it("should use default input type from form data", () => {
      const { result } = renderHook(() =>
        useBtcRateGeneration(baseFormData, mockUpdateFormData),
      );

      result.current.applyToChart(); // No input type specified

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceCustomRates: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
      });
    });
  });

  describe("Chart Max Value", () => {
    it("should return preset max axis for preset input type", () => {
      const presetFormData = {
        ...baseFormData,
        btcPriceInputType: "preset" as const,
        btcPricePreset: "conservative" as ScenarioKey,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(presetFormData, mockUpdateFormData),
      );

      expect(result.current.getChartMaxValue).toBe(150);
    });

    it("should return default 200 for custom preset", () => {
      const customFormData = {
        ...baseFormData,
        btcPriceInputType: "preset" as const,
        btcPricePreset: "custom" as ScenarioKey,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(customFormData, mockUpdateFormData),
      );

      expect(result.current.getChartMaxValue).toBe(200);
    });

    it("should return default 200 for non-preset input types", () => {
      const flatFormData = {
        ...baseFormData,
        btcPriceInputType: "flat" as const,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(flatFormData, mockUpdateFormData),
      );

      expect(result.current.getChartMaxValue).toBe(200);
    });

    it("should fallback to 200 when preset lacks maxAxis", () => {
      const formDataWithInvalidPreset = {
        ...baseFormData,
        btcPriceInputType: "preset" as const,
        btcPricePreset: "nonexistent" as any, // Using any to test invalid scenario
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(formDataWithInvalidPreset, mockUpdateFormData),
      );

      expect(result.current.getChartMaxValue).toBe(200);
    });
  });

  describe("Helper Flags", () => {
    it("should correctly identify manual rate selection", () => {
      const manualFormData = {
        ...baseFormData,
        btcPricePreset: "custom" as ScenarioKey,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(manualFormData, mockUpdateFormData),
      );

      expect(result.current.isManualRateSelected).toBe(true);
    });

    it("should correctly identify direct edit mode", () => {
      const directEditFormData = {
        ...baseFormData,
        btcPriceManualMode: true,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(directEditFormData, mockUpdateFormData),
      );

      expect(result.current.isDirectEditMode).toBe(true);
    });

    it("should correctly identify custom economic scenario", () => {
      const customEconomicFormData = {
        ...baseFormData,
        economicScenario: "custom" as ScenarioKey,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(customEconomicFormData, mockUpdateFormData),
      );

      expect(result.current.isCustomEconomicScenario).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero time horizon", () => {
      const zeroTimeFormData = {
        ...baseFormData,
        timeHorizon: 0,
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(zeroTimeFormData, mockUpdateFormData),
      );

      const rates = result.current.generateBtcRates("flat");
      expect(rates).toEqual([]);
    });

    it("should handle negative rates in calculations", () => {
      const negativeRatesFormData = {
        ...baseFormData,
        btcPriceCustomRates: [-10, -5, 0, 5, 10],
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(negativeRatesFormData, mockUpdateFormData),
      );

      // Sum: -10 + -5 + 0 + 5 + 10 = 0, average = 0
      expect(result.current.calculateAverageBtcAppreciation).toBe(0);
    });

    it("should handle missing preset scenario gracefully", () => {
      const invalidPresetFormData = {
        ...baseFormData,
        btcPriceInputType: "preset" as const,
        btcPricePreset: "invalid_scenario" as any, // Using any to test invalid scenario
      };

      const { result } = renderHook(() =>
        useBtcRateGeneration(invalidPresetFormData, mockUpdateFormData),
      );

      const rates = result.current.generateBtcRates("preset");
      expect(rates).toEqual([30, 30, 30, 30, 30, 30, 30, 30, 30, 30]); // Fallback to flat
    });
  });
});
