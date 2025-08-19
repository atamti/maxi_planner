import { DEFAULT_FORM_DATA } from "../config/defaults";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";

/**
 * Helper function to generate BTC rates based on a scenario
 */
export const generateBtcRatesFromScenario = (
  scenarioKey: string,
  timeHorizon: number,
): number[] => {
  const scenario = economicScenarios[scenarioKey as ScenarioKey]?.btcPrice;
  if (!scenario) return Array(30).fill(50);

  const rates = [];
  for (let i = 0; i < timeHorizon; i++) {
    const progress = i / Math.max(1, timeHorizon - 1);
    // Use exponential curve for upward acceleration
    const curvedProgress = Math.pow(progress, 1.5);
    const rate =
      scenario.startRate +
      (scenario.endRate - scenario.startRate) * curvedProgress;
    rates.push(Math.round(rate / 2) * 2);
  }

  // Fill the rest of the array with the last value
  const fullArray = [...rates];
  while (fullArray.length < 30) {
    fullArray.push(rates[rates.length - 1] || 50);
  }

  return fullArray;
};

/**
 * Helper function to generate inflation rates based on a scenario
 */
export const generateInflationRatesFromScenario = (
  scenarioKey: string,
  timeHorizon: number,
): number[] => {
  const inflationScenario =
    economicScenarios[scenarioKey as ScenarioKey]?.inflation;
  if (!inflationScenario) return Array(30).fill(8);

  const rates = [];
  for (let i = 0; i < timeHorizon; i++) {
    const progress = i / Math.max(1, timeHorizon - 1);
    const curvedProgress = Math.pow(progress, 2);
    const rate =
      inflationScenario.startRate +
      (inflationScenario.endRate - inflationScenario.startRate) *
        curvedProgress;
    rates.push(Math.round(rate / 2) * 2);
  }

  // Fill the rest of the array
  const fullArray = [...rates];
  while (fullArray.length < 30) {
    fullArray.push(rates[rates.length - 1] || 8);
  }

  return fullArray;
};

/**
 * Helper function to generate income rates based on a scenario
 */
export const generateIncomeRatesFromScenario = (
  scenarioKey: string,
  timeHorizon: number,
): number[] => {
  const incomeScenario =
    economicScenarios[scenarioKey as ScenarioKey]?.incomeYield;
  if (!incomeScenario) return Array(30).fill(8);

  const rates = [];
  for (let i = 0; i < timeHorizon; i++) {
    const progress = i / Math.max(1, timeHorizon - 1);
    const curvedProgress = Math.pow(progress, 1.5); // Use 1.5 curve like other income calculations
    const rate =
      incomeScenario.startRate +
      (incomeScenario.endRate - incomeScenario.startRate) * curvedProgress;
    rates.push(Math.round(rate));
  }

  // Fill the rest of the array
  const fullArray = [...rates];
  while (fullArray.length < 30) {
    fullArray.push(rates[rates.length - 1] || 8);
  }

  return fullArray;
};

/**
 * Hook for managing form reset functionality
 */
export const useFormReset = (
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
) => {
  /**
   * Resets form data to defaults and properly applies scenarios
   */
  const resetForm = () => {
    setFormData((prevData) => {
      // Create a new form data object with defaults
      const newData = { ...DEFAULT_FORM_DATA };

      // Generate the correct BTC rates for the selected scenario
      const scenarioKey = newData.followEconomicScenarioBtc
        ? newData.economicScenario
        : newData.btcPricePreset;

      newData.btcPriceCustomRates = generateBtcRatesFromScenario(
        scenarioKey,
        newData.timeHorizon,
      );

      // Also generate inflation rates if following scenario
      if (newData.followEconomicScenarioInflation) {
        newData.inflationCustomRates = generateInflationRatesFromScenario(
          newData.economicScenario,
          newData.timeHorizon,
        );
      }

      return newData;
    });
  };

  return { resetForm };
};
