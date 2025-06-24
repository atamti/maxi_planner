import React from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const EconomicScenariosSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  const handleScenarioChange = (scenario: ScenarioKey) => {
    const selectedScenario = economicScenarios[scenario];

    if (scenario === "custom") {
      // Just set the scenario name but also disable "follow scenario" for BTC
      updateFormData({
        economicScenario: scenario,
        followEconomicScenarioBtc: false, // Turn off "Follow scenario" toggle
        followEconomicScenarioInflation: false, // Turn off "Follow scenario" toggle
      });
      return;
    }

    // Apply scenario settings
    updateFormData({
      economicScenario: scenario,
      // Apply inflation settings if following scenario
      ...(formData.followEconomicScenarioInflation && {
        inflationInputType: "preset",
        inflationPreset: scenario,
        inflationManualMode: false,
      }),
      // Apply BTC settings if following scenario
      ...(formData.followEconomicScenarioBtc && {
        btcPriceInputType: "preset",
        btcPricePreset: scenario,
        btcPriceManualMode: false,
      }),
    });
  };

  const currentScenario =
    economicScenarios[formData.economicScenario as ScenarioKey];

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
      <h3 className="text-lg font-bold mb-3">Economic Scenario</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {Object.entries(economicScenarios).map(([key, scenario]) => (
          <div
            key={key}
            onClick={() => handleScenarioChange(key as ScenarioKey)}
            className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 
              ${
                formData.economicScenario === key
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-blue-100"
              }`}
          >
            <h4 className="font-medium">{scenario.name}</h4>
            <p
              className={`text-xs mt-1 ${formData.economicScenario === key ? "text-blue-100" : "text-gray-500"}`}
            >
              {scenario.description}
            </p>
          </div>
        ))}
      </div>

      {/* Show metrics for current scenario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-sm text-gray-500">USD inflation</div>
          <div className="text-xl font-bold text-amber-600">
            {currentScenario.inflationAvg}% avg
          </div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-sm text-gray-500">BTC nominal appreciation</div>
          <div className="text-xl font-bold text-green-600">
            {currentScenario.btcAppreciationAvg}% avg
          </div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm">
          <div className="text-sm text-gray-500">Income portfolio yield</div>
          <div
            className={`text-xl font-bold ${currentScenario.realIncomeGrowth >= 0 ? "text-blue-600" : "text-red-600"}`}
          >
            {currentScenario.realIncomeGrowth >= 0 ? "+" : ""}
            {currentScenario.realIncomeGrowth}% avg
          </div>
        </div>
      </div>
    </div>
  );
};
