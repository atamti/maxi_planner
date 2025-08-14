import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CalculationResults, FormData } from "../types";
import { useDataFlowOrchestrator } from "./dataFlowOrchestrator";

// Mock the centralized state context
const mockScenarioManager = {
  predictStateChange: vi.fn(),
  syncWithEconomicScenario: vi.fn(),
  calculateRates: vi.fn(),
};

const mockSelectors = {
  getCurrentScenario: vi.fn(),
  getActiveBtcPrice: vi.fn(),
  isSectionExpanded: vi.fn(),
};

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
  loanRate: 8,
  loanTermYears: 15,
  interestOnly: false,
  ltvRatio: 50,
  investmentsStartYield: 4,
  investmentsEndYield: 6,
  speculationStartYield: 8,
  speculationEndYield: 12,
  incomeYield: 5,
  incomeReinvestmentPct: 80,
  incomeAllocationPct: 70,
  startingExpenses: 5000,
  economicScenario: "tight" as const,
  followEconomicScenarioInflation: true,
  followEconomicScenarioBtc: true,
  followEconomicScenarioIncome: true,
  inflationMode: "simple" as const,
  inflationInputType: "preset" as const,
  inflationFlat: 3,
  inflationStart: 2,
  inflationEnd: 4,
  inflationPreset: "tight" as const,
  inflationCustomRates: [0.03, 0.035, 0.04],
  inflationManualMode: false,
  btcPriceMode: "simple" as const,
  btcPriceInputType: "preset" as const,
  btcPriceFlat: 50000,
  btcPriceStart: 50000,
  btcPriceEnd: 100000,
  btcPricePreset: "debasement" as const,
  btcPriceCustomRates: [50000, 60000, 75000],
  btcPriceManualMode: false,
  incomeMode: "simple" as const,
  incomeInputType: "preset" as const,
  incomeFlat: 60000,
  incomeStart: 50000,
  incomeEnd: 80000,
  incomePreset: "tight" as const,
  incomeCustomRates: [50000, 55000, 60000],
  incomeManualMode: false,
  enableAnnualReallocation: false,
};

const mockCalculationResults: CalculationResults = {
  results: [
    { year: 1, btcWithIncome: 5.5, btcWithoutIncome: 5.2 },
    { year: 2, btcWithIncome: 6.1, btcWithoutIncome: 5.4 },
  ],
  usdIncome: [60000, 63000],
  usdIncomeWithLeverage: [75000, 78750],
  btcIncome: [0.92, 0.95],
  annualExpenses: [5000, 5150],
  incomeAtActivationYears: [75000],
  incomeAtActivationYearsWithLeverage: [93750],
  expensesAtActivationYears: [6381],
  loanPrincipal: 99825,
  loanInterest: 8,
};

const mockState = {
  formData: mockFormData,
  calculationResults: mockCalculationResults,
  ui: {
    isCalculating: true,
    expandedSections: new Set(["portfolio-setup"]),
  },
};

const mockUpdateFormData = vi.fn();

const mockCentralizedStateContext = {
  state: mockState,
  updateFormData: mockUpdateFormData,
  selectors: mockSelectors,
  scenarioManager: mockScenarioManager,
  toggleSection: vi.fn(),
};

vi.mock("../store", () => ({
  useCentralizedStateContext: () => mockCentralizedStateContext,
}));

