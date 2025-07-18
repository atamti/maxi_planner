import React from "react";
import economicScenarios from "../../config/economicScenarios";
import { useBtcAutoApplyEffects } from "../../hooks/useBtcAutoApplyEffects";
import { useBtcRateGeneration } from "../../hooks/useBtcRateGeneration";
import { useBtcScenarioManagement } from "../../hooks/useBtcScenarioManagement";
import { useExchangeRateHandling } from "../../hooks/useExchangeRateHandling";
import { FormData } from "../../types";
import { RateAssumptionsSection } from "../common/RateAssumptionsSection";
import { ExchangeRateInput } from "./btc-price/ExchangeRateInput";
import { PriceProjectionChart } from "./btc-price/PriceProjectionChart";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const BtcPriceSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  const {
    presetScenarios,
    calculateAverageBtcAppreciation,
    generateBtcRates,
    applyToChart,
    getChartMaxValue,
    isManualRateSelected,
    isDirectEditMode,
    isCustomEconomicScenario,
  } = useBtcRateGeneration(formData, updateFormData);

  const { handleInputTypeChange, handleScenarioChange, handleScenarioToggle } =
    useBtcScenarioManagement(formData, updateFormData, applyToChart);

  const {
    showLockedMessage,
    formatNumberForDisplay,
    parseFormattedNumber,
    handleExchangeRateChange,
    handleLockedInteraction,
  } = useExchangeRateHandling(formData, updateFormData);

  // Set up auto-apply effects
  useBtcAutoApplyEffects(formData, applyToChart);

  return (
    <div className="space-y-6">
      {/* Section 1: Starting Exchange Rate */}
      <ExchangeRateInput
        formData={formData}
        formatNumberForDisplay={formatNumberForDisplay}
        handleExchangeRateChange={handleExchangeRateChange}
      />

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
          maxValue: getChartMaxValue,
          yAxisLabel: "BTC appreciation (%, nominal)",
          unit: "%",
        }}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
      />

      {/* Section 3: Price Projection Chart */}
      <PriceProjectionChart formData={formData} />
    </div>
  );
};
