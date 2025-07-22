import React, { useEffect } from "react";
import { useRateGeneration } from "../../hooks/useRateGeneration";
import { useScenarioManagement } from "../../hooks/useScenarioManagement";
import { useUIStateManagement } from "../../hooks/useUIStateManagement";
import { FormData } from "../../types";
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

  // Use extracted hooks
  const { generateRates, applyRatesToArray, calculateAverageRate } =
    useRateGeneration();
  const {
    handleScenarioChange: handleScenarioChangeHook,
    handleScenarioToggle: handleScenarioToggleHook,
    handleIncomeScenarioSync: handleIncomeScenarioSyncHook,
  } = useScenarioManagement(
    formData,
    updateFormData,
    config,
    economicScenarios,
  );
  const { showLockedMessage, handleLockedInteraction } = useUIStateManagement();

  // Calculate average rate
  const avgRate = calculateAverageRate(customRates, formData.timeHorizon);

  const applyToChart = (
    type: "flat" | "linear" | "preset" | "manual" | "saylor" = inputType as any,
  ) => {
    const rates = generateRates({
      type,
      flatRate,
      startRate,
      endRate,
      timeHorizon: formData.timeHorizon,
      preset,
      presetScenarios,
    });
    const newRates = applyRatesToArray(
      rates,
      customRates,
      formData.timeHorizon,
      flatRate || 8,
    );
    updateFormData({ [dataKey]: newRates });
  };

  const handleScenarioChange = (selectedScenario: string) => {
    handleScenarioChangeHook(selectedScenario);
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
        {!followScenario && (
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
                  if (presetScenarios && presetScenarios[value]) {
                    updateFormData({
                      [inputTypeKey as keyof FormData]: "preset",
                      [presetKey as keyof FormData]: value,
                    });
                    // Auto-apply the preset to the chart
                    setTimeout(() => applyToChart("preset"), 0);
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
                {presetScenarios &&
                  Object.entries(presetScenarios).map(
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
        {!followScenario && (
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
        {!followScenario && inputType === "saylor" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Michael Saylor's BTC Forecast
            </h4>
            <p className="text-xs text-blue-700">
              Based on Saylor's public statements about Bitcoin's long-term
              price trajectory:
              <br />• Starts at 37% annual appreciation in year 0
              <br />• Declines linearly to 21% by the final year
              <br />• Curve adjusts automatically for your selected time horizon
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
