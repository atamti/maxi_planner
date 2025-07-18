import React from "react";
import { InsightData } from "../../../hooks/usePortfolioInsights";
import { FormDataSubset } from "../../../types";

interface Props {
  insightData: InsightData;
  formData: FormDataSubset;
}

export const PortfolioMixInsights: React.FC<Props> = ({
  insightData,
  formData,
}) => {
  const { portfolioMix } = insightData;

  if (!portfolioMix || portfolioMix.mixChange <= 5) {
    return null;
  }

  const { finalSavingsPct, finalInvestmentsPct, finalSpeculationPct } =
    portfolioMix;

  return (
    <div className="bg-white p-3 rounded border">
      <p className="text-blue-700 text-sm">
        📊 <strong>Portfolio Drift:</strong> Mix shifts from{" "}
        {formData.savingsPct}/{formData.investmentsPct}/
        {formData.speculationPct}% to approximately{" "}
        {Math.round(finalSavingsPct / 5) * 5}/
        {Math.round(finalInvestmentsPct / 5) * 5}/
        {Math.round(finalSpeculationPct / 5) * 5}%
        <br />
        <span className="text-gray-600">
          (Savings/Investments/Speculation - no rebalancing)
        </span>
      </p>
    </div>
  );
};
