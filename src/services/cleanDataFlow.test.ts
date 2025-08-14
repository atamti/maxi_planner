import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScenarioKey } from "../config/economicScenarios";
import { FormData, Mode } from "../types";
import {
  useDataIntegrity,
  usePredictableUpdates,
  useSeparationOfConcerns,
  useSingleSourceOfTruth,
} from "./cleanDataFlow";

// Mock the centralized state context
const mockState = {
  formData: {
    // Basic portfolio settings
    btcStack: 5,
    exchangeRate: 65000,
    timeHorizon: 30,
    activationYear: 5,
    priceCrash: 0.8,

    // Allocation percentages
    savingsPct: 60,
    investmentsPct: 30,
    speculationPct: 10,
    collateralPct: 0,

    // Loan settings
    ltvRatio: 0,
    loanRate: 8,
    loanTermYears: 15,
    interestOnly: false,

    // Yield settings
    investmentsStartYield: 4,
    investmentsEndYield: 6,
    speculationStartYield: 8,
    speculationEndYield: 12,
    incomeYield: 5,
    incomeReinvestmentPct: 80,

    // Income settings
    incomeAllocationPct: 70,
    startingExpenses: 5000,

    // Economic scenario
    economicScenario: "moderate" as ScenarioKey,
    followEconomicScenarioInflation: true,
    followEconomicScenarioBtc: true,
    followEconomicScenarioIncome: true,

    // Inflation configuration
    inflationMode: "simple" as Mode,
    inflationInputType: "preset" as const,
    inflationFlat: 3,
    inflationStart: 2,
    inflationEnd: 4,
    inflationPreset: "moderate" as ScenarioKey,
    inflationCustomRates: [],
    inflationManualMode: false,

    // BTC price configuration
    btcPriceMode: "simple" as Mode,
    btcPriceInputType: "preset" as const,
    btcPriceFlat: 50000,
    btcPriceStart: 50000,
    btcPriceEnd: 100000,
    btcPricePreset: "bullish" as ScenarioKey,
    btcPriceCustomRates: [],
    btcPriceManualMode: false,

    // Income configuration
    incomeMode: "simple" as Mode,
    incomeInputType: "preset" as const,
    incomeFlat: 60000,
    incomeStart: 50000,
    incomeEnd: 80000,
    incomePreset: "moderate" as ScenarioKey,
    incomeCustomRates: [],
    incomeManualMode: false,
    enableAnnualReallocation: false,
  } as FormData,
  calculationResults: {
    finalPortfolioValue: 2000000,
    escapeVelocityYear: 15,
    btcAtRetirement: 10,
    liquidationRisk: false,
  },
  ui: {
    isCalculating: false,
    allocationError: null,
    expandedSections: {
      portfolio: true,
      allocation: false,
      scenario: false,
      loan: false,
    },
  },
  scenarios: {
    inflation: [],
    btcPrice: [],
    income: [],
  },
};

const mockUpdateFormData = vi.fn();
const mockResetForm = vi.fn();
const mockSelectors = {
  getAllocationPercentages: vi.fn(() => ({
    savings: 60,
    investments: 30,
    speculation: 10,
  })),
  getTotalAllocation: vi.fn(() => 100),
  isAllocationValid: vi.fn(() => true),
  getBtcPriceAtYear: vi.fn((year: number) => 50000 * Math.pow(1.2, year)),
  getInflationAtYear: vi.fn((year: number) => 0.03),
  getIncomeAtYear: vi.fn((year: number) => 50000 * Math.pow(1.05, year)),
  isSectionExpanded: vi.fn((section: string) => true),
};

const mockScenarioManager = {
  calculateRates: vi.fn(),
  syncWithEconomicScenario: vi.fn(),
  handleInputTypeChange: vi.fn(),
  handleScenarioSelection: vi.fn(),
  predictStateChange: vi.fn(),
};

// Mock the centralized state context
vi.mock("../store", () => ({
  useCentralizedStateContext: () => ({
    state: mockState,
    updateFormData: mockUpdateFormData,
    resetForm: mockResetForm,
    selectors: mockSelectors,
    scenarioManager: mockScenarioManager,
  }),
}));

