import React from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";
import { DraggableRateChart } from "./DraggableRateChart";
import { RateConfigSection } from "./RateConfigSection";
import { ToggleSwitch } from "./common/ToggleSwitch";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const BtcPriceSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  // Calculate average BTC appreciation rate
  const calculateAverageBtcAppreciation = (): number => {
    if (formData.btcPriceCustomRates.length === 0) return 0;
    const sum = formData.btcPriceCustomRates
      .slice(0, formData.timeHorizon)
      .reduce((acc, val) => acc + val, 0);
    return Math.round(sum / formData.timeHorizon);
  };

  const getScenarioPresets = () => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      // Include "custom" scenario in presets so we can access its values
      presets[key] = scenario.btcPrice;
    });
    return presets;
  };

  const presetScenarios = getScenarioPresets();

  // Check if manual mode is selected
  const isManualRateSelected = formData.btcPricePreset === "custom";

  // Change the check for year-by-year mode to check for manual mode instead
  // This now represents "direct edit chart" mode
  const isDirectEditMode = formData.btcPriceManualMode;

  // Check if the economic scenario is set to custom
  const isCustomEconomicScenario = formData.economicScenario === "custom";

  const generateBtcRates = (
    inputType:
      | "flat"
      | "linear"
      | "preset"
      | "manual" = formData.btcPriceInputType,
  ): number[] => {
    const rates = [];

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
    } else if (inputType === "preset") {
      // Only access preset scenarios if we're not in custom mode
      if (!isManualRateSelected && presetScenarios[formData.btcPricePreset]) {
        const scenario = presetScenarios[formData.btcPricePreset];

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

  const applyToChart = (
    inputType:
      | "flat"
      | "linear"
      | "preset"
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

  const handleInputTypeChange = (
    newType: "flat" | "linear" | "preset" | "manual",
  ) => {
    updateFormData({ btcPriceInputType: newType });

    // If switching to year-by-year mode, don't apply any preset and enable manual mode
    if (newType === "manual") {
      updateFormData({ btcPriceManualMode: true });
      return;
    }

    // For other input types, apply the chart
    applyToChart(newType);
  };

  // Update handleScenarioChange to handle the new dropdown options
  const handleScenarioChange = (selectedScenario: string) => {
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

  // Auto-apply when values change (but not in manual mode)
  React.useEffect(() => {
    if (formData.btcPriceInputType === "flat" && !formData.btcPriceManualMode) {
      applyToChart();
    }
  }, [formData.btcPriceFlat, formData.timeHorizon]);

  React.useEffect(() => {
    if (
      formData.btcPriceInputType === "linear" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }
  }, [formData.btcPriceStart, formData.btcPriceEnd, formData.timeHorizon]);

  React.useEffect(() => {
    if (
      formData.btcPriceInputType === "preset" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }
  }, [formData.btcPricePreset, formData.timeHorizon]);

  // Reapply currently selected scenario when switching to auto mode
  React.useEffect(() => {
    if (!formData.btcPriceManualMode) {
      // Reapply current config when switching back to auto mode
      applyToChart(formData.btcPriceInputType);
    }
  }, [formData.btcPriceManualMode]);

  const getChartMaxValue = (): number => {
    if (formData.btcPriceInputType === "preset" && !isManualRateSelected) {
      return presetScenarios[formData.btcPricePreset]?.maxAxis || 100;
    }
    if (isManualRateSelected) {
      // When manual mode is selected, use the custom scenario's maxAxis
      return presetScenarios.custom?.maxAxis || 100;
    }
    if (formData.btcPriceInputType === "flat") {
      return Math.max(100, Math.ceil((formData.btcPriceFlat * 1.2) / 10) * 10);
    }
    if (formData.btcPriceInputType === "linear") {
      const maxValue = Math.max(formData.btcPriceStart, formData.btcPriceEnd);
      return Math.max(100, Math.ceil((maxValue * 1.2) / 10) * 10);
    }
    return 100;
  };

  const handleScenarioToggle = (follow: boolean) => {
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

  return (
    <div className="space-y-4">
      {/* Use ToggleSwitch for "Follow Scenario" */}
      {formData.economicScenario !== "custom" && (
        <ToggleSwitch
          checked={formData.followEconomicScenarioBtc}
          onChange={(checked) => handleScenarioToggle(checked)}
          id="btc-scenario-toggle"
          label="Follow Scenario"
          colorClass={{ on: "bg-green-500", off: "bg-gray-300" }}
          disabled={formData.btcPriceManualMode}
          description={{
            on: `Following economic scenario with ${calculateAverageBtcAppreciation()}% average appreciation. Settings are controlled by the selected scenario.`,
            off: "Manual configuration with custom parameters.",
          }}
        />
      )}

      {/* Use the RateConfigSection for configuration */}
      <RateConfigSection
        title="BTC Growth Scenario:"
        inputType={formData.btcPriceInputType}
        onInputTypeChange={handleInputTypeChange}
        flat={formData.btcPriceFlat}
        onFlatChange={(value) => updateFormData({ btcPriceFlat: value })}
        start={formData.btcPriceStart}
        onStartChange={(value) => updateFormData({ btcPriceStart: value })}
        end={formData.btcPriceEnd}
        onEndChange={(value) => updateFormData({ btcPriceEnd: value })}
        preset={formData.btcPricePreset}
        onPresetChange={(value) => handleScenarioChange(value)}
        manualMode={formData.btcPriceManualMode}
        scenarioType="btcPrice"
        disabled={formData.followEconomicScenarioBtc}
      />

      {/* Interactive Chart Editor */}
      <div className="mt-4 w-full">
        <DraggableRateChart
          title="📈 BTC Price Appreciation Chart"
          data={formData.btcPriceCustomRates}
          onChange={(newData) =>
            updateFormData({
              btcPriceCustomRates: newData,
              ...(formData.followEconomicScenarioBtc
                ? { followEconomicScenarioBtc: false }
                : {}),
            })
          }
          onStartDrag={() => {
            if (formData.followEconomicScenarioBtc) {
              updateFormData({ followEconomicScenarioBtc: false });
            }
            if (!formData.btcPriceManualMode) {
              updateFormData({
                btcPriceManualMode: true,
                btcPriceInputType: "manual",
              });
            }
          }}
          maxYears={formData.timeHorizon}
          maxValue={getChartMaxValue()}
          minValue={0}
          yAxisLabel="BTC appreciation (%, nominal)"
          readOnly={!formData.btcPriceManualMode}
        />
      </div>

      {/* Use ToggleSwitch for Direct Edit mode */}
      {!formData.followEconomicScenarioBtc && (
        <ToggleSwitch
          checked={formData.btcPriceManualMode}
          onChange={(checked) =>
            updateFormData({
              btcPriceManualMode: checked,
              ...(checked ? { btcPriceInputType: "manual" } : {}),
            })
          }
          id="btc-manual-mode-toggle"
          label="Direct edit chart"
          colorClass={{ on: "bg-yellow-400", off: "bg-gray-300" }}
          description={{
            on: "🔓 Chart unlocked. Click and drag points to customize your BTC price forecast.",
            off: "🔒 Chart locked. Enable to directly edit by dragging points on the chart.",
          }}
        />
      )}
    </div>
  );
};
