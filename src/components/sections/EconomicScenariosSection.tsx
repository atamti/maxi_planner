import React from "react";
import economicScenarios, { ScenarioKey } from "../../config/economicScenarios";
import { useRateGeneration } from "../../hooks/useRateGeneration";
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
  const { generateRates, calculateAverageRate } = useRateGeneration();

  // Calculate actual average rates for a scenario
  const calculateScenarioAverages = (scenarioKey: ScenarioKey) => {
    const scenario = economicScenarios[scenarioKey];
    if (!scenario) {
      return {
        inflationAvg: 0,
        btcAppreciationAvg: 0,
        incomeGrowth: 0,
      };
    }

    if (scenarioKey === "custom") {
      // For custom scenario, calculate averages based on current form data or use scenario defaults
      const inflationAvg =
        formData.inflationCustomRates &&
        formData.inflationCustomRates.length > 0
          ? Math.round(
              formData.inflationCustomRates
                .filter((rate) => !isNaN(rate) && isFinite(rate))
                .reduce((sum, rate) => sum + rate, 0) /
                formData.inflationCustomRates.filter(
                  (rate) => !isNaN(rate) && isFinite(rate),
                ).length,
            )
          : scenario.inflation.startRate; // Fallback to scenario default

      const btcAvg =
        formData.btcPriceCustomRates && formData.btcPriceCustomRates.length > 0
          ? Math.round(
              formData.btcPriceCustomRates
                .filter((rate) => !isNaN(rate) && isFinite(rate))
                .reduce((sum, rate) => sum + rate, 0) /
                formData.btcPriceCustomRates.filter(
                  (rate) => !isNaN(rate) && isFinite(rate),
                ).length,
            )
          : scenario.btcPrice.startRate; // Fallback to scenario default

      const incomeAvg =
        formData.incomeCustomRates && formData.incomeCustomRates.length > 0
          ? Math.round(
              formData.incomeCustomRates
                .filter((rate) => !isNaN(rate) && isFinite(rate))
                .reduce((sum, rate) => sum + rate, 0) /
                formData.incomeCustomRates.filter(
                  (rate) => !isNaN(rate) && isFinite(rate),
                ).length,
            )
          : scenario.incomeYield.startRate; // Fallback to scenario default

      return {
        inflationAvg,
        btcAppreciationAvg: btcAvg,
        incomeGrowth: incomeAvg,
      };
    }

    // For non-custom scenarios, calculate using rate generation
    try {
      // Calculate inflation average
      const inflationRates = generateRates({
        type: "preset",
        flatRate: 0,
        startRate: 0,
        endRate: 0,
        preset: scenarioKey,
        timeHorizon: formData.timeHorizon,
        presetScenarios: { [scenarioKey]: scenario.inflation },
      });
      const inflationAvg = calculateAverageRate(
        inflationRates,
        formData.timeHorizon,
      );

      // Calculate BTC average
      const btcRates = generateRates({
        type: "preset",
        flatRate: 0,
        startRate: 0,
        endRate: 0,
        preset: scenarioKey,
        timeHorizon: formData.timeHorizon,
        presetScenarios: { [scenarioKey]: scenario.btcPrice },
      });
      const btcAvg = calculateAverageRate(btcRates, formData.timeHorizon);

      // Calculate income average
      const incomeRates = generateRates({
        type: "preset",
        flatRate: 0,
        startRate: 0,
        endRate: 0,
        preset: scenarioKey,
        timeHorizon: formData.timeHorizon,
        presetScenarios: { [scenarioKey]: scenario.incomeYield },
      });
      const incomeAvg = calculateAverageRate(incomeRates, formData.timeHorizon);

      return {
        inflationAvg,
        btcAppreciationAvg: btcAvg,
        incomeGrowth: incomeAvg,
      };
    } catch (error) {
      console.error(
        `Error calculating averages for scenario ${scenarioKey}:`,
        error,
      );
      // Fallback to scenario defaults if calculation fails
      return {
        inflationAvg: scenario.inflation.startRate,
        btcAppreciationAvg: scenario.btcPrice.startRate,
        incomeGrowth: scenario.incomeYield.startRate,
      };
    }
  };

  const handleScenarioChange = (scenario: ScenarioKey) => {
    console.log(`🌍 [EconomicScenariosSection] Scenario change requested:`, {
      newScenario: scenario,
      currentScenario: formData.economicScenario,
      followInflation: formData.followEconomicScenarioInflation,
      followBtc: formData.followEconomicScenarioBtc,
      currentInflationPreset: formData.inflationPreset,
      currentBtcPreset: formData.btcPricePreset,
    });

    updateFormData({ economicScenario: scenario });

    if (scenario === "custom") {
      console.log(`🔧 [EconomicScenariosSection] Setting up custom scenario`);

      // Before switching to custom, capture current rates from the previous scenario
      const currentScenario = formData.economicScenario;
      console.log(
        `📋 [EconomicScenariosSection] Copying rates from scenario: ${currentScenario}`,
      );

      // Generate current scenario rates to copy to custom arrays
      let inflationCustomRates = formData.inflationCustomRates;
      let btcPriceCustomRates = formData.btcPriceCustomRates;

      if (
        currentScenario !== "custom" &&
        economicScenarios[currentScenario as keyof typeof economicScenarios]
      ) {
        // Generate inflation rates from current scenario
        const inflationPresetScenarios: Record<string, any> = {};
        Object.entries(economicScenarios).forEach(([key, scen]) => {
          inflationPresetScenarios[key] = scen.inflation;
        });

        const inflationRates = generateRates({
          type: "preset",
          flatRate: formData.inflationFlat,
          startRate: formData.inflationStart,
          endRate: formData.inflationEnd,
          preset: currentScenario,
          timeHorizon: formData.timeHorizon,
          presetScenarios: inflationPresetScenarios,
        });

        inflationCustomRates = inflationRates.slice(0, formData.timeHorizon);

        // Generate BTC rates from current scenario
        const btcPresetScenarios: Record<string, any> = {};
        Object.entries(economicScenarios).forEach(([key, scen]) => {
          btcPresetScenarios[key] = scen.btcPrice;
        });

        const btcRates = generateRates({
          type: "preset",
          flatRate: formData.btcPriceFlat,
          startRate: formData.btcPriceStart,
          endRate: formData.btcPriceEnd,
          preset: currentScenario,
          timeHorizon: formData.timeHorizon,
          presetScenarios: btcPresetScenarios,
        });

        btcPriceCustomRates = btcRates.slice(0, formData.timeHorizon);

        console.log(
          `✅ [EconomicScenariosSection] Copied rates from ${currentScenario} to custom arrays`,
        );
      }

      // Set everything to custom mode and disable follow toggles
      updateFormData({
        economicScenario: scenario,
        followEconomicScenarioBtc: false,
        followEconomicScenarioInflation: false,
        // Update preset keys to custom so sections know to use custom mode
        inflationPreset: "custom",
        btcPricePreset: "custom",
        incomePreset: "custom",
        // Set input types to use the custom scenario defaults
        inflationInputType: "preset",
        btcPriceInputType: "preset",
        incomeInputType: "preset",
        // Copy the current scenario rates to custom arrays
        inflationCustomRates,
        btcPriceCustomRates,
      });
      console.log(
        `✅ [EconomicScenariosSection] Custom scenario setup complete`,
      );
      return;
    }

    // If following scenarios, update the respective sections
    if (
      formData.followEconomicScenarioInflation &&
      scenario !== ("custom" as ScenarioKey)
    ) {
      console.log(
        `🌡️ [EconomicScenariosSection] Updating inflation for scenario:`,
        scenario,
      );
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

    if (
      formData.followEconomicScenarioBtc &&
      scenario !== ("custom" as ScenarioKey)
    ) {
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
    if (
      formData.followEconomicScenarioIncome &&
      scenario !== ("custom" as ScenarioKey)
    ) {
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

    console.log(
      `✅ [EconomicScenariosSection] Scenario change complete for:`,
      scenario,
    );
  };

  const currentScenario =
    economicScenarios[formData.economicScenario as ScenarioKey];

  // Create descriptive title for the section
  const getSectionTitle = () => {
    if (formData.economicScenario === "custom") {
      return "2. 🌍 Economic Scenario: Custom";
    }
    if (currentScenario) {
      const calculatedAverages = calculateScenarioAverages(
        formData.economicScenario as ScenarioKey,
      );
      return `2. 🌍 Economic Scenario: ${currentScenario.name} • ${calculatedAverages.inflationAvg}% USD • ${calculatedAverages.btcAppreciationAvg}% BTC`;
    }
    return "2. 🌍 Economic Scenario: None";
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
      {currentScenario &&
        (() => {
          const calculatedAverages = calculateScenarioAverages(
            formData.economicScenario as ScenarioKey,
          );
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-md shadow-sm border">
                <div className="text-sm text-gray-500">USD inflation</div>
                <div className="text-xl font-bold text-amber-600">
                  {calculatedAverages.inflationAvg}% avg
                </div>
                <div className="text-xs text-gray-400">
                  {currentScenario.inflation.startRate}% →{" "}
                  {currentScenario.inflation.endRate}%
                </div>
              </div>

              <div className="p-3 bg-white rounded-md shadow-sm border">
                <div className="text-sm text-gray-500">
                  BTC nominal appreciation
                </div>
                <div className="text-xl font-bold text-green-600">
                  {calculatedAverages.btcAppreciationAvg}% avg
                </div>
                <div className="text-xs text-gray-400">
                  {currentScenario.btcPrice.startRate}% →{" "}
                  {currentScenario.btcPrice.endRate}%
                </div>
              </div>

              <div className="p-3 bg-white rounded-md shadow-sm border">
                <div className="text-sm text-gray-500">
                  Income portfolio yield
                </div>
                <div
                  className={`text-xl font-bold ${calculatedAverages.incomeGrowth >= 0 ? "text-blue-600" : "text-red-600"}`}
                >
                  {calculatedAverages.incomeGrowth >= 0 ? "+" : ""}
                  {calculatedAverages.incomeGrowth}% avg
                </div>
                <div className="text-xs text-gray-400">
                  {currentScenario.incomeYield.startRate}% →{" "}
                  {currentScenario.incomeYield.endRate}%
                </div>
              </div>
            </div>
          );
        })()}
    </CollapsibleSection>
  );
};
