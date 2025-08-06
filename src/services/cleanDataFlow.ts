// Clean data flow hooks - top-down data flow with predictable patterns
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCentralizedStateContext } from "../store";
import { FormData } from "../types";

// Single source of truth hook - all data flows from here
export const useSingleSourceOfTruth = () => {
  const { state, updateFormData, resetForm } = useCentralizedStateContext();

  // The single source of truth for all application data
  const sourceOfTruth = useMemo(
    () => ({
      // Core data
      formData: state.formData,
      calculationResults: state.calculationResults,

      // UI state
      ui: state.ui,

      // Derived state
      scenarios: state.scenarios,

      // Metadata
      lastUpdated: Date.now(),
      version: "1.0.0",
    }),
    [state],
  );

  return {
    sourceOfTruth,
    updateFormData,
    resetForm,
  };
};

// Predictable update patterns hook
export const usePredictableUpdates = () => {
  const { updateFormData: baseUpdate } = useCentralizedStateContext();
  const [updateHistory, setUpdateHistory] = useState<
    Array<{
      timestamp: number;
      updates: Partial<FormData>;
      reason?: string;
    }>
  >([]);

  // Wrapped update function that tracks changes
  const updateFormData = useCallback(
    (updates: Partial<FormData>, reason?: string) => {
      // Log the update for debugging and tracking
      const updateRecord = {
        timestamp: Date.now(),
        updates,
        reason,
      };

      setUpdateHistory((prev) => [...prev.slice(-9), updateRecord]); // Keep last 10 updates

      // Apply the update
      baseUpdate(updates);
    },
    [baseUpdate],
  );

  // Batch updates for related changes
  const batchUpdate = useCallback(
    (updates: Array<{ data: Partial<FormData>; reason?: string }>) => {
      const mergedUpdates = updates.reduce(
        (acc, { data }) => ({ ...acc, ...data }),
        {} as Partial<FormData>,
      );

      const reasons = updates
        .map((u) => u.reason)
        .filter(Boolean)
        .join(", ");

      updateFormData(mergedUpdates, `Batch: ${reasons}`);
    },
    [updateFormData],
  );

  // Conditional updates
  const conditionalUpdate = useCallback(
    (condition: boolean, updates: Partial<FormData>, reason?: string) => {
      if (condition) {
        updateFormData(updates, `Conditional: ${reason}`);
      }
    },
    [updateFormData],
  );

  return {
    updateFormData,
    batchUpdate,
    conditionalUpdate,
    updateHistory,
  };
};

// Data integrity and validation hook
export const useDataIntegrity = () => {
  const { state } = useCentralizedStateContext();
  const [integrityChecks, setIntegrityChecks] = useState<
    Array<{
      check: string;
      passed: boolean;
      message?: string;
    }>
  >([]);

  // Run integrity checks on form data
  const runIntegrityChecks = useCallback(() => {
    const checks = [];
    const { formData } = state;

    // Check allocation totals
    const allocationTotal =
      formData.savingsPct + formData.investmentsPct + formData.speculationPct;
    checks.push({
      check: "allocation-total",
      passed: allocationTotal === 100,
      message:
        allocationTotal !== 100
          ? `Allocation total is ${allocationTotal}%, expected 100%`
          : undefined,
    });

    // Check LTV ratio vs collateral
    if (formData.collateralPct > 0 && formData.ltvRatio === 0) {
      checks.push({
        check: "ltv-collateral-consistency",
        passed: false,
        message: "Collateral allocation set but LTV ratio is 0%",
      });
    } else {
      checks.push({
        check: "ltv-collateral-consistency",
        passed: true,
      });
    }

    // Check time horizon vs activation year
    checks.push({
      check: "activation-year-validity",
      passed: formData.activationYear <= formData.timeHorizon,
      message:
        formData.activationYear > formData.timeHorizon
          ? "Activation year cannot be greater than time horizon"
          : undefined,
    });

    // Check custom rates array lengths
    const expectedLength = formData.timeHorizon;
    checks.push({
      check: "inflation-rates-length",
      passed: formData.inflationCustomRates.length >= expectedLength,
      message:
        formData.inflationCustomRates.length < expectedLength
          ? `Inflation rates array too short: ${formData.inflationCustomRates.length}/${expectedLength}`
          : undefined,
    });

    checks.push({
      check: "btc-rates-length",
      passed: formData.btcPriceCustomRates.length >= expectedLength,
      message:
        formData.btcPriceCustomRates.length < expectedLength
          ? `BTC price rates array too short: ${formData.btcPriceCustomRates.length}/${expectedLength}`
          : undefined,
    });

    checks.push({
      check: "income-rates-length",
      passed: formData.incomeCustomRates.length >= expectedLength,
      message:
        formData.incomeCustomRates.length < expectedLength
          ? `Income rates array too short: ${formData.incomeCustomRates.length}/${expectedLength}`
          : undefined,
    });

    setIntegrityChecks(checks);
    return checks;
  }, [state]);

  // Auto-run integrity checks when form data changes
  useEffect(() => {
    runIntegrityChecks();
  }, [runIntegrityChecks]);

  const hasIntegrityIssues = integrityChecks.some((check) => !check.passed);
  const integrityErrors = integrityChecks.filter((check) => !check.passed);

  return {
    integrityChecks,
    hasIntegrityIssues,
    integrityErrors,
    runIntegrityChecks,
  };
};

// Separation of concerns hook - ensures clean boundaries
export const useSeparationOfConcerns = () => {
  const { state, selectors, scenarioManager } = useCentralizedStateContext();

  // Data access layer - what components should use for reading data
  const dataAccess = useMemo(
    () => ({
      // Form data access
      formData: state.formData,

      // Calculated data access
      calculationResults: state.calculationResults,

      // UI state access
      ui: state.ui,

      // Computed values
      allocationPercentages: selectors.getAllocationPercentages(),
      totalAllocation: selectors.getTotalAllocation(),
      isAllocationValid: selectors.isAllocationValid(),

      // Rate lookups
      getBtcPriceAtYear: selectors.getBtcPriceAtYear,
      getInflationAtYear: selectors.getInflationAtYear,
      getIncomeAtYear: selectors.getIncomeAtYear,
    }),
    [state, selectors],
  );

  // Business logic layer - what components should use for operations
  const businessLogic = useMemo(
    () => ({
      // Scenario operations
      calculateRates: scenarioManager.calculateRates,
      syncWithScenario: scenarioManager.syncWithEconomicScenario,
      handleInputTypeChange: scenarioManager.handleInputTypeChange,
      handleScenarioSelection: scenarioManager.handleScenarioSelection,
      predictStateChange: scenarioManager.predictStateChange,
    }),
    [scenarioManager],
  );

  // Presentation layer - what UI components should focus on
  const presentation = useMemo(
    () => ({
      // Section expansion states
      isSectionExpanded: selectors.isSectionExpanded,

      // Loading and error states
      isCalculating: state.ui.isCalculating,
      allocationError: state.ui.allocationError,

      // Display formatting helpers
      formatPercentage: (value: number) => `${Math.round(value * 100) / 100}%`,
      formatCurrency: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(value),
      formatBtc: (value: number) => `₿${Math.round(value * 100000) / 100000}`,
    }),
    [state, selectors],
  );

  return {
    dataAccess,
    businessLogic,
    presentation,
  };
};
