import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  useFormState,
  useInteractionEffects,
  useNumberFormatting,
  useRateCalculationEngine,
  useScenarioLogic,
} from "./index";

describe("Shared Hook Utilities", () => {
  describe("useInteractionEffects", () => {
    it("should manage temporary state changes", () => {
      const { result } = renderHook(() =>
        useInteractionEffects("initial", 100),
      );

      expect(result.current.state).toBe("initial");
      expect(result.current.isActive).toBe(false);

      act(() => {
        result.current.triggerEffect("active");
      });

      expect(result.current.state).toBe("active");
      expect(result.current.isActive).toBe(true);
    });

    it("should reset to initial state after duration", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() =>
        useInteractionEffects("initial", 100),
      );

      act(() => {
        result.current.triggerEffect("active");
      });

      expect(result.current.state).toBe("active");

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current.state).toBe("initial");
      expect(result.current.isActive).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("useFormState", () => {
    it("should manage form state with validation", () => {
      const validator = (value: number) => ({
        isValid: value > 0,
        error: value <= 0 ? "Must be positive" : undefined,
      });

      const { result } = renderHook(() => useFormState(5, validator));

      expect(result.current.value).toBe(5);
      expect(result.current.isValid).toBe(true);
      expect(result.current.error).toBe(null);

      act(() => {
        result.current.setValue(-1 as any);
      });

      expect(result.current.value).toBe(-1);
      expect(result.current.isValid).toBe(false);
      expect(result.current.error).toBe("Must be positive");
    });

    it("should transform values before validation", () => {
      const transformer = (value: number) => Math.max(0, value);
      const { result } = renderHook(() =>
        useFormState(-5 as any, undefined, transformer),
      );

      expect(result.current.value).toBe(0); // Transformed from -5
    });
  });

  describe("useRateCalculationEngine", () => {
    it("should generate flat rates", () => {
      const { result } = renderHook(() => useRateCalculationEngine());

      const rates = result.current.generateFlat(5, 3);
      expect(rates).toEqual([5, 5, 5, 5]);
    });

    it("should generate linear rates", () => {
      const { result } = renderHook(() => useRateCalculationEngine());

      const rates = result.current.generateLinear(10, 20, 2);
      expect(rates).toEqual([10, 15, 20]);
    });

    it("should calculate average rate", () => {
      const { result } = renderHook(() => useRateCalculationEngine());

      // [10, 20, 30] excludes year 0, so [20, 30] avg = 50/2 = 25
      const average = result.current.calculateAverageRate([10, 20, 30]);
      expect(average).toBe(25);
    });

    it("should normalize rate arrays", () => {
      const { result } = renderHook(() => useRateCalculationEngine());

      const normalized = result.current.normalizeRatesArray([10, 20], 4);
      expect(normalized).toEqual([10, 20, 20, 20]);
    });
  });

  describe("useScenarioLogic", () => {
    const mockScenarios = {
      conservative: { btcPrice: [5, 6, 7] },
      moderate: { btcPrice: [10, 15, 20] },
      aggressive: { btcPrice: [20, 30, 40] },
    };

    it("should apply scenarios correctly", () => {
      const { result } = renderHook(() => useScenarioLogic(mockScenarios, 3));

      const rates = result.current.applyScenario(
        "moderate",
        (scenario) => scenario.btcPrice,
      );
      expect(rates).toEqual([10, 15, 20]);
    });

    it("should get available scenarios", () => {
      const { result } = renderHook(() => useScenarioLogic(mockScenarios, 3));

      const scenarios = result.current.getAvailableScenarios();
      expect(scenarios).toEqual(["conservative", "moderate", "aggressive"]);
    });

    it("should check scenario existence", () => {
      const { result } = renderHook(() => useScenarioLogic(mockScenarios, 3));

      expect(result.current.scenarioExists("moderate")).toBe(true);
      expect(result.current.scenarioExists("nonexistent")).toBe(false);
    });
  });

  describe("useNumberFormatting", () => {
    it("should format numbers for display", () => {
      const { result } = renderHook(() => useNumberFormatting());

      expect(result.current.formatNumberForDisplay(1234.56)).toBe("1,235");
    });

    it("should parse formatted numbers", () => {
      const { result } = renderHook(() => useNumberFormatting());

      expect(result.current.parseFormattedNumber("1,234")).toBe(1234);
    });

    it("should format percentages", () => {
      const { result } = renderHook(() => useNumberFormatting());

      expect(result.current.formatPercentage(12.345)).toBe("12.3%");
      expect(result.current.formatPercentage(12.345, 2)).toBe("12.35%");
    });

    it("should format currency", () => {
      const { result } = renderHook(() => useNumberFormatting());

      expect(result.current.formatCurrency(1234.56)).toBe("$1,235");
    });

    it("should format BTC amounts", () => {
      const { result } = renderHook(() => useNumberFormatting());

      expect(result.current.formatBtc(1.23456)).toBe("₿1.23");
    });

    it("should clamp numbers", () => {
      const { result } = renderHook(() => useNumberFormatting());

      expect(result.current.clampNumber(15, 0, 10)).toBe(10);
      expect(result.current.clampNumber(-5, 0, 10)).toBe(0);
      expect(result.current.clampNumber(5, 0, 10)).toBe(5);
    });

    it("should validate numbers", () => {
      const { result } = renderHook(() => useNumberFormatting());

      expect(result.current.isValidNumber("123")).toBe(true);
      expect(result.current.isValidNumber("1,234")).toBe(true);
      expect(result.current.isValidNumber("abc")).toBe(false);
      expect(result.current.isValidNumber("")).toBe(false);
    });
  });
});
