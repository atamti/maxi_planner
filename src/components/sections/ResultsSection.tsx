import React, { useCallback } from "react";
import { CalculationResults, FormDataSubset } from "../../types";
import { ChartsSection } from "../results/ChartsSection";
import { EscapeVelocitySection } from "../results/EscapeVelocitySection";
import { FinalBtcStackCard } from "../results/FinalBtcStackCard";
import { FinalYearCard } from "../results/FinalYearCard";
import { IncomeActivationCard } from "../results/IncomeActivationCard";
import { LoanDetailsCard } from "../results/LoanDetailsCard";
import { PortfolioInsightsSection } from "../results/PortfolioInsightsSection";
import { RiskInsightsSection } from "../results/RiskInsightsSection";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
  showUSD: boolean;
  onUpdateFormData?: (updates: { activationYear: number }) => void;
}

export const ResultsSection: React.FC<Props> = ({
  results,
  formData,
  showUSD,
  onUpdateFormData,
}) => {
  const { results: calculationResults } = results;

  // Helper function to get BTC price at a specific year using custom rates
  const getBtcPriceAtYear = useCallback(
    (year: number): number => {
      let price = formData.exchangeRate;
      for (let i = 0; i < year; i++) {
        const appreciationRate =
          (formData.btcPriceCustomRates?.[i] || 50) / 100;
        price = price * (1 + appreciationRate);
      }
      return price;
    },
    [formData.exchangeRate, formData.btcPriceCustomRates],
  );

  return (
    <div className="card-themed rounded-none p-4">
      <h2 className="font-poppins text-2xl font-bold text-primary mb-4 uppercase tracking-wide">
        RESULTS
      </h2>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Section 1: Final BTC Stack */}
        <FinalBtcStackCard
          calculationResults={calculationResults}
          formData={formData}
          showUSD={showUSD}
          getBtcPriceAtYear={getBtcPriceAtYear}
        />

        {/* Section 2: Income Activation Year Analysis */}
        <IncomeActivationCard results={results} formData={formData} />

        {/* Section 3: Final Year Analysis */}
        <FinalYearCard results={results} formData={formData} />

        {/* Section 4: Loan Details */}
        <LoanDetailsCard
          formData={formData}
          getBtcPriceAtYear={getBtcPriceAtYear}
        />
      </div>

      {/* Portfolio Insights Section - Spans full width below first row */}
      <PortfolioInsightsSection
        results={results}
        formData={formData}
        getBtcPriceAtYear={getBtcPriceAtYear}
      />

      {/* Escape Velocity Section */}
      <EscapeVelocitySection
        results={results}
        formData={formData}
        getBtcPriceAtYear={getBtcPriceAtYear}
      />

      {/* Risk Insights Section */}
      <RiskInsightsSection
        results={results}
        formData={formData}
        getBtcPriceAtYear={getBtcPriceAtYear}
      />

      {/* Charts Section */}
      <ChartsSection
        results={results}
        formData={formData}
        getBtcPriceAtYear={getBtcPriceAtYear}
        onUpdateFormData={onUpdateFormData}
      />
    </div>
  );
};
