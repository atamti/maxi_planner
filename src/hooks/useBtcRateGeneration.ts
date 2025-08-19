import { useMemo } from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";

export const useBtcRateGeneration = (
  formData: FormData,
  updateFormData: (updates: Partial<FormData>) => void,
) => {
  // Get preset scenarios
  const presetScenarios = useMemo(() => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      presets[key] = scenario.btcPrice;
    });
    return presets;
  }, []);

  // Get dropdown presets (excludes custom)
  const dropdownPresets = useMemo(() => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      if (key !== "custom") {
        presets[key] = scenario.btcPrice;
      }
    });
    return presets;
  }, []);

  // Generate BTC rates based on input type
  const generateBtcRates = useMemo(() => {
    return (
      inputType:
        | "flat"
        | "linear"
        | "preset"
        | "saylor"
        | "manual" = formData.btcPriceInputType,
    ): number[] => {
      const rates = [];
      const isManualRateSelected = formData.btcPricePreset === "custom";

      if (inputType === "flat") {
        for (let i = 0; i < formData.timeHorizon; i++) {
          rates.push(formData.btcPriceFlat);
        }
      } else if (inputType === "linear") {
        for (let i = 0; i < formData.timeHorizon; i++) {
          const progress = i / Math.max(1, formData.timeHorizon - 1);
          const rate =
            formData.btcPriceStart +
            (formData.btcPriceEnd - formData.btcPriceStart) * progress;
          rates.push(Math.round(rate));
        }
      } else if (inputType === "saylor") {
        // Saylor projection: 37% -> 21% over 21-year curve, mapped to current timeHorizon
        for (let i = 0; i < formData.timeHorizon; i++) {
          // Map current year to the 21-year Saylor curve
          const saylorProgress = i / Math.max(1, formData.timeHorizon - 1);
          // Apply the 21-year curve: 37% declining to 21%
          const rate = 37 - (37 - 21) * saylorProgress;
          rates.push(Math.round(rate));
        }
      } else if (inputType === "preset") {
        // Only access preset scenarios if we're not in custom mode
        if (
          !isManualRateSelected &&
          presetScenarios[formData.btcPricePreset as ScenarioKey]
        ) {
          const scenario =
            presetScenarios[formData.btcPricePreset as ScenarioKey];

          for (let i = 0; i < formData.timeHorizon; i++) {
            const progress = i / Math.max(1, formData.timeHorizon - 1);
            // Use exponential curve for upward acceleration
            const curvedProgress = Math.pow(progress, 1.5);
            const rate =
              scenario.startRate +
              (scenario.endRate - scenario.startRate) * curvedProgress;
            rates.push(Math.round(rate / 2) * 2);
          }
        } else {
          // Fallback to flat rate if we're in custom mode
          for (let i = 0; i < formData.timeHorizon; i++) {
            rates.push(formData.btcPriceFlat);
          }
        }
      }

      return rates;
    };
  }, [formData, presetScenarios]);

  // Apply rates to chart
  const applyToChart = useMemo(() => {
    return (
      inputType:
        | "flat"
        | "linear"
        | "preset"
        | "saylor"
        | "manual" = formData.btcPriceInputType,
    ) => {
      const rates = generateBtcRates(inputType);
      const newRates = [...formData.btcPriceCustomRates];
      rates.forEach((rate, index) => {
        if (index < newRates.length) {
          newRates[index] = rate;
        }
      });
      updateFormData({ btcPriceCustomRates: newRates });
    };
  }, [formData.btcPriceCustomRates, generateBtcRates, updateFormData]);

  // Get chart maximum value
  const getChartMaxValue = useMemo((): number => {
    const isManualRateSelected = formData.btcPricePreset === "custom";

    // If we're using a preset scenario that isn't custom, use its maxAxis value
    if (formData.btcPriceInputType === "preset" && !isManualRateSelected) {
      return (
        presetScenarios[formData.btcPricePreset as ScenarioKey]?.maxAxis || 200
      );
    }

    // Default to 200% for all other cases
    return 200;
  }, [formData.btcPriceInputType, formData.btcPricePreset, presetScenarios]);

  return {
    presetScenarios,
    dropdownPresets,
    generateBtcRates,
    applyToChart,
    getChartMaxValue,
    // Helper flags
    isManualRateSelected: formData.btcPricePreset === "custom",
    isDirectEditMode: formData.btcPriceManualMode,
    isCustomEconomicScenario: formData.economicScenario === "custom",
  };
};
