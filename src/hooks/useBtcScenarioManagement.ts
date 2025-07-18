import { useMemo } from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";

export const useBtcScenarioManagement = (
  formData: FormData,
  updateFormData: (updates: Partial<FormData>) => void,
  applyToChart: (
    inputType?: "flat" | "linear" | "preset" | "saylor" | "manual",
  ) => void,
) => {
  // Handle input type changes
  const handleInputTypeChange = useMemo(() => {
    return (newType: "flat" | "linear" | "preset" | "saylor" | "manual") => {
      updateFormData({ btcPriceInputType: newType });

      // If switching to year-by-year mode, don't apply any preset and enable manual mode
      if (newType === "manual") {
        updateFormData({ btcPriceManualMode: true });
        return;
      }

      // For other input types, apply the chart
      applyToChart(newType);
    };
  }, [updateFormData, applyToChart]);

  // Handle scenario changes
  const handleScenarioChange = useMemo(() => {
    return (selectedScenario: string) => {
      if (selectedScenario === "custom-flat") {
        // Handle Custom Flat Rate selection
        const customScenario = economicScenarios.custom.btcPrice;

        updateFormData({
          btcPricePreset: "custom",
          followEconomicScenarioBtc: false,
          btcPriceInputType: "flat",
          btcPriceFlat: customScenario.startRate,
        });

        // Apply flat rate to the chart immediately
        setTimeout(() => applyToChart("flat"), 0);
      } else if (selectedScenario === "custom-linear") {
        // Handle Custom Linear Progression selection
        const customScenario = economicScenarios.custom.btcPrice;

        updateFormData({
          btcPricePreset: "custom",
          followEconomicScenarioBtc: false,
          btcPriceInputType: "linear",
          btcPriceStart: customScenario.startRate,
          btcPriceEnd: customScenario.endRate,
        });

        // Apply linear progression to the chart immediately
        setTimeout(() => applyToChart("linear"), 0);
      } else if (selectedScenario === "custom-saylor") {
        // Handle Saylor projection selection (37% -> 21% over 21 years)
        updateFormData({
          btcPricePreset: "custom",
          followEconomicScenarioBtc: false,
          btcPriceInputType: "saylor",
          btcPriceStart: 37,
          btcPriceEnd: 21,
        });

        // Apply Saylor projection to the chart immediately
        setTimeout(() => applyToChart("saylor"), 0);
      } else if (selectedScenario === "manual") {
        // Get the custom scenario settings
        const customScenario = economicScenarios.custom.btcPrice;

        // Handle manual selection with custom scenario defaults
        updateFormData({
          btcPricePreset: "custom",
          followEconomicScenarioBtc: false,
          // Default to flat rate when switching to manual
          btcPriceInputType: "manual",
          // Apply defaults from custom scenario
          btcPriceFlat: customScenario.startRate,
          btcPriceStart: customScenario.startRate,
          btcPriceEnd: customScenario.endRate,
        });

        // Enable direct editing
        updateFormData({ btcPriceManualMode: true });
      } else {
        // Handle preset scenario selection
        updateFormData({
          btcPricePreset: selectedScenario as ScenarioKey,
          btcPriceInputType: "preset",
          btcPriceManualMode: false,
        });
      }
    };
  }, [updateFormData, applyToChart]);

  // Handle scenario toggle
  const handleScenarioToggle = useMemo(() => {
    return (follow: boolean) => {
      updateFormData({
        followEconomicScenarioBtc: follow,
        // If now following scenario, update BTC preset based on economic scenario
        ...(follow &&
          formData.economicScenario !== "custom" && {
            btcPriceManualMode: false,
            btcPriceInputType: "preset",
            btcPricePreset: formData.economicScenario as ScenarioKey, // Reset to match economic scenario
          }),
      });
    };
  }, [updateFormData, formData.economicScenario]);

  return {
    handleInputTypeChange,
    handleScenarioChange,
    handleScenarioToggle,
  };
};
