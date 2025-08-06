import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";

export interface ScenarioManager {
  calculateRates: (field: string, formData: FormData) => number[];
  syncWithEconomicScenario: (
    field: string,
    scenario: string,
    formData: FormData,
  ) => Partial<FormData>;
  handleInputTypeChange: (inputType: string) => void;
  handleScenarioSelection: (scenario: string) => void;
  predictStateChange: (updates: Partial<FormData>) => {
    affectedScenarios: string[];
    willTriggerRecalculation: boolean;
  };
}

export function createScenarioManager(
  formData: FormData,
  dispatch: React.Dispatch<any>,
): ScenarioManager {
  const calculateRates = (field: string, data: FormData): number[] => {
    // Get the field config
    const inputType = data[`${field}InputType` as keyof FormData] as string;
    const preset = data[`${field}Preset` as keyof FormData] as string;
    const flatRate = data[`${field}Flat` as keyof FormData] as number;
    const startRate = data[`${field}Start` as keyof FormData] as number;
    const endRate = data[`${field}End` as keyof FormData] as number;
    const customRates = data[
      `${field}CustomRates` as keyof FormData
    ] as number[];

    // Create preset scenarios for this field
    const presetScenarios: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      const fieldConfig = scenario[field as keyof typeof scenario];
      if (
        fieldConfig &&
        typeof fieldConfig === "object" &&
        "startRate" in fieldConfig
      ) {
        presetScenarios[key] = fieldConfig;
      }
    });

    // TODO: Fix after hook consolidation complete
    // return generateRates({
    //   type: inputType,
    //   preset,
    //   flatRate,
    //   startRate,
    //   endRate,
    //   customRates,
    //   timeHorizon: data.timeHorizon,
    //   presetScenarios,
    // });
    return []; // Temporary stub
  };

  const syncWithEconomicScenario = (
    field: string,
    scenario: string,
    data: FormData,
  ): Partial<FormData> => {
    const scenarioConfig = economicScenarios[scenario as ScenarioKey];
    if (!scenarioConfig) return {};

    const fieldConfig = scenarioConfig[field as keyof typeof scenarioConfig];
    if (
      !fieldConfig ||
      typeof fieldConfig !== "object" ||
      !("startRate" in fieldConfig)
    ) {
      return {};
    }

    return {
      [`${field}InputType`]: "preset",
      [`${field}Preset`]: scenario,
      [`${field}Start`]: fieldConfig.startRate,
      [`${field}End`]: fieldConfig.endRate,
    };
  };

  return {
    calculateRates,
    syncWithEconomicScenario,
    handleInputTypeChange: (inputType: string) => {
      // TODO: Implement after hook consolidation
      console.warn("handleInputTypeChange not yet implemented");
    },
    handleScenarioSelection: (scenario: string) => {
      // TODO: Implement after hook consolidation
      console.warn("handleScenarioSelection not yet implemented");
    },
    predictStateChange: (updates: Partial<FormData>) => {
      // TODO: Implement after hook consolidation - analyze what scenarios will be affected
      const affectedScenarios: string[] = [];
      const willTriggerRecalculation = Object.keys(updates).some(
        (key) =>
          key.includes("Rate") ||
          key.includes("InputType") ||
          key.includes("Preset"),
      );
      return { affectedScenarios, willTriggerRecalculation };
    },
  };
}
