import React from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";
import { DraggableInflationChart } from "./DraggableInflationChart";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const BtcPriceSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  const getScenarioPresets = () => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      if (key !== "custom") {
        presets[key] = scenario.btcPrice;
      }
    });
    return presets;
  };

  const presetScenarios = getScenarioPresets();

  // Check if manual mode is selected
  const isManualRateSelected = formData.btcPricePreset === "custom";

  const generateBtcRates = (
    inputType = formData.btcPriceInputType,
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

  const applyToChart = (inputType = formData.btcPriceInputType) => {
    const rates = generateBtcRates(inputType);
    const newRates = [...formData.btcPriceCustomRates];
    rates.forEach((rate, index) => {
      if (index < newRates.length) {
        newRates[index] = rate;
      }
    });
    updateFormData({ btcPriceCustomRates: newRates });
  };

  const handleInputTypeChange = (newType: "flat" | "linear" | "preset") => {
    updateFormData({ btcPriceInputType: newType });
    applyToChart(newType);
  };

  const handleScenarioChange = (selectedScenario: string) => {
    if (selectedScenario === "manual") {
      // Handle manual selection
      updateFormData({
        btcPricePreset: "custom",
        followEconomicScenarioBtc: false,
        // Default to flat rate when switching to manual
        btcPriceInputType: "flat",
      });
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
    if (formData.btcPriceInputType === "flat" || isManualRateSelected) {
      return Math.max(100, Math.ceil((formData.btcPriceFlat * 1.2) / 10) * 10);
    }
    if (formData.btcPriceInputType === "linear") {
      const maxValue = Math.max(formData.btcPriceStart, formData.btcPriceEnd);
      return Math.max(100, Math.ceil((maxValue * 1.2) / 10) * 10);
    }
    return 100;
  };

  // Calculate average BTC appreciation rate
  const calculateAverageBtcAppreciation = (): number => {
    if (formData.btcPriceCustomRates.length === 0) return 0;

    const sum = formData.btcPriceCustomRates
      .slice(0, formData.timeHorizon)
      .reduce((acc, val) => acc + val, 0);

    return Math.round(sum / formData.timeHorizon);
  };

  const handleScenarioToggle = (follow: boolean) => {
    updateFormData({
      followEconomicScenarioBtc: follow,
      // If now following scenario, update BTC preset based on economic scenario
      ...(follow &&
        formData.economicScenario !== "custom" && {
          btcPriceManualMode: false,
          btcPriceInputType: "preset",
        }),
    });
  };

  return (
    <div className="space-y-4">
      {/* Scenario Toggle - With corrected description */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-start space-x-4">
          <div className="text-sm font-medium text-green-800 w-32">
            Follow Scenario
          </div>

          <div className="relative mx-2">
            <input
              type="checkbox"
              checked={!formData.followEconomicScenarioBtc}
              onChange={(e) => handleScenarioToggle(!e.target.checked)}
              className="sr-only"
              id="btc-scenario-toggle"
            />
            <label
              htmlFor="btc-scenario-toggle"
              className={`flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ${
                formData.followEconomicScenarioBtc
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                  formData.followEconomicScenarioBtc
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </label>
          </div>

          <div className="text-sm font-medium text-green-800 w-32">
            Manual Control
          </div>
        </div>

        {/* Corrected description */}
        <div className="mt-3 text-xs text-green-700 min-h-[1.5rem] ml-1">
          {formData.followEconomicScenarioBtc
            ? `Following economic scenario with ${calculateAverageBtcAppreciation()}% average appreciation. Settings are controlled by the selected scenario.`
            : "Manual configuration with custom parameters."}
        </div>
      </div>

      {/* Scenario Selection at the top */}
      <div
        className={`p-4 bg-gray-50 rounded-lg ${formData.followEconomicScenarioBtc ? "opacity-60" : ""}`}
      >
        <div className="mb-4">
          <label className="block font-medium mb-1">BTC Growth Scenario:</label>
          <select
            value={isManualRateSelected ? "manual" : formData.btcPricePreset}
            onChange={(e) => handleScenarioChange(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={formData.followEconomicScenarioBtc}
          >
            {Object.entries(presetScenarios).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.name} ({preset.startRate}% → {preset.endRate}%)
              </option>
            ))}
            <option value="manual">Manually set rate</option>
          </select>
          <p className="text-xs text-gray-600 mt-1">
            {!isManualRateSelected && "Curved upward progression over "}
            {formData.timeHorizon} years
          </p>
        </div>

        {/* Show additional options only when manual rate is selected */}
        {isManualRateSelected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="flat"
                    checked={formData.btcPriceInputType === "flat"}
                    onChange={(e) =>
                      handleInputTypeChange(
                        e.target.value as "flat" | "linear" | "preset",
                      )
                    }
                    className="mr-2"
                    disabled={formData.btcPriceManualMode}
                  />
                  <span
                    className={
                      formData.btcPriceManualMode ? "text-gray-400" : ""
                    }
                  >
                    Flat Rate
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="linear"
                    checked={formData.btcPriceInputType === "linear"}
                    onChange={(e) =>
                      handleInputTypeChange(
                        e.target.value as "flat" | "linear" | "preset",
                      )
                    }
                    className="mr-2"
                    disabled={formData.btcPriceManualMode}
                  />
                  <span
                    className={
                      formData.btcPriceManualMode ? "text-gray-400" : ""
                    }
                  >
                    Linear Progression
                  </span>
                </label>
              </div>
            </div>

            <div>
              {formData.btcPriceInputType === "flat" && (
                <div>
                  <label className="block font-medium mb-1">
                    Flat Rate (%):
                  </label>
                  <input
                    type="number"
                    value={formData.btcPriceFlat}
                    onChange={(e) =>
                      updateFormData({ btcPriceFlat: Number(e.target.value) })
                    }
                    className="w-full p-2 border rounded"
                    min="0"
                    max="500"
                    disabled={formData.btcPriceManualMode}
                  />
                </div>
              )}

              {formData.btcPriceInputType === "linear" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium mb-1">
                      Start Rate (%):
                    </label>
                    <input
                      type="number"
                      value={formData.btcPriceStart}
                      onChange={(e) =>
                        updateFormData({
                          btcPriceStart: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded"
                      min="0"
                      max="500"
                      disabled={formData.btcPriceManualMode}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      End Rate (%):
                    </label>
                    <input
                      type="number"
                      value={formData.btcPriceEnd}
                      onChange={(e) =>
                        updateFormData({ btcPriceEnd: Number(e.target.value) })
                      }
                      className="w-full p-2 border rounded"
                      min="0"
                      max="500"
                      disabled={formData.btcPriceManualMode}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Chart Editor */}
      <div className="mt-4 w-full">
        <h4 className="font-semibold mb-2">📈 BTC Price Appreciation Chart</h4>
        <div className="w-full">
          <DraggableInflationChart
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
                updateFormData({ btcPriceManualMode: true });
              }
            }}
            maxYears={formData.timeHorizon}
            maxValue={getChartMaxValue()}
            minValue={0}
            yAxisLabel="BTC appreciation (%, nominal)"
          />
        </div>
      </div>

      {/* Manual Mode Toggle - Below Chart - Only visible in manual mode */}
      {!formData.followEconomicScenarioBtc && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-start space-x-4">
            <div className="text-sm font-medium text-green-800 w-24">
              Auto Apply
            </div>

            <div className="relative mx-2">
              <input
                type="checkbox"
                checked={formData.btcPriceManualMode}
                onChange={(e) =>
                  updateFormData({ btcPriceManualMode: e.target.checked })
                }
                className="sr-only"
                id="btc-manual-mode-toggle"
              />
              <label
                htmlFor="btc-manual-mode-toggle"
                className={`flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ${
                  formData.btcPriceManualMode ? "bg-gray-300" : "bg-green-500"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                    formData.btcPriceManualMode
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </label>
            </div>

            <div className="text-sm font-medium text-green-800 w-24">
              Manual Mode
            </div>
          </div>

          {/* Left-aligned description */}
          <div className="mt-3 text-xs text-green-700 min-h-[1.5rem] ml-1">
            {formData.btcPriceManualMode
              ? "Chart editing locked - drag points to adjust values"
              : "Changes apply immediately when adjusting parameters"}
          </div>
        </div>
      )}
    </div>
  );
};
