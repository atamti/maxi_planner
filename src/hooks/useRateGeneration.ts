import { logCalculation, logError } from "../utils/logger";

export interface RateGenerationParams {
  type: "flat" | "linear" | "preset" | "saylor" | "manual";
  flatRate: number;
  startRate: number;
  endRate: number;
  preset: string;
  timeHorizon: number;
  presetScenarios?: any;
}

export const useRateGeneration = () => {
  const generateRates = (params: RateGenerationParams): number[] => {
    const {
      type,
      flatRate,
      startRate,
      endRate,
      preset,
      timeHorizon,
      presetScenarios,
    } = params;

    logCalculation("useRateGeneration", "generateRates", params, {
      timeHorizon,
      type,
    });

    const rates = [];

    try {
      if (type === "flat") {
        // Generate rates for the full time horizon + 1 (to include the final year)
        for (let i = 0; i <= timeHorizon; i++) {
          rates.push(flatRate);
        }
      } else if (type === "linear") {
        for (let i = 0; i <= timeHorizon; i++) {
          const progress = i / Math.max(1, timeHorizon - 1);
          const rate = startRate + (endRate - startRate) * progress;
          rates.push(Math.round(rate));
        }
      } else if (type === "saylor") {
        // Saylor projection: 37% -> 21% over timeHorizon, following the 21-year curve
        for (let i = 0; i <= timeHorizon; i++) {
          const progress = i / Math.max(1, timeHorizon - 1);
          // 37% declining to 21% linearly
          const rate = 37 - (37 - 21) * progress;
          rates.push(Math.round(rate));
        }
      } else if (type === "preset" && presetScenarios && preset !== "custom") {
        const scenario = presetScenarios[preset];

        if (scenario) {
          logCalculation(
            "useRateGeneration",
            "presetScenario",
            { preset },
            {
              startRate: scenario.startRate,
              endRate: scenario.endRate,
            },
          );

          for (let i = 0; i <= timeHorizon; i++) {
            const progress = i / Math.max(1, timeHorizon - 1);
            const curvedProgress = Math.pow(progress, 1.5);
            const rate =
              scenario.startRate +
              (scenario.endRate - scenario.startRate) * curvedProgress;
            rates.push(Math.round(rate / 2) * 2);
          }
        } else {
          logError(
            "useRateGeneration",
            "presetScenarioNotFound",
            new Error("Scenario not found"),
            {
              preset,
              availableScenarios: Object.keys(presetScenarios || {}),
            },
          );
        }
      } else {
        logCalculation(
          "useRateGeneration",
          "defaultCase",
          { type, preset },
          {
            hasPresetScenarios: !!presetScenarios,
            isCustom: preset === "custom",
          },
        );
      }

      logCalculation(
        "useRateGeneration",
        "generateRatesComplete",
        { type },
        {
          generatedRatesCount: rates.length,
          sampleRates: rates.slice(0, 5),
        },
      );
    } catch (error) {
      logError("useRateGeneration", "generateRates", error as Error, {
        params,
      });
      throw error;
    }

    return rates;
  };

  const applyRatesToArray = (
    currentRates: number[],
    newRates: number[],
    timeHorizon: number,
    fallbackRate: number = 8,
  ): number[] => {
    logCalculation(
      "useRateGeneration",
      "applyRatesToArray",
      {
        currentRatesCount: currentRates.length,
        newRatesCount: newRates.length,
        timeHorizon,
      },
      { fallbackRate },
    );

    // Make sure we have a properly sized array that includes the final year
    const updatedRates = [...currentRates];

    // Ensure the array is at least as long as timeHorizon + 1
    let addedRates = 0;
    while (updatedRates.length <= timeHorizon) {
      updatedRates.push(fallbackRate);
      addedRates++;
    }

    if (addedRates > 0) {
      logCalculation(
        "useRateGeneration",
        "addFallbackRates",
        { addedCount: addedRates, fallbackRate },
        { newLength: updatedRates.length },
      );
    }

    // Apply the generated rates
    let appliedRates = 0;
    newRates.forEach((rate, index) => {
      if (index <= timeHorizon) {
        updatedRates[index] = rate;
        appliedRates++;
      }
    });

    logCalculation(
      "useRateGeneration",
      "applyRatesComplete",
      { appliedCount: appliedRates },
      {
        finalLength: updatedRates.length,
        sampleRates: updatedRates.slice(0, 5),
      },
    );

    // Keep a reasonable buffer but ensure we have enough for timeHorizon + 1
    const result = updatedRates.slice(0, Math.max(timeHorizon + 1, 30));

    return result;
  };

  const calculateAverageRate = (
    rates: number[],
    timeHorizon: number,
  ): number => {
    if (rates.length === 0) return 0;
    const sum = rates.slice(0, timeHorizon).reduce((acc, val) => acc + val, 0);
    const average = Math.round(sum / timeHorizon);

    logCalculation(
      "useRateGeneration",
      "calculateAverageRate",
      { ratesCount: rates.length, timeHorizon, sum },
      { average },
    );

    return average;
  };

  return {
    generateRates,
    applyRatesToArray,
    calculateAverageRate,
  };
};
