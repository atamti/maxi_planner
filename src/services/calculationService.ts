// Calculation business logic service
import { CalculationResults, FormDataSubset } from "../types";
import { CalculationService } from "./types";

export const createCalculationService = (): CalculationService => {
  const calculatePortfolioGrowth = (
    results: CalculationResults,
    formData: FormDataSubset,
  ) => {
    const { results: calculationResults } = results;

    const finalBtcWithIncome =
      calculationResults[calculationResults.length - 1]?.btcWithIncome || 0;
    const finalBtcWithoutIncome =
      calculationResults[calculationResults.length - 1]?.btcWithoutIncome || 0;

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

  const calculateCashflows = (
    results: CalculationResults,
    formData: FormDataSubset,
  ) => {
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

  const calculatePortfolioMix = (
    results: CalculationResults,
    formData: FormDataSubset,
  ) => {
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

  const formatCurrency = (
    value: number,
  ): { formatted: string; isPositive: boolean } => {
    const isPositive = value >= 0;
    const formatted = isPositive
      ? value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        })
      : `(${Math.abs(value).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        })})`;

    return { formatted, isPositive };
  };

  return {
    calculatePortfolioGrowth,
    calculateCashflows,
    calculatePortfolioMix,
    formatCurrency,
  };
};
