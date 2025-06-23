import { ScenarioKey } from "./config/economicScenarios";

export interface FormData {
  btcStack: number;
  savingsPct: number;
  investmentsPct: number;
  speculationPct: number;
  collateralPct: number;
  loanRate: number;
  loanTermYears: number;
  interestOnly: boolean;
  incomeYield: number;
  incomeAllocationPct: number;
  incomeReinvestmentPct: number;
  investmentsStartYield: number;
  investmentsEndYield: number;
  speculationStartYield: number;
  speculationEndYield: number;
  btcGrowth: number;
  priceCrash: number;
  exchangeRate: number;
  timeHorizon: number;
  activationYear: number;

  // Economic Scenarios
  economicScenario: ScenarioKey;
  followEconomicScenarioInflation: boolean;
  followEconomicScenarioBtc: boolean;

  // USD Inflation
  inflationMode: "simple" | "advanced";
  inflationInputType: "flat" | "linear" | "preset";
  inflationFlat: number;
  inflationStart: number;
  inflationEnd: number;
  inflationPreset: ScenarioKey;
  inflationCustomRates: number[]; // For advanced mode - array of 30 rates
  inflationManualMode: boolean; // Prevents auto-updates when user is manually editing

  // BTC Price Appreciation
  btcPriceMode: "simple" | "advanced";
  btcPriceInputType: "flat" | "linear" | "preset";
  btcPriceFlat: number;
  btcPriceStart: number;
  btcPriceEnd: number;
  btcPricePreset: ScenarioKey;
  btcPriceCustomRates: number[];
  btcPriceManualMode: boolean;
}

export interface EconomicScenarioDefinition {
  name: string;
  description: string;
  inflationAvg: number;
  btcAppreciationAvg: number;
  realIncomeGrowth: number;
  inflationPreset: ScenarioKey;
  btcPricePreset: ScenarioKey;
  incomePortfolioYieldPreset: ScenarioKey;
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
  incomeAtActivationYears: number[];
  incomeAtActivationYearsWithLeverage: number[];
  loanPrincipal: number;
  loanInterest: number;
}
