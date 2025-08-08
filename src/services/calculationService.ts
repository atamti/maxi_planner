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

    // Enhanced mathematical robustness: Check for division by zero and handle edge cases
    if (formData.btcStack === 0) {
      return {
        btcGrowthWithIncome: finalBtcWithIncome === 0 ? 0 : Infinity,
        btcGrowthWithoutIncome: finalBtcWithoutIncome === 0 ? 0 : Infinity,
        btcGrowthDifference: NaN, // Infinity - Infinity = NaN
        finalBtcWithIncome,
        finalBtcWithoutIncome,
      };
    }

    // Enhanced mathematical robustness: Apply proper rounding to prevent floating point precision errors
    let btcGrowthWithIncome =
      ((finalBtcWithIncome - formData.btcStack) / formData.btcStack) * 100;
    let btcGrowthWithoutIncome =
      ((finalBtcWithoutIncome - formData.btcStack) / formData.btcStack) * 100;

    // Handle special cases before rounding
    if (isFinite(btcGrowthWithIncome)) {
      btcGrowthWithIncome = Math.round(btcGrowthWithIncome * 100) / 100;
    }
    if (isFinite(btcGrowthWithoutIncome)) {
      btcGrowthWithoutIncome = Math.round(btcGrowthWithoutIncome * 100) / 100;
    }

    let btcGrowthDifference = btcGrowthWithoutIncome - btcGrowthWithIncome;
    if (isFinite(btcGrowthDifference)) {
      btcGrowthDifference = Math.round(btcGrowthDifference * 100) / 100;
    }

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
    // Enhanced mathematical robustness: Guard against zero time horizon
    if (formData.timeHorizon <= 0) {
      return {
        finalSavingsPct: formData.savingsPct,
        finalInvestmentsPct: formData.investmentsPct,
        finalSpeculationPct: formData.speculationPct,
        mixChange: 0,
      };
    }

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

    // Enhanced mathematical robustness: Guard against division by zero in total allocation
    const totalAllocation =
      formData.savingsPct +
      formData.investmentsPct * investmentGrowth +
      formData.speculationPct * speculationGrowth;

    if (totalAllocation === 0) {
      return {
        finalSavingsPct: 0,
        finalInvestmentsPct: 0,
        finalSpeculationPct: 0,
        mixChange: 0,
      };
    }

    const finalInvestmentsPct =
      ((formData.investmentsPct * investmentGrowth) / totalAllocation) * 100;
    const finalSpeculationPct =
      ((formData.speculationPct * speculationGrowth) / totalAllocation) * 100;
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
    // Enhanced mathematical robustness: Handle special numeric values
    if (!isFinite(value)) {
      if (value === Infinity) {
        return { formatted: "$∞", isPositive: true };
      }
      if (value === -Infinity) {
        return { formatted: "($∞)", isPositive: false };
      }
      if (isNaN(value)) {
        return { formatted: "$--", isPositive: true };
      }
    }

    const isPositive = value >= 0;
    const roundedValue = Math.round(value);

    const formatted = isPositive
      ? roundedValue.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : `(${Math.abs(roundedValue).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
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
