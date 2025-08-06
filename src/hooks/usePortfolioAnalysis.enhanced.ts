import { useMemo } from "react";
import { CalculationResults, FormDataSubset } from "../types";
import { useLoanCalculations } from "./useLoanCalculations";

// Core analysis interfaces (from usePortfolioAnalysis)
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

// Enhanced insights interface (from usePortfolioInsights)
export interface InsightData {
  btcGrowthWithIncome: number;
  btcGrowthWithoutIncome: number;
  finalBtcWithIncome: number;
  finalBtcWithoutIncome: number;
  btcGrowthDifference: number;
  liquidationData?: {
    liquidationPrice: number;
    minBtcPrice: number;
    maxBtcPrice: number;
    liquidationBuffer: number;
  };
  cashflows: {
    activationYear: {
      withoutLeverage: number;
      withLeverage: number;
    };
  };
  portfolioMix?: {
    finalSavingsPct: number;
    finalInvestmentsPct: number;
    finalSpeculationPct: number;
    mixChange: number;
  };
}

/**
 * Enhanced portfolio analysis hook that consolidates:
 * - usePortfolioAnalysis: Core portfolio calculations (cashflows, growth, mix)
 * - usePortfolioInsights: Higher-level insights with loan integration
 *
 * Provides both granular analysis methods and comprehensive insight data
 */
export const usePortfolioAnalysisEnhanced = (
  results: CalculationResults,
  formData: FormDataSubset,
  getBtcPriceAtYear?: (year: number) => number,
) => {
  const { calculateLoanDetails } = useLoanCalculations(
    formData,
    getBtcPriceAtYear || (() => 0),
  );

  // Core analysis methods (from usePortfolioAnalysis)
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

    // Safety check: ensure we have calculation results
    const finalResult = calculationResults[calculationResults.length - 1];
    if (!finalResult) {
      return {
        btcGrowthWithIncome: 0,
        btcGrowthWithoutIncome: 0,
        btcGrowthDifference: 0,
        finalBtcWithIncome: formData.btcStack,
        finalBtcWithoutIncome: formData.btcStack,
      };
    }

    const finalBtcWithIncome = finalResult.btcWithIncome;
    const finalBtcWithoutIncome = finalResult.btcWithoutIncome;

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

  // Utility methods (from usePortfolioAnalysis)
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

  // Enhanced insights (from usePortfolioInsights)
  const getInsightData = useMemo((): InsightData => {
    const portfolioGrowth = calculatePortfolioGrowth();
    const cashflows = calculateCashflows();
    const dynamicLoanValues = getBtcPriceAtYear
      ? calculateLoanDetails(formData.activationYear)
      : null;

    const {
      btcGrowthWithIncome,
      btcGrowthWithoutIncome,
      finalBtcWithIncome,
      finalBtcWithoutIncome,
    } = portfolioGrowth;

    const btcGrowthDifference = btcGrowthWithoutIncome - btcGrowthWithIncome;

    // Liquidation risk analysis
    let liquidationData: InsightData["liquidationData"];
    if (formData.collateralPct > 0 && dynamicLoanValues && getBtcPriceAtYear) {
      const liquidationPrice = dynamicLoanValues.liquidationPrice;
      let minBtcPrice = Infinity;
      let maxBtcPrice = 0;

      for (
        let year = formData.activationYear;
        year <= formData.timeHorizon;
        year++
      ) {
        const btcPrice = getBtcPriceAtYear(year);
        minBtcPrice = Math.min(minBtcPrice, btcPrice);
        maxBtcPrice = Math.max(maxBtcPrice, btcPrice);
      }

      if (minBtcPrice !== Infinity) {
        const liquidationBuffer =
          ((minBtcPrice - liquidationPrice) / liquidationPrice) * 100;

        liquidationData = {
          liquidationPrice,
          minBtcPrice,
          maxBtcPrice,
          liquidationBuffer,
        };
      }
    }

    // Portfolio mix evolution
    let portfolioMix: InsightData["portfolioMix"];
    if (formData.savingsPct < 100) {
      const mixEvolution = calculatePortfolioMixEvolution();
      portfolioMix = mixEvolution;
    }

    return {
      btcGrowthWithIncome,
      btcGrowthWithoutIncome,
      finalBtcWithIncome,
      finalBtcWithoutIncome,
      btcGrowthDifference,
      liquidationData,
      cashflows,
      portfolioMix,
    };
  }, [
    results,
    formData,
    getBtcPriceAtYear,
    calculateLoanDetails,
    calculateCashflows,
    calculatePortfolioGrowth,
  ]);

  return {
    // Core analysis methods (usePortfolioAnalysis API)
    calculateCashflows,
    calculatePortfolioGrowth,
    calculatePortfolioMixEvolution,
    formatCashflow,
    getGrowthCategory,
    getRiskLevel,

    // Enhanced insights (usePortfolioInsights API)
    insightData: getInsightData,

    // Convenience methods for backward compatibility
    getInsightData: () => getInsightData,
  };
};
