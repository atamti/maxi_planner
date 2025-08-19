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
      // Protect against negative and non-integer horizons
      const safeHorizon = Math.max(0, Math.floor(horizon));
      return Array(safeHorizon + 1).fill(rate);
    },
    [],
  );

  /**
   * Generate linear rate array (smooth transition from start to end)
   */
  const generateLinear = useCallback(
    (start: number, end: number, horizon: number): number[] => {
      // Protect against negative and non-integer horizons
      const safeHorizon = Math.max(0, Math.floor(horizon));
      const rates = [];
      for (let i = 0; i <= safeHorizon; i++) {
        const progress = safeHorizon === 0 ? 0 : i / safeHorizon;

        // Handle infinite bounds gracefully - prevent NaN from infinity arithmetic
        if (!isFinite(start) && !isFinite(end)) {
          // Both bounds infinite - use first bound for all values except final
          rates.push(progress === 1 ? end : start);
        } else if (!isFinite(start)) {
          // Start infinite, end finite - use start except at final position
          rates.push(progress === 1 ? end : start);
        } else if (!isFinite(end)) {
          // End infinite, start finite - use start except at final position
          rates.push(progress === 1 ? end : start);
        } else {
          // Both finite - normal linear interpolation
          const interpolatedValue = start + (end - start) * progress;
          rates.push(interpolatedValue);
        }
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
      // Protect against negative and non-integer horizons
      const safeHorizon = Math.max(0, Math.floor(horizon));

      if (!scenarioData || scenarioData.length === 0) {
        return Array(safeHorizon + 1).fill(0);
      }

      // If scenario has enough data, use it directly (padded to horizon + 1)
      if (scenarioData.length >= safeHorizon + 1) {
        return scenarioData.slice(0, safeHorizon + 1);
      }

      // If scenario is shorter, pad with the last value
      const result = [...scenarioData];
      const lastValue = scenarioData[scenarioData.length - 1] || 0;
      while (result.length < safeHorizon + 1) {
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
      // Protect against negative and non-integer horizons
      const safeHorizon = Math.max(0, Math.floor(horizon));

      // Protect against invalid decay factors
      const safeDecayFactor =
        isFinite(decayFactor) && decayFactor > 0 ? decayFactor : 0.85;

      const rates = [];
      for (let i = 0; i <= safeHorizon; i++) {
        // Saylor model: high initial returns that decay over time
        const decayedRate = initialRate * Math.pow(safeDecayFactor, i / 4); // Decay every 4 years

        // Enforce minimum 5% rate and ensure finite result
        const finalRate = Math.max(isFinite(decayedRate) ? decayedRate : 5, 5);
        rates.push(finalRate);
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
      // Protect against negative target lengths
      const safeTargetLength = Math.max(0, Math.floor(targetLength));

      if (!rates || rates.length === 0) {
        return Array(safeTargetLength).fill(0);
      }

      if (rates.length === safeTargetLength) return [...rates]; // Return a copy

      if (rates.length > safeTargetLength) {
        return rates.slice(0, safeTargetLength);
      }

      // Pad with last value if array is too short
      const result = [...rates];
      const lastValue = rates[rates.length - 1] || 0;
      while (result.length < safeTargetLength) {
        result.push(lastValue);
      }
      return result;
    },
    [],
  );

  /**
   * Calculate average rate from an array with optional timeHorizon limit
   */
  const calculateAverageRate = useCallback(
    (rates: number[], timeHorizon?: number): number => {
      if (!rates || rates.length === 0) return 0;

      // If timeHorizon is provided, slice the array to include years 1-timeHorizon (excluding year 0)
      const relevantRates = timeHorizon
        ? rates.slice(1, timeHorizon + 1)
        : rates.slice(1); // Always exclude year 0 if no timeHorizon specified

      if (relevantRates.length === 0) return 0;

      const sum = relevantRates.reduce((acc, rate) => acc + rate, 0);
      const average = sum / relevantRates.length;

      // Apply consistent precision formatting like MarketAssumptionsSection
      return parseFloat(average.toFixed(1));
    },
    [],
  );

  return {
    generateFlat,
    generateLinear,
    generateFromScenario,
    generateSaylorProjection,
    normalizeRatesArray,
    calculateAverageRate,
  };
};
