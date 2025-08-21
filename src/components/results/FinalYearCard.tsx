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
        <span className="text-loss font-bold">
          ({formatCurrency(Math.abs(value), 0)})
        </span>
      );
    }
    return (
      <span className="text-gain font-bold">{formatCurrency(value, 0)}</span>
    );
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
    <div className="card-themed rounded-none p-4 border-2 border-navy-900 bg-navy-900/10">
      <h3 className="font-poppins text-lg font-bold text-navy-900 mb-4 uppercase tracking-wide">
        🎯 YEAR {formData.timeHorizon} ANALYSIS
      </h3>
      <div className="space-y-4">
        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="font-inter text-sm font-bold text-navy-900 mb-2 uppercase tracking-wide">
            💰 INCOME:
          </p>
          <p className="text-primary font-mono">
            <span className="font-semibold">USD:</span>{" "}
            {formatCurrency(finalYearIncome, 0)}
          </p>
          <p className="text-primary font-mono">
            <span className="font-semibold">BTC:</span>{" "}
            {formatNumber(finalYearBtcIncome, 3)} BTC
          </p>
          {formData.collateralPct > 0 && (
            <p className="text-primary font-mono">
              <span className="font-semibold">USD (Leveraged):</span>{" "}
              {formatCurrency(finalYearIncomeWithLeverage, 0)}
            </p>
          )}
        </div>

        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="font-inter text-sm font-bold text-navy-900 mb-2 uppercase tracking-wide">
            💸 EXPENSES:
          </p>
          <p className="text-primary font-mono">
            {formatCurrency(finalYearExpenses, 0)}
          </p>
        </div>

        <div className="p-3 bg-surface-alt rounded-none border-2 border-themed">
          <p className="font-inter text-sm font-bold text-navy-900 mb-2 uppercase tracking-wide">
            📊 NET CASHFLOW:
          </p>
          <p className="font-mono">
            <span className="font-semibold text-primary">Base:</span>{" "}
            {formatCashflow(finalYearCashflows.withoutLeverage)}
          </p>
          {formData.collateralPct > 0 && (
            <p className="font-mono">
              <span className="font-semibold text-primary">Leveraged:</span>{" "}
              {formatCashflow(finalYearCashflows.withLeverage)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
