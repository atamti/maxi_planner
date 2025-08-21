import React from "react";
import { InsightData } from "../../../hooks/usePortfolioInsights";
import { FormDataSubset } from "../../../types";
import { formatNumber } from "../../../utils/formatNumber";

interface Props {
  insightData: InsightData;
  formData: FormDataSubset;
}

export const GrowthInsights: React.FC<Props> = ({ insightData, formData }) => {
  const { btcGrowthWithIncome, finalBtcWithIncome } = insightData;

  if (btcGrowthWithIncome > 1000) {
    return (
      <div className="card-themed p-3 border border-accent">
        <p className="text-success text-sm font-ui">
          🚀 <strong>Exponential Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 100) * 100}% BTC stack growth
          <br />
          <span className="text-secondary">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else if (btcGrowthWithIncome > 500) {
    return (
      <div className="card-themed p-3 border border-accent">
        <p className="text-success text-sm font-ui">
          📈 <strong>High Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 50) * 50}% BTC stack growth
          <br />
          <span className="text-secondary">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else if (btcGrowthWithIncome > 100) {
    return (
      <div className="card-themed p-3 border border-accent">
        <p className="text-info text-sm font-ui">
          💰 <strong>Solid Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 25) * 25}% BTC stack growth
          <br />
          <span className="text-secondary">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else if (btcGrowthWithIncome > 0) {
    return (
      <div className="card-themed p-3 border border-accent">
        <p className="text-warning text-sm font-ui">
          📊 <strong>Modest Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 10) * 10}% BTC stack growth
          <br />
          <span className="text-secondary">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else {
    return (
      <div className="card-themed p-3 border border-accent">
        <p className="text-warning text-sm font-ui">
          ⚠️ <strong>Stack Decline:</strong> ~
          {Math.round(Math.abs(btcGrowthWithIncome) / 10) * 10}% BTC stack loss
          <br />
          <span className="text-secondary">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  }
};
