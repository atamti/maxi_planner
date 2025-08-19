import { ScenarioKey } from "./config/economicScenarios";

// Common type for rate configuration (used by both inflation and BTC price)
export type InputType = "flat" | "linear" | "preset" | "manual" | "saylor";
export type Mode = "simple" | "advanced";

// Rate configuration interface for both inflation and BTC price
export interface RateConfig {
  mode: Mode;
  inputType: InputType;
  flat: number;
  start: number;
  end: number;
  preset: ScenarioKey;
  customRates: number[];
  manualMode: boolean;
}

// Portfolio allocation interface
export interface PortfolioAllocation {
  savingsPct: number;
  investmentsPct: number;
  speculationPct: number;
  collateralPct: number;
}

// Yield configuration interface
export interface YieldConfig {
  investmentsStartYield: number;
  investmentsEndYield: number;
  speculationStartYield: number;
  speculationEndYield: number;
  incomeYield: number;
  incomeReinvestmentPct: number;
}

// Loan configuration interface
export interface LoanConfig {
  loanRate: number;
  loanTermYears: number;
  interestOnly: boolean;
}

// The main FormData interface with flat structure for backward compatibility
export interface FormData {
  // Basic portfolio configuration
  btcStack: number;
  exchangeRate: number;
  timeHorizon: number;
  activationYear: number;
  priceCrash: number;

  // Portfolio allocations
  savingsPct: number;
  investmentsPct: number;
  speculationPct: number;
  collateralPct: number;

  // Allocation strategy
  enableAnnualReallocation: boolean;

  // Loan configuration
  loanRate: number;
  loanTermYears: number;
  interestOnly: boolean;

  // LTV ratio - new field for controlling the starting LTV ratio from 0% to 50%
  ltvRatio: number;

  // Yield settings
  investmentsStartYield: number;
  investmentsEndYield: number;
  speculationStartYield: number;
  speculationEndYield: number;
  incomeYield: number;
  incomeReinvestmentPct: number;

  // Income configuration
  incomeAllocationPct: number;
  startingExpenses: number;

  // Economic scenario configuration
  economicScenario: ScenarioKey;
  followEconomicScenarioInflation: boolean;
  followEconomicScenarioBtc: boolean;
  followEconomicScenarioIncome: boolean;

  // Inflation settings - flat structure for backward compatibility
  inflationMode: Mode;
  inflationInputType: "flat" | "linear" | "preset";
  inflationFlat: number;
  inflationStart: number;
  inflationEnd: number;
  inflationPreset: ScenarioKey;
  inflationCustomRates: number[];
  inflationManualMode: boolean;

  // BTC Price settings - flat structure for backward compatibility
  btcPriceMode: Mode;
  btcPriceInputType: "flat" | "linear" | "preset" | "saylor" | "manual";
  btcPriceFlat: number;
  btcPriceStart: number;
  btcPriceEnd: number;
  btcPricePreset: ScenarioKey;
  btcPriceCustomRates: number[];
  btcPriceManualMode: boolean;

  // Income settings - flat structure for backward compatibility
  incomeMode: Mode;
  incomeInputType: "flat" | "linear" | "preset" | "manual";
  incomeFlat: number;
  incomeStart: number;
  incomeEnd: number;
  incomePreset: ScenarioKey;
  incomeCustomRates: number[];
  incomeManualMode: boolean;
}

// Centralized subset type for components that need specific FormData properties
export interface FormDataSubset {
  timeHorizon: number;
  exchangeRate: number;
  priceCrash: number;
  speculationPct: number;
  collateralPct: number;
  ltvRatio: number;
  loanRate: number;
  loanTermYears: number;
  interestOnly: boolean;
  investmentsStartYield: number;
  investmentsEndYield: number;
  speculationStartYield: number;
  speculationEndYield: number;
  activationYear: number;
  btcPriceCustomRates: number[];
  inflationCustomRates: number[];
  incomeCustomRates: number[];
  startingExpenses: number;
  savingsPct: number;
  investmentsPct: number;
  btcStack: number;
  incomeAllocationPct: number; // Add missing income allocation
  enableAnnualReallocation: boolean; // Allocation strategy toggle
}

export interface Result {
  year: number;
  btcWithIncome: number;
  btcWithoutIncome: number;
}

export interface CalculationResults {
  results: Result[];
  usdIncome: number[];
  usdIncomeWithLeverage: number[];
  btcIncome: number[];
  annualExpenses: number[];
  incomeAtActivationYears: number[];
  incomeAtActivationYearsWithLeverage: number[];
  expensesAtActivationYears: number[];
  loanPrincipal: number;
  loanInterest: number;
  btcAppreciationAverage: number; // Centralized BTC appreciation average (CAGR)
}
