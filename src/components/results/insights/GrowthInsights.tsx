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
      <div className="bg-white p-3 rounded border">
        <p className="text-green-700 text-sm">
          🚀 <strong>Exponential Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 100) * 100}% BTC stack growth
          <br />
          <span className="text-gray-600">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else if (btcGrowthWithIncome > 500) {
    return (
      <div className="bg-white p-3 rounded border">
        <p className="text-green-700 text-sm">
          📈 <strong>High Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 50) * 50}% BTC stack growth
          <br />
          <span className="text-gray-600">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else if (btcGrowthWithIncome > 100) {
    return (
      <div className="bg-white p-3 rounded border">
        <p className="text-blue-700 text-sm">
          💰 <strong>Solid Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 25) * 25}% BTC stack growth
          <br />
          <span className="text-gray-600">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else if (btcGrowthWithIncome > 0) {
    return (
      <div className="bg-white p-3 rounded border">
        <p className="text-yellow-700 text-sm">
          📊 <strong>Modest Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 10) * 10}% BTC stack growth
          <br />
          <span className="text-gray-600">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  } else {
    return (
      <div className="bg-white p-3 rounded border">
        <p className="text-red-700 text-sm">
          ⚠️ <strong>Stack Decline:</strong> ~
          {Math.round(Math.abs(btcGrowthWithIncome) / 10) * 10}% BTC stack loss
          <br />
          <span className="text-gray-600">
            ({formatNumber(formData.btcStack, 1)} → ~
            {formatNumber(finalBtcWithIncome, 1)} BTC)
          </span>
        </p>
      </div>
    );
  }
};
