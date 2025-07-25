import React from "react";
import economicScenarios, { ScenarioKey } from "../../config/economicScenarios";
import { FormData } from "../../types";
import { UsdPurchasingPowerChart } from "../charts/UsdPurchasingPowerChart";
import { RateAssumptionsSection } from "../common/RateAssumptionsSection";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const InflationSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  const getScenarioPresets = () => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      // Include "custom" scenario in presets so we can access its values
      presets[key] = scenario.inflation;
    });
    return presets;
  };

  const presetScenarios = getScenarioPresets();

  // Determine chart max value based on input type
  const getChartMaxValue = (): number => {
    if (
      formData.inflationInputType === "preset" &&
      formData.inflationPreset !== "custom"
    ) {
      return (
        presetScenarios[formData.inflationPreset as ScenarioKey]?.maxAxis || 100
      );
    }
    // For flat and linear modes, use a reasonable max based on the values
    if (formData.inflationInputType === "flat") {
      return Math.max(100, Math.ceil((formData.inflationFlat * 1.2) / 10) * 10);
    }
    if (formData.inflationInputType === "linear") {
      const maxValue = Math.max(formData.inflationStart, formData.inflationEnd);
      return Math.max(100, Math.ceil((maxValue * 1.2) / 10) * 10);
    }
    return 100; // Default
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Rate Assumptions - Using Reusable Component */}
      <RateAssumptionsSection
        formData={formData}
        updateFormData={updateFormData}
        config={{
          title: "Inflation Rate Assumptions",
          emoji: "💵",
          colorClass: {
            background: "bg-gray-50",
            border: "border-gray-400",
            text: "text-gray-800",
          },
          dataKey: "inflationCustomRates",
          flatRateKey: "inflationFlat",
          startRateKey: "inflationStart",
          endRateKey: "inflationEnd",
          inputTypeKey: "inflationInputType",
          manualModeKey: "inflationManualMode",
          followScenarioKey: "followEconomicScenarioInflation",
          presetKey: "inflationPreset",
          maxValue: getChartMaxValue(),
          yAxisLabel: "Annual Inflation Rate (%)",
          unit: "%",
        }}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
      />

      {/* Section 2: USD Purchasing Power Decay Chart */}
      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
        <h4 className="font-semibold text-red-800 mb-3">
          📉 USD Purchasing Power Decay
        </h4>
        <div style={{ height: "400px" }}>
          <UsdPurchasingPowerChart formData={formData} />
        </div>
      </div>
    </div>
  );
};
