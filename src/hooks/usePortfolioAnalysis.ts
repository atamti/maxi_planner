import { CalculationResults, FormDataSubset } from "../types";

export interface CashflowAnalysis {
  activationYear: {
    withoutLeverage: number;
    withLeverage: number;
  };
  finalYear: {
    withoutLeverage: number;
    withLeverage: number;
  };
}

export interface PortfolioGrowthAnalysis {
  btcGrowthWithIncome: number;
  btcGrowthWithoutIncome: number;
  btcGrowthDifference: number;
  finalBtcWithIncome: number;
  finalBtcWithoutIncome: number;
}

export interface PortfolioMixEvolution {
  finalSavingsPct: number;
  finalInvestmentsPct: number;
  finalSpeculationPct: number;
  mixChange: number;
}

/**
 * Custom hook for portfolio analysis calculations
 * Consolidates complex portfolio analysis logic
 */
export const usePortfolioAnalysis = (
  results: CalculationResults,
  formData: FormDataSubset,
) => {
  const calculateCashflows = (): CashflowAnalysis => {
    const activationYearExpenses =
      results.annualExpenses[formData.activationYear] || 0;
    const finalYearExpenses =
      results.annualExpenses[results.annualExpenses.length - 1] || 0;

    const activationYearIncome =
      results.usdIncome[formData.activationYear] || 0;
    const activationYearIncomeWithLeverage =
      results.usdIncomeWithLeverage[formData.activationYear] || 0;

    const finalYearIncome =
      results.usdIncome[results.usdIncome.length - 1] || 0;
    const finalYearIncomeWithLeverage =
      results.usdIncomeWithLeverage[results.usdIncomeWithLeverage.length - 1] ||
      0;

    return {
      activationYear: {
        withoutLeverage: activationYearIncome - activationYearExpenses,
        withLeverage: activationYearIncomeWithLeverage - activationYearExpenses,
      },
      finalYear: {
        withoutLeverage: finalYearIncome - finalYearExpenses,
        withLeverage: finalYearIncomeWithLeverage - finalYearExpenses,
      },
    };
  };

  const calculatePortfolioGrowth = (): PortfolioGrowthAnalysis => {
    const { results: calculationResults } = results;

    const finalBtcWithIncome =
      calculationResults[calculationResults.length - 1].btcWithIncome;
    const finalBtcWithoutIncome =
      calculationResults[calculationResults.length - 1].btcWithoutIncome;

    const btcGrowthWithIncome =
      ((finalBtcWithIncome - formData.btcStack) / formData.btcStack) * 100;
    const btcGrowthWithoutIncome =
      ((finalBtcWithoutIncome - formData.btcStack) / formData.btcStack) * 100;
    const btcGrowthDifference = btcGrowthWithoutIncome - btcGrowthWithIncome;

    return {
      btcGrowthWithIncome,
      btcGrowthWithoutIncome,
      btcGrowthDifference,
      finalBtcWithIncome,
      finalBtcWithoutIncome,
    };
  };

  const calculatePortfolioMixEvolution = (): PortfolioMixEvolution => {
    const { finalBtcWithIncome } = calculatePortfolioGrowth();

    // Calculate what investments and speculation would be at final year
    let investmentGrowth = 1;
    let speculationGrowth = 1;

    for (let year = 0; year < formData.timeHorizon; year++) {
      const investmentsYield =
        formData.investmentsStartYield -
        (formData.investmentsStartYield - formData.investmentsEndYield) *
          (year / formData.timeHorizon);
      const speculationYield =
        formData.speculationStartYield -
        (formData.speculationStartYield - formData.speculationEndYield) *
          (year / formData.timeHorizon);

      investmentGrowth *= 1 + investmentsYield / 100;
      speculationGrowth *= 1 + speculationYield / 100;
    }

    const finalInvestmentsPct =
      ((formData.investmentsPct * investmentGrowth) /
        (formData.savingsPct +
          formData.investmentsPct * investmentGrowth +
          formData.speculationPct * speculationGrowth)) *
      100;
    const finalSpeculationPct =
      ((formData.speculationPct * speculationGrowth) /
        (formData.savingsPct +
          formData.investmentsPct * investmentGrowth +
          formData.speculationPct * speculationGrowth)) *
      100;
    const finalSavingsPct = 100 - finalInvestmentsPct - finalSpeculationPct;

    const mixChange = Math.abs(finalSavingsPct - formData.savingsPct);

    return {
      finalSavingsPct,
      finalInvestmentsPct,
      finalSpeculationPct,
      mixChange,
    };
  };

  const formatCashflow = (
    value: number,
  ): { formatted: string; isPositive: boolean } => {
    const isPositive = value >= 0;
    const formatted = isPositive
      ? value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        })
      : `(${Math.abs(value).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })})`;

    return { formatted, isPositive };
  };

  const getGrowthCategory = (
    growthPercent: number,
  ): "exponential" | "huge" | "strong" | "moderate" | "decline" => {
    if (growthPercent > 1000) return "exponential";
    if (growthPercent > 500) return "huge";
    if (growthPercent > 200) return "strong";
    if (growthPercent > 0) return "moderate";
    return "decline";
  };

  const getRiskLevel = (
    percentage: number,
  ): "low" | "moderate" | "high" | "extreme" => {
    if (percentage < 25) return "extreme";
    if (percentage < 50) return "high";
    if (percentage < 100) return "moderate";
    return "low";
  };

  return {
    calculateCashflows,
    calculatePortfolioGrowth,
    calculatePortfolioMixEvolution,
    formatCashflow,
    getGrowthCategory,
    getRiskLevel,
  };
};
