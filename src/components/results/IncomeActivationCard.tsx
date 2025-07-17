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
        <span className="text-red-600">
          ({formatCurrency(Math.abs(value), 0)})
        </span>
      );
    }
    return <span>{formatCurrency(value, 0)}</span>;
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
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <h3 className="text-lg font-semibold text-green-800 mb-3">
        🚀 Income Activation Year Analysis (Year {formData.activationYear})
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-green-700 mb-1">💰 Income:</p>
          <p className="text-sm">
            <strong>Base:</strong>{" "}
            {formatCurrency(results.usdIncome[formData.activationYear] || 0, 0)}
          </p>
          {formData.collateralPct > 0 && (
            <p className="text-sm">
              <strong>Leveraged:</strong>{" "}
              {formatCurrency(
                results.usdIncomeWithLeverage[formData.activationYear] || 0,
                0,
              )}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-green-700 mb-1">
            💸 Expenses:
          </p>
          <p className="text-sm">
            {formatCurrency(
              results.annualExpenses[formData.activationYear] || 0,
              0,
            )}
          </p>
        </div>

        <div className="pt-2 border-t border-green-300">
          <p className="text-sm font-medium text-green-700 mb-1">
            📊 Net Cashflow:
          </p>
          <p className="text-sm">
            <strong>Base:</strong> {formatCashflow(cashflows.withoutLeverage)}
          </p>
          {formData.collateralPct > 0 && (
            <p className="text-sm">
              <strong>Leveraged:</strong>{" "}
              {formatCashflow(cashflows.withLeverage)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
