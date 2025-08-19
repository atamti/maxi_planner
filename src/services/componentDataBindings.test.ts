import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScenarioKey } from "../config/economicScenarios";
import { CalculationResults, FormData } from "../types";
import {
  FieldProps,
  SectionProps,
  useEconomicScenariosData,
  useMarketAssumptionsData,
  usePortfolioSetupData,
  useResultsData,
} from "./componentDataBindings";

// Mock the dependencies
const mockFormData: FormData = {
  btcStack: 5,
  exchangeRate: 65000,
  timeHorizon: 30,
  activationYear: 5,
  priceCrash: 0.8,

  savingsPct: 60,
  investmentsPct: 30,
  speculationPct: 10,
  collateralPct: 0,

  ltvRatio: 0,
  loanRate: 8,
  loanTermYears: 15,
  interestOnly: false,

  investmentsStartYield: 4,
  investmentsEndYield: 6,
  speculationStartYield: 8,
  speculationEndYield: 12,
  incomeYield: 5,
  incomeReinvestmentPct: 80,

  incomeAllocationPct: 70,
  startingExpenses: 5000,

  economicScenario: "moderate" as ScenarioKey,
  followEconomicScenarioInflation: true,
  followEconomicScenarioBtc: true,
  followEconomicScenarioIncome: true,

  inflationMode: "simple" as const,
  inflationInputType: "preset" as const,
  inflationFlat: 3,
  inflationStart: 2,
  inflationEnd: 4,
  inflationPreset: "moderate" as ScenarioKey,
  inflationCustomRates: [0.03, 0.035, 0.04],
  inflationManualMode: false,

  btcPriceMode: "simple" as const,
  btcPriceInputType: "preset" as const,
  btcPriceFlat: 50000,
  btcPriceStart: 50000,
  btcPriceEnd: 100000,
  btcPricePreset: "bullish" as ScenarioKey,
  btcPriceCustomRates: [50000, 60000, 75000],
  btcPriceManualMode: false,

  incomeMode: "simple" as const,
  incomeInputType: "preset" as const,
  incomeFlat: 60000,
  incomeStart: 50000,
  incomeEnd: 80000,
  incomePreset: "moderate" as ScenarioKey,
  incomeCustomRates: [50000, 55000, 60000],
  incomeManualMode: false,
  enableAnnualReallocation: true,
};

const mockCalculationResults: CalculationResults = {
  results: [
    { year: 0, btcWithIncome: 5, btcWithoutIncome: 5 },
    { year: 1, btcWithIncome: 6, btcWithoutIncome: 5.5 },
    { year: 2, btcWithIncome: 7.5, btcWithoutIncome: 6.2 },
  ],
  usdIncome: [0, 50000, 55000],
  usdIncomeWithLeverage: [0, 75000, 82500],
  btcIncome: [0, 0.1, 0.12],
  annualExpenses: [40000, 42000, 44000],
  incomeAtActivationYears: [0, 10000, 20000],
  incomeAtActivationYearsWithLeverage: [0, 15000, 30000],
  expensesAtActivationYears: [40000, 42000, 44000],
  loanPrincipal: 150000,
  loanInterest: 12000,
  btcAppreciationAverage: 45.7,
};

const mockUpdateFormData = vi.fn();
const mockValidateData = vi.fn();
const mockToggleSection = vi.fn();
const mockSelectors = {
  isSectionExpanded: vi.fn(),
  getAllocationPercentages: vi.fn(() => ({
    savings: 60,
    investments: 30,
    speculation: 10,
  })),
  isAllocationValid: vi.fn(() => true),
  getTotalAllocation: vi.fn(() => 100),
  hasCalculationResults: vi.fn(() => true),
  getBtcPriceAtYear: vi.fn((year: number) => 50000 * Math.pow(1.2, year)),
};

const mockScenarioManager = {
  syncWithEconomicScenario: vi.fn(),
  calculateRates: vi.fn(),
  setRateConfiguration: vi.fn(),
};

const mockState = {
  formData: mockFormData,
  calculationResults: mockCalculationResults,
  ui: {
    isCalculating: false,
    showUSD: false,
    expandedSections: {
      "portfolio-setup": true,
      "economic-scenarios": false,
      "rate-configuration": false,
    },
  },
};

// Mock the centralized state context
vi.mock("../store", () => ({
  useCentralizedStateContext: () => ({
    state: mockState,
    selectors: mockSelectors,
    toggleSection: mockToggleSection,
    scenarioManager: mockScenarioManager,
  }),
}));

