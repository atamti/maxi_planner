// New centralized state management hook
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useCalculations } from "../hooks/useCalculations";
import { FormData } from "../types";
import { appReducer, initialState } from "./reducer";
import { createScenarioManager } from "./scenarioManager";
import { createSelectors } from "./selectors";
import { AppState } from "./types";

export interface CentralizedState {
  // Current state
  state: AppState;

  // Core actions
  updateFormData: (updates: Partial<FormData>) => void;
  resetForm: () => void;

  // UI actions
  toggleSection: (sectionId: string) => void;
  setShowUSD: (show: boolean) => void;

  // Computed values via selectors
  selectors: ReturnType<typeof createSelectors>;

  // Scenario management
  scenarioManager: ReturnType<typeof createScenarioManager>;

  // Convenience getters for backward compatibility
  formData: FormData;
  calculationResults: AppState["calculationResults"];
  allocationError: string;
  showUSD: boolean;
}

export const useCentralizedState = (): CentralizedState => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Get calculations whenever form data changes
  const calculationResults = useCalculations(state.formData);

  // Update calculation results when they change
  useEffect(() => {
    dispatch({
      type: "SET_CALCULATION_RESULTS",
      payload: calculationResults,
    });
  }, [calculationResults]);

  // Core actions
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    dispatch({
      type: "UPDATE_FORM_DATA",
      payload: updates,
    });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM_DATA" });
  }, []);

  // UI actions
  const toggleSection = useCallback((sectionId: string) => {
    dispatch({
      type: "TOGGLE_SECTION",
      payload: sectionId,
    });
  }, []);

  const setShowUSD = useCallback((show: boolean) => {
    dispatch({
      type: "UPDATE_UI_STATE",
      payload: { showUSD: show },
    });
  }, []);

  // Create selectors
  const selectors = useMemo(() => createSelectors(state), [state]);

  // Create scenario manager
  const scenarioManager = useMemo(
    () => createScenarioManager(state.formData, dispatch),
    [state.formData],
  );

  return {
    state,
    updateFormData,
    resetForm,
    toggleSection,
    setShowUSD,
    selectors,
    scenarioManager,

    // Convenience getters for backward compatibility
    formData: state.formData,
    calculationResults: state.calculationResults,
    allocationError: state.ui.allocationError,
    showUSD: state.ui.showUSD,
  };
};
