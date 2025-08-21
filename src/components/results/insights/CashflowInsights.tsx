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
      <div
        key="activation-base-pos"
        className="card-themed p-3 border border-accent"
      >
        <p className="text-success text-sm font-ui">
          ✅ <strong>EARLY SUCCESS:</strong> Income covers expenses from year{" "}
          {formData.activationYear}
          <br />
          <span className="text-secondary">
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
      <div
        key="activation-base-neg"
        className="card-themed p-3 border border-accent"
      >
        <p className="text-warning text-sm font-ui">
          ⚠️ <strong>EARLY DEFICIT:</strong> Income shortfall of ~
          {formatCurrency(
            Math.round(
              Math.abs(cashflows.activationYear.withoutLeverage) / 1000,
            ) * 1000,
            0,
          )}{" "}
          in year {formData.activationYear}
          <br />
          <span className="text-secondary">
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
            className="card-themed p-3 border border-accent"
          >
            <p className="text-success text-sm font-ui">
              🚀 <strong>LEVERAGE ADVANTAGE:</strong> Turns year{" "}
              {formData.activationYear} deficit into ~
              {formatCurrency(
                Math.round(cashflows.activationYear.withLeverage / 1000) * 1000,
                0,
              )}{" "}
              surplus
              <br />
              <span className="text-secondary">
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
        <div
          key="activation-lev-neg"
          className="card-themed p-3 border border-accent"
        >
          <p className="text-warning text-sm font-ui">
            ❌ <strong>Leverage Burden:</strong> Debt service creates ~
            {formatCurrency(
              Math.round(
                Math.abs(cashflows.activationYear.withLeverage) / 1000,
              ) * 1000,
              0,
            )}{" "}
            deficit in year {formData.activationYear}
            <br />
            <span className="text-secondary">
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
