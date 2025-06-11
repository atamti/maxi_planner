import React from "react";
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
  const presetScenarios = {
    managed: {
      name: "Managed Debasement",
      startRate: 8,
      endRate: 12,
      maxAxis: 20,
    },
    crisis: {
      name: "Crisis Acceleration",
      startRate: 15,
      endRate: 25,
      maxAxis: 40,
    },
    hyperinflation: {
      name: "Hyperinflationary Spiral",
      startRate: 30,
      endRate: 100,
      maxAxis: 100,
    },
  };

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

  return (
    <div className="space-y-4">
      {/* Quick Setup Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
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
                    inflationPreset: e.target.value as
                      | "managed"
                      | "crisis"
                      | "hyperinflation",
                  })
                }
                className="w-full p-2 border rounded"
                disabled={formData.inflationManualMode}
              >
                <option value="managed">Managed Debasement (8% → 12%)</option>
                <option value="crisis">Crisis Acceleration (15% → 25%)</option>
                <option value="hyperinflation">
                  Hyperinflationary Spiral (30% → 100%)
                </option>
              </select>
              <p className="text-xs text-gray-600 mt-1">
                Curved upward progression over {formData.timeHorizon} years
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Chart Editor */}
      <div className="mt-4 w-full">
        <h4 className="font-semibold mb-2">📊 Interactive Chart Editor</h4>
        <div className="w-full">
          <DraggableInflationChart
            data={formData.inflationCustomRates}
            onChange={(newData) =>
              updateFormData({ inflationCustomRates: newData })
            }
            onStartDrag={() => {
              if (!formData.inflationManualMode) {
                updateFormData({ inflationManualMode: true });
              }
            }}
            maxYears={formData.timeHorizon}
            maxValue={getChartMaxValue()}
            minValue={0}
          />
        </div>
      </div>

      {/* Manual Mode Toggle - Below Chart */}
      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-amber-800">
            {formData.inflationManualMode ? "🔒 Manual Mode" : "🔄 Auto Mode"}
          </span>
          <div className="relative">
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
          <span className="text-sm text-amber-700">
            {formData.inflationManualMode
              ? "Chart locked - quick setup disabled"
              : "Auto-apply enabled"}
          </span>
        </div>
      </div>
    </div>
  );
};
