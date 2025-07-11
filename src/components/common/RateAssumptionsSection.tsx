import React from "react";
import { FormData } from "../../types";
import { DraggableRateChart } from "../DraggableRateChart";
import { ToggleSwitch } from "./ToggleSwitch";

interface RateAssumptionConfig {
  title: string;
  emoji: string;
  colorClass: {
    background: string;
    border: string;
    text: string;
  };
  dataKey: keyof FormData;
  flatRateKey?: keyof FormData;
  startRateKey?: keyof FormData;
  endRateKey?: keyof FormData;
  inputTypeKey?: keyof FormData;
  manualModeKey?: keyof FormData;
  followScenarioKey?: keyof FormData;
  presetKey?: keyof FormData;
  maxValue?: number;
  yAxisLabel: string;
  unit?: string;
}

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  config: RateAssumptionConfig;
  economicScenarios?: any;
  presetScenarios?: any;
}

export const RateAssumptionsSection: React.FC<Props> = ({
  formData,
  updateFormData,
  config,
  economicScenarios,
  presetScenarios,
}) => {
  const {
    title,
    emoji,
    colorClass,
    dataKey,
    flatRateKey,
    startRateKey,
    endRateKey,
    inputTypeKey,
    manualModeKey,
    followScenarioKey,
    presetKey,
    maxValue = 200,
    yAxisLabel,
    unit = "%",
  } = config;

  // Get current values from formData
  const customRates = formData[dataKey] as number[];
  const flatRate = flatRateKey ? (formData[flatRateKey] as number) : 0;
  const startRate = startRateKey ? (formData[startRateKey] as number) : 0;
  const endRate = endRateKey ? (formData[endRateKey] as number) : 0;
  const inputType = inputTypeKey ? (formData[inputTypeKey] as string) : "flat";
  const manualMode = manualModeKey
    ? (formData[manualModeKey] as boolean)
    : false;
  const followScenario = followScenarioKey
    ? (formData[followScenarioKey] as boolean)
    : false;
  const preset = presetKey ? (formData[presetKey] as string) : "";

  // Calculate average rate
  const calculateAverageRate = (): number => {
    if (customRates.length === 0) return 0;
    const sum = customRates
      .slice(0, formData.timeHorizon)
      .reduce((acc, val) => acc + val, 0);
    return Math.round(sum / formData.timeHorizon);
  };

  const generateRates = (
    type: "flat" | "linear" | "preset" | "manual" = inputType as any,
  ): number[] => {
    const rates = [];

    if (type === "flat") {
      // Ensure we generate rates for the full time horizon
      for (let i = 0; i < formData.timeHorizon; i++) {
        rates.push(flatRate);
      }
    } else if (type === "linear") {
      for (let i = 0; i < formData.timeHorizon; i++) {
        const progress = i / Math.max(1, formData.timeHorizon - 1);
        const rate = startRate + (endRate - startRate) * progress;
        rates.push(Math.round(rate));
      }
    } else if (type === "preset" && presetScenarios && preset !== "custom") {
      const scenario = presetScenarios[preset];
      if (scenario) {
        for (let i = 0; i < formData.timeHorizon; i++) {
          const progress = i / Math.max(1, formData.timeHorizon - 1);
          const curvedProgress = Math.pow(progress, 1.5);
          const rate =
            scenario.startRate +
            (scenario.endRate - scenario.startRate) * curvedProgress;
          rates.push(Math.round(rate / 2) * 2);
        }
      }
    }

    return rates;
  };

  const applyToChart = (
    type: "flat" | "linear" | "preset" | "manual" = inputType as any,
  ) => {
    const rates = generateRates(type);

    // Make sure we have a properly sized array
    const newRates = [...customRates];

    // Ensure the array is at least as long as the time horizon
    while (newRates.length < formData.timeHorizon) {
      newRates.push(flatRate || 8); // Use flat rate or default
    }

    // Apply the generated rates
    rates.forEach((rate, index) => {
      if (index < formData.timeHorizon) {
        newRates[index] = rate;
      }
    });

    // Update only up to timeHorizon to avoid extra values
    const trimmedRates = newRates.slice(0, Math.max(formData.timeHorizon, 30));

    updateFormData({ [dataKey]: trimmedRates });
  };

  const handleScenarioChange = (selectedScenario: string) => {
    if (selectedScenario === "custom-flat") {
      const customScenario =
        economicScenarios?.custom?.[
          dataKey === "btcPriceCustomRates" ? "btcPrice" : "inflation"
        ];
      updateFormData({
        ...(presetKey ? { [presetKey]: "custom" } : {}),
        ...(followScenarioKey ? { [followScenarioKey]: false } : {}),
        ...(inputTypeKey ? { [inputTypeKey]: "flat" } : {}),
        ...(flatRateKey && customScenario
          ? { [flatRateKey]: customScenario.startRate }
          : {}),
      });
      setTimeout(() => applyToChart("flat"), 0);
    } else if (selectedScenario === "custom-linear") {
      const customScenario =
        economicScenarios?.custom?.[
          dataKey === "btcPriceCustomRates" ? "btcPrice" : "inflation"
        ];
      updateFormData({
        ...(presetKey ? { [presetKey]: "custom" } : {}),
        ...(followScenarioKey ? { [followScenarioKey]: false } : {}),
        ...(inputTypeKey ? { [inputTypeKey]: "linear" } : {}),
        ...(startRateKey && customScenario
          ? { [startRateKey]: customScenario.startRate }
          : {}),
        ...(endRateKey && customScenario
          ? { [endRateKey]: customScenario.endRate }
          : {}),
      });
      setTimeout(() => applyToChart("linear"), 0);
    } else {
      // Handle preset scenario selection
      updateFormData({
        ...(presetKey ? { [presetKey]: selectedScenario } : {}),
        ...(inputTypeKey ? { [inputTypeKey]: "preset" } : {}),
        ...(manualModeKey ? { [manualModeKey]: false } : {}),
      });
    }
  };

  const handleScenarioToggle = (follow: boolean) => {
    if (followScenarioKey) {
      updateFormData({
        [followScenarioKey]: follow,
        ...(follow &&
        formData.economicScenario !== "custom" &&
        presetKey &&
        manualModeKey &&
        inputTypeKey
          ? {
              [manualModeKey]: false,
              [inputTypeKey]: "preset",
              [presetKey]: formData.economicScenario,
            }
          : {}),
      });
    }
  };

  // Auto-apply when values change (but not in manual mode)
  React.useEffect(() => {
    if (inputType === "flat" && !manualMode && flatRateKey) {
      applyToChart();
    }
  }, [flatRate, formData.timeHorizon]);

  React.useEffect(() => {
    if (inputType === "linear" && !manualMode && startRateKey && endRateKey) {
      applyToChart();
    }
  }, [startRate, endRate, formData.timeHorizon]);

  React.useEffect(() => {
    if (inputType === "preset" && !manualMode) {
      applyToChart();
    }
  }, [preset, formData.timeHorizon]);

  React.useEffect(() => {
    if (!manualMode) {
      applyToChart(inputType as any);
    }
  }, [manualMode]);

  // Add effect to handle economic scenario changes for income
  React.useEffect(() => {
    if (
      followScenario &&
      formData.economicScenario !== "custom" &&
      economicScenarios
    ) {
      const scenario = economicScenarios[formData.economicScenario];
      if (scenario && dataKey === "incomeCustomRates" && scenario.incomeYield) {
        // Generate rates based on the selected economic scenario
        const newRates = [];
        for (let i = 0; i < formData.timeHorizon; i++) {
          const progress = i / Math.max(1, formData.timeHorizon - 1);
          const curvedProgress = Math.pow(progress, 1.5);
          const rate =
            scenario.incomeYield.startRate +
            (scenario.incomeYield.endRate - scenario.incomeYield.startRate) *
              curvedProgress;
          newRates.push(Math.round(rate));
        }

        // Update the custom rates to match the economic scenario
        const updatedRates = [...(formData[dataKey] as number[])];
        newRates.forEach((rate, index) => {
          if (index < updatedRates.length) {
            updatedRates[index] = rate;
          }
        });
        updateFormData({ [dataKey]: updatedRates });
      }
    }
  }, [followScenario, formData.economicScenario, formData.timeHorizon]);

  const [showLockedMessage, setShowLockedMessage] = React.useState(false);

  // Show locked message temporarily when user tries to interact with locked controls
  const handleLockedInteraction = () => {
    if (followScenario || manualMode) {
      setShowLockedMessage(true);
      setTimeout(() => setShowLockedMessage(false), 3000);
    }
  };

  return (
    <div
      className={`p-4 ${colorClass.background} rounded-lg border-l-4 ${colorClass.border}`}
    >
      <h4 className={`font-semibold ${colorClass.text} mb-3`}>
        {emoji} {title}
      </h4>

      {/* Follow Scenario Toggle */}
      {followScenarioKey && formData.economicScenario !== "custom" && (
        <ToggleSwitch
          checked={followScenario}
          onChange={(checked) => handleScenarioToggle(checked)}
          id={`${dataKey}-scenario-toggle`}
          label="Follow Global Scenario"
          colorClass={{ on: "bg-green-500", off: "bg-gray-300" }}
          disabled={manualMode}
          description={{
            on: `Following scenario with ${calculateAverageRate()}${unit} average rate. Settings are controlled by the selected scenario.`,
            off: "Manual configuration with custom parameters.",
          }}
        />
      )}

      {/* Locked Control Message */}
      {showLockedMessage && (
        <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
          ⚠️ Controls are locked.{" "}
          {followScenario
            ? 'Disable "Follow Global Scenario"'
            : 'Disable "Direct edit chart"'}{" "}
          to modify these settings.
        </div>
      )}

      {/* Growth Scenario Dropdown Section */}
      <div
        className={`p-4 rounded-lg border transition-all duration-200 ${
          followScenario || manualMode
            ? `${colorClass.background} opacity-50 cursor-not-allowed border-gray-300`
            : `${colorClass.background} border-gray-200 hover:border-gray-300`
        }`}
      >
        <label className="block font-medium mb-2">Growth Scenario:</label>
        <select
          value={
            inputType === "flat"
              ? "custom-flat"
              : inputType === "linear"
                ? "custom-linear"
                : preset
          }
          onChange={(e) => {
            if (followScenario || manualMode) {
              handleLockedInteraction();
              return;
            }
            handleScenarioChange(e.target.value);
          }}
          className={`w-full p-2 border rounded mb-3 transition-all duration-200 ${
            followScenario || manualMode
              ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
              : "bg-white border-gray-300 hover:border-gray-400"
          }`}
          disabled={followScenario || manualMode}
          onClick={
            followScenario || manualMode ? handleLockedInteraction : undefined
          }
        >
          {/* Economic scenario presets */}
          {presetScenarios && (
            <optgroup label="Preset Scenarios">
              {Object.entries(presetScenarios).map(
                ([key, scenario]: [string, any]) => {
                  if (key !== "custom") {
                    return (
                      <option key={key} value={key}>
                        {scenario.name} ({scenario.startRate}
                        {unit} → {scenario.endRate}
                        {unit})
                      </option>
                    );
                  }
                  return null;
                },
              )}
            </optgroup>
          )}

          {/* Custom options */}
          <optgroup label="Custom Configurations">
            <option value="custom-flat">Custom - Flat Rate</option>
            <option value="custom-linear">Custom - Linear Progression</option>
          </optgroup>
        </select>

        {/* Show appropriate fields based on selection */}
        {inputType === "flat" && flatRateKey && (
          <div className="mt-3">
            <label className="block font-medium mb-1">
              Flat Rate ({unit}):
            </label>
            <input
              type="number"
              value={flatRate}
              onChange={(e) => {
                if (followScenario || manualMode) {
                  handleLockedInteraction();
                  return;
                }
                updateFormData({ [flatRateKey]: Number(e.target.value) });
              }}
              className={`w-full p-2 border rounded transition-all duration-200 ${
                followScenario || manualMode
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                  : "bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500"
              }`}
              min="0"
              max="500"
              disabled={followScenario || manualMode}
              onClick={
                followScenario || manualMode
                  ? handleLockedInteraction
                  : undefined
              }
            />
          </div>
        )}

        {inputType === "linear" && startRateKey && endRateKey && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block font-medium mb-1">
                Start Rate ({unit}):
              </label>
              <input
                type="number"
                value={startRate}
                onChange={(e) => {
                  if (followScenario || manualMode) {
                    handleLockedInteraction();
                    return;
                  }
                  updateFormData({ [startRateKey]: Number(e.target.value) });
                }}
                className={`w-full p-2 border rounded transition-all duration-200 ${
                  followScenario || manualMode
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    : "bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500"
                }`}
                min="0"
                max="500"
                disabled={followScenario || manualMode}
                onClick={
                  followScenario || manualMode
                    ? handleLockedInteraction
                    : undefined
                }
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                End Rate ({unit}):
              </label>
              <input
                type="number"
                value={endRate}
                onChange={(e) => {
                  if (followScenario || manualMode) {
                    handleLockedInteraction();
                    return;
                  }
                  updateFormData({ [endRateKey]: Number(e.target.value) });
                }}
                className={`w-full p-2 border rounded transition-all duration-200 ${
                  followScenario || manualMode
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    : "bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500"
                }`}
                min="0"
                max="500"
                disabled={followScenario || manualMode}
                onClick={
                  followScenario || manualMode
                    ? handleLockedInteraction
                    : undefined
                }
              />
            </div>
          </div>
        )}

        {/* Enhanced locked state message */}
        {(followScenario || manualMode) && (
          <div className="mt-3 p-2 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs">
            {followScenario ? (
              <>
                🔒 Settings controlled by global scenario. Current selection
                shown for reference.
              </>
            ) : (
              <>
                🔒 Settings locked in direct edit mode. Current selection shown
                for reference. Adjust values directly on the chart below.
              </>
            )}
          </div>
        )}
      </div>

      {/* Interactive Chart Editor */}
      <div className="mt-4 w-full">
        <DraggableRateChart
          title={`${emoji} ${title} Chart`}
          data={customRates}
          onChange={(newData) =>
            updateFormData({
              [dataKey]: newData,
              ...(followScenario && followScenarioKey
                ? { [followScenarioKey]: false }
                : {}),
            })
          }
          onStartDrag={() => {
            if (followScenario && followScenarioKey) {
              updateFormData({ [followScenarioKey]: false });
            }
            if (!manualMode && manualModeKey) {
              updateFormData({
                [manualModeKey]: true,
                ...(inputTypeKey ? { [inputTypeKey]: "manual" } : {}),
              });
            }
          }}
          maxYears={formData.timeHorizon}
          maxValue={maxValue}
          minValue={0}
          yAxisLabel={yAxisLabel}
          readOnly={!manualMode}
        />
      </div>

      {/* Direct Edit Toggle */}
      {!followScenario && manualModeKey && (
        <ToggleSwitch
          checked={manualMode}
          onChange={(checked) =>
            updateFormData({
              [manualModeKey]: checked,
              ...(checked && inputTypeKey ? { [inputTypeKey]: "manual" } : {}),
            })
          }
          id={`${dataKey}-manual-mode-toggle`}
          label="Direct edit chart"
          colorClass={{ on: "bg-yellow-400", off: "bg-gray-300" }}
          description={{
            on: "🔓 Chart unlocked. Click and drag points to customize your forecast.",
            off: "🔒 Chart locked. Enable to directly edit by dragging points on the chart.",
          }}
        />
      )}
    </div>
  );
};
