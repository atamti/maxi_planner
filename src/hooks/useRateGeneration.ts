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

    console.log(`🏭 generateRates called:`, {
      type,
      flatRate,
      startRate,
      endRate,
      preset,
      timeHorizon,
      presetScenariosKeys: presetScenarios
        ? Object.keys(presetScenarios)
        : "null",
      presetScenarios,
    });

    const rates = [];

    if (type === "flat") {
      console.log(`📍 Using flat rate: ${flatRate}`);
      // Generate rates for the full time horizon + 1 (to include the final year)
      for (let i = 0; i <= timeHorizon; i++) {
        rates.push(flatRate);
      }
    } else if (type === "linear") {
      console.log(`📈 Using linear rate: ${startRate} -> ${endRate}`);
      for (let i = 0; i <= timeHorizon; i++) {
        const progress = i / Math.max(1, timeHorizon - 1);
        const rate = startRate + (endRate - startRate) * progress;
        rates.push(Math.round(rate));
      }
    } else if (type === "saylor") {
      console.log(`🚀 Using Saylor projection: 37% -> 21%`);
      // Saylor projection: 37% -> 21% over timeHorizon, following the 21-year curve
      for (let i = 0; i <= timeHorizon; i++) {
        const progress = i / Math.max(1, timeHorizon - 1);
        // 37% declining to 21% linearly
        const rate = 37 - (37 - 21) * progress;
        rates.push(Math.round(rate));
      }
    } else if (type === "preset" && presetScenarios && preset !== "custom") {
      console.log(`🎯 Using preset scenario: ${preset}`);
      const scenario = presetScenarios[preset];
      console.log(`📋 Scenario data:`, scenario);

      if (scenario) {
        console.log(
          `✅ Scenario found, generating rates from ${scenario.startRate} to ${scenario.endRate}`,
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
        console.log(`❌ Scenario not found for preset: ${preset}`);
      }
    } else {
      console.log(`⚠️ No matching type or invalid preset conditions:`, {
        type,
        hasPresetScenarios: !!presetScenarios,
        preset,
        isCustom: preset === "custom",
      });
    }

    console.log(`📊 Generated rates:`, rates);
    return rates;
  };

  const applyRatesToArray = (
    currentRates: number[],
    newRates: number[],
    timeHorizon: number,
    fallbackRate: number = 8,
  ): number[] => {
    console.log(`🔧 applyRatesToArray called:`, {
      currentRates: currentRates.slice(0, 10),
      newRates: newRates.slice(0, 10),
      timeHorizon,
      fallbackRate,
      currentRatesLength: currentRates.length,
      newRatesLength: newRates.length,
    });

    // Make sure we have a properly sized array that includes the final year
    const updatedRates = [...currentRates];
    console.log(`📋 Initial updatedRates:`, updatedRates.slice(0, 10));

    // Ensure the array is at least as long as timeHorizon + 1
    while (updatedRates.length <= timeHorizon) {
      console.log(
        `➕ Adding fallback rate ${fallbackRate} at index ${updatedRates.length}`,
      );
      updatedRates.push(fallbackRate);
    }

    console.log(`📏 After ensuring length:`, {
      updatedRatesLength: updatedRates.length,
      updatedRates: updatedRates.slice(0, 10),
    });

    // Apply the generated rates
    newRates.forEach((rate, index) => {
      if (index <= timeHorizon) {
        console.log(
          `🔄 Setting rate[${index}] = ${rate} (was ${updatedRates[index]})`,
        );
        updatedRates[index] = rate;
      }
    });

    console.log(
      `✅ Final updatedRates before slice:`,
      updatedRates.slice(0, 10),
    );

    // Keep a reasonable buffer but ensure we have enough for timeHorizon + 1
    const result = updatedRates.slice(0, Math.max(timeHorizon + 1, 30));
    console.log(`🎯 Final result:`, result.slice(0, 10));

    return result;
  };

  const calculateAverageRate = (
    rates: number[],
    timeHorizon: number,
  ): number => {
    if (rates.length === 0) return 0;
    const sum = rates.slice(0, timeHorizon).reduce((acc, val) => acc + val, 0);
    return Math.round(sum / timeHorizon);
  };

  return {
    generateRates,
    applyRatesToArray,
    calculateAverageRate,
  };
};