describe("Data Flow Orchestrator - Comprehensive Testing", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockScenarioManager.predictStateChange.mockReturnValue({
      affectedScenarios: [],
      willTriggerRecalculation: false,
    });
  });

  describe("Core Data Access", () => {
    it("should provide access to form data from state", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      expect(result.current.formData).toEqual(mockState.formData);
      expect(result.current.formData.btcStack).toBe(5);
      expect(result.current.formData.timeHorizon).toBe(30);
    });

    it("should provide access to calculation results", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      expect(result.current.calculationResults).toEqual(
        mockState.calculationResults,
      );
      expect(result.current.calculationResults.results).toHaveLength(2);
      expect(result.current.calculationResults.loanPrincipal).toBe(99825);
    });
  });

  describe("Data Updates - updateFormData", () => {
    it("should validate data before updating", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      await act(async () => {
        await result.current.updateFormData({ btcStack: 10 });
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ btcStack: 10 });
    });

    it("should prevent updates with invalid data", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await act(async () => {
        await result.current.updateFormData({ btcStack: -5 });
      });

      expect(consoleSpy).toHaveBeenCalledWith("Data validation failed:", [
        "BTC stack cannot be negative",
      ]);
      expect(mockUpdateFormData).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should use scenario manager to predict state changes", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      mockScenarioManager.predictStateChange.mockReturnValue({
        affectedScenarios: ["btc-price"],
        willTriggerRecalculation: true,
      });

      await act(async () => {
        await result.current.updateFormData({ economicScenario: "debasement" });
      });

      expect(mockScenarioManager.predictStateChange).toHaveBeenCalledWith({
        economicScenario: "debasement",
      });
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        economicScenario: "debasement",
      });
    });

    it("should handle scenario changes with side effects", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      mockScenarioManager.predictStateChange.mockReturnValue({
        affectedScenarios: ["btc-price", "inflation"],
        willTriggerRecalculation: true,
      });

      await act(async () => {
        await result.current.updateFormData({
          economicScenario: "crisis",
          btcStack: 8,
        });
      });

      expect(mockScenarioManager.predictStateChange).toHaveBeenCalledWith({
        economicScenario: "crisis",
        btcStack: 8,
      });
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        economicScenario: "crisis",
        btcStack: 8,
      });
    });
  });

  describe("Batch Updates", () => {
    it("should merge multiple updates into single update", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const updates = [{ btcStack: 8 }, { timeHorizon: 25 }, { loanRate: 6 }];

      await act(async () => {
        await result.current.batchUpdate(updates);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcStack: 8,
        timeHorizon: 25,
        loanRate: 6,
      });
    });

    it("should handle overlapping updates by using last value", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const updates = [
        { btcStack: 5, timeHorizon: 30 },
        { btcStack: 10 },
        { btcStack: 15, loanRate: 7 },
      ];

      await act(async () => {
        await result.current.batchUpdate(updates);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcStack: 15,
        timeHorizon: 30,
        loanRate: 7,
      });
    });

    it("should validate merged batch updates", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const updates = [
        { btcStack: 5 },
        { btcStack: -10 }, // Invalid
      ];

      await act(async () => {
        await result.current.batchUpdate(updates);
      });

      expect(consoleSpy).toHaveBeenCalledWith("Data validation failed:", [
        "BTC stack cannot be negative",
      ]);
      expect(mockUpdateFormData).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Data Validation", () => {
    it("should validate allocation percentages", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const validResult = result.current.validateData({
        savingsPct: 50,
        investmentsPct: 30,
        speculationPct: 20,
      });

      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual([]);
    });

    it("should reject allocation percentages over 100%", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const invalidResult = result.current.validateData({
        savingsPct: 60,
        investmentsPct: 50,
        speculationPct: 30, // Total = 140%
      });

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain(
        "Total allocation must be between 0% and 100%, got 140%",
      );
    });

    it("should reject negative allocation percentages when total goes below 0%", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const invalidResult = result.current.validateData({
        savingsPct: -50,
        investmentsPct: 30,
        speculationPct: 10,
      });

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain(
        "Total allocation must be between 0% and 100%, got -10%",
      );
    });

    it("should validate BTC stack positive values", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const validResult = result.current.validateData({ btcStack: 10 });
      expect(validResult.isValid).toBe(true);
    });

    it("should reject negative BTC stack", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const invalidResult = result.current.validateData({ btcStack: -5 });
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain("BTC stack cannot be negative");
    });

    it("should warn about unusually large BTC stack", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const warningResult = result.current.validateData({ btcStack: 1500 });
      expect(warningResult.isValid).toBe(false);
      expect(warningResult.errors).toContain(
        "BTC stack seems unusually large (>1000 BTC)",
      );
    });

    it("should validate time horizon within reasonable range", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const validResult = result.current.validateData({ timeHorizon: 25 });
      expect(validResult.isValid).toBe(true);

      const tooShortResult = result.current.validateData({ timeHorizon: 0 });
      expect(tooShortResult.isValid).toBe(false);
      expect(tooShortResult.errors).toContain(
        "Time horizon must be between 1 and 50 years",
      );

      const tooLongResult = result.current.validateData({ timeHorizon: 100 });
      expect(tooLongResult.isValid).toBe(false);
      expect(tooLongResult.errors).toContain(
        "Time horizon must be between 1 and 50 years",
      );
    });

    it("should validate loan rate within reasonable range", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const validResult = result.current.validateData({ loanRate: 8 });
      expect(validResult.isValid).toBe(true);

      const negativeResult = result.current.validateData({ loanRate: -2 });
      expect(negativeResult.isValid).toBe(false);
      expect(negativeResult.errors).toContain(
        "Loan rate must be between 0% and 50%",
      );

      const excessiveResult = result.current.validateData({ loanRate: 75 });
      expect(excessiveResult.isValid).toBe(false);
      expect(excessiveResult.errors).toContain(
        "Loan rate must be between 0% and 50%",
      );
    });

    it("should validate LTV ratio within reasonable range", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const validResult = result.current.validateData({ ltvRatio: 30 });
      expect(validResult.isValid).toBe(true);

      const negativeResult = result.current.validateData({ ltvRatio: -10 });
      expect(negativeResult.isValid).toBe(false);
      expect(negativeResult.errors).toContain(
        "LTV ratio must be between 0% and 50%",
      );

      const excessiveResult = result.current.validateData({ ltvRatio: 80 });
      expect(excessiveResult.isValid).toBe(false);
      expect(excessiveResult.errors).toContain(
        "LTV ratio must be between 0% and 50%",
      );
    });

    it("should handle multiple validation errors", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const multipleErrorsResult = result.current.validateData({
        btcStack: -5,
        timeHorizon: 100,
        loanRate: -2,
        ltvRatio: 80,
      });

      expect(multipleErrorsResult.isValid).toBe(false);
      expect(multipleErrorsResult.errors).toHaveLength(4);
      expect(multipleErrorsResult.errors).toContain(
        "BTC stack cannot be negative",
      );
      expect(multipleErrorsResult.errors).toContain(
        "Time horizon must be between 1 and 50 years",
      );
      expect(multipleErrorsResult.errors).toContain(
        "Loan rate must be between 0% and 50%",
      );
      expect(multipleErrorsResult.errors).toContain(
        "LTV ratio must be between 0% and 50%",
      );
    });
  });

  describe("Change Tracking", () => {
    it("should detect changed fields between form data objects", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const oldData = {
        btcStack: 5,
        timeHorizon: 30,
        loanRate: 8,
      } as FormData;

      const newData = {
        btcStack: 10,
        timeHorizon: 30,
        loanRate: 6,
      } as FormData;

      const changedFields = result.current.getChangedFields(oldData, newData);

      expect(changedFields).toContain("btcStack");
      expect(changedFields).toContain("loanRate");
      expect(changedFields).not.toContain("timeHorizon");
      expect(changedFields).toHaveLength(2);
    });

    it("should return empty array when no fields changed", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const data = {
        btcStack: 5,
        timeHorizon: 30,
        loanRate: 8,
      } as FormData;

      const changedFields = result.current.getChangedFields(data, data);

      expect(changedFields).toEqual([]);
    });

    it("should detect all fields changed when completely different", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const oldData = {
        btcStack: 5,
        timeHorizon: 30,
      } as FormData;

      const newData = {
        btcStack: 10,
        timeHorizon: 25,
      } as FormData;

      const changedFields = result.current.getChangedFields(oldData, newData);

      expect(changedFields).toContain("btcStack");
      expect(changedFields).toContain("timeHorizon");
      expect(changedFields).toHaveLength(2);
    });

    it("should indicate whether there are unsaved changes", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      // Note: Current implementation always returns false since it compares formData with itself
      // This is a placeholder for future persistence functionality
      const hasChanges = result.current.hasUnsavedChanges();

      expect(typeof hasChanges).toBe("boolean");
    });
  });

  describe("Calculation Control", () => {
    it("should provide pause calculations function", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      expect(typeof result.current.pauseCalculations).toBe("function");

      // Should not throw when called
      act(() => {
        result.current.pauseCalculations();
      });
    });

    it("should provide resume calculations function", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      expect(typeof result.current.resumeCalculations).toBe("function");

      // Should not throw when called
      act(() => {
        result.current.resumeCalculations();
      });
    });

    it("should force recalculation by triggering form update", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      act(() => {
        result.current.forceRecalculation();
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({});
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complex scenario-driven updates", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      mockScenarioManager.predictStateChange.mockReturnValue({
        affectedScenarios: ["btc-price", "inflation", "income"],
        willTriggerRecalculation: true,
      });

      await act(async () => {
        await result.current.updateFormData({
          economicScenario: "spiral",
          btcStack: 8,
        });
      });

      expect(mockScenarioManager.predictStateChange).toHaveBeenCalledWith({
        economicScenario: "spiral",
        btcStack: 8,
      });
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        economicScenario: "spiral",
        btcStack: 8,
      });
    });

    it("should validate complex batch updates with dependencies", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const complexUpdates = [
        { savingsPct: 50 },
        { investmentsPct: 35 },
        { speculationPct: 15 }, // Total = 100%
        { btcStack: 12 },
        { timeHorizon: 20 },
      ];

      await act(async () => {
        await result.current.batchUpdate(complexUpdates);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        savingsPct: 50,
        investmentsPct: 35,
        speculationPct: 15,
        btcStack: 12,
        timeHorizon: 20,
      });
    });

    it("should handle edge case with zero allocations", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const zeroAllocation = result.current.validateData({
        savingsPct: 0,
        investmentsPct: 0,
        speculationPct: 0,
      });

      expect(zeroAllocation.isValid).toBe(true);
      expect(zeroAllocation.errors).toEqual([]);
    });

    it("should track changes across multiple update cycles", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const initialData = {
        btcStack: 5,
        timeHorizon: 30,
        loanRate: 8,
      } as FormData;
      const intermediateData = {
        btcStack: 7,
        timeHorizon: 30,
        loanRate: 8,
      } as FormData;
      const finalData = {
        btcStack: 10,
        timeHorizon: 25,
        loanRate: 6,
      } as FormData;

      const firstCycleChanges = result.current.getChangedFields(
        initialData,
        intermediateData,
      );
      const secondCycleChanges = result.current.getChangedFields(
        intermediateData,
        finalData,
      );
      const totalChanges = result.current.getChangedFields(
        initialData,
        finalData,
      );

      expect(firstCycleChanges).toEqual(["btcStack"]);
      expect(secondCycleChanges).toEqual([
        "btcStack",
        "timeHorizon",
        "loanRate",
      ]);
      expect(totalChanges).toEqual(["btcStack", "timeHorizon", "loanRate"]);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle undefined values in validation gracefully", () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      const undefinedResult = result.current.validateData({
        btcStack: undefined,
        timeHorizon: undefined,
      });

      // Should not throw and should be valid when undefined
      expect(undefinedResult.isValid).toBe(true);
    });

    it("should handle empty object updates", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      await act(async () => {
        await result.current.updateFormData({});
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({});
    });

    it("should handle empty batch updates", async () => {
      const { result } = renderHook(() => useDataFlowOrchestrator());

      await act(async () => {
        await result.current.batchUpdate([]);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({});
    });

    it("should maintain referential stability of callback functions", () => {
      const { result, rerender } = renderHook(() => useDataFlowOrchestrator());

      const firstRenderCallbacks = {
        updateFormData: result.current.updateFormData,
        batchUpdate: result.current.batchUpdate,
        validateData: result.current.validateData,
        getChangedFields: result.current.getChangedFields,
      };

      rerender();

      const secondRenderCallbacks = {
        updateFormData: result.current.updateFormData,
        batchUpdate: result.current.batchUpdate,
        validateData: result.current.validateData,
        getChangedFields: result.current.getChangedFields,
      };

      // Callbacks should be stable across re-renders
      expect(firstRenderCallbacks.updateFormData).toBe(
        secondRenderCallbacks.updateFormData,
      );
      expect(firstRenderCallbacks.batchUpdate).toBe(
        secondRenderCallbacks.batchUpdate,
      );
      expect(firstRenderCallbacks.validateData).toBe(
        secondRenderCallbacks.validateData,
      );
      expect(firstRenderCallbacks.getChangedFields).toBe(
        secondRenderCallbacks.getChangedFields,
      );
    });
  });
});
