import { useMemo } from "react";
import { CalculationResults, FormDataSubset } from "../types";
import { useLoanCalculations } from "./useLoanCalculations";
import { usePortfolioAnalysis } from "./usePortfolioAnalysis";

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

export const usePortfolioInsights = (
  results: CalculationResults,
  formData: FormDataSubset,
  getBtcPriceAtYear: (year: number) => number,
): InsightData => {
  const { calculateLoanDetails } = useLoanCalculations(
    formData,
    getBtcPriceAtYear,
  );
  const { calculateCashflows, calculatePortfolioGrowth } = usePortfolioAnalysis(
    results,
    formData,
  );

  return useMemo(() => {
    const portfolioGrowth = calculatePortfolioGrowth();
    const cashflows = calculateCashflows();
    const dynamicLoanValues = calculateLoanDetails(formData.activationYear);

    const {
      btcGrowthWithIncome,
      btcGrowthWithoutIncome,
      finalBtcWithIncome,
      finalBtcWithoutIncome,
    } = portfolioGrowth;

    const btcGrowthDifference = btcGrowthWithoutIncome - btcGrowthWithIncome;

    // Liquidation risk analysis
    let liquidationData: InsightData["liquidationData"];
    if (formData.collateralPct > 0 && dynamicLoanValues) {
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

      portfolioMix = {
        finalSavingsPct,
        finalInvestmentsPct,
        finalSpeculationPct,
        mixChange,
      };
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
};
