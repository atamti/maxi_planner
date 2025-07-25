import React from "react";
import economicScenarios, { ScenarioKey } from "../../config/economicScenarios";
import { FormData } from "../../types";
import { CollapsibleSection } from "../common/CollapsibleSection";

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

  // Create descriptive title for the section
  const getSectionTitle = () => {
    if (formData.economicScenario === "custom") {
      return "2. 🌍 Economic Scenario: Custom";
    }
    return `2. 🌍 Economic Scenario: ${currentScenario?.name || "None"} • ${currentScenario?.inflationAvg || 0}% USD • ${currentScenario?.btcAppreciationAvg || 0}% BTC`;
  };

  return (
    <CollapsibleSection title={getSectionTitle()} noGrid={true}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {Object.entries(economicScenarios).map(([key, scenario]) => (
          <div
            key={key}
            onClick={() => handleScenarioChange(key as ScenarioKey)}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 
              ${
                formData.economicScenario === key
                  ? "bg-blue-500 text-white border-blue-600 shadow-lg"
                  : "bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 shadow-sm"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-white rounded-md shadow-sm border">
          <div className="text-sm text-gray-500">USD inflation</div>
          <div className="text-xl font-bold text-amber-600">
            {currentScenario.inflationAvg}% avg
          </div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm border">
          <div className="text-sm text-gray-500">BTC nominal appreciation</div>
          <div className="text-xl font-bold text-green-600">
            {currentScenario.btcAppreciationAvg}% avg
          </div>
        </div>

        <div className="p-3 bg-white rounded-md shadow-sm border">
          <div className="text-sm text-gray-500">Income portfolio yield</div>
          <div
            className={`text-xl font-bold ${currentScenario.incomeGrowth >= 0 ? "text-blue-600" : "text-red-600"}`}
          >
            {currentScenario.incomeGrowth >= 0 ? "+" : ""}
            {currentScenario.incomeGrowth}% avg
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};
