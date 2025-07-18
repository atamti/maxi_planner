import React from "react";
import { InsightData } from "../../../hooks/usePortfolioInsights";
import { formatCurrency } from "../../../utils/formatNumber";

interface Props {
  insightData: InsightData;
}

export const LiquidationRiskInsights: React.FC<Props> = ({ insightData }) => {
  const { liquidationData } = insightData;

  if (!liquidationData) {
    return null;
  }

  const { liquidationPrice, minBtcPrice, liquidationBuffer } = liquidationData;

  if (liquidationBuffer < 25) {
    return (
      <div className="bg-white p-3 rounded border">
        <p className="text-red-700 text-sm">
          🚨 <strong>Liquidation Risk:</strong> Only ~
          {Math.round(liquidationBuffer / 5) * 5}% buffer above liquidation
          price
          <br />
          <span className="text-gray-600">
            (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs Liquidation: ~
            {formatCurrency(liquidationPrice, 0)})
          </span>
        </p>
      </div>
    );
  } else if (liquidationBuffer < 50) {
    return (
      <div className="bg-white p-3 rounded border">
        <p className="text-orange-700 text-sm">
          ⚠️ <strong>Moderate Liquidation Risk:</strong> ~
          {Math.round(liquidationBuffer / 10) * 10}% buffer above liquidation
          <br />
          <span className="text-gray-600">
            (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs Liquidation: ~
            {formatCurrency(liquidationPrice, 0)})
          </span>
        </p>
      </div>
    );
  } else if (liquidationBuffer < 100) {
    return (
      <div className="bg-white p-3 rounded border">
        <p className="text-yellow-700 text-sm">
          🛡️ <strong>Safe Liquidation Buffer:</strong> ~
          {Math.round(liquidationBuffer / 10) * 10}% above liquidation price
          <br />
          <span className="text-gray-600">
            (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs Liquidation: ~
            {formatCurrency(liquidationPrice, 0)})
          </span>
        </p>
      </div>
    );
  } else {
    return (
      <div className="bg-white p-3 rounded border">
        <p className="text-green-700 text-sm">
          ✅ <strong>Very Safe Leverage:</strong> ~
          {Math.round(liquidationBuffer / 25) * 25}% above liquidation price
          <br />
          <span className="text-gray-600">
            (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs Liquidation: ~
            {formatCurrency(liquidationPrice, 0)})
          </span>
        </p>
      </div>
    );
  }
};
