// State selectors for computed values and data access
import { AppState, StateSelectors } from "./types";

export const createSelectors = (state: AppState): StateSelectors => {
  return {
    // Form data selectors
    getAllocationPercentages: () => ({
      savingsPct: state.formData.savingsPct,
      investmentsPct: state.formData.investmentsPct,
      speculationPct: state.formData.speculationPct,
    }),

    getTotalAllocation: () =>
      state.formData.savingsPct +
      state.formData.investmentsPct +
      state.formData.speculationPct,

    isAllocationValid: () => {
      const total =
        state.formData.savingsPct +
        state.formData.investmentsPct +
        state.formData.speculationPct;
      return total === 100;
    },

    // Calculation selectors
    getBtcPriceAtYear: (year: number) => {
      // Use cached rates if available, otherwise fallback to custom rates
      const rates =
        state.scenarios.rateCache.btcPrice.length > 0
          ? state.scenarios.rateCache.btcPrice
          : state.formData.btcPriceCustomRates;

      if (year >= rates.length) {
        return rates[rates.length - 1] || 0;
      }
      return rates[year] || 0;
    },

    getInflationAtYear: (year: number) => {
      const rates =
        state.scenarios.rateCache.inflation.length > 0
          ? state.scenarios.rateCache.inflation
          : state.formData.inflationCustomRates;

      if (year >= rates.length) {
        return rates[rates.length - 1] || 0;
      }
      return rates[year] || 0;
    },

    getIncomeAtYear: (year: number) => {
      const rates =
        state.scenarios.rateCache.income.length > 0
          ? state.scenarios.rateCache.income
          : state.formData.incomeCustomRates;

      if (year >= rates.length) {
        return rates[rates.length - 1] || 0;
      }
      return rates[year] || 0;
    },

    // UI selectors
    isSectionExpanded: (sectionId: string) => {
      return state.ui.expandedSections[sectionId] ?? false;
    },

    hasCalculationResults: () => {
      return state.calculationResults.results.length > 0;
    },
  };
};
