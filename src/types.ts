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
