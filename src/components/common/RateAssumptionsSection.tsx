import React, { useEffect } from "react";
import { useScenarioManagement } from "../../hooks/useScenarioManagement";
import { useUIStateManagement } from "../../hooks/useUIStateManagement";
import { FormData } from "../../types";
import { useGeneralRateSystem } from "../../utils/shared/useGeneralRateSystem";
import { DraggableRateChart } from "../charts/DraggableRateChart";
import LockedStateMessage from "./LockedStateMessage";
import RateInputs from "./RateInputs";
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
  dropdownPresets?: any;
}

export const RateAssumptionsSection: React.FC<Props> = ({
  formData,
  updateFormData,
  config,
  economicScenarios,
  presetScenarios,
  dropdownPresets,
}) => {
  // Log the configuration for debugging
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

  // Use extracted hooks
  const { generateRates, applyRatesToArray, calculateAverageRate } =
    useGeneralRateSystem();
  const scenarioHook = useScenarioManagement(
    formData,
    updateFormData,
    config,
    economicScenarios,
  );

  const {
    handleScenarioChange: handleScenarioChangeHook,
    handleScenarioToggle: handleScenarioToggleHook,
    handleIncomeScenarioSync: handleIncomeScenarioSyncHook,
  } = scenarioHook;
  const { showLockedMessage, handleLockedInteraction } = useUIStateManagement();

  // Calculate average rate
  const avgRate = calculateAverageRate(customRates, formData.timeHorizon);

  const applyToChart = (
    type: "flat" | "linear" | "preset" | "manual" | "saylor" = inputType as any,
    overridePreset?: string,
  ) => {
    const rates = generateRates({
      type,
      flatRate,
      startRate,
      endRate,
      timeHorizon: formData.timeHorizon,
      preset: overridePreset || preset,
      presetScenarios,
    });

    const newRates = applyRatesToArray(
      customRates,
      rates,
      formData.timeHorizon,
      flatRate || 8,
    );

    updateFormData({ [dataKey]: newRates });
  };

  const handleScenarioChange = (selectedScenario: string) => {
    handleScenarioChangeHook(selectedScenario);

    // Apply the selected scenario to the chart immediately
    setTimeout(() => {
      if (selectedScenario === "custom-flat") {
        applyToChart("flat");
      } else if (selectedScenario === "custom-linear") {
        applyToChart("linear");
      } else if (selectedScenario === "custom-saylor") {
        applyToChart("saylor");
      } else if (selectedScenario === "custom") {
        // For custom preset, just use the current custom rates
        applyToChart("manual");
      } else {
        // For preset scenarios, pass the scenario name directly
        applyToChart("preset", selectedScenario);
      }
    }, 0);
  };

  const handleScenarioToggle = (follow: boolean) => {
    handleScenarioToggleHook(follow);
  };

  // Sync economic scenario preset when following scenario
  useEffect(() => {
    if (
      followScenario &&
      formData.economicScenario !== "custom" &&
      economicScenarios
    ) {
      handleIncomeScenarioSyncHook();
    }
  }, [followScenario, formData.economicScenario, formData.timeHorizon]);

  // Initialize chart with preset scenario on component mount
  useEffect(() => {
    if (
      inputType === "preset" &&
      preset &&
      preset !== "custom" &&
      presetScenarios
    ) {
      // SKIP preset regeneration - rates are already loaded correctly from defaults
      // The issue is that we have two different rate generation algorithms that produce
      // different results for the same preset (45.7% vs 44.5% CAGR)
      // By skipping regeneration, we preserve the correctly loaded rates
    }
  }, [inputType, preset, presetScenarios]); // Only run when these dependencies change

  // Watch for preset changes (e.g., when switching to/from custom mode)
  useEffect(() => {
    if (preset === "custom" && inputType === "preset") {
      setTimeout(() => {
        applyToChart("manual");
      }, 0);
    } else if (
      preset &&
      preset !== "custom" &&
      inputType === "preset" &&
      presetScenarios
    ) {
      // SKIP preset regeneration - rates are already loaded correctly from defaults
      // Only regenerate if the user actually changed the preset selection
    }
  }, [preset]); // Watch for preset changes

  // Watch for rate input changes and automatically update the chart
  useEffect(() => {
    if (
      !manualMode &&
      (!followScenario || formData.economicScenario === "custom")
    ) {
      // Only auto-apply when not in manual mode and not following a scenario
      if (
        inputType === "flat" &&
        typeof flatRate === "number" &&
        !isNaN(flatRate)
      ) {
        setTimeout(() => applyToChart("flat"), 0);
      } else if (
        inputType === "linear" &&
        typeof startRate === "number" &&
        typeof endRate === "number" &&
        !isNaN(startRate) &&
        !isNaN(endRate)
      ) {
        setTimeout(() => applyToChart("linear"), 0);
      } else if (inputType === "saylor") {
        setTimeout(() => applyToChart("saylor"), 0);
      }
    }
  }, [flatRate, startRate, endRate, inputType, manualMode, followScenario]); // Watch for rate input changes

  return (
    <div className="w-full">
      <LockedStateMessage
        show={showLockedMessage}
        message={
          followScenario
            ? `🔒 Settings controlled by global scenario. Current selection shown for reference.`
            : `🔒 Settings locked in direct edit mode. Current selection shown for reference.`
        }
      />

      {/* Header */}
      <div
        className={`p-4 rounded-lg mb-4 ${colorClass.background} ${colorClass.border}`}
      >
        <h3 className={`text-lg font-semibold ${colorClass.text}`}>
          {emoji} {title}
        </h3>
        <p className={`text-sm mt-1 ${colorClass.text}`}>
          Configure your {title.toLowerCase()} forecast
        </p>
      </div>

      {/* Controls */}
      <div className="mb-4">
        {/* Follow Scenario Toggle */}
        {followScenarioKey && formData.economicScenario !== "custom" && (
          <div className="mb-4">
            <ToggleSwitch
              checked={followScenario}
              onChange={handleScenarioToggle}
              id={`${dataKey}-follow-scenario-toggle`}
              label="Follow scenario"
              colorClass={{ on: "bg-green-400", off: "bg-gray-300" }}
              description={{
                on: `Following scenario with ${avgRate}${unit} average rate. Settings are controlled by the selected scenario.`,
                off: `Independent configuration. Average rate: ${avgRate}${unit}. Enable to sync with the selected economic scenario.`,
              }}
            />
          </div>
        )}

        {/* Unified Scenario Selection */}
        {(!followScenario || formData.economicScenario === "custom") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Configuration
            </label>
            <select
              value={inputType === "preset" ? preset : inputType}
              onChange={(e) => {
                if (manualMode) {
                  handleLockedInteraction();
                } else {
                  const value = e.target.value;
                  // Check if it's a preset scenario
                  if (
                    (dropdownPresets || presetScenarios) &&
                    (dropdownPresets || presetScenarios)[value]
                  ) {
                    updateFormData({
                      [inputTypeKey as keyof FormData]: "preset",
                      [presetKey as keyof FormData]: value,
                    });
                    // Auto-apply the preset to the chart
                    setTimeout(() => applyToChart("preset", value), 0);
                  } else {
                    // It's a custom input type
                    updateFormData({
                      [inputTypeKey as keyof FormData]: value,
                    });
                    // Auto-apply the configuration to the chart
                    setTimeout(() => applyToChart(value as any), 0);
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={manualMode}
            >
              <optgroup label="Preset Scenarios">
                {(dropdownPresets || presetScenarios) &&
                  Object.entries(dropdownPresets || presetScenarios).map(
                    ([key, scenario]: [string, any]) => (
                      <option key={key} value={key}>
                        {scenario.name}
                      </option>
                    ),
                  )}
              </optgroup>
              <optgroup label="Custom Scenarios">
                <option value="flat">Flat Rate</option>
                <option value="linear">Linear Change</option>
                <option value="saylor">Saylor's Forecast</option>
              </optgroup>
            </select>
          </div>
        )}

        {/* Rate Inputs */}
        {(!followScenario || formData.economicScenario === "custom") && (
          <RateInputs
            rateType={title}
            inputType={inputType as any}
            flatRate={flatRate}
            startRate={startRate}
            endRate={endRate}
            onFlatRateChange={(value) => {
              if (manualMode) {
                handleLockedInteraction();
              } else {
                flatRateKey && updateFormData({ [flatRateKey]: value });
              }
            }}
            onStartRateChange={(value) => {
              if (manualMode) {
                handleLockedInteraction();
              } else {
                startRateKey && updateFormData({ [startRateKey]: value });
              }
            }}
            onEndRateChange={(value) => {
              if (manualMode) {
                handleLockedInteraction();
              } else {
                endRateKey && updateFormData({ [endRateKey]: value });
              }
            }}
            isLocked={manualMode}
            onLockedInteraction={handleLockedInteraction}
          />
        )}

        {/* Saylor explanation */}
        {(!followScenario || formData.economicScenario === "custom") &&
          inputType === "saylor" && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                Michael Saylor's BTC Forecast
              </h4>
              <p className="text-xs text-blue-700">
                Based on Saylor's public statements about Bitcoin's long-term
                price trajectory:
                <br />• Starts at 37% annual appreciation in year 0
                <br />• Declines linearly to 21% by the final year
                <br />• Curve adjusts automatically for your selected time
                horizon
              </p>
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
      {(!followScenario || formData.economicScenario === "custom") &&
        manualModeKey && (
          <ToggleSwitch
            checked={manualMode}
            onChange={(checked) =>
              updateFormData({
                [manualModeKey]: checked,
                ...(checked && inputTypeKey
                  ? { [inputTypeKey]: "manual" }
                  : {}),
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