// Mock the data flow orchestrator
vi.mock("./dataFlowOrchestrator", () => ({
  useDataFlowOrchestrator: () => ({
    formData: mockFormData,
    calculationResults: mockCalculationResults,
    updateFormData: mockUpdateFormData,
    validateData: mockValidateData,
  }),
}));

describe("Component Data Bindings - Comprehensive Testing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateData.mockReturnValue({ isValid: true, errors: [] });
    mockSelectors.isSectionExpanded.mockImplementation(
      (section: string) =>
        mockState.ui.expandedSections[
          section as keyof typeof mockState.ui.expandedSections
        ] || false,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("usePortfolioSetupData", () => {
    it("should provide section props with correct title and expansion state", () => {
      const { result } = renderHook(() => usePortfolioSetupData());

      expect(result.current.sectionProps).toMatchObject({
        title: "💼 Portfolio Setup: 5 BTC over 30 years",
        isExpanded: true,
      });
      expect(typeof result.current.sectionProps.onToggle).toBe("function");
    });

    it("should handle section toggle correctly", () => {
      const { result } = renderHook(() => usePortfolioSetupData());

      act(() => {
        result.current.sectionProps.onToggle();
      });

      expect(mockToggleSection).toHaveBeenCalledWith("portfolio-setup");
    });

    it("should provide BTC stack field with correct properties", () => {
      const { result } = renderHook(() => usePortfolioSetupData());

      const btcStackField = result.current.btcStackField;
      expect(btcStackField.value).toBe(5);
      expect(btcStackField.label).toBe("BTC Stack Size (₿)");
      expect(typeof btcStackField.onChange).toBe("function");
    });

    it("should handle BTC stack field changes", () => {
      const { result } = renderHook(() => usePortfolioSetupData());

      act(() => {
        result.current.btcStackField.onChange(10);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ btcStack: 10 });
    });

    it("should provide time horizon field with helper text", () => {
      const { result } = renderHook(() => usePortfolioSetupData());

      const timeHorizonField = result.current.timeHorizonField;
      expect(timeHorizonField.value).toBe(30);
      expect(timeHorizonField.label).toBe("Time Horizon (Years)");
      expect(timeHorizonField.helperText).toBe("30 years");
    });

    it("should handle time horizon field changes", () => {
      const { result } = renderHook(() => usePortfolioSetupData());

      act(() => {
        result.current.timeHorizonField.onChange(25);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ timeHorizon: 25 });
    });

    it("should provide allocation data with all percentages", () => {
      const { result } = renderHook(() => usePortfolioSetupData());

      const { allocationData } = result.current;
      expect(allocationData.savings.value).toBe(60);
      expect(allocationData.investments.value).toBe(30);
      expect(allocationData.speculation.value).toBe(10);
      expect(allocationData.total).toBe(100);
      expect(allocationData.isValid).toBe(true);
    });

    it("should handle allocation percentage changes", () => {
      const { result } = renderHook(() => usePortfolioSetupData());

      act(() => {
        result.current.allocationData.savings.onChange(70);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ savingsPct: 70 });

      act(() => {
        result.current.allocationData.investments.onChange(25);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ investmentsPct: 25 });

      act(() => {
        result.current.allocationData.speculation.onChange(5);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ speculationPct: 5 });
    });

    it("should show validation errors when present", () => {
      mockValidateData.mockReturnValue({
        isValid: false,
        errors: [
          "BTC stack must be positive",
          "Time horizon must be between 1 and 50 years",
        ],
      });

      const { result } = renderHook(() => usePortfolioSetupData());

      expect(result.current.btcStackField.error).toBe(
        "BTC stack must be positive",
      );
      expect(result.current.timeHorizonField.error).toBe(
        "Time horizon must be between 1 and 50 years",
      );
    });
  });

  describe("useEconomicScenariosData", () => {
    it("should provide section props with economic scenario title", () => {
      const { result } = renderHook(() => useEconomicScenariosData());

      expect(result.current.sectionProps).toMatchObject({
        title: "🌍 Economic Scenario: moderate",
        isExpanded: false,
      });
    });

    it("should handle section toggle", () => {
      const { result } = renderHook(() => useEconomicScenariosData());

      act(() => {
        result.current.sectionProps.onToggle();
      });

      expect(mockToggleSection).toHaveBeenCalledWith("economic-scenarios");
    });

    it("should provide scenario selection with current value", () => {
      const { result } = renderHook(() => useEconomicScenariosData());

      expect(result.current.scenarioSelection.value).toBe("moderate");
      expect(typeof result.current.scenarioSelection.onChange).toBe("function");
    });

    it("should handle scenario selection changes", () => {
      const { result } = renderHook(() => useEconomicScenariosData());

      act(() => {
        result.current.scenarioSelection.onChange("bearish");
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        economicScenario: "bearish",
      });
    });

    it("should sync with economic scenario when not custom", () => {
      const { result } = renderHook(() => useEconomicScenariosData());

      act(() => {
        result.current.scenarioSelection.onChange("bullish");
      });

      expect(mockScenarioManager.syncWithEconomicScenario).toHaveBeenCalledWith(
        "btcPrice",
        "bullish",
        expect.any(Object),
      );
    });

    it("should not sync when custom scenario is selected", () => {
      const { result } = renderHook(() => useEconomicScenariosData());

      act(() => {
        result.current.scenarioSelection.onChange("custom");
      });

      expect(
        mockScenarioManager.syncWithEconomicScenario,
      ).not.toHaveBeenCalled();
    });

    it("should provide follow toggles for economic scenarios", () => {
      const { result } = renderHook(() => useEconomicScenariosData());

      expect(result.current.followToggles).toMatchObject({
        inflation: { value: true, label: "Follow scenario for inflation" },
        btcPrice: { value: true, label: "Follow scenario for BTC price" },
        income: { value: true, label: "Follow scenario for income" },
      });
    });

    it("should handle follow toggle changes", () => {
      const { result } = renderHook(() => useEconomicScenariosData());

      act(() => {
        result.current.followToggles.inflation.onChange(false);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioInflation: false,
      });

      act(() => {
        result.current.followToggles.btcPrice.onChange(false);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioBtc: false,
      });

      act(() => {
        result.current.followToggles.income.onChange(false);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioIncome: false,
      });
    });
  });

  describe("useMarketAssumptionsData", () => {
    it("should provide section props for market assumptions", () => {
      const { result } = renderHook(() => useMarketAssumptionsData());

      expect(result.current.sectionProps).toMatchObject({
        title: "📊 Market Assumptions",
        isExpanded: false,
      });
    });

    it("should provide inflation configuration", () => {
      const { result } = renderHook(() => useMarketAssumptionsData());

      const { inflationConfig } = result.current;
      expect(inflationConfig.mode).toBe("simple");
      expect(inflationConfig.inputType).toBe("preset");
      expect(inflationConfig.preset).toBe("moderate");
      expect(inflationConfig.customRates).toEqual([0.03, 0.035, 0.04]);
    });

    it("should provide BTC price configuration", () => {
      const { result } = renderHook(() => useMarketAssumptionsData());

      const { btcPriceConfig } = result.current;
      expect(btcPriceConfig.mode).toBe("simple");
      expect(btcPriceConfig.inputType).toBe("preset");
      expect(btcPriceConfig.preset).toBe("bullish");
      expect(btcPriceConfig.customRates).toEqual([50000, 60000, 75000]);
    });

    it("should provide income configuration", () => {
      const { result } = renderHook(() => useMarketAssumptionsData());

      const { incomeConfig } = result.current;
      expect(incomeConfig.mode).toBe("simple");
      expect(incomeConfig.inputType).toBe("preset");
      expect(incomeConfig.preset).toBe("moderate");
      expect(incomeConfig.customRates).toEqual([50000, 55000, 60000]);
    });

    it("should handle configuration updates", () => {
      const { result } = renderHook(() => useMarketAssumptionsData());

      act(() => {
        result.current.inflationConfig.onUpdate({ inflationFlat: 2.5 });
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ inflationFlat: 2.5 });

      act(() => {
        result.current.btcPriceConfig.onUpdate({ btcPriceFlat: 60000 });
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ btcPriceFlat: 60000 });

      act(() => {
        result.current.incomeConfig.onUpdate({ incomeFlat: 70000 });
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ incomeFlat: 70000 });
    });
  });

  describe("useResultsData", () => {
    it("should indicate when results are available", () => {
      const { result } = renderHook(() => useResultsData());

      expect(result.current.hasResults).toBe(true);
      expect(result.current.showUSD).toBe(false);
    });

    it("should provide chart data when results exist", () => {
      const { result } = renderHook(() => useResultsData());

      expect(result.current.chartData).toBeDefined();
      expect(result.current.chartData!.btcGrowth).toHaveLength(3);
      expect(result.current.chartData!.btcGrowth[0]).toMatchObject({
        year: 0,
        withIncome: 5,
        withoutIncome: 5,
      });

      expect(result.current.chartData!.income).toHaveLength(3);
      expect(result.current.chartData!.income[1]).toMatchObject({
        year: 1,
        income: 50000,
        incomeWithLeverage: 75000,
        expenses: 42000,
      });
    });

    it("should provide insights data when results exist", () => {
      const { result } = renderHook(() => useResultsData());

      expect(result.current.insightsData).toBeDefined();
      expect(result.current.insightsData!.formData).toBe(mockFormData);
      expect(result.current.insightsData!.results).toBe(mockCalculationResults);
      expect(typeof result.current.insightsData!.getBtcPriceAtYear).toBe(
        "function",
      );
    });

    it("should handle case when no results are available", () => {
      mockSelectors.hasCalculationResults.mockReturnValue(false);

      const { result } = renderHook(() => useResultsData());

      expect(result.current.hasResults).toBe(false);
      expect(result.current.chartData).toBeNull();
      expect(result.current.insightsData).toBeNull();
    });

    it("should provide full calculation results and form data", () => {
      const { result } = renderHook(() => useResultsData());

      expect(result.current.calculationResults).toBe(mockCalculationResults);
      expect(result.current.formData).toBe(mockFormData);
    });

    it("should update when UI state changes", () => {
      const { result, rerender } = renderHook(() => useResultsData());

      expect(result.current.showUSD).toBe(false);

      // Simulate UI state change
      mockState.ui.showUSD = true;
      rerender();

      expect(result.current.showUSD).toBe(true);
    });
  });

  describe("Data Binding Interfaces", () => {
    it("should properly type SectionProps interface", () => {
      const { result } = renderHook(() => usePortfolioSetupData());
      const sectionProps: SectionProps = result.current.sectionProps;

      expect(typeof sectionProps.title).toBe("string");
      expect(typeof sectionProps.isExpanded).toBe("boolean");
      expect(typeof sectionProps.onToggle).toBe("function");
    });

    it("should properly type FieldProps interface", () => {
      const { result } = renderHook(() => usePortfolioSetupData());
      const btcStackField: FieldProps<number> = result.current.btcStackField;

      expect(typeof btcStackField.value).toBe("number");
      expect(typeof btcStackField.onChange).toBe("function");
      expect(typeof btcStackField.label).toBe("string");
    });

    it("should handle field props with different types", () => {
      const { result } = renderHook(() => useEconomicScenariosData());
      const scenarioField: FieldProps<string> = {
        value: result.current.scenarioSelection.value,
        onChange: result.current.scenarioSelection.onChange,
        label: "Economic Scenario",
      };

      expect(typeof scenarioField.value).toBe("string");
      expect(typeof scenarioField.onChange).toBe("function");
    });
  });

  describe("Integration Testing", () => {
    it("should work together across all data binding hooks", () => {
      const portfolioHook = renderHook(() => usePortfolioSetupData());
      const scenarioHook = renderHook(() => useEconomicScenariosData());
      const marketHook = renderHook(() => useMarketAssumptionsData());
      const resultsHook = renderHook(() => useResultsData());

      // All hooks should provide their data successfully
      expect(portfolioHook.result.current.sectionProps).toBeDefined();
      expect(scenarioHook.result.current.sectionProps).toBeDefined();
      expect(marketHook.result.current.sectionProps).toBeDefined();
      expect(resultsHook.result.current.hasResults).toBe(true);
    });

    it("should maintain consistency across data updates", async () => {
      const portfolioHook = renderHook(() => usePortfolioSetupData());
      const resultsHook = renderHook(() => useResultsData());

      // Initial state
      expect(portfolioHook.result.current.btcStackField.value).toBe(5);
      expect(resultsHook.result.current.formData.btcStack).toBe(5);

      // Update through portfolio hook
      await act(async () => {
        portfolioHook.result.current.btcStackField.onChange(8);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ btcStack: 8 });
    });

    it("should handle complex workflow scenarios", async () => {
      const scenarioHook = renderHook(() => useEconomicScenariosData());
      const marketHook = renderHook(() => useMarketAssumptionsData());

      // Change economic scenario
      await act(async () => {
        scenarioHook.result.current.scenarioSelection.onChange("bearish");
      });

      // Should trigger both update and sync
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        economicScenario: "bearish",
      });
      expect(mockScenarioManager.syncWithEconomicScenario).toHaveBeenCalledWith(
        "btcPrice",
        "bearish",
        expect.any(Object),
      );

      // Update market configuration
      await act(async () => {
        marketHook.result.current.inflationConfig.onUpdate({
          inflationFlat: 4,
        });
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ inflationFlat: 4 });
    });
  });
});
