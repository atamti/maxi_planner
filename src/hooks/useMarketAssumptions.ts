import { ScenarioKey } from "../config/economicScenarios";
import { usePortfolio } from "../context/PortfolioContext";
import { InputType, Mode } from "../types";

/**
 * Custom hook for managing market assumptions (BTC price, inflation, income)
 */
export const useMarketAssumptions = () => {
  const { formData, updateFormData } = usePortfolio();

  const updateInflationSettings = (updates: {
    inflationMode?: Mode;
    inflationInputType?: "flat" | "linear" | "preset";
    inflationFlat?: number;
    inflationStart?: number;
    inflationEnd?: number;
    inflationPreset?: ScenarioKey;
    inflationCustomRates?: number[];
    inflationManualMode?: boolean;
  }) => {
    updateFormData(updates);
  };

  const updateBtcPriceSettings = (updates: {
    btcPriceMode?: Mode;
    btcPriceInputType?: InputType;
    btcPriceFlat?: number;
    btcPriceStart?: number;
    btcPriceEnd?: number;
    btcPricePreset?: ScenarioKey;
    btcPriceCustomRates?: number[];
    btcPriceManualMode?: boolean;
  }) => {
    updateFormData(updates);
  };

  const updateIncomeSettings = (updates: {
    incomeMode?: Mode;
    incomeInputType?: "flat" | "linear" | "preset" | "manual";
    incomeFlat?: number;
    incomeStart?: number;
    incomeEnd?: number;
    incomePreset?: ScenarioKey;
    incomeCustomRates?: number[];
    incomeManualMode?: boolean;
    startingExpenses?: number;
    incomeAllocationPct?: number;
    incomeReinvestmentPct?: number;
  }) => {
    updateFormData(updates);
  };

  return {
    // Inflation data
    inflation: {
      mode: formData.inflationMode,
      inputType: formData.inflationInputType,
      flat: formData.inflationFlat,
      start: formData.inflationStart,
      end: formData.inflationEnd,
      preset: formData.inflationPreset,
      customRates: formData.inflationCustomRates,
      manualMode: formData.inflationManualMode,
    },

    // BTC Price data
    btcPrice: {
      mode: formData.btcPriceMode,
      inputType: formData.btcPriceInputType,
      flat: formData.btcPriceFlat,
      start: formData.btcPriceStart,
      end: formData.btcPriceEnd,
      preset: formData.btcPricePreset,
      customRates: formData.btcPriceCustomRates,
      manualMode: formData.btcPriceManualMode,
    },

    // Income data
    income: {
      mode: formData.incomeMode,
      inputType: formData.incomeInputType,
      flat: formData.incomeFlat,
      start: formData.incomeStart,
      end: formData.incomeEnd,
      preset: formData.incomePreset,
      customRates: formData.incomeCustomRates,
      manualMode: formData.incomeManualMode,
      startingExpenses: formData.startingExpenses,
      allocationPct: formData.incomeAllocationPct,
      reinvestmentPct: formData.incomeReinvestmentPct,
    },

    // Update functions
    updateInflationSettings,
    updateBtcPriceSettings,
    updateIncomeSettings,
  };
};
