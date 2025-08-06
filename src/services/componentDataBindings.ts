// Component data bindings - provides clean data flow for components
import { useMemo } from "react";
import { useCentralizedStateContext } from "../store";
import { FormData } from "../types";
import { useDataFlowOrchestrator } from "./dataFlowOrchestrator";

// Standard component props interface for form sections
export interface SectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

// Standard component props for form fields
export interface FieldProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  label: string;
  helperText?: string;
}

// Portfolio setup section data binding
export const usePortfolioSetupData = () => {
  const { selectors, toggleSection } = useCentralizedStateContext();
  const { formData, updateFormData, validateData } = useDataFlowOrchestrator();

  const sectionProps: SectionProps = {
    title: `💼 Portfolio Setup: ${formData.btcStack} BTC over ${formData.timeHorizon} years`,
    isExpanded: selectors.isSectionExpanded("portfolio-setup"),
    onToggle: () => toggleSection("portfolio-setup"),
  };

  const btcStackField: FieldProps<number> = {
    value: formData.btcStack,
    onChange: (value) => updateFormData({ btcStack: value }),
    label: "BTC Stack Size (₿)",
    error: validateData({ btcStack: formData.btcStack }).errors.find((e) =>
      e.includes("BTC stack"),
    ),
  };

  const timeHorizonField: FieldProps<number> = {
    value: formData.timeHorizon,
    onChange: (value) => updateFormData({ timeHorizon: value }),
    label: "Time Horizon (Years)",
    helperText: `${formData.timeHorizon} years`,
    error: validateData({ timeHorizon: formData.timeHorizon }).errors.find(
      (e) => e.includes("Time horizon"),
    ),
  };

  const allocationData = {
    savings: {
      value: formData.savingsPct,
      onChange: (value: number) => updateFormData({ savingsPct: value }),
      label: "Savings %",
    },
    investments: {
      value: formData.investmentsPct,
      onChange: (value: number) => updateFormData({ investmentsPct: value }),
      label: "Investments %",
    },
    speculation: {
      value: formData.speculationPct,
      onChange: (value: number) => updateFormData({ speculationPct: value }),
      label: "Speculation %",
    },
    error: selectors.getAllocationPercentages(),
    isValid: selectors.isAllocationValid(),
    total: selectors.getTotalAllocation(),
  };

  return {
    sectionProps,
    btcStackField,
    timeHorizonField,
    allocationData,
  };
};

// Economic scenarios section data binding
export const useEconomicScenariosData = () => {
  const { selectors, toggleSection, scenarioManager } =
    useCentralizedStateContext();
  const { formData, updateFormData } = useDataFlowOrchestrator();

  const sectionProps: SectionProps = {
    title: `🌍 Economic Scenario: ${formData.economicScenario}`,
    isExpanded: selectors.isSectionExpanded("economic-scenarios"),
    onToggle: () => toggleSection("economic-scenarios"),
  };

  const scenarioSelection = {
    value: formData.economicScenario,
    onChange: (scenario: string) => {
      updateFormData({ economicScenario: scenario as any });
      if (scenario !== "custom") {
        scenarioManager.syncWithEconomicScenario(
          "btcPrice",
          scenario as string,
          formData,
        );
      }
    },
    options: ["tight", "debasement", "crisis", "spiral", "custom"],
  };

  const followToggles = {
    inflation: {
      value: formData.followEconomicScenarioInflation,
      onChange: (value: boolean) =>
        updateFormData({ followEconomicScenarioInflation: value }),
      label: "Follow scenario for inflation",
    },
    btcPrice: {
      value: formData.followEconomicScenarioBtc,
      onChange: (value: boolean) =>
        updateFormData({ followEconomicScenarioBtc: value }),
      label: "Follow scenario for BTC price",
    },
    income: {
      value: formData.followEconomicScenarioIncome,
      onChange: (value: boolean) =>
        updateFormData({ followEconomicScenarioIncome: value }),
      label: "Follow scenario for income",
    },
  };

  return {
    sectionProps,
    scenarioSelection,
    followToggles,
  };
};

// Market assumptions section data binding
export const useMarketAssumptionsData = () => {
  const { selectors, toggleSection } = useCentralizedStateContext();
  const { formData, updateFormData } = useDataFlowOrchestrator();

  const sectionProps: SectionProps = {
    title: "📊 Market Assumptions",
    isExpanded: selectors.isSectionExpanded("market-assumptions"),
    onToggle: () => toggleSection("market-assumptions"),
  };

  const inflationConfig = {
    mode: formData.inflationMode,
    inputType: formData.inflationInputType,
    flat: formData.inflationFlat,
    start: formData.inflationStart,
    end: formData.inflationEnd,
    preset: formData.inflationPreset,
    customRates: formData.inflationCustomRates,
    onUpdate: (updates: Partial<FormData>) => updateFormData(updates),
  };

  const btcPriceConfig = {
    mode: formData.btcPriceMode,
    inputType: formData.btcPriceInputType,
    flat: formData.btcPriceFlat,
    start: formData.btcPriceStart,
    end: formData.btcPriceEnd,
    preset: formData.btcPricePreset,
    customRates: formData.btcPriceCustomRates,
    onUpdate: (updates: Partial<FormData>) => updateFormData(updates),
  };

  const incomeConfig = {
    mode: formData.incomeMode,
    inputType: formData.incomeInputType,
    flat: formData.incomeFlat,
    start: formData.incomeStart,
    end: formData.incomeEnd,
    preset: formData.incomePreset,
    customRates: formData.incomeCustomRates,
    onUpdate: (updates: Partial<FormData>) => updateFormData(updates),
  };

  return {
    sectionProps,
    inflationConfig,
    btcPriceConfig,
    incomeConfig,
  };
};

// Results section data binding
export const useResultsData = () => {
  const { state, selectors } = useCentralizedStateContext();
  const { calculationResults, formData } = useDataFlowOrchestrator();

  const hasResults = selectors.hasCalculationResults();
  const showUSD = state.ui.showUSD;

  const chartData = useMemo(() => {
    if (!hasResults) return null;

    return {
      btcGrowth: calculationResults.results.map((r) => ({
        year: r.year,
        withIncome: r.btcWithIncome,
        withoutIncome: r.btcWithoutIncome,
      })),
      income: calculationResults.usdIncome.map((income, index) => ({
        year: index,
        income,
        incomeWithLeverage: calculationResults.usdIncomeWithLeverage[index],
        expenses: calculationResults.annualExpenses[index],
      })),
    };
  }, [calculationResults, hasResults]);

  const insightsData = useMemo(() => {
    if (!hasResults) return null;

    return {
      formData,
      results: calculationResults,
      getBtcPriceAtYear: selectors.getBtcPriceAtYear,
    };
  }, [calculationResults, formData, hasResults, selectors.getBtcPriceAtYear]);

  return {
    hasResults,
    showUSD,
    chartData,
    insightsData,
    calculationResults,
    formData,
  };
};
