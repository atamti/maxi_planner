import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRateCalculationEngine } from "./useRateCalculationEngine";

describe("useRateCalculationEngine", () => {
  const getHook = () => {
    const { result } = renderHook(() => useRateCalculationEngine());
    return result.current;
  };

  describe("generateFlat", () => {
    it("should generate flat rate array with correct length", () => {
      const { generateFlat } = getHook();

      const result = generateFlat(5, 10);

      expect(result).toHaveLength(11); // horizon + 1
      expect(result).toEqual(Array(11).fill(5));
    });

    it("should handle zero horizon", () => {
      const { generateFlat } = getHook();

      const result = generateFlat(3.5, 0);

      expect(result).toHaveLength(1);
      expect(result).toEqual([3.5]);
    });

    it("should handle negative rates", () => {
      const { generateFlat } = getHook();

      const result = generateFlat(-2.5, 3);

      expect(result).toHaveLength(4);
      expect(result).toEqual([-2.5, -2.5, -2.5, -2.5]);
    });

    it("should handle very large horizons", () => {
      const { generateFlat } = getHook();

      const result = generateFlat(1, 1000);

      expect(result).toHaveLength(1001);
      expect(result.every((rate) => rate === 1)).toBe(true);
    });

    it("should handle decimal rates", () => {
      const { generateFlat } = getHook();

      const result = generateFlat(3.14159, 2);

      expect(result).toHaveLength(3);
      expect(result).toEqual([3.14159, 3.14159, 3.14159]);
    });
  });

  describe("generateLinear", () => {
    it("should generate linear progression from start to end", () => {
      const { generateLinear } = getHook();

      const result = generateLinear(0, 10, 4);

      expect(result).toHaveLength(5);
      expect(result).toEqual([0, 2.5, 5, 7.5, 10]);
    });

    it("should handle zero horizon", () => {
      const { generateLinear } = getHook();

      const result = generateLinear(5, 15, 0);

      expect(result).toHaveLength(1);
      expect(result).toEqual([5]); // Should start with start value
    });

    it("should handle equal start and end values", () => {
      const { generateLinear } = getHook();

      const result = generateLinear(7, 7, 3);

      expect(result).toHaveLength(4);
      expect(result).toEqual([7, 7, 7, 7]);
    });

    it("should handle negative progression", () => {
      const { generateLinear } = getHook();

      const result = generateLinear(10, 0, 2);

      expect(result).toHaveLength(3);
      expect(result).toEqual([10, 5, 0]);
    });

    it("should handle decimal values", () => {
      const { generateLinear } = getHook();

      const result = generateLinear(1.5, 3.5, 4);

      expect(result).toHaveLength(5);
      expect(result).toEqual([1.5, 2, 2.5, 3, 3.5]);
    });

    it("should handle large ranges", () => {
      const { generateLinear } = getHook();

      const result = generateLinear(-100, 100, 4);

      expect(result).toHaveLength(5);
      expect(result).toEqual([-100, -50, 0, 50, 100]);
    });

    it("should handle single step horizon", () => {
      const { generateLinear } = getHook();

      const result = generateLinear(2, 8, 1);

      expect(result).toHaveLength(2);
      expect(result).toEqual([2, 8]);
    });
  });

  describe("generateFromScenario", () => {
    it("should use scenario data directly when it has enough data", () => {
      const { generateFromScenario } = getHook();

      const scenarioData = [1, 2, 3, 4, 5, 6, 7];
      const result = generateFromScenario(scenarioData, 4);

      expect(result).toHaveLength(5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should pad with last value when scenario is shorter", () => {
      const { generateFromScenario } = getHook();

      const scenarioData = [1, 2, 3];
      const result = generateFromScenario(scenarioData, 6);

      expect(result).toHaveLength(7);
      expect(result).toEqual([1, 2, 3, 3, 3, 3, 3]);
    });

    it("should handle empty scenario data", () => {
      const { generateFromScenario } = getHook();

      const result = generateFromScenario([], 3);

      expect(result).toHaveLength(4);
      expect(result).toEqual([0, 0, 0, 0]);
    });

    it("should handle null scenario data", () => {
      const { generateFromScenario } = getHook();

      const result = generateFromScenario(null as any, 2);

      expect(result).toHaveLength(3);
      expect(result).toEqual([0, 0, 0]);
    });

    it("should handle undefined scenario data", () => {
      const { generateFromScenario } = getHook();

      const result = generateFromScenario(undefined as any, 2);

      expect(result).toHaveLength(3);
      expect(result).toEqual([0, 0, 0]);
    });

    it("should handle scenario with zero values", () => {
      const { generateFromScenario } = getHook();

      const scenarioData = [0, 0];
      const result = generateFromScenario(scenarioData, 4);

      expect(result).toHaveLength(5);
      expect(result).toEqual([0, 0, 0, 0, 0]);
    });

    it("should handle scenario ending with zero and needing padding", () => {
      const { generateFromScenario } = getHook();

      const scenarioData = [5, 3, 0];
      const result = generateFromScenario(scenarioData, 5);

      expect(result).toHaveLength(6);
      expect(result).toEqual([5, 3, 0, 0, 0, 0]);
    });

    it("should handle negative values in scenario", () => {
      const { generateFromScenario } = getHook();

      const scenarioData = [-1, -2];
      const result = generateFromScenario(scenarioData, 4);

      expect(result).toHaveLength(5);
      expect(result).toEqual([-1, -2, -2, -2, -2]);
    });

    it("should handle zero horizon", () => {
      const { generateFromScenario } = getHook();

      const scenarioData = [1, 2, 3];
      const result = generateFromScenario(scenarioData, 0);

      expect(result).toHaveLength(1);
      expect(result).toEqual([1]);
    });
  });

  describe("generateSaylorProjection", () => {
    it("should generate decreasing returns with default decay", () => {
      const { generateSaylorProjection } = getHook();

      const result = generateSaylorProjection(100, 8);

      expect(result).toHaveLength(9);
      expect(result[0]).toBe(100); // First year should be initial rate
      expect(result[1]).toBeGreaterThan(result[4]); // Should decay over time
      expect(result[4]).toBeGreaterThan(result[8]); // Continue decaying
      expect(result[8]).toBeGreaterThanOrEqual(5); // Should not go below minimum
    });

    it("should respect minimum rate floor", () => {
      const { generateSaylorProjection } = getHook();

      // Very high decay should still respect minimum
      const result = generateSaylorProjection(100, 20, 0.1);

      expect(result).toHaveLength(21);
      expect(result.every((rate) => rate >= 5)).toBe(true);
    });

    it("should handle custom decay factor", () => {
      const { generateSaylorProjection } = getHook();

      const slowDecay = generateSaylorProjection(100, 8, 0.95);
      const fastDecay = generateSaylorProjection(100, 8, 0.5);

      expect(slowDecay[4]).toBeGreaterThan(fastDecay[4]);
      expect(slowDecay[8]).toBeGreaterThan(fastDecay[8]);
    });

    it("should handle zero horizon", () => {
      const { generateSaylorProjection } = getHook();

      const result = generateSaylorProjection(50, 0);

      expect(result).toHaveLength(1);
      expect(result).toEqual([50]);
    });

    it("should handle low initial rates", () => {
      const { generateSaylorProjection } = getHook();

      const result = generateSaylorProjection(3, 4);

      expect(result).toHaveLength(5);
      expect(result.every((rate) => rate >= 5)).toBe(true); // Should be clamped to minimum
    });

    it("should handle negative initial rates", () => {
      const { generateSaylorProjection } = getHook();

      const result = generateSaylorProjection(-10, 2);

      expect(result).toHaveLength(3);
      expect(result.every((rate) => rate >= 5)).toBe(true); // Should be clamped to minimum
    });

    it("should handle decay over multiple 4-year periods", () => {
      const { generateSaylorProjection } = getHook();

      const result = generateSaylorProjection(100, 16);

      expect(result).toHaveLength(17);
      // At year 4, should be 100 * 0.85^1 = 85
      expect(result[4]).toBeCloseTo(85, 1);
      // At year 8, should be 100 * 0.85^2 = 72.25
      expect(result[8]).toBeCloseTo(72.25, 1);
      // At year 12, should be 100 * 0.85^3 = 61.4125
      expect(result[12]).toBeCloseTo(61.4125, 1);
    });
  });

  describe("normalizeRatesArray", () => {
    it("should return array unchanged if length matches", () => {
      const { normalizeRatesArray } = getHook();

      const rates = [1, 2, 3, 4, 5];
      const result = normalizeRatesArray(rates, 5);

      expect(result).toEqual(rates);
      expect(result).not.toBe(rates); // Should be a copy
    });

    it("should truncate array if too long", () => {
      const { normalizeRatesArray } = getHook();

      const rates = [1, 2, 3, 4, 5, 6, 7];
      const result = normalizeRatesArray(rates, 4);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should pad array if too short", () => {
      const { normalizeRatesArray } = getHook();

      const rates = [1, 2, 3];
      const result = normalizeRatesArray(rates, 6);

      expect(result).toEqual([1, 2, 3, 3, 3, 3]);
    });

    it("should handle empty array", () => {
      const { normalizeRatesArray } = getHook();

      const result = normalizeRatesArray([], 3);

      expect(result).toEqual([0, 0, 0]);
    });

    it("should handle target length of zero", () => {
      const { normalizeRatesArray } = getHook();

      const rates = [1, 2, 3];
      const result = normalizeRatesArray(rates, 0);

      expect(result).toEqual([]);
    });

    it("should pad with last value correctly", () => {
      const { normalizeRatesArray } = getHook();

      const rates = [5, 10, -3];
      const result = normalizeRatesArray(rates, 6);

      expect(result).toEqual([5, 10, -3, -3, -3, -3]);
    });

    it("should handle single element array", () => {
      const { normalizeRatesArray } = getHook();

      const rates = [42];
      const result = normalizeRatesArray(rates, 4);

      expect(result).toEqual([42, 42, 42, 42]);
    });
  });

  describe("calculateAverageRate", () => {
    it("should calculate correct average for positive numbers", () => {
      const { calculateAverageRate } = getHook();

      const rates = [2, 4, 6, 8]; // Year 0, 1, 2, 3  
      const result = calculateAverageRate(rates);

      // Should exclude year 0, so calculate average of [4, 6, 8] = 18/3 = 6
      expect(result).toBe(6);
    });

    it("should handle empty array", () => {
      const { calculateAverageRate } = getHook();

      const result = calculateAverageRate([]);

      expect(result).toBe(0);
    });

    it("should handle null input", () => {
      const { calculateAverageRate } = getHook();

      const result = calculateAverageRate(null as any);

      expect(result).toBe(0);
    });

    it("should handle undefined input", () => {
      const { calculateAverageRate } = getHook();

      const result = calculateAverageRate(undefined as any);

      expect(result).toBe(0);
    });

    it("should handle negative numbers", () => {
      const { calculateAverageRate } = getHook();

      const rates = [-2, -4, -6]; // Year 0, 1, 2
      const result = calculateAverageRate(rates);

      // Should exclude year 0, so calculate average of [-4, -6] = -10/2 = -5
      expect(result).toBe(-5);
    });

    it("should handle mixed positive and negative numbers", () => {
      const { calculateAverageRate } = getHook();

      const rates = [-10, 0, 10]; // Year 0, 1, 2
      const result = calculateAverageRate(rates);

      // Should exclude year 0, so calculate average of [0, 10] = 10/2 = 5  
      expect(result).toBe(5);
    });

    it("should handle decimal numbers", () => {
      const { calculateAverageRate } = getHook();

      const rates = [1.5, 2.5, 3.5]; // Year 0, 1, 2
      const result = calculateAverageRate(rates);

      // Should exclude year 0, so calculate average of [2.5, 3.5] = 6/2 = 3
      expect(result).toBeCloseTo(3, 10);
    });

    it("should handle single element array", () => {
      const { calculateAverageRate } = getHook();

      const rates = [42.7]; // Only year 0
      const result = calculateAverageRate(rates);

      // Should exclude year 0, so no data left - should return 0
      expect(result).toBe(0);
    });

    it("should handle very large numbers", () => {
      const { calculateAverageRate } = getHook();

      const rates = [1000000, 2000000, 3000000]; // Year 0, 1, 2
      const result = calculateAverageRate(rates);

      // Should exclude year 0, so calculate average of [2000000, 3000000] = 5000000/2 = 2500000
      expect(result).toBe(2500000);
    });

    it("should handle precision with many decimal places", () => {
      const { calculateAverageRate } = getHook();

      const rates = [1.123456789, 2.987654321, 4.444444444]; // Year 0, 1, 2
      const result = calculateAverageRate(rates);

      // Should exclude year 0, so calculate average of [2.987654321, 4.444444444] = 7.432098765 / 2 = 3.7164... → 3.7 with .toFixed(1)
      expect(result).toBe(3.7);
    });

    it("should handle timeHorizon parameter correctly", () => {
      const { calculateAverageRate } = getHook();

      const rates = [0, 10, 20, 30, 40, 50]; // year 0, then years 1-5

      // Without timeHorizon, uses years 1-5: (10+20+30+40+50)/5 = 30
      const fullAvg = calculateAverageRate(rates);
      expect(fullAvg).toBe(30.0);

      // With timeHorizon=3, uses years 1-3: (10+20+30)/3 = 20
      const limitedAvg = calculateAverageRate(rates, 3);
      expect(limitedAvg).toBe(20.0);

      // With timeHorizon=1, uses year 1 only: 10/1 = 10
      const singleAvg = calculateAverageRate(rates, 1);
      expect(singleAvg).toBe(10.0);
    });
  });

  describe("Integration tests", () => {
    it("should work well with normalized arrays", () => {
      const { generateLinear, normalizeRatesArray, calculateAverageRate } =
        getHook();

      const linear = generateLinear(0, 10, 4);
      const normalized = normalizeRatesArray(linear, 8);
      const average = calculateAverageRate(normalized);

      expect(normalized).toHaveLength(8);
      // linear = [0, 2.5, 5, 7.5, 10] → normalized = [0, 2.5, 5, 7.5, 10, 10, 10, 10]
      // average excludes year 0, so uses [2.5, 5, 7.5, 10, 10, 10, 10] = 55 / 7 = 7.857... → 7.9 with .toFixed(1)
      expect(average).toBe(7.9);
    });

    it("should handle scenario generation with normalization", () => {
      const { generateFromScenario, normalizeRatesArray } = getHook();

      const scenario = generateFromScenario([1, 5], 4);
      const normalized = normalizeRatesArray(scenario, 3);

      expect(scenario).toEqual([1, 5, 5, 5, 5]);
      expect(normalized).toEqual([1, 5, 5]);
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("should handle very large horizons efficiently", () => {
      const { generateFlat } = getHook();

      const start = performance.now();
      const result = generateFlat(1, 10000);
      const end = performance.now();

      expect(result).toHaveLength(10001);
      expect(end - start).toBeLessThan(100); // Should complete in reasonable time
    });

    it("should handle floating point precision edge cases", () => {
      const { generateLinear } = getHook();

      const result = generateLinear(0.1, 0.3, 2);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeCloseTo(0.1, 10);
      expect(result[1]).toBeCloseTo(0.2, 10);
      expect(result[2]).toBeCloseTo(0.3, 10);
    });
  });
});
