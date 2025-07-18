import React from "react";
import { InsightData } from "../../../hooks/usePortfolioInsights";
import { CalculationResults, FormDataSubset } from "../../../types";
import { formatCurrency } from "../../../utils/formatNumber";

interface Props {
  insightData: InsightData;
  formData: FormDataSubset;
  results: CalculationResults;
  dynamicLoanValues?: {
    annualPayments: number;
  } | null;
}

export const CashflowInsights: React.FC<Props> = ({
  insightData,
  formData,
  results,
  dynamicLoanValues,
}) => {
  const { cashflows } = insightData;
  const { results: calculationResults } = results;

  const insights = [];

  // Base cashflow insights
  if (cashflows.activationYear.withoutLeverage > 0) {
    insights.push(
      <div key="activation-base-pos" className="bg-white p-3 rounded border">
        <p className="text-green-700 text-sm">
          ✅ <strong>Early Success:</strong> Income covers expenses from year{" "}
          {formData.activationYear}
          <br />
          <span className="text-gray-600">
            (Surplus: ~
            {formatCurrency(
              Math.round(cashflows.activationYear.withoutLeverage / 1000) *
                1000,
              0,
            )}{" "}
            annually)
          </span>
        </p>
      </div>,
    );
  } else {
    insights.push(
      <div key="activation-base-neg" className="bg-white p-3 rounded border">
        <p className="text-orange-700 text-sm">
          ⚠️ <strong>Early Deficit:</strong> Income shortfall of ~
          {formatCurrency(
            Math.round(
              Math.abs(cashflows.activationYear.withoutLeverage) / 1000,
            ) * 1000,
            0,
          )}{" "}
          in year {formData.activationYear}
          <br />
          <span className="text-gray-600">
            (Need ~
            {formatCurrency(
              Math.round(
                results.annualExpenses[formData.activationYear] / 1000,
              ) * 1000,
              0,
            )}{" "}
            expenses vs ~
            {formatCurrency(
              Math.round(results.usdIncome[formData.activationYear] / 1000) *
                1000,
              0,
            )}{" "}
            income)
          </span>
        </p>
      </div>,
    );
  }

  // Leveraged insights
  if (formData.collateralPct > 0) {
    if (cashflows.activationYear.withLeverage > 0) {
      if (cashflows.activationYear.withoutLeverage <= 0) {
        insights.push(
          <div
            key="activation-lev-saves"
            className="bg-white p-3 rounded border"
          >
            <p className="text-blue-700 text-sm">
              🚀 <strong>Leverage Advantage:</strong> Turns year{" "}
              {formData.activationYear} deficit into ~
              {formatCurrency(
                Math.round(cashflows.activationYear.withLeverage / 1000) * 1000,
                0,
              )}{" "}
              surplus
              <br />
              <span className="text-gray-600">
                (Leverage income: ~
                {formatCurrency(
                  Math.round(
                    (results.usdIncomeWithLeverage[formData.activationYear] -
                      results.usdIncome[formData.activationYear]) /
                      1000,
                  ) * 1000,
                  0,
                )}{" "}
                additional)
              </span>
            </p>
          </div>,
        );
      }
    } else {
      insights.push(
        <div key="activation-lev-neg" className="bg-white p-3 rounded border">
          <p className="text-red-700 text-sm">
            ❌ <strong>Leverage Burden:</strong> Debt service creates ~
            {formatCurrency(
              Math.round(
                Math.abs(cashflows.activationYear.withLeverage) / 1000,
              ) * 1000,
              0,
            )}{" "}
            deficit in year {formData.activationYear}
            <br />
            <span className="text-gray-600">
              (Debt service: ~
              {formatCurrency(
                Math.round((dynamicLoanValues?.annualPayments || 0) / 1000) *
                  1000,
                0,
              )}{" "}
              annually)
            </span>
          </p>
        </div>,
      );
    }
  }

  return <>{insights}</>;
};
