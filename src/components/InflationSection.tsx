import React from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";
import { DraggableInflationChart } from "./DraggableInflationChart";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const InflationSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  const getScenarioPresets = () => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      if (key !== "custom") {
        presets[key] = scenario.inflation;
      }
    });
    return presets;
  };

  const presetScenarios = getScenarioPresets();

  const generateInflationRates = (
    inputType = formData.inflationInputType,
  ): number[] => {
    const rates = [];

    if (inputType === "flat") {
      for (let i = 0; i < formData.timeHorizon; i++) {
        rates.push(formData.inflationFlat);
      }
    } else if (inputType === "linear") {
      for (let i = 0; i < formData.timeHorizon; i++) {
        const progress = i / Math.max(1, formData.timeHorizon - 1);
        const rate =
          formData.inflationStart +
          (formData.inflationEnd - formData.inflationStart) * progress;
        rates.push(Math.round(rate)); // Round to nearest 1%
      }
    } else if (inputType === "preset") {
      const scenario = presetScenarios[formData.inflationPreset];

      for (let i = 0; i < formData.timeHorizon; i++) {
        const progress = i / Math.max(1, formData.timeHorizon - 1);
        // Use exponential curve for upward acceleration: y = start + (end - start) * progress^2
        const curvedProgress = Math.pow(progress, 2);
        const rate =
          scenario.startRate +
          (scenario.endRate - scenario.startRate) * curvedProgress;
        rates.push(Math.round(rate / 2) * 2); // Round to nearest 2% to match chart snap
      }
    }

    return rates;
  };

  const applyToChart = (inputType = formData.inflationInputType) => {
    const rates = generateInflationRates(inputType);
    // Update the custom rates array, preserving any years beyond timeHorizon
    const newRates = [...formData.inflationCustomRates];
    rates.forEach((rate, index) => {
      if (index < newRates.length) {
        newRates[index] = rate;
      }
    });
    updateFormData({ inflationCustomRates: newRates });
  };

  // Handle switching input types and immediately apply
  const handleInputTypeChange = (newType: "flat" | "linear" | "preset") => {
    updateFormData({ inflationInputType: newType });
    // Apply the new type immediately
    applyToChart(newType);
  };

  // Auto-apply when other values change (but not input type, as that's handled above)
  React.useEffect(() => {
    if (
      formData.inflationInputType === "flat" &&
      !formData.inflationManualMode
    ) {
      applyToChart();
    }
  }, [formData.inflationFlat, formData.timeHorizon]);

  React.useEffect(() => {
    if (
      formData.inflationInputType === "linear" &&
      !formData.inflationManualMode
    ) {
      applyToChart();
    }
  }, [formData.inflationStart, formData.inflationEnd, formData.timeHorizon]);

  React.useEffect(() => {
    if (
      formData.inflationInputType === "preset" &&
      !formData.inflationManualMode
    ) {
      applyToChart();
    }
  }, [formData.inflationPreset, formData.timeHorizon]);

  // Determine chart max value based on input type
  const getChartMaxValue = (): number => {
    if (formData.inflationInputType === "preset") {
      return presetScenarios[formData.inflationPreset].maxAxis;
    }
    // For flat and linear modes, use a reasonable max based on the values
    if (formData.inflationInputType === "flat") {
      return Math.max(100, Math.ceil((formData.inflationFlat * 1.2) / 10) * 10);
    }
    if (formData.inflationInputType === "linear") {
      const maxValue = Math.max(formData.inflationStart, formData.inflationEnd);
      return Math.max(100, Math.ceil((maxValue * 1.2) / 10) * 10);
    }
    return 100; // Default
  };

  // Calculate average inflation rate
  const calculateAverageInflation = (): number => {
    if (formData.inflationCustomRates.length === 0) return 0;

    const sum = formData.inflationCustomRates
      .slice(0, formData.timeHorizon)
      .reduce((acc, val) => acc + val, 0);

    return Math.round(sum / formData.timeHorizon);
  };

  const handleScenarioToggle = (follow: boolean) => {
    updateFormData({
      followEconomicScenarioInflation: follow,
      // If now following scenario, update inflation preset based on economic scenario
      ...(follow &&
        formData.economicScenario !== "custom" && {
          inflationManualMode: false,
          inflationInputType: "preset",
        }),
    });
  };

  return (
    <div className="space-y-4">
      {/* Scenario Toggle - With fixed description that includes the message from the removed blue box */}
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center justify-start space-x-4">
          <div className="text-sm font-medium text-amber-800 w-32">
            Follow Scenario
          </div>

          <div className="relative mx-2">
            <input
              type="checkbox"
              checked={formData.followEconomicScenarioInflation}
              onChange={(e) => handleScenarioToggle(e.target.checked)}
              className="sr-only"
              id="inflation-scenario-toggle"
            />
            <label
              htmlFor="inflation-scenario-toggle"
              className={`flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ${
                formData.followEconomicScenarioInflation
                  ? "bg-amber-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                  formData.followEconomicScenarioInflation
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </label>
          </div>

          <div className="text-sm font-medium text-amber-800 w-32">
            Custom Control
          </div>
        </div>

        {/* Description with corrected text and integrated info box message */}
        <div className="mt-3 text-xs text-amber-700 min-h-[1.5rem] ml-1">
          {formData.followEconomicScenarioInflation
            ? `Following economic scenario with ${calculateAverageInflation()}% average inflation. Settings are controlled by the selected scenario.`
            : "Manual configuration with custom parameters."}
        </div>
      </div>

      {/* Remove the Following Scenario Message blue box since we integrated it into the description */}

      {/* Quick Setup Options - Only fully enabled in manual mode */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg ${formData.followEconomicScenarioInflation ? "opacity-60" : ""}`}
      >
        <div>
          <label className="block font-medium mb-2">Quick Setup:</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="flat"
                checked={formData.inflationInputType === "flat"}
                onChange={(e) =>
                  handleInputTypeChange(
                    e.target.value as "flat" | "linear" | "preset",
                  )
                }
                className="mr-2"
                disabled={formData.inflationManualMode}
              />
              <span
                className={formData.inflationManualMode ? "text-gray-400" : ""}
              >
                Flat Rate
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="linear"
                checked={formData.inflationInputType === "linear"}
                onChange={(e) =>
                  handleInputTypeChange(
                    e.target.value as "flat" | "linear" | "preset",
                  )
                }
                className="mr-2"
                disabled={formData.inflationManualMode}
              />
              <span
                className={formData.inflationManualMode ? "text-gray-400" : ""}
              >
                Linear Progression
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="preset"
                checked={formData.inflationInputType === "preset"}
                onChange={(e) =>
                  handleInputTypeChange(
                    e.target.value as "flat" | "linear" | "preset",
                  )
                }
                className="mr-2"
                disabled={formData.inflationManualMode}
              />
              <span
                className={formData.inflationManualMode ? "text-gray-400" : ""}
              >
                Preset Scenario
              </span>
            </label>
          </div>
        </div>

        <div>
          {formData.inflationInputType === "flat" && (
            <div>
              <label className="block font-medium mb-1">Flat Rate (%):</label>
              <input
                type="number"
                value={formData.inflationFlat}
                onChange={(e) =>
                  updateFormData({ inflationFlat: Number(e.target.value) })
                }
                className="w-full p-2 border rounded"
                min="0"
                max="100"
                disabled={formData.inflationManualMode}
              />
            </div>
          )}

          {formData.inflationInputType === "linear" && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium mb-1">
                  Start Rate (%):
                </label>
                <input
                  type="number"
                  value={formData.inflationStart}
                  onChange={(e) =>
                    updateFormData({ inflationStart: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                  min="0"
                  max="100"
                  disabled={formData.inflationManualMode}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">End Rate (%):</label>
                <input
                  type="number"
                  value={formData.inflationEnd}
                  onChange={(e) =>
                    updateFormData({ inflationEnd: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                  min="0"
                  max="100"
                  disabled={formData.inflationManualMode}
                />
              </div>
            </div>
          )}

          {formData.inflationInputType === "preset" && (
            <div>
              <label className="block font-medium mb-1">Scenario:</label>
              <select
                value={formData.inflationPreset}
                onChange={(e) =>
                  updateFormData({
                    inflationPreset: e.target.value as ScenarioKey,
                  })
                }
                className="w-full p-2 border rounded"
                disabled={formData.inflationManualMode}
              >
                {Object.entries(presetScenarios).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name} ({preset.startRate}% → {preset.endRate}%)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Curved upward progression over {formData.timeHorizon} years
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Chart Editor - Always visible but may be read-only */}
      <div className="mt-4 w-full">
        <h4 className="font-semibold mb-2">📊 Interactive Chart Editor</h4>
        <div className="w-full">
          <DraggableInflationChart
            data={formData.inflationCustomRates}
            onChange={(newData) =>
              updateFormData({
                inflationCustomRates: newData,
                ...(formData.followEconomicScenarioInflation
                  ? { followEconomicScenarioInflation: false }
                  : {}),
              })
            }
            onStartDrag={() => {
              if (formData.followEconomicScenarioInflation) {
                updateFormData({ followEconomicScenarioInflation: false });
              }
              if (!formData.inflationManualMode) {
                updateFormData({ inflationManualMode: true });
              }
            }}
            maxYears={formData.timeHorizon}
            maxValue={getChartMaxValue()}
            minValue={0}
            yAxisLabel="Annual Inflation Rate (%)"
          />
        </div>
      </div>

      {/* Manual Mode Toggle - Below Chart - Only visible in manual mode */}
      {!formData.followEconomicScenarioInflation && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-start space-x-4">
            <div className="text-sm font-medium text-amber-800 w-24">
              Auto Apply
            </div>

            <div className="relative mx-2">
              <input
                type="checkbox"
                checked={formData.inflationManualMode}
                onChange={(e) =>
                  updateFormData({ inflationManualMode: e.target.checked })
                }
                className="sr-only"
                id="manual-mode-toggle"
              />
              <label
                htmlFor="manual-mode-toggle"
                className={`flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ${
                  formData.inflationManualMode ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                    formData.inflationManualMode
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </label>
            </div>

            <div className="text-sm font-medium text-amber-800 w-24">
              Manual Mode
            </div>
          </div>

          {/* Left-aligned description */}
          <div className="mt-3 text-xs text-amber-700 min-h-[1.5rem] ml-1">
            {formData.inflationManualMode
              ? "Chart editing locked - drag points to adjust values"
              : "Changes apply immediately when adjusting parameters"}
          </div>
        </div>
      )}
    </div>
  );
};
