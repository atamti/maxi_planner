import { useCallback } from "react";

/**
 * Shared rate calculation engine for generating different types of rate arrays
 * Consolidates common rate generation patterns used across multiple hooks
 */
export const useRateCalculationEngine = () => {
  /**
   * Generate flat rate array (same rate for all years)
   */
  const generateFlat = useCallback(
    (rate: number, horizon: number): number[] => {
      return Array(horizon + 1).fill(rate);
    },
    [],
  );

  /**
   * Generate linear rate array (smooth transition from start to end)
   */
  const generateLinear = useCallback(
    (start: number, end: number, horizon: number): number[] => {
      const rates = [];
      for (let i = 0; i <= horizon; i++) {
        const progress = horizon === 0 ? 0 : i / horizon;
        rates.push(start + (end - start) * progress);
      }
      return rates;
    },
    [],
  );

  /**
   * Generate rates from economic scenario data
   */
  const generateFromScenario = useCallback(
    (scenarioData: number[], horizon: number): number[] => {
      if (!scenarioData || scenarioData.length === 0) {
        return Array(horizon + 1).fill(0);
      }

      // If scenario has enough data, use it directly (padded to horizon + 1)
      if (scenarioData.length >= horizon + 1) {
        return scenarioData.slice(0, horizon + 1);
      }

      // If scenario is shorter, pad with the last value
      const result = [...scenarioData];
      const lastValue = scenarioData[scenarioData.length - 1] || 0;
      while (result.length < horizon + 1) {
        result.push(lastValue);
      }
      return result;
    },
    [],
  );

  /**
   * Generate Saylor-like projection (decreasing returns over time)
   */
  const generateSaylorProjection = useCallback(
    (
      initialRate: number,
      horizon: number,
      decayFactor: number = 0.85,
    ): number[] => {
      const rates = [];
      for (let i = 0; i <= horizon; i++) {
        // Saylor model: high initial returns that decay over time
        const decayedRate = initialRate * Math.pow(decayFactor, i / 4); // Decay every 4 years
        rates.push(Math.max(decayedRate, 5)); // Minimum 5% rate
      }
      return rates;
    },
    [],
  );

  /**
   * Normalize rates array to ensure it matches the expected length
   */
  const normalizeRatesArray = useCallback(
    (rates: number[], targetLength: number): number[] => {
      if (rates.length === targetLength) return rates;

      if (rates.length > targetLength) {
        return rates.slice(0, targetLength);
      }

      // Pad with last value if array is too short
      const result = [...rates];
      const lastValue = rates[rates.length - 1] || 0;
      while (result.length < targetLength) {
        result.push(lastValue);
      }
      return result;
    },
    [],
  );

  /**
   * Calculate average rate from an array
   */
  const calculateAverageRate = useCallback((rates: number[]): number => {
    if (!rates || rates.length === 0) return 0;
    const sum = rates.reduce((acc, rate) => acc + rate, 0);
    return sum / rates.length;
  }, []);

  return {
    generateFlat,
    generateLinear,
    generateFromScenario,
    generateSaylorProjection,
    normalizeRatesArray,
    calculateAverageRate,
  };
};
