import React from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";
import { BtcExchangeChart } from "./BtcExchangeChart";
import { RateAssumptionsSection } from "./common/RateAssumptionsSection";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const BtcPriceSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  // Calculate average BTC appreciation rate
  const calculateAverageBtcAppreciation = (): number => {
    if (formData.btcPriceCustomRates.length === 0) return 0;
    const sum = formData.btcPriceCustomRates
      .slice(0, formData.timeHorizon)
      .reduce((acc, val) => acc + val, 0);
    return Math.round(sum / formData.timeHorizon);
  };

  const getScenarioPresets = () => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      // Include "custom" scenario in presets so we can access its values
      presets[key] = scenario.btcPrice;
    });
    return presets;
  };

  const presetScenarios = getScenarioPresets();

  // Check if manual mode is selected
  const isManualRateSelected = formData.btcPricePreset === "custom";

  // Change the check for year-by-year mode to check for manual mode instead
  // This now represents "direct edit chart" mode
  const isDirectEditMode = formData.btcPriceManualMode;

  // Check if the economic scenario is set to custom
  const isCustomEconomicScenario = formData.economicScenario === "custom";

  const generateBtcRates = (
    inputType:
      | "flat"
      | "linear"
      | "preset"
      | "manual" = formData.btcPriceInputType,
  ): number[] => {
    const rates = [];

    if (inputType === "flat") {
      for (let i = 0; i < formData.timeHorizon; i++) {
        rates.push(formData.btcPriceFlat);
      }
    } else if (inputType === "linear") {
      for (let i = 0; i < formData.timeHorizon; i++) {
        const progress = i / Math.max(1, formData.timeHorizon - 1);
        const rate =
          formData.btcPriceStart +
          (formData.btcPriceEnd - formData.btcPriceStart) * progress;
        rates.push(Math.round(rate));
      }
    } else if (inputType === "preset") {
      // Only access preset scenarios if we're not in custom mode
      if (
        !isManualRateSelected &&
        presetScenarios[formData.btcPricePreset as ScenarioKey]
      ) {
        const scenario =
          presetScenarios[formData.btcPricePreset as ScenarioKey];

        for (let i = 0; i < formData.timeHorizon; i++) {
          const progress = i / Math.max(1, formData.timeHorizon - 1);
          // Use exponential curve for upward acceleration
          const curvedProgress = Math.pow(progress, 1.5);
          const rate =
            scenario.startRate +
            (scenario.endRate - scenario.startRate) * curvedProgress;
          rates.push(Math.round(rate / 2) * 2);
        }
      } else {
        // Fallback to flat rate if we're in custom mode
        for (let i = 0; i < formData.timeHorizon; i++) {
          rates.push(formData.btcPriceFlat);
        }
      }
    }

    return rates;
  };

  const applyToChart = (
    inputType:
      | "flat"
      | "linear"
      | "preset"
      | "manual" = formData.btcPriceInputType,
  ) => {
    const rates = generateBtcRates(inputType);
    const newRates = [...formData.btcPriceCustomRates];
    rates.forEach((rate, index) => {
      if (index < newRates.length) {
        newRates[index] = rate;
      }
    });
    updateFormData({ btcPriceCustomRates: newRates });
  };

  const handleInputTypeChange = (
    newType: "flat" | "linear" | "preset" | "manual",
  ) => {
    updateFormData({ btcPriceInputType: newType });

    // If switching to year-by-year mode, don't apply any preset and enable manual mode
    if (newType === "manual") {
      updateFormData({ btcPriceManualMode: true });
      return;
    }

    // For other input types, apply the chart
    applyToChart(newType);
  };

  // Update handleScenarioChange to handle the new dropdown options
  const handleScenarioChange = (selectedScenario: string) => {
    if (selectedScenario === "custom-flat") {
      // Handle Custom Flat Rate selection
      const customScenario = economicScenarios.custom.btcPrice;

      updateFormData({
        btcPricePreset: "custom",
        followEconomicScenarioBtc: false,
        btcPriceInputType: "flat",
        btcPriceFlat: customScenario.startRate,
      });

      // Apply flat rate to the chart immediately
      setTimeout(() => applyToChart("flat"), 0);
    } else if (selectedScenario === "custom-linear") {
      // Handle Custom Linear Progression selection
      const customScenario = economicScenarios.custom.btcPrice;

      updateFormData({
        btcPricePreset: "custom",
        followEconomicScenarioBtc: false,
        btcPriceInputType: "linear",
        btcPriceStart: customScenario.startRate,
        btcPriceEnd: customScenario.endRate,
      });

      // Apply linear progression to the chart immediately
      setTimeout(() => applyToChart("linear"), 0);
    } else if (selectedScenario === "manual") {
      // Get the custom scenario settings
      const customScenario = economicScenarios.custom.btcPrice;

      // Handle manual selection with custom scenario defaults
      updateFormData({
        btcPricePreset: "custom",
        followEconomicScenarioBtc: false,
        // Default to flat rate when switching to manual
        btcPriceInputType: "manual",
        // Apply defaults from custom scenario
        btcPriceFlat: customScenario.startRate,
        btcPriceStart: customScenario.startRate,
        btcPriceEnd: customScenario.endRate,
      });

      // Enable direct editing
      updateFormData({ btcPriceManualMode: true });
    } else {
      // Handle preset scenario selection
      updateFormData({
        btcPricePreset: selectedScenario as ScenarioKey,
        btcPriceInputType: "preset",
        btcPriceManualMode: false,
      });
    }
  };

  // Auto-apply when values change (but not in manual mode)
  React.useEffect(() => {
    if (formData.btcPriceInputType === "flat" && !formData.btcPriceManualMode) {
      applyToChart();
    }
  }, [formData.btcPriceFlat, formData.timeHorizon]);

  React.useEffect(() => {
    if (
      formData.btcPriceInputType === "linear" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }
  }, [formData.btcPriceStart, formData.btcPriceEnd, formData.timeHorizon]);

  React.useEffect(() => {
    if (
      formData.btcPriceInputType === "preset" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }
  }, [formData.btcPricePreset, formData.timeHorizon]);

  // Reapply currently selected scenario when switching to auto mode
  React.useEffect(() => {
    if (!formData.btcPriceManualMode) {
      // Reapply current config when switching back to auto mode
      applyToChart(formData.btcPriceInputType);
    }
  }, [formData.btcPriceManualMode]);

  const getChartMaxValue = (): number => {
    // If we're using a preset scenario that isn't custom, use its maxAxis value
    if (formData.btcPriceInputType === "preset" && !isManualRateSelected) {
      return (
        presetScenarios[formData.btcPricePreset as ScenarioKey]?.maxAxis || 200
      );
    }

    // Default to 200% for all other cases
    return 200;
  };

  const handleScenarioToggle = (follow: boolean) => {
    updateFormData({
      followEconomicScenarioBtc: follow,
      // If now following scenario, update BTC preset based on economic scenario
      ...(follow &&
        formData.economicScenario !== "custom" && {
          btcPriceManualMode: false,
          btcPriceInputType: "preset",
          btcPricePreset: formData.economicScenario as ScenarioKey, // Reset to match economic scenario
        }),
    });
  };

  // Format number with commas for display
  const formatNumberForDisplay = (value: number): string => {
    return Math.round(value).toLocaleString();
  };

  // Parse number from formatted string
  const parseFormattedNumber = (value: string): number => {
    return Number(value.replace(/,/g, ""));
  };

  // Handle exchange rate input change
  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseFormattedNumber(inputValue);
    if (!isNaN(numericValue)) {
      updateFormData({ exchangeRate: numericValue });
    }
  };

  const [showLockedMessage, setShowLockedMessage] = React.useState(false);

  // Show locked message temporarily when user tries to interact with locked controls
  const handleLockedInteraction = () => {
    if (formData.followEconomicScenarioBtc || formData.btcPriceManualMode) {
      setShowLockedMessage(true);
      setTimeout(() => setShowLockedMessage(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Starting Exchange Rate */}
      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-semibold text-blue-800 mb-3">
          💰 Current BTC Price
        </h4>
        <div>
          <label className="block font-medium mb-1">
            Starting USD Exchange Rate ($/₿):
          </label>
          <input
            type="text"
            value={formatNumberForDisplay(formData.exchangeRate)}
            onChange={handleExchangeRateChange}
            className="w-full p-2 border rounded font-mono"
            placeholder="100,000"
          />
        </div>
      </div>

      {/* Section 2: Rate Assumptions - Using Reusable Component */}
      <RateAssumptionsSection
        formData={formData}
        updateFormData={updateFormData}
        config={{
          title: "Appreciation Rate Assumptions",
          emoji: "📊",
          colorClass: {
            background: "bg-gray-50",
            border: "border-gray-400",
            text: "text-gray-800",
          },
          dataKey: "btcPriceCustomRates",
          flatRateKey: "btcPriceFlat",
          startRateKey: "btcPriceStart",
          endRateKey: "btcPriceEnd",
          inputTypeKey: "btcPriceInputType",
          manualModeKey: "btcPriceManualMode",
          followScenarioKey: "followEconomicScenarioBtc",
          presetKey: "btcPricePreset",
          maxValue: getChartMaxValue(),
          yAxisLabel: "BTC appreciation (%, nominal)",
          unit: "%",
        }}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
      />

      {/* Section 3: Price Projection Chart */}
      <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
        <h4 className="font-semibold text-orange-800 mb-3">
          💹 Projected USD exchange rate
        </h4>
        <div style={{ height: "400px" }}>
          <BtcExchangeChart formData={formData} />
        </div>
      </div>
    </div>
  );
};
