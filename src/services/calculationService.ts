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

  // Calculate simple arithmetic average for display purposes
  const calculateSimpleAverage = (
    rates: number[],
    timeHorizon?: number,
  ): number => {
    if (!rates || rates.length === 0) return 0;

    // Filter out invalid rates (NaN, Infinity)
    const validRates = rates.filter((rate) => !isNaN(rate) && isFinite(rate));
    if (validRates.length === 0) return 0;

    // Use timeHorizon to limit the calculation if provided
    const ratesToUse = timeHorizon 
      ? validRates.slice(0, timeHorizon)
      : validRates;

    if (ratesToUse.length === 0) return 0;

    const sum = ratesToUse.reduce((acc, rate) => acc + rate, 0);
    const average = sum / ratesToUse.length;

    return parseFloat(average.toFixed(1));
  };

  // Calculate CAGR (Compound Annual Growth Rate) from annual rates
  const calculateCAGR = (
    annualRates: number[],
    timeHorizon: number,
  ): number => {
    if (!annualRates || annualRates.length === 0 || timeHorizon <= 0) return 0;

    // Use rates from Year 0 to Year timeHorizon-1 (full planning period)
    const ratesToUse = annualRates.slice(0, timeHorizon);

    if (ratesToUse.length === 0) return 0;

    // Convert percentage rates to growth multipliers and compound them
    // Example: 30% rate becomes 1.30, 50% becomes 1.50
    const compoundedGrowth = ratesToUse.reduce((compound, rate) => {
      return compound * (1 + rate / 100);
    }, 1);

    // Calculate CAGR: (Final Value / Initial Value)^(1/years) - 1
    // Since we start with 1 (100%), Initial Value = 1, Final Value = compoundedGrowth
    const years = ratesToUse.length;
    const cagr = (Math.pow(compoundedGrowth, 1 / years) - 1) * 100;
    const result = parseFloat(cagr.toFixed(1));

    return result;
  };

  return {
    calculatePortfolioGrowth,
    calculateCashflows,
    calculatePortfolioMix,
    formatCurrency,
    calculateCAGR,
    calculateSimpleAverage,
  };
};
