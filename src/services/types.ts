// Business logic services separated from components
import { CalculationResults, FormDataSubset } from "../types";

export interface AllocationService {
  validateAllocation: (allocation: {
    savingsPct: number;
    investmentsPct: number;
    speculationPct: number;
  }) => {
    isValid: boolean;
    error: string;
    total: number;
  };

  adjustAllocation: (
    current: {
      savingsPct: number;
      investmentsPct: number;
      speculationPct: number;
    },
    updates: Partial<{
      savingsPct: number;
      investmentsPct: number;
      speculationPct: number;
    }>,
    minThreshold?: number,
  ) => { savingsPct: number; investmentsPct: number; speculationPct: number };

  getHighlightStatus: (
    field: string,
    activeField: string | null,
  ) => {
    isHighlighted: boolean;
    classes: string;
  };
}

export interface CalculationService {
  calculatePortfolioGrowth: (
    results: CalculationResults,
    formData: FormDataSubset,
  ) => {
    btcGrowthWithIncome: number;
    btcGrowthWithoutIncome: number;
    btcGrowthDifference: number;
    finalBtcWithIncome: number;
    finalBtcWithoutIncome: number;
  };

  calculateCashflows: (
    results: CalculationResults,
    formData: FormDataSubset,
  ) => {
    activationYear: { withoutLeverage: number; withLeverage: number };
    finalYear: { withoutLeverage: number; withLeverage: number };
  };

  calculatePortfolioMix: (
    results: CalculationResults,
    formData: FormDataSubset,
  ) => {
    finalSavingsPct: number;
    finalInvestmentsPct: number;
    finalSpeculationPct: number;
    mixChange: number;
  };

  formatCurrency: (value: number) => { formatted: string; isPositive: boolean };

  calculateCAGR: (annualRates: number[], timeHorizon: number) => number;
}

export interface LoanService {
  calculateLoanDetails: (
    formData: FormDataSubset,
    getBtcPriceAtYear: (year: number) => number,
    activationYear: number,
  ) => {
    loanAmount: number;
    monthlyPayment: number;
    liquidationPrice: number;
    totalInterest: number;
    riskLevel: "low" | "moderate" | "high" | "extreme";
  };

  validateLoanConfiguration: (formData: FormDataSubset) => {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
}

export interface ValidationService {
  validateFormData: (formData: FormDataSubset) => {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: Record<string, string>;
  };

  validateTimeHorizon: (timeHorizon: number) => {
    isValid: boolean;
    message?: string;
  };

  validateBtcStack: (btcStack: number) => {
    isValid: boolean;
    message?: string;
  };

  validateYieldRates: (
    startYield: number,
    endYield: number,
  ) => { isValid: boolean; message?: string };
}
