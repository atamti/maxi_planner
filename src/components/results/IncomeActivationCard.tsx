import React from "react";
import { CalculationResults, FormDataSubset } from "../../types";
import { formatCurrency } from "../../utils/formatNumber";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
}

export const IncomeActivationCard: React.FC<Props> = ({
  results,
  formData,
}) => {
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

  // Calculate USD cashflows (income minus expenses)
  const calculateCashflows = () => {
    const activationYearExpenses =
      results.annualExpenses[formData.activationYear] || 0;
    const activationYearIncome =
      results.usdIncome[formData.activationYear] || 0;
    const activationYearIncomeWithLeverage =
      results.usdIncomeWithLeverage[formData.activationYear] || 0;

    return {
      withoutLeverage: activationYearIncome - activationYearExpenses,
      withLeverage: activationYearIncomeWithLeverage - activationYearExpenses,
    };
  };

  const cashflows = calculateCashflows();

  return (
    <div className="card-themed rounded-none p-6 border-2 border-navy-900 bg-navy-900/5">
      <h3 className="font-poppins text-lg font-bold text-navy-900 mb-4 uppercase tracking-wide">
        🚀 INCOME ACTIVATION YEAR ({formData.activationYear})
      </h3>
      <div className="space-y-4">
        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="font-inter text-sm font-bold text-navy-900 mb-2 uppercase tracking-wide">
            💰 INCOME:
          </p>
          <p className="text-primary font-mono">
            <span className="font-semibold">Base:</span>{" "}
            {formatCurrency(results.usdIncome[formData.activationYear] || 0, 0)}
          </p>
          {formData.collateralPct > 0 && (
            <p className="text-primary font-mono">
              <span className="font-semibold">Leveraged:</span>{" "}
              {formatCurrency(
                results.usdIncomeWithLeverage[formData.activationYear] || 0,
                0,
              )}
            </p>
          )}
        </div>

        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="font-inter text-sm font-bold text-navy-900 mb-2 uppercase tracking-wide">
            💸 EXPENSES:
          </p>
          <p className="text-primary font-mono">
            {formatCurrency(
              results.annualExpenses[formData.activationYear] || 0,
              0,
            )}
          </p>
        </div>

        <div className="p-3 bg-surface-alt rounded-none border-2 border-themed">
          <p className="font-inter text-sm font-bold text-navy-900 mb-2 uppercase tracking-wide">
            📊 NET CASHFLOW:
          </p>
          <p className="font-mono">
            <span className="font-semibold text-primary">Base:</span>{" "}
            {formatCashflow(cashflows.withoutLeverage)}
          </p>
          {formData.collateralPct > 0 && (
            <p className="font-mono">
              <span className="font-semibold text-primary">Leveraged:</span>{" "}
              {formatCashflow(cashflows.withLeverage)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
