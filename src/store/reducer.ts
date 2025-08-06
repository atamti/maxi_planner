// Central state reducer for the application
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { ScenarioKey } from "../config/economicScenarios";
import { AppAction, AppState, ScenarioState, UIState } from "./types";

// Initial state
const initialUIState: UIState = {
  showUSD: false,
  allocationError: "",
  activeSection: null,
  isCalculating: false,
  expandedSections: {
    "portfolio-setup": true,
    "economic-scenarios": false,
    "market-assumptions": false,
    leverage: false,
    "income-cashflow": false,
  },
};

const initialScenarioState: ScenarioState = {
  economicScenarios: {} as Record<ScenarioKey, any>,
  rateCache: {
    inflation: [],
    btcPrice: [],
    income: [],
  },
  syncStatus: {
    inflation: false,
    btcPrice: false,
    income: false,
  },
};

export const initialState: AppState = {
  formData: DEFAULT_FORM_DATA,
  calculationResults: {
    results: [],
    usdIncome: [],
    usdIncomeWithLeverage: [],
    btcIncome: [],
    annualExpenses: [],
    incomeAtActivationYears: [],
    incomeAtActivationYearsWithLeverage: [],
    expensesAtActivationYears: [],
    loanPrincipal: 0,
    loanInterest: 0,
  },
  ui: initialUIState,
  scenarios: initialScenarioState,
};

// State reducer
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "UPDATE_FORM_DATA": {
      const newFormData = { ...state.formData, ...action.payload };

      // Auto-calculate allocation error when allocation changes
      let newAllocationError = state.ui.allocationError;
      if (
        "savingsPct" in action.payload ||
        "investmentsPct" in action.payload ||
        "speculationPct" in action.payload
      ) {
        const total =
          newFormData.savingsPct +
          newFormData.investmentsPct +
          newFormData.speculationPct;
        newAllocationError =
          total !== 100
            ? `Allocations must sum to 100% (current: ${total}%)`
            : "";
      }

      return {
        ...state,
        formData: newFormData,
        ui: {
          ...state.ui,
          allocationError: newAllocationError,
          isCalculating: true, // Signal that recalculation is needed
        },
      };
    }

    case "RESET_FORM_DATA": {
      return {
        ...state,
        formData: DEFAULT_FORM_DATA,
        ui: {
          ...state.ui,
          allocationError: "",
          isCalculating: true,
        },
      };
    }

    case "SET_CALCULATION_RESULTS": {
      return {
        ...state,
        calculationResults: action.payload,
        ui: {
          ...state.ui,
          isCalculating: false,
        },
      };
    }

    case "UPDATE_UI_STATE": {
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload,
        },
      };
    }

    case "UPDATE_SCENARIO_STATE": {
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          ...action.payload,
        },
      };
    }

    case "TOGGLE_SECTION": {
      const sectionId = action.payload;
      return {
        ...state,
        ui: {
          ...state.ui,
          expandedSections: {
            ...state.ui.expandedSections,
            [sectionId]: !state.ui.expandedSections[sectionId],
          },
        },
      };
    }

    case "SET_ALLOCATION_ERROR": {
      return {
        ...state,
        ui: {
          ...state.ui,
          allocationError: action.payload,
        },
      };
    }

    case "SYNC_SCENARIO": {
      const { type, rates } = action.payload;
      return {
        ...state,
        scenarios: {
          ...state.scenarios,
          rateCache: {
            ...state.scenarios.rateCache,
            [type]: rates,
          },
          syncStatus: {
            ...state.scenarios.syncStatus,
            [type]: true,
          },
        },
      };
    }

    default:
      return state;
  }
}
