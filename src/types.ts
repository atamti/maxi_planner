export interface FormData {
  btcStack: number;
  savingsPct: number;
  investmentsPct: number;
  speculationPct: number;
  collateralPct: number;
  loanRate: number;
  incomeYield: number;
  investmentsStartYield: number;
  investmentsEndYield: number;
  speculationStartYield: number;
  speculationEndYield: number;
  btcGrowth: number;
  priceCrash: number;
  expenses: number;
  income: number;
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
  btcIncome: number[];
  riskScores: number[];
  loanPrincipal: number;
  loanInterest: number;
}
