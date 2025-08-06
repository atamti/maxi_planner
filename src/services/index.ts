// Services exports
export { createAllocationService } from "./allocationService";
export { createCalculationService } from "./calculationService";
export { createLoanService } from "./loanService";
export type {
  AllocationService,
  CalculationService,
  LoanService,
  ValidationService,
} from "./types";
export { createValidationService } from "./validationService";

// Clean data flow services exports
export { useDataFlowOrchestrator } from "./dataFlowOrchestrator";
export type { DataFlowOrchestrator } from "./dataFlowOrchestrator";

export {
  useEconomicScenariosData,
  useMarketAssumptionsData,
  usePortfolioSetupData,
  useResultsData,
} from "./componentDataBindings";
export type { FieldProps, SectionProps } from "./componentDataBindings";

export {
  useDataIntegrity,
  usePredictableUpdates,
  useSeparationOfConcerns,
  useSingleSourceOfTruth,
} from "./cleanDataFlow";
