import React from "react";
import { CalculationResults, FormDataSubset } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatNumber";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
}

export const FinalYearCard: React.FC<Props> = ({ results, formData }) => {
  const { usdIncome, usdIncomeWithLeverage, btcIncome, annualExpenses } =
    results;

  // Helper function to format cashflow values
  const formatCashflow = (value: number): React.ReactElement => {
    if (value < 0) {
      return (
        <span className="text-red-600">
          ({formatCurrency(Math.abs(value), 0)})
        </span>
      );
    }
    return <span>{formatCurrency(value, 0)}</span>;
  };

  // Calculate final year cashflows
  const finalYearExpenses = annualExpenses[annualExpenses.length - 1] || 0;
  const finalYearIncome = usdIncome[usdIncome.length - 1] || 0;
  const finalYearIncomeWithLeverage =
    usdIncomeWithLeverage[usdIncomeWithLeverage.length - 1] || 0;
  const finalYearBtcIncome = btcIncome[btcIncome.length - 1] || 0;

  const finalYearCashflows = {
    withoutLeverage: finalYearIncome - finalYearExpenses,
    withLeverage: finalYearIncomeWithLeverage - finalYearExpenses,
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">
        🎯 Year {formData.timeHorizon} Analysis
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-blue-700 mb-1">💰 Income:</p>
          <p className="text-sm">
            <strong>USD:</strong> {formatCurrency(finalYearIncome, 0)}
          </p>
          <p className="text-sm">
            <strong>BTC:</strong> {formatNumber(finalYearBtcIncome, 3)} BTC
          </p>
          {formData.collateralPct > 0 && (
            <p className="text-sm">
              <strong>USD (Leveraged):</strong>{" "}
              {formatCurrency(finalYearIncomeWithLeverage, 0)}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-blue-700 mb-1">💸 Expenses:</p>
          <p className="text-sm">{formatCurrency(finalYearExpenses, 0)}</p>
        </div>

        <div className="pt-2 border-t border-blue-300">
          <p className="text-sm font-medium text-blue-700 mb-1">
            📊 Net Cashflow:
          </p>
          <p className="text-sm">
            <strong>Base:</strong>{" "}
            {formatCashflow(finalYearCashflows.withoutLeverage)}
          </p>
          {formData.collateralPct > 0 && (
            <p className="text-sm">
              <strong>Leveraged:</strong>{" "}
              {formatCashflow(finalYearCashflows.withLeverage)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
