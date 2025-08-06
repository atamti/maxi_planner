// Centralized state types for the refactored architecture
import { ScenarioKey } from "../config/economicScenarios";
import { CalculationResults, FormData } from "../types";

// Core application state
export interface AppState {
  // Form data - the main configuration state
  formData: FormData;

  // Derived/computed state
  calculationResults: CalculationResults;

  // UI state
  ui: UIState;

  // Cached scenario data
  scenarios: ScenarioState;
}

// UI state management
export interface UIState {
  showUSD: boolean;
  allocationError: string;
  activeSection: string | null;
  isCalculating: boolean;
  expandedSections: Record<string, boolean>;
}

// Scenario management state
export interface ScenarioState {
  // Cached economic scenarios
  economicScenarios: Record<ScenarioKey, any>;

  // Rate calculations cache
  rateCache: {
    inflation: number[];
    btcPrice: number[];
    income: number[];
  };

  // Scenario sync status
  syncStatus: {
    inflation: boolean;
    btcPrice: boolean;
    income: boolean;
  };
}

// Action types for state updates
export type AppAction =
  | { type: "UPDATE_FORM_DATA"; payload: Partial<FormData> }
  | { type: "RESET_FORM_DATA" }
  | { type: "SET_CALCULATION_RESULTS"; payload: CalculationResults }
  | { type: "UPDATE_UI_STATE"; payload: Partial<UIState> }
  | { type: "UPDATE_SCENARIO_STATE"; payload: Partial<ScenarioState> }
  | { type: "TOGGLE_SECTION"; payload: string }
  | { type: "SET_ALLOCATION_ERROR"; payload: string }
  | {
      type: "SYNC_SCENARIO";
      payload: { type: "inflation" | "btcPrice" | "income"; rates: number[] };
    };

// State selectors for computed values
export interface StateSelectors {
  // Form data selectors
  getAllocationPercentages: () => {
    savingsPct: number;
    investmentsPct: number;
    speculationPct: number;
  };
  getTotalAllocation: () => number;
  isAllocationValid: () => boolean;

  // Calculation selectors
  getBtcPriceAtYear: (year: number) => number;
  getInflationAtYear: (year: number) => number;
  getIncomeAtYear: (year: number) => number;

  // UI selectors
  isSectionExpanded: (sectionId: string) => boolean;
  hasCalculationResults: () => boolean;
}