describe("Clean Data Flow Service - Comprehensive Testing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useSingleSourceOfTruth", () => {
    it("should provide single source of truth data structure", () => {
      const { result } = renderHook(() => useSingleSourceOfTruth());

      expect(result.current.sourceOfTruth).toBeDefined();
      expect(result.current.sourceOfTruth.formData).toEqual(mockState.formData);
      expect(result.current.sourceOfTruth.calculationResults).toEqual(
        mockState.calculationResults,
      );
      expect(result.current.sourceOfTruth.ui).toEqual(mockState.ui);
      expect(result.current.sourceOfTruth.scenarios).toEqual(
        mockState.scenarios,
      );
      expect(result.current.sourceOfTruth.version).toBe("1.0.0");
      expect(typeof result.current.sourceOfTruth.lastUpdated).toBe("number");
    });

    it("should provide update and reset functions", () => {
      const { result } = renderHook(() => useSingleSourceOfTruth());

      expect(result.current.updateFormData).toBe(mockUpdateFormData);
      expect(result.current.resetForm).toBe(mockResetForm);
    });

    it("should update lastUpdated timestamp when state changes", () => {
      const { result, rerender } = renderHook(() => useSingleSourceOfTruth());

      const firstTimestamp = result.current.sourceOfTruth.lastUpdated;

      // Simulate state change
      mockState.formData.btcStack = 6;
      rerender();

      const secondTimestamp = result.current.sourceOfTruth.lastUpdated;
      expect(secondTimestamp).toBeGreaterThanOrEqual(firstTimestamp);
    });
  });

  describe("usePredictableUpdates", () => {
    it("should provide update functions with history tracking", () => {
      const { result } = renderHook(() => usePredictableUpdates());

      expect(result.current.updateFormData).toBeDefined();
      expect(result.current.batchUpdate).toBeDefined();
      expect(result.current.conditionalUpdate).toBeDefined();
      expect(result.current.updateHistory).toEqual([]);
    });

    it("should track update history when updateFormData is called", async () => {
      const { result } = renderHook(() => usePredictableUpdates());

      const updates = { btcStack: 6 };
      const reason = "BTC stack update test";

      await act(async () => {
        result.current.updateFormData(updates, reason);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith(updates);
      expect(result.current.updateHistory).toHaveLength(1);
      expect(result.current.updateHistory[0]).toMatchObject({
        updates,
        reason,
      });
      expect(typeof result.current.updateHistory[0].timestamp).toBe("number");
    });

    it("should handle batch updates correctly", async () => {
      const { result } = renderHook(() => usePredictableUpdates());

      const batchUpdates = [
        { data: { btcStack: 7 }, reason: "Update BTC stack" },
        { data: { exchangeRate: 70000 }, reason: "Update exchange rate" },
      ];

      await act(async () => {
        result.current.batchUpdate(batchUpdates);
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcStack: 7,
        exchangeRate: 70000,
      });
    });

    it("should handle conditional updates correctly", async () => {
      const { result } = renderHook(() => usePredictableUpdates());

      // Test positive condition
      await act(async () => {
        result.current.conditionalUpdate(
          true,
          { timeHorizon: 25 },
          "Conditional update",
        );
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ timeHorizon: 25 });

      // Test negative condition
      mockUpdateFormData.mockClear();
      await act(async () => {
        result.current.conditionalUpdate(
          false,
          { timeHorizon: 35 },
          "Should not update",
        );
      });

      expect(mockUpdateFormData).not.toHaveBeenCalled();
    });

    it("should limit update history to last 10 entries", async () => {
      const { result } = renderHook(() => usePredictableUpdates());

      // Add 12 updates
      for (let i = 0; i < 12; i++) {
        await act(async () => {
          result.current.updateFormData({ btcStack: 5 + i }, `Update ${i}`);
        });
      }

      // Should only keep last 10
      expect(result.current.updateHistory).toHaveLength(10);
      expect(result.current.updateHistory[0].reason).toBe("Update 2");
      expect(result.current.updateHistory[9].reason).toBe("Update 11");
    });
  });

  describe("useDataIntegrity", () => {
    it("should provide integrity checking functionality", () => {
      const { result } = renderHook(() => useDataIntegrity());

      expect(result.current.integrityChecks).toBeDefined();
      expect(result.current.hasIntegrityIssues).toBeDefined();
      expect(result.current.integrityErrors).toBeDefined();
      expect(result.current.runIntegrityChecks).toBeDefined();
    });

    it("should validate allocation totals correctly", () => {
      // Test valid allocation (100%)
      const { result } = renderHook(() => useDataIntegrity());

      const allocationCheck = result.current.integrityChecks.find(
        (check) => check.check === "allocation-total",
      );
      expect(allocationCheck?.passed).toBe(true);
    });

    it("should detect invalid allocation totals", () => {
      // Modify mock state to have invalid allocation
      const originalSavingsPct = mockState.formData.savingsPct;
      mockState.formData.savingsPct = 50; // Total will be 90%

      const { result } = renderHook(() => useDataIntegrity());

      const allocationCheck = result.current.integrityChecks.find(
        (check) => check.check === "allocation-total",
      );
      expect(allocationCheck?.passed).toBe(false);
      expect(allocationCheck?.message).toContain("90%");

      // Restore original value
      mockState.formData.savingsPct = originalSavingsPct;
    });

    it("should validate LTV vs collateral consistency", () => {
      // Test inconsistent LTV/collateral
      const originalCollateralPct = mockState.formData.collateralPct;
      const originalLtvRatio = mockState.formData.ltvRatio;

      mockState.formData.collateralPct = 10;
      mockState.formData.ltvRatio = 0;

      const { result } = renderHook(() => useDataIntegrity());

      const ltvCheck = result.current.integrityChecks.find(
        (check) => check.check === "ltv-collateral-consistency",
      );
      expect(ltvCheck?.passed).toBe(false);
      expect(ltvCheck?.message).toContain(
        "Collateral allocation set but LTV ratio is 0%",
      );

      // Restore original values
      mockState.formData.collateralPct = originalCollateralPct;
      mockState.formData.ltvRatio = originalLtvRatio;
    });

    it("should validate activation year vs time horizon", () => {
      // Test invalid activation year
      const originalActivationYear = mockState.formData.activationYear;
      mockState.formData.activationYear = 35; // Greater than timeHorizon (30)

      const { result } = renderHook(() => useDataIntegrity());

      const activationCheck = result.current.integrityChecks.find(
        (check) => check.check === "activation-year-validity",
      );
      expect(activationCheck?.passed).toBe(false);
      expect(activationCheck?.message).toContain(
        "cannot be greater than time horizon",
      );

      // Restore original value
      mockState.formData.activationYear = originalActivationYear;
    });

    it("should validate custom rates array lengths", () => {
      // Test short inflation rates array
      const originalInflationRates = mockState.formData.inflationCustomRates;
      mockState.formData.inflationCustomRates = [0.03, 0.035]; // Only 2 elements, need 30

      const { result } = renderHook(() => useDataIntegrity());

      const inflationCheck = result.current.integrityChecks.find(
        (check) => check.check === "inflation-rates-length",
      );
      expect(inflationCheck?.passed).toBe(false);
      expect(inflationCheck?.message).toContain("2/30");

      // Restore original value
      mockState.formData.inflationCustomRates = originalInflationRates;
    });

    it("should identify integrity issues correctly", () => {
      // Introduce multiple issues
      const originalSavingsPct = mockState.formData.savingsPct;
      const originalActivationYear = mockState.formData.activationYear;

      mockState.formData.savingsPct = 50; // Invalid allocation total
      mockState.formData.activationYear = 35; // Invalid activation year

      const { result } = renderHook(() => useDataIntegrity());

      expect(result.current.hasIntegrityIssues).toBe(true);
      expect(result.current.integrityErrors.length).toBeGreaterThan(0);

      // Restore original values
      mockState.formData.savingsPct = originalSavingsPct;
      mockState.formData.activationYear = originalActivationYear;
    });
  });

  describe("useSeparationOfConcerns", () => {
    it("should provide clean data access layer", () => {
      const { result } = renderHook(() => useSeparationOfConcerns());

      const { dataAccess } = result.current;
      expect(dataAccess.formData).toEqual(mockState.formData);
      expect(dataAccess.calculationResults).toEqual(
        mockState.calculationResults,
      );
      expect(dataAccess.ui).toEqual(mockState.ui);
      expect(dataAccess.allocationPercentages).toEqual({
        savings: 60,
        investments: 30,
        speculation: 10,
      });
      expect(dataAccess.totalAllocation).toBe(100);
      expect(dataAccess.isAllocationValid).toBe(true);
    });

    it("should provide rate lookup functions in data access", () => {
      const { result } = renderHook(() => useSeparationOfConcerns());

      const { dataAccess } = result.current;
      expect(typeof dataAccess.getBtcPriceAtYear).toBe("function");
      expect(typeof dataAccess.getInflationAtYear).toBe("function");
      expect(typeof dataAccess.getIncomeAtYear).toBe("function");

      // Test the functions work
      expect(dataAccess.getBtcPriceAtYear(5)).toBe(50000 * Math.pow(1.2, 5));
      expect(dataAccess.getInflationAtYear(3)).toBe(0.03);
      expect(dataAccess.getIncomeAtYear(2)).toBe(50000 * Math.pow(1.05, 2));
    });

    it("should provide business logic layer", () => {
      const { result } = renderHook(() => useSeparationOfConcerns());

      const { businessLogic } = result.current;
      expect(businessLogic.calculateRates).toBe(
        mockScenarioManager.calculateRates,
      );
      expect(businessLogic.syncWithScenario).toBe(
        mockScenarioManager.syncWithEconomicScenario,
      );
      expect(businessLogic.handleInputTypeChange).toBe(
        mockScenarioManager.handleInputTypeChange,
      );
      expect(businessLogic.handleScenarioSelection).toBe(
        mockScenarioManager.handleScenarioSelection,
      );
      expect(businessLogic.predictStateChange).toBe(
        mockScenarioManager.predictStateChange,
      );
    });

    it("should provide presentation layer with formatting helpers", () => {
      const { result } = renderHook(() => useSeparationOfConcerns());

      const { presentation } = result.current;
      expect(presentation.isCalculating).toBe(false);
      expect(presentation.allocationError).toBeNull();
      expect(typeof presentation.isSectionExpanded).toBe("function");

      // Test formatting functions
      expect(presentation.formatPercentage(12.34)).toBe("12.34%");
      expect(presentation.formatCurrency(123457)).toBe("$123,457");
      expect(presentation.formatBtc(1.23456789)).toBe("₿1.23457");
    });

    it("should maintain clean separation between layers", () => {
      const { result } = renderHook(() => useSeparationOfConcerns());

      const { dataAccess, businessLogic, presentation } = result.current;

      // Data access should only contain data, no functions for mutation
      expect(typeof dataAccess.formData).toBe("object");
      expect(typeof dataAccess.calculationResults).toBe("object");

      // Business logic should contain operational functions
      expect(typeof businessLogic.calculateRates).toBe("function");
      expect(typeof businessLogic.syncWithScenario).toBe("function");

      // Presentation should contain UI state and formatting
      expect(typeof presentation.formatPercentage).toBe("function");
      expect(typeof presentation.formatCurrency).toBe("function");
      expect(typeof presentation.isCalculating).toBe("boolean");
    });
  });

  describe("Integration Testing", () => {
    it("should work together for complete data flow management", async () => {
      const sourceHook = renderHook(() => useSingleSourceOfTruth());
      const updateHook = renderHook(() => usePredictableUpdates());
      const integrityHook = renderHook(() => useDataIntegrity());
      const concernsHook = renderHook(() => useSeparationOfConcerns());

      // Test that all hooks provide their expected interfaces
      expect(sourceHook.result.current.sourceOfTruth).toBeDefined();
      expect(updateHook.result.current.updateFormData).toBeDefined();
      expect(integrityHook.result.current.runIntegrityChecks).toBeDefined();
      expect(concernsHook.result.current.dataAccess).toBeDefined();

      // Test integrated workflow
      await act(async () => {
        updateHook.result.current.updateFormData(
          { ltvRatio: 25 },
          "Integration test",
        );
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({ ltvRatio: 25 });
      expect(updateHook.result.current.updateHistory).toHaveLength(1);
    });

    it("should handle edge cases in integrated workflow", async () => {
      const updateHook = renderHook(() => usePredictableUpdates());
      const integrityHook = renderHook(() => useDataIntegrity());

      // Create data that will fail integrity checks
      await act(async () => {
        // This would create an invalid allocation total in a real scenario
        updateHook.result.current.updateFormData(
          { savingsPct: 150 },
          "Invalid allocation test",
        );
      });

      // The update should still be tracked even if it creates invalid data
      expect(updateHook.result.current.updateHistory).toHaveLength(1);

      // Integrity system should eventually detect issues
      // (In real implementation, this would trigger integrity checks)
      expect(integrityHook.result.current.runIntegrityChecks).toBeDefined();
    });
  });
});
