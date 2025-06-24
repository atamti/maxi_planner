import React from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";
import { DraggableRateChart } from "./DraggableRateChart";
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
    // If we're using a preset scenario that isn't custom, use its maxAxis value
    if (formData.btcPriceInputType === "preset" && !isManualRateSelected) {
      return (
        presetScenarios[formData.btcPricePreset as ScenarioKey]?.maxAxis || 200
      );
    }

    // Default to 200% for all other cases
    return 200;
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
          label="Follow Global Scenario"
          colorClass={{ on: "bg-green-500", off: "bg-gray-300" }}
          disabled={formData.btcPriceManualMode}
          description={{
            on: `Following ${formData.economicScenario} scenario with ${calculateAverageBtcAppreciation()}% average appreciation. Settings are controlled by the selected scenario.`,
            off: "Manual configuration with custom parameters.",
          }}
        />
      )}

      {/* BTC Growth Scenario Dropdown Section */}
      <div
        className={`p-4 bg-gray-50 rounded-lg ${formData.followEconomicScenarioBtc ? "opacity-60" : ""}`}
      >
        <label className="block font-medium mb-2">BTC Growth Scenario:</label>
        <select
          value={
            formData.btcPriceInputType === "flat"
              ? "custom-flat"
              : formData.btcPriceInputType === "linear"
                ? "custom-linear"
                : formData.btcPricePreset
          }
          onChange={(e) => handleScenarioChange(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          disabled={
            formData.followEconomicScenarioBtc || formData.btcPriceManualMode
          }
        >
          {/* Economic scenario presets */}
          <optgroup label="Preset Scenarios">
            {Object.entries(presetScenarios).map(([key, scenario]) => {
              if (key !== "custom") {
                return (
                  <option key={key} value={key}>
                    {scenario.name} ({scenario.startRate}% → {scenario.endRate}
                    %)
                  </option>
                );
              }
              return null;
            })}
          </optgroup>

          {/* Custom options */}
          <optgroup label="Custom Configurations">
            <option value="custom-flat">Custom - Flat Rate</option>
            <option value="custom-linear">Custom - Linear Progression</option>
          </optgroup>
        </select>

        {/* Show appropriate fields based on selection - MODIFIED to maintain visibility */}
        {formData.btcPriceInputType === "flat" && (
          <div
            className={`mt-3 ${formData.btcPriceManualMode ? "opacity-60" : ""}`}
          >
            <label className="block font-medium mb-1">Flat Rate (%):</label>
            <input
              type="number"
              value={formData.btcPriceFlat}
              onChange={(e) =>
                updateFormData({ btcPriceFlat: Number(e.target.value) })
              }
              className="w-full p-2 border rounded"
              min="0"
              max="500"
              disabled={
                formData.followEconomicScenarioBtc ||
                formData.btcPriceManualMode
              }
            />
          </div>
        )}

        {formData.btcPriceInputType === "linear" && (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 ${formData.btcPriceManualMode ? "opacity-60" : ""}`}
          >
            <div>
              <label className="block font-medium mb-1">Start Rate (%):</label>
              <input
                type="number"
                value={formData.btcPriceStart}
                onChange={(e) =>
                  updateFormData({ btcPriceStart: Number(e.target.value) })
                }
                className="w-full p-2 border rounded"
                min="0"
                max="500"
                disabled={
                  formData.followEconomicScenarioBtc ||
                  formData.btcPriceManualMode
                }
              />
            </div>
            <div>
              <label className="block font-medium mb-1">End Rate (%):</label>
              <input
                type="number"
                value={formData.btcPriceEnd}
                onChange={(e) =>
                  updateFormData({ btcPriceEnd: Number(e.target.value) })
                }
                className="w-full p-2 border rounded"
                min="0"
                max="500"
                disabled={
                  formData.followEconomicScenarioBtc ||
                  formData.btcPriceManualMode
                }
              />
            </div>
          </div>
        )}

        {/* Add this message when in manual mode to provide context */}
        {formData.btcPriceManualMode && (
          <div className="mt-3 text-xs text-gray-500 italic">
            Reference settings shown above. Adjustments are now made directly on
            the chart.
          </div>
        )}
      </div>

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
