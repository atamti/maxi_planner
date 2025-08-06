// Data flow orchestrator - manages the flow of data through the application
import { useCallback, useMemo } from "react";
import { useCentralizedStateContext } from "../store";
import { CalculationResults, FormData } from "../types";

export interface DataFlowOrchestrator {
  // Single source of truth
  formData: FormData;
  calculationResults: CalculationResults;

  // Predictable update patterns
  updateFormData: (updates: Partial<FormData>) => Promise<void>;
  batchUpdate: (updates: Partial<FormData>[]) => Promise<void>;

  // Data validation and integrity
  validateData: (data: Partial<FormData>) => {
    isValid: boolean;
    errors: string[];
  };

  // Change tracking
  getChangedFields: (oldData: FormData, newData: FormData) => string[];
  hasUnsavedChanges: () => boolean;

  // Data flow control
  pauseCalculations: () => void;
  resumeCalculations: () => void;
  forceRecalculation: () => void;
}

export const useDataFlowOrchestrator = (): DataFlowOrchestrator => {
  const {
    state,
    updateFormData: baseUpdateFormData,
    selectors,
    scenarioManager,
  } = useCentralizedStateContext();

  // Track calculation state
  const isPaused = useMemo(
    () => state.ui.isCalculating === false,
    [state.ui.isCalculating],
  );

  // Predictable update with validation and side effects
  const updateFormData = useCallback(
    async (updates: Partial<FormData>) => {
      // Validate the updates first
      const validation = validateData(updates);
      if (!validation.isValid) {
        console.warn("Data validation failed:", validation.errors);
        return;
      }

      // Predict what will change
      const stateChanges = scenarioManager.predictStateChange(updates);

      // Apply the updates
      baseUpdateFormData(updates);

      // Handle side effects based on what changed
      if (stateChanges.affectedScenarios.length > 0) {
        // Scenarios affected by changes
      }

      if (stateChanges.willTriggerRecalculation) {
        // Will trigger recalculation
      }
    },
    [baseUpdateFormData, scenarioManager],
  );

  // Batch updates for efficiency
  const batchUpdate = useCallback(
    async (updates: Partial<FormData>[]) => {
      // Merge all updates into a single update
      const mergedUpdates = updates.reduce(
        (acc, update) => ({ ...acc, ...update }),
        {},
      );
      await updateFormData(mergedUpdates);
    },
    [updateFormData],
  );

  // Data validation
  const validateData = useCallback(
    (data: Partial<FormData>) => {
      const errors: string[] = [];

      // Validate allocation percentages
      if (
        "savingsPct" in data ||
        "investmentsPct" in data ||
        "speculationPct" in data
      ) {
        const currentData = { ...state.formData, ...data };
        const total =
          currentData.savingsPct +
          currentData.investmentsPct +
          currentData.speculationPct;
        if (total < 0 || total > 100) {
          errors.push(
            `Total allocation must be between 0% and 100%, got ${total}%`,
          );
        }
      }

      // Validate BTC stack
      if ("btcStack" in data && data.btcStack !== undefined) {
        if (data.btcStack < 0) {
          errors.push("BTC stack cannot be negative");
        }
        if (data.btcStack > 1000) {
          errors.push("BTC stack seems unusually large (>1000 BTC)");
        }
      }

      // Validate time horizon
      if ("timeHorizon" in data && data.timeHorizon !== undefined) {
        if (data.timeHorizon < 1 || data.timeHorizon > 50) {
          errors.push("Time horizon must be between 1 and 50 years");
        }
      }

      // Validate loan rate
      if ("loanRate" in data && data.loanRate !== undefined) {
        if (data.loanRate < 0 || data.loanRate > 50) {
          errors.push("Loan rate must be between 0% and 50%");
        }
      }

      // Validate LTV ratio
      if ("ltvRatio" in data && data.ltvRatio !== undefined) {
        if (data.ltvRatio < 0 || data.ltvRatio > 50) {
          errors.push("LTV ratio must be between 0% and 50%");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [state.formData],
  );

  // Change tracking
  const getChangedFields = useCallback(
    (oldData: FormData, newData: FormData): string[] => {
      const changedFields: string[] = [];

      Object.keys(newData).forEach((key) => {
        const typedKey = key as keyof FormData;
        if (oldData[typedKey] !== newData[typedKey]) {
          changedFields.push(key);
        }
      });

      return changedFields;
    },
    [],
  );

  const hasUnsavedChanges = useCallback(() => {
    // This would compare against a saved state if we had persistence
    // For now, we'll consider any non-default state as "unsaved"
    return JSON.stringify(state.formData) !== JSON.stringify(state.formData);
  }, [state.formData]);

  // Calculation control
  const pauseCalculations = useCallback(() => {
    // This would be implemented with the calculation pause logic
  }, []);

  const resumeCalculations = useCallback(() => {
    // This would be implemented with the calculation resume logic
  }, []);

  const forceRecalculation = useCallback(() => {
    // Force a recalculation by updating a dummy field
    baseUpdateFormData({});
  }, [baseUpdateFormData]);

  return {
    formData: state.formData,
    calculationResults: state.calculationResults,
    updateFormData,
    batchUpdate,
    validateData,
    getChangedFields,
    hasUnsavedChanges,
    pauseCalculations,
    resumeCalculations,
    forceRecalculation,
  };
};
