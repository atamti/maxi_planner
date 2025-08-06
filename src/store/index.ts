// Centralized state management exports
export {
  CentralizedStateProvider,
  useCentralizedStateContext,
  usePortfolioCompat,
} from "./CentralizedStateProvider";
export { createScenarioManager } from "./scenarioManager";
export type { ScenarioManager } from "./scenarioManager";
export { createSelectors } from "./selectors";
export type {
  AppAction,
  AppState,
  ScenarioState,
  StateSelectors,
  UIState,
} from "./types";
export { useCentralizedState } from "./useCentralizedState";
export type { CentralizedState } from "./useCentralizedState";
