import React, { useEffect, useState } from "react";
import economicScenarios, { ScenarioKey } from "../../config/economicScenarios";
import { usePortfolioCompat } from "../../store";
import { useGeneralRateSystem } from "../../utils/shared/useGeneralRateSystem";
import { createCalculationService } from "../../services/calculationService";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { ScenarioRestoreMessage } from "../common/ScenarioRestoreMessage";

export const EconomicScenariosSection: React.FC = () => {
  const { formData, updateFormData, calculationResults } = usePortfolioCompat();
  const calculationService = createCalculationService();

  const { generateRates, calculateAverageRate } = useGeneralRateSystem();
  const [showRestoreMessage, setShowRestoreMessage] = useState(false);

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
              calculationService.calculateSimpleAverage(
                formData.inflationCustomRates,
                formData.timeHorizon,
              ),
            )
          : scenario.inflation.startRate; // Fallback to scenario default

      // Use centralized BTC appreciation calculation (CAGR)
      const btcAvg = Math.round(calculationResults.btcAppreciationAverage ?? 0);

      const incomeAvg =
        formData.incomeCustomRates && formData.incomeCustomRates.length > 0
          ? Math.round(
              calculationService.calculateSimpleAverage(
                formData.incomeCustomRates,
                formData.timeHorizon,
              ),
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
      // Use centralized BTC appreciation calculation instead of local calculateAverageRate
      const btcAvg = Math.round(calculationResults.btcAppreciationAverage ?? 0);

      console.log(
        `� EconomicScenariosSection (NON-CUSTOM path) CENTRALIZED BTC Display: ${btcAvg}% | Raw: ${calculationResults.btcAppreciationAverage}`,
      );

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

  // Check which sections are in manual mode for restoration message
  const getSectionsInManualMode = () => {
    const sections = [];
    if (!formData.followEconomicScenarioInflation) {
      sections.push("USD Inflation");
    }
    if (!formData.followEconomicScenarioBtc) {
      sections.push("BTC Price Appreciation");
    }
    if (!formData.followEconomicScenarioIncome) {
      sections.push("Income Yield Assumptions");
    }
    return sections;
  };

  // Show restore message when switching from custom to non-custom scenario with manual sections
  useEffect(() => {
    const sectionsInManualMode = getSectionsInManualMode();

    if (
      formData.economicScenario !== "custom" &&
      sectionsInManualMode.length > 0
    ) {
      setShowRestoreMessage(true);
    } else {
      setShowRestoreMessage(false);
    }
  }, [
    formData.economicScenario,
    formData.followEconomicScenarioInflation,
    formData.followEconomicScenarioBtc,
    formData.followEconomicScenarioIncome,
  ]);

  // Handler to restore all sections to follow scenario
  const handleRestoreAllToScenario = () => {
    updateFormData({
      followEconomicScenarioInflation: true,
      followEconomicScenarioBtc: true,
      followEconomicScenarioIncome: true,
    });
    setShowRestoreMessage(false);
  };

  // Handler to dismiss the restore message
  const handleDismissRestoreMessage = () => {
    setShowRestoreMessage(false);
  };

  const handleScenarioChange = (scenario: ScenarioKey) => {
    updateFormData({ economicScenario: scenario });

    if (scenario === "custom") {
      // Before switching to custom, capture current rates from the previous scenario
      const currentScenario = formData.economicScenario;

      // Generate current scenario rates to copy to custom arrays
      let inflationCustomRates = formData.inflationCustomRates;
      let btcPriceCustomRates = formData.btcPriceCustomRates;
      let incomeCustomRates = formData.incomeCustomRates; // Fix 2: Include income rates

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
          `🔴 EconomicScenariosSection REGENERATING BTC rates from scenario "${currentScenario}":`,
          btcRates.slice(0, formData.timeHorizon),
        );

        // Fix 2: Generate income rates from current scenario
        const incomePresetScenarios: Record<string, any> = {};
        Object.entries(economicScenarios).forEach(([key, scen]) => {
          incomePresetScenarios[key] = scen.incomeYield;
        });

        const incomeRates = generateRates({
          type: "preset",
          flatRate: formData.incomeFlat,
          startRate: formData.incomeStart,
          endRate: formData.incomeEnd,
          preset: currentScenario,
          timeHorizon: formData.timeHorizon,
          presetScenarios: incomePresetScenarios,
        });

        incomeCustomRates = incomeRates.slice(0, formData.timeHorizon);
      }

      // Set everything to custom mode and disable follow toggles
      updateFormData({
        economicScenario: scenario,
        followEconomicScenarioBtc: false,
        followEconomicScenarioInflation: false,
        followEconomicScenarioIncome: false, // Fix 2: Also disable income follow
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
        incomeCustomRates, // Fix 2: Include income rates
      });
      console.log(
        `🔴 EconomicScenariosSection calling updateFormData with regenerated rates for scenario "${currentScenario}"`,
      );
      return;
    }

    // For non-custom scenarios, just update the presets but don't force follow toggles
    // This preserves user's manual configurations while updating the preset references
    updateFormData({
      // Update preset keys to match the new scenario, but don't force follow toggles
      inflationPreset: scenario,
      btcPricePreset: scenario,
      incomePreset: scenario,
    });

    // If following scenarios, update the respective sections
    if (
      formData.followEconomicScenarioInflation &&
      scenario !== ("custom" as ScenarioKey)
    ) {
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

  const handleRestoreAll = () => {
    updateFormData({
      followEconomicScenarioBtc: true,
      followEconomicScenarioInflation: true,
      followEconomicScenarioIncome: true,
    });
    setShowRestoreMessage(false);
  };

  const sectionsInManualMode = getSectionsInManualMode().length;

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

      {/* Scenario restoration message */}
      {showRestoreMessage && (
        <div className="mt-4">
          <ScenarioRestoreMessage
            show={showRestoreMessage}
            onRestoreAll={handleRestoreAll}
            onDismiss={() => setShowRestoreMessage(false)}
            sectionCount={sectionsInManualMode}
          />
        </div>
      )}
    </CollapsibleSection>
  );
};
