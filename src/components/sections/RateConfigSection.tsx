import React from "react";
import economicScenarios, { ScenarioKey } from "../../config/economicScenarios";
import { InputType } from "../../types";

interface Props {
  title: string;
  inputType: InputType;
  onInputTypeChange: (type: InputType) => void;
  flat: number;
  onFlatChange: (value: number) => void;
  start: number;
  onStartChange: (value: number) => void;
  end: number;
  onEndChange: (value: number) => void;
  preset: ScenarioKey;
  onPresetChange: (preset: ScenarioKey) => void;
  manualMode: boolean;
  scenarioType: "inflation" | "btcPrice";
  disabled?: boolean;
  showPresets?: boolean;
  customOptions?: React.ReactNode;
}

export const RateConfigSection: React.FC<Props> = ({
  title,
  inputType,
  onInputTypeChange,
  flat,
  onFlatChange,
  start,
  onStartChange,
  end,
  onEndChange,
  preset,
  onPresetChange,
  manualMode,
  scenarioType,
  disabled = false,
  showPresets = true,
  customOptions,
}) => {
  const presetScenarios = React.useMemo(() => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      if (key !== "custom" || showPresets) {
        presets[key] =
          scenarioType === "inflation" ? scenario.inflation : scenario.btcPrice;
      }
    });
    return presets;
  }, [scenarioType, showPresets]);

  return (
    <div
      className={`p-4 bg-gray-50 rounded-lg ${disabled ? "opacity-60" : ""}`}
    >
      <div className="mb-4 relative group">
        <label className="block font-medium mb-1">{title}</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="flat"
              checked={inputType === "flat"}
              onChange={() => onInputTypeChange("flat")}
              className="mr-2"
              disabled={disabled || manualMode}
            />
            <span className={manualMode ? "text-gray-400" : ""}>Flat Rate</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              value="linear"
              checked={inputType === "linear"}
              onChange={() => onInputTypeChange("linear")}
              className="mr-2"
              disabled={disabled || manualMode}
            />
            <span className={manualMode ? "text-gray-400" : ""}>
              Linear Progression
            </span>
          </label>

          {showPresets && (
            <label className="flex items-center">
              <input
                type="radio"
                value="preset"
                checked={inputType === "preset"}
                onChange={() => onInputTypeChange("preset")}
                className="mr-2"
                disabled={disabled || manualMode}
              />
              <span className={manualMode ? "text-gray-400" : ""}>
                Preset Scenario
              </span>
            </label>
          )}

          {customOptions}
        </div>
      </div>

      {inputType === "flat" && !manualMode && (
        <div className="mt-4">
          <label className="block font-medium mb-1">Flat Rate (%):</label>
          <input
            type="number"
            value={flat}
            onChange={(e) => onFlatChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
            min="0"
            max="500"
            disabled={disabled || manualMode}
          />
        </div>
      )}

      {inputType === "linear" && !manualMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block font-medium mb-1">Start Rate (%):</label>
            <input
              type="number"
              value={start}
              onChange={(e) => onStartChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              max="500"
              disabled={disabled || manualMode}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">End Rate (%):</label>
            <input
              type="number"
              value={end}
              onChange={(e) => onEndChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="0"
              max="500"
              disabled={disabled || manualMode}
            />
          </div>
        </div>
      )}

      {inputType === "preset" && showPresets && (
        <div className="mt-4">
          <label className="block font-medium mb-1">Scenario:</label>
          <select
            value={preset}
            onChange={(e) => onPresetChange(e.target.value as ScenarioKey)}
            className="w-full p-2 border rounded"
            disabled={disabled || manualMode}
          >
            {Object.entries(presetScenarios).map(([key, scenarioData]) => (
              <option key={key} value={key}>
                {scenarioData.name} ({scenarioData.startRate}% →{" "}
                {scenarioData.endRate}%)
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
