import React from "react";
import { ScenarioKey } from "../../config/economicScenarios";

interface ScenarioDropdownProps {
  selectedScenario: ScenarioKey;
  onScenarioChange: (scenario: ScenarioKey) => void;
  isLocked: boolean;
  onLockedInteraction: () => void;
  presetScenarios?: any;
}

const ScenarioDropdown: React.FC<ScenarioDropdownProps> = ({
  selectedScenario,
  onScenarioChange,
  isLocked,
  onLockedInteraction,
  presetScenarios,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Economic Scenario
      </label>
      <select
        value={selectedScenario}
        onChange={(e) => onScenarioChange(e.target.value as ScenarioKey)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={isLocked}
        onClick={isLocked ? onLockedInteraction : undefined}
      >
        <option value="custom">Custom</option>
        {presetScenarios &&
          Object.entries(presetScenarios).map(
            ([key, scenario]: [string, any]) => (
              <option key={key} value={key}>
                {scenario.name || key}
              </option>
            ),
          )}
      </select>
    </div>
  );
};

export default ScenarioDropdown;
