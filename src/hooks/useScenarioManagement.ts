import { FormData } from "../types";

export interface ScenarioConfig {
  dataKey: keyof FormData;
  flatRateKey?: keyof FormData;
  startRateKey?: keyof FormData;
  endRateKey?: keyof FormData;
  inputTypeKey?: keyof FormData;
  manualModeKey?: keyof FormData;
  followScenarioKey?: keyof FormData;
  presetKey?: keyof FormData;
}

export const useScenarioManagement = (
  formData: FormData,
  updateFormData: (updates: Partial<FormData>) => void,
  config: ScenarioConfig,
  economicScenarios?: any,
) => {
  const {
    dataKey,
    flatRateKey,
    startRateKey,
    endRateKey,
    inputTypeKey,
    manualModeKey,
    followScenarioKey,
    presetKey,
  } = config;

  const handleScenarioChange = (selectedScenario: string) => {
    console.log(`🎮 [useScenarioManagement] handleScenarioChange called:`, {
      selectedScenario,
      dataKey,
      presetKey,
      followScenarioKey,
      inputTypeKey,
      currentFormData: {
        economicScenario: formData.economicScenario,
        preset: presetKey ? formData[presetKey] : "N/A",
        inputType: inputTypeKey ? formData[inputTypeKey] : "N/A",
        followScenario: followScenarioKey ? formData[followScenarioKey] : "N/A",
      },
    });

    if (selectedScenario === "custom-flat") {
      const customScenario =
        economicScenarios?.custom?.[
          dataKey === "btcPriceCustomRates" ? "btcPrice" : "inflation"
        ];
      console.log(`🎯 [useScenarioManagement] Setting custom-flat:`, {
        customScenario,
      });
      updateFormData({
        ...(presetKey ? { [presetKey]: "custom" } : {}),
        ...(followScenarioKey ? { [followScenarioKey]: false } : {}),
        ...(inputTypeKey ? { [inputTypeKey]: "flat" } : {}),
        ...(flatRateKey && customScenario
          ? { [flatRateKey]: customScenario.startRate }
          : {}),
      });
    } else if (selectedScenario === "custom-linear") {
      const customScenario =
        economicScenarios?.custom?.[
          dataKey === "btcPriceCustomRates" ? "btcPrice" : "inflation"
        ];
      console.log(`📈 [useScenarioManagement] Setting custom-linear:`, {
        customScenario,
      });
      updateFormData({
        ...(presetKey ? { [presetKey]: "custom" } : {}),
        ...(followScenarioKey ? { [followScenarioKey]: false } : {}),
        ...(inputTypeKey ? { [inputTypeKey]: "linear" } : {}),
        ...(startRateKey && customScenario
          ? { [startRateKey]: customScenario.startRate }
          : {}),
        ...(endRateKey && customScenario
          ? { [endRateKey]: customScenario.endRate }
          : {}),
      });
    } else if (
      selectedScenario === "custom-saylor" &&
      dataKey === "btcPriceCustomRates"
    ) {
      // Handle Saylor projection selection
      console.log(`🚀 [useScenarioManagement] Setting custom-saylor`);
      updateFormData({
        ...(presetKey ? { [presetKey]: "custom" } : {}),
        ...(followScenarioKey ? { [followScenarioKey]: false } : {}),
        ...(inputTypeKey ? { [inputTypeKey]: "saylor" } : {}),
        ...(startRateKey ? { [startRateKey]: 37 } : {}),
        ...(endRateKey ? { [endRateKey]: 21 } : {}),
      });
    } else {
      // Handle preset scenario selection
      console.log(
        `📋 [useScenarioManagement] Setting preset scenario:`,
        selectedScenario,
      );
      const updates = {
        ...(presetKey ? { [presetKey]: selectedScenario } : {}),
        ...(inputTypeKey ? { [inputTypeKey]: "preset" } : {}),
        ...(manualModeKey ? { [manualModeKey]: false } : {}),
      };
      console.log(`📝 [useScenarioManagement] Updates to apply:`, updates);
      updateFormData(updates);
    }
  };

  const handleScenarioToggle = (follow: boolean) => {
    if (followScenarioKey) {
      updateFormData({
        [followScenarioKey]: follow,
        ...(follow &&
        formData.economicScenario !== "custom" &&
        presetKey &&
        manualModeKey &&
        inputTypeKey
          ? {
              [manualModeKey]: false,
              [inputTypeKey]: "preset",
              [presetKey]: formData.economicScenario,
            }
          : {}),
      });
    }
  };

  const handleIncomeScenarioSync = () => {
    const followScenario = followScenarioKey
      ? (formData[followScenarioKey] as boolean)
      : false;

    if (
      followScenario &&
      formData.economicScenario !== "custom" &&
      economicScenarios
    ) {
      const scenario = economicScenarios[formData.economicScenario];
      if (scenario && dataKey === "incomeCustomRates" && scenario.incomeYield) {
        // Generate rates based on the selected economic scenario
        const newRates = [];
        for (let i = 0; i < formData.timeHorizon; i++) {
          const progress = i / Math.max(1, formData.timeHorizon - 1);
          const curvedProgress = Math.pow(progress, 1.5);
          const rate =
            scenario.incomeYield.startRate +
            (scenario.incomeYield.endRate - scenario.incomeYield.startRate) *
              curvedProgress;
          newRates.push(Math.round(rate));
        }

        // Update the custom rates to match the economic scenario
        const updatedRates = [...(formData[dataKey] as number[])];
        newRates.forEach((rate, index) => {
          if (index < updatedRates.length) {
            updatedRates[index] = rate;
          }
        });
        updateFormData({ [dataKey]: updatedRates });
      }
    }
  };

  return {
    handleScenarioChange,
    handleScenarioToggle,
    handleIncomeScenarioSync,
  };
};
