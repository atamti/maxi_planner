import { FormData } from "../types";

export const DEFAULT_FORM_DATA: FormData = {
  btcStack: 5,
  savingsPct: 65,
  investmentsPct: 25,
  speculationPct: 10,
  collateralPct: 50,
  enableAnnualReallocation: true, // Default to annual reallocation (traditional portfolio management)
  loanRate: 7,
  loanTermYears: 10,
  interestOnly: true,
  ltvRatio: 40,
  investmentsStartYield: 30,
  investmentsEndYield: 0,
  speculationStartYield: 40,
  speculationEndYield: 0,
  priceCrash: 0,
  exchangeRate: 100000,
  timeHorizon: 20,
  activationYear: 10,

  // Economic scenario
  economicScenario: "debasement",
  followEconomicScenarioInflation: true,
  followEconomicScenarioBtc: true,

  // USD Inflation - Fix to match economic scenario
  inflationMode: "simple",
  inflationInputType: "preset", // Should be preset, not flat
  inflationFlat: 8,
  inflationStart: 5,
  inflationEnd: 15,
  inflationPreset: "debasement", // This should match economicScenario
  inflationCustomRates: Array(30).fill(8), // Will be updated by scenario
  inflationManualMode: false,

  // BTC Price Appreciation - Also fix this to match
  btcPriceMode: "simple",
  btcPriceInputType: "preset" as
    | "flat"
    | "linear"
    | "preset"
    | "saylor"
    | "manual",
  btcPriceFlat: 50,
  btcPriceStart: 30,
  btcPriceEnd: 70,
  btcPricePreset: "debasement", // This should match economicScenario
  btcPriceCustomRates: Array(30).fill(50), // Will be updated by scenario
  btcPriceManualMode: false,

  // Income section - Fix to match economic scenario
  incomeYield: 8, // This old field might be causing confusion
  incomeAllocationPct: 10,
  incomeReinvestmentPct: 30,

  // New income system - Fix to match economic scenario
  startingExpenses: 50000,
  followEconomicScenarioIncome: true,
  incomeMode: "simple",
  incomeInputType: "preset", // Should be preset, not flat
  incomeFlat: 8,
  incomeStart: 8,
  incomeEnd: 8,
  incomePreset: "debasement", // This should match economicScenario
  incomeCustomRates: Array(30).fill(8), // Will be updated by scenario
  incomeManualMode: false,
};
