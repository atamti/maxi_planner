import { FormData } from "../types";

export const DEFAULT_FORM_DATA: FormData = {
  btcStack: 5,
  savingsPct: 65,
  investmentsPct: 25,
  speculationPct: 10,
  collateralPct: 50,
  loanRate: 7,
  loanTermYears: 10,
  interestOnly: true,
  incomeYield: 20,
  incomeAllocationPct: 10,
  incomeReinvestmentPct: 5,
  investmentsStartYield: 30,
  investmentsEndYield: 10,
  speculationStartYield: 40,
  speculationEndYield: 10,
  btcGrowth: 50,
  priceCrash: 0,
  exchangeRate: 100000,
  timeHorizon: 20,
  activationYear: 5,

  // Economic scenario
  economicScenario: "debasement",
  followEconomicScenarioInflation: true,
  followEconomicScenarioBtc: true,

  // USD Inflation
  inflationMode: "simple",
  inflationInputType: "flat",
  inflationFlat: 8,
  inflationStart: 5,
  inflationEnd: 15,
  inflationPreset: "debasement",
  inflationCustomRates: Array(30).fill(8), // Default 8% for all years
  inflationManualMode: false,

  // BTC Price Appreciation
  btcPriceMode: "simple",
  btcPriceInputType: "preset",
  btcPriceFlat: 50,
  btcPriceStart: 30,
  btcPriceEnd: 70,
  btcPricePreset: "debasement",
  btcPriceCustomRates: Array(30).fill(50), // Default 50% for all years
  btcPriceManualMode: false,

  // Add missing income-related properties
  startingExpenses: 50000,
  followEconomicScenarioIncome: true,
  incomeMode: "simple",
  incomeInputType: "preset",
  incomeFlat: 8,
  incomeStart: 8,
  incomeEnd: 8,
  incomePreset: "debasement",
  incomeCustomRates: Array(30).fill(8), // Default 8% for all years
  incomeManualMode: false,
};
