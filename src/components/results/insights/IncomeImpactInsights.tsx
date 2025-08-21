import React from "react";
import { InsightData } from "../../../hooks/usePortfolioInsights";
import { FormDataSubset } from "../../../types";
import { formatNumber } from "../../../utils/formatNumber";

interface Props {
  insightData: InsightData;
  formData: FormDataSubset;
}

export const IncomeImpactInsights: React.FC<Props> = ({
  insightData,
  formData,
}) => {
  const { btcGrowthDifference, finalBtcWithIncome, finalBtcWithoutIncome } =
    insightData;

  if (formData.incomeAllocationPct === 0) {
    return (
      <div className="card-themed p-3 border border-accent">
        <p className="text-primary text-sm font-ui">
          📈 <strong>Pure Growth:</strong> No income allocation - focused on BTC
          appreciation
          <br />
          <span className="text-secondary">
            (100% stack growth potential: {formatNumber(formData.btcStack, 1)} →
            ~{formatNumber(finalBtcWithoutIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  }

  if (btcGrowthDifference > 50) {
    return (
      <div className="card-themed p-3 border border-accent">
        <p className="text-warning text-sm font-ui">
          🔥 <strong>High Income Cost:</strong> ~
          {Math.round(btcGrowthDifference / 10) * 10}% BTC growth sacrificed
          <br />
          <span className="text-secondary">
            (Could have ~{formatNumber(finalBtcWithoutIncome, 1)} BTC vs ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else if (btcGrowthDifference > 20) {
    return (
      <div className="card-themed p-3 border border-accent">
        <p className="text-warning text-sm font-ui">
          💰 <strong>Balanced Strategy:</strong> ~
          {Math.round(btcGrowthDifference / 5) * 5}% BTC growth traded for
          income
          <br />
          <span className="text-secondary">
            (Trade-off: ~
            {formatNumber(finalBtcWithoutIncome - finalBtcWithIncome, 1)} BTC
            for income stream)
          </span>
        </p>
      </div>
    );
  }

  return null;
};
