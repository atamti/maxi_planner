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
    updateFormData({ economicScenario: scenario });

    // If following scenarios, update the respective sections
    if (formData.followEconomicScenarioInflation && scenario !== "custom") {
      // Update inflation rates
      const inflationScenario = economicScenarios[scenario].inflation;
      const newInflationRates = [];
      for (let i = 0; i < formData.timeHorizon; i++) {
        const progress = i / Math.max(1, formData.timeHorizon - 1);
        const curvedProgress = Math.pow(progress, 2);
        const rate =
          inflationScenario.startRate +
          (inflationScenario.endRate - inflationScenario.startRate) *
            curvedProgress;
        newInflationRates.push(Math.round(rate / 2) * 2);
      }

      const updatedInflationRates = [...formData.inflationCustomRates];
      newInflationRates.forEach((rate, index) => {
        if (index < updatedInflationRates.length) {
          updatedInflationRates[index] = rate;
        }
      });

      updateFormData({
        inflationPreset: scenario,
        inflationCustomRates: updatedInflationRates,
      });
    }

    if (formData.followEconomicScenarioBtc && scenario !== "custom") {
      // Update BTC price rates
      const btcScenario = economicScenarios[scenario].btcPrice;
      const newBtcRates = [];
      for (let i = 0; i < formData.timeHorizon; i++) {
        const progress = i / Math.max(1, formData.timeHorizon - 1);
        const curvedProgress = Math.pow(progress, 1.5);
        const rate =
          btcScenario.startRate +
          (btcScenario.endRate - btcScenario.startRate) * curvedProgress;
        newBtcRates.push(Math.round(rate / 2) * 2);
      }

      const updatedBtcRates = [...formData.btcPriceCustomRates];
      newBtcRates.forEach((rate, index) => {
        if (index < updatedBtcRates.length) {
          updatedBtcRates[index] = rate;
        }
      });

      updateFormData({
        btcPricePreset: scenario,
        btcPriceCustomRates: updatedBtcRates,
      });
    }

    // Add income yield updates
    if (formData.followEconomicScenarioIncome && scenario !== "custom") {
      const incomeScenario = economicScenarios[scenario].incomeYield;
      const newIncomeRates = [];
      for (let i = 0; i < formData.timeHorizon; i++) {
        const progress = i / Math.max(1, formData.timeHorizon - 1);
        const curvedProgress = Math.pow(progress, 1.5);
        const rate =
          incomeScenario.startRate +
          (incomeScenario.endRate - incomeScenario.startRate) * curvedProgress;
        newIncomeRates.push(Math.round(rate));
      }

      const updatedIncomeRates = [...formData.incomeCustomRates];
      newIncomeRates.forEach((rate, index) => {
        if (index < updatedIncomeRates.length) {
          updatedIncomeRates[index] = rate;
        }
      });

      updateFormData({
        incomePreset: scenario,
        incomeCustomRates: updatedIncomeRates,
      });
    }

    if (scenario === "custom") {
      // Just set the scenario name but also disable "follow scenario" for BTC
      updateFormData({
        economicScenario: scenario,
        followEconomicScenarioBtc: false, // Turn off "Follow scenario" toggle
        followEconomicScenarioInflation: false, // Turn off "Follow scenario" toggle
      });
      return;
    }
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
