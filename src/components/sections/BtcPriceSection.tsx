import React from "react";
import economicScenarios from "../../config/economicScenarios";
import { useBtcAutoApplyEffects } from "../../hooks/useBtcAutoApplyEffects";
import { useBtcScenarioManagement } from "../../hooks/useBtcScenarioManagement";
import { FormData } from "../../types";
import { useBtcRateSystem } from "../../utils/shared/useBtcRateSystem";
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
    dropdownPresets,
    generateBtcRates,
    applyToChart,
    getChartMaxValue,
    isManualRateSelected,
    isDirectEditMode,
    isCustomEconomicScenario,
    showLockedMessage,
    formatNumberForDisplay,
    parseFormattedNumber,
    handleExchangeRateChange,
    handleLockedInteraction,
  } = useBtcRateSystem(formData, updateFormData);

  const { handleInputTypeChange, handleScenarioChange, handleScenarioToggle } =
    useBtcScenarioManagement(formData, updateFormData, applyToChart);

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
            background: "bg-surface-alt",
            border: "border-themed",
            text: "text-primary",
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
          yAxisLabel: "BTC appreciation (nominal)",
          unit: "%",
        }}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
        dropdownPresets={dropdownPresets}
      />

      {/* Section 3: Price Projection Chart */}
      <PriceProjectionChart formData={formData} />
    </div>
  );
};
