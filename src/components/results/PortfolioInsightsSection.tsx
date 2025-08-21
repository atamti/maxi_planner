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
    <div className="card-themed rounded-none p-6 border-2 border-navy-900 mb-8">
      <h3 className="font-poppins text-xl font-bold text-navy-900 mb-6 uppercase tracking-wide">
        🧠 PORTFOLIO INSIGHTS
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.slice(0, 6)}
      </div>
    </div>
  );
};
