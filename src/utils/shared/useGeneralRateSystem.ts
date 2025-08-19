import { useCallback } from "react";
import { useRateCalculationEngine } from "./useRateCalculationEngine";

export interface GeneralRateParams {
  type: "flat" | "linear" | "preset" | "saylor" | "manual";
  flatRate: number;
  startRate: number;
  endRate: number;
  preset: string;
  timeHorizon: number;
  presetScenarios?: any;
}

/**
 * Consolidated general rate system for handling standard rate generation
 * Combines functionality from useRateGeneration with the shared rate calculation engine
 */
export const useGeneralRateSystem = () => {
  const {
    generateFlat,
    generateLinear,
    generateSaylorProjection,
    normalizeRatesArray,
    calculateAverageRate,
  } = useRateCalculationEngine();

  /**
   * Generate rates based on the specified parameters
   */
  const generateRates = useCallback(
    (params: GeneralRateParams): number[] => {
      const {
        type,
        flatRate,
        startRate,
        endRate,
        preset,
        timeHorizon,
        presetScenarios,
      } = params;

      try {
        let rates: number[] = [];

        switch (type) {
          case "flat":
            rates = generateFlat(flatRate, timeHorizon);
            break;

          case "linear":
            rates = generateLinear(startRate, endRate, timeHorizon).map(
              (rate) => Math.round(rate),
            );
            break;

          case "saylor":
            // Saylor projection: 37% -> 21% over timeHorizon
            rates = generateLinear(37, 21, timeHorizon).map((rate) =>
              Math.round(rate),
            );
            break;

          case "preset":
            if (presetScenarios && preset !== "custom") {
              const scenario = presetScenarios[preset];

              if (scenario) {
                // Generate curved progression for preset scenarios
                for (let i = 0; i <= timeHorizon; i++) {
                  const progress = timeHorizon === 0 ? 0 : i / timeHorizon;
                  const curvedProgress = Math.pow(progress, 1.5);
                  const rate =
                    scenario.startRate +
                    (scenario.endRate - scenario.startRate) * curvedProgress;
                  rates.push(Math.round(rate / 2) * 2); // Round to nearest even number
                }
              } else {
                // Fallback to flat 8% rate
                rates = generateFlat(8, timeHorizon);
              }
            } else {
              // For custom or no preset scenarios, return empty array
              rates = [];
            }
            break;

          default:
            rates = generateFlat(8, timeHorizon); // Default fallback
            break;
        }

        return rates;
      } catch (error) {
        throw error;
      }
    },
    [generateFlat, generateLinear],
  );

  /**
   * Apply generated rates to an existing array, ensuring proper sizing
   */
  const applyRatesToArray = useCallback(
    (
      currentRates: number[],
      newRates: number[],
      timeHorizon: number,
      fallbackRate: number = 8,
    ): number[] => {
      // Start with current rates
      const updatedRates = [...currentRates];

      // Ensure the array is at least as long as timeHorizon + 1
      while (updatedRates.length <= timeHorizon) {
        updatedRates.push(fallbackRate);
      }

      // Apply the generated rates
      newRates.forEach((rate, index) => {
        if (index <= timeHorizon) {
          updatedRates[index] = rate;
        }
      });

      // Normalize to appropriate length (timeHorizon + 1, with reasonable buffer)
      return normalizeRatesArray(updatedRates, Math.max(timeHorizon + 1, 30));
    },
    [normalizeRatesArray],
  );

  /**
   * Calculate average rate over the specified time horizon
   */
  const calculateAverageRateForHorizon = useCallback(
    (rates: number[], timeHorizon: number): number => {
      if (rates.length === 0) return 0;

      const relevantRates = rates.slice(0, timeHorizon);
      const sum = relevantRates.reduce((acc, val) => acc + val, 0);
      const average = Math.round(sum / timeHorizon);

      return average;
    },
    [],
  );

  return {
    generateRates,
    applyRatesToArray,
    calculateAverageRate: calculateAverageRateForHorizon,
  };
};
