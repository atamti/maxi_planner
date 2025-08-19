import { useCallback, useMemo, useState } from "react";
import economicScenarios, { ScenarioKey } from "../../config/economicScenarios";
import { FormData } from "../../types";
import { useRateCalculationEngine } from "./useRateCalculationEngine";

/**
 * Consolidated BTC rate system handling BTC-specific rate generation and exchange rate management
 * Combines functionality from useBtcRateGeneration and useExchangeRateHandling
 */
export const useBtcRateSystem = (
  formData: FormData,
  updateFormData: (updates: Partial<FormData>) => void,
) => {
  // Get rate calculation engine functions
  const { generateFlat, generateLinear } = useRateCalculationEngine();

  // State for exchange rate locked message
  const [showLockedMessage, setShowLockedMessage] = useState(false);

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
  const generateBtcRates = useCallback(
    (
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
    },
    [
      formData.btcPriceInputType,
      formData.btcPricePreset,
      formData.timeHorizon,
      formData.btcPriceFlat,
      formData.btcPriceStart,
      formData.btcPriceEnd,
      presetScenarios,
    ],
  );

  // Apply rates to chart
  const applyToChart = useCallback(
    (
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
    },
    [generateBtcRates, updateFormData],
  );

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

  // Exchange rate handling utilities
  const formatNumberForDisplay = useCallback((value: number): string => {
    return Math.round(value).toLocaleString();
  }, []);

  const parseFormattedNumber = useCallback((value: string): number => {
    return Number(value.replace(/,/g, ""));
  }, []);

  // Handle exchange rate input change
  const handleExchangeRateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseFormattedNumber(inputValue);
      if (!isNaN(numericValue)) {
        updateFormData({ exchangeRate: numericValue });
      }
    },
    [parseFormattedNumber, updateFormData],
  );

  // Show locked message temporarily when user tries to interact with locked controls
  const handleLockedInteraction = useCallback(() => {
    if (formData.followEconomicScenarioBtc || formData.btcPriceManualMode) {
      setShowLockedMessage(true);
      setTimeout(() => setShowLockedMessage(false), 3000);
    }
  }, [formData.followEconomicScenarioBtc, formData.btcPriceManualMode]);

  return {
    // BTC rate generation
    presetScenarios,
    dropdownPresets,
    generateBtcRates,
    applyToChart,
    getChartMaxValue,

    // Exchange rate handling
    showLockedMessage,
    formatNumberForDisplay,
    parseFormattedNumber,
    handleExchangeRateChange,
    handleLockedInteraction,

    // Helper flags
    isManualRateSelected: formData.btcPricePreset === "custom",
    isDirectEditMode: formData.btcPriceManualMode,
    isCustomEconomicScenario: formData.economicScenario === "custom",
  };
};
