import React from "react";
import { useLoanCalculations } from "../../hooks/useLoanCalculations";
import { usePortfolioInsights } from "../../hooks/usePortfolioInsights";
import { CalculationResults, FormDataSubset } from "../../types";
import {
  CashflowInsights,
  GrowthInsights,
  IncomeImpactInsights,
  LiquidationRiskInsights,
  PortfolioMixInsights,
} from "./insights";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
  getBtcPriceAtYear: (year: number) => number;
}

export const PortfolioInsightsSection: React.FC<Props> = ({
  results,
  formData,
  getBtcPriceAtYear,
}) => {
  const { calculateLoanDetails } = useLoanCalculations(
    formData,
    getBtcPriceAtYear,
  );
  const insightData = usePortfolioInsights(
    results,
    formData,
    getBtcPriceAtYear,
  );

  const dynamicLoanValues = calculateLoanDetails(formData.activationYear);

  const insights = [
    <GrowthInsights
      key="growth"
      insightData={insightData}
      formData={formData}
    />,
    <IncomeImpactInsights
      key="income-impact"
      insightData={insightData}
      formData={formData}
    />,
    <LiquidationRiskInsights
      key="liquidation-risk"
      insightData={insightData}
    />,
    <CashflowInsights
      key="cashflow"
      insightData={insightData}
      formData={formData}
      results={results}
      dynamicLoanValues={dynamicLoanValues}
    />,
    <PortfolioMixInsights
      key="portfolio-mix"
      insightData={insightData}
      formData={formData}
    />,
  ].filter(Boolean);

  return (
    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
      <h3 className="text-lg font-semibold text-indigo-800 mb-3">
        🧠 Portfolio Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.slice(0, 6)}
      </div>
    </div>
  );
};
