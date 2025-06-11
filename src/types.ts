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

  // USD Inflation
  inflationMode: "simple" | "advanced";
  inflationInputType: "flat" | "linear" | "preset";
  inflationFlat: number;
  inflationStart: number;
  inflationEnd: number;
  inflationPreset: "managed" | "crisis" | "hyperinflation";
  inflationCustomRates: number[]; // For advanced mode - array of 30 rates
  inflationManualMode: boolean; // Prevents auto-updates when user is manually editing
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
