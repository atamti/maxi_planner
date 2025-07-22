import React from "react";
import { FormData } from "../../types";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const LeverageSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  const formatNumberForDisplay = (value: number): string => {
    return Math.round(value).toLocaleString();
  };

  const hasLeverage = formData.collateralPct > 0;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
        <h4 className="font-semibold text-orange-800 mb-3">
          🏦 Leverage Configuration
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Collateral Percentage */}
          <div>
            <label className="block font-medium mb-1">
              Collateral Percentage (%):
            </label>
            <input
              type="range"
              value={formData.collateralPct}
              onChange={(e) =>
                updateFormData({ collateralPct: Number(e.target.value) })
              }
              className="w-full"
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-600">
              {formData.collateralPct}% of BTC stack used as collateral
            </span>
            <p className="text-xs text-gray-600 mt-1">
              {formData.collateralPct === 0
                ? "No leverage - pure BTC strategy"
                : `${formData.collateralPct}% of your BTC will be used as loan collateral`}
            </p>
          </div>

          {/* LTV Ratio */}
          {hasLeverage && (
            <div>
              <label className="block font-medium mb-1">
                Loan-to-Value (LTV) Ratio (%):
              </label>
              <input
                type="range"
                value={formData.ltvRatio}
                onChange={(e) =>
                  updateFormData({ ltvRatio: Number(e.target.value) })
                }
                className="w-full"
                min="0"
                max="50"
              />
              <span className="text-sm text-gray-600">
                {formData.ltvRatio}% initial LTV ratio
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Conservative max: 50% to avoid liquidation risk
              </p>
            </div>
          )}

          {/* Loan Rate */}
          {hasLeverage && (
            <div>
              <label className="block font-medium mb-1">
                Loan Interest Rate (%):
              </label>
              <input
                type="number"
                value={formData.loanRate}
                onChange={(e) =>
                  updateFormData({ loanRate: Number(e.target.value) })
                }
                className="w-full p-2 border rounded"
                min="0"
                max="20"
                step="0.1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Annual interest rate for the loan
              </p>
            </div>
          )}

          {/* Loan Term */}
          {hasLeverage && (
            <div>
              <label className="block font-medium mb-1">
                Loan Term (Years):
              </label>
              <input
                type="range"
                value={formData.loanTermYears}
                onChange={(e) =>
                  updateFormData({ loanTermYears: Number(e.target.value) })
                }
                className="w-full"
                min="1"
                max="30"
              />
              <span className="text-sm text-gray-600">
                {formData.loanTermYears} years
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Length of the loan repayment period
              </p>
            </div>
          )}

          {/* Interest Only Toggle */}
          {hasLeverage && (
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.interestOnly}
                  onChange={(e) =>
                    updateFormData({ interestOnly: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="font-medium">Interest-Only Payments</span>
              </label>
              <p className="text-xs text-gray-600 mt-1">
                {formData.interestOnly
                  ? "Pay only interest, no principal reduction"
                  : "Pay both principal and interest (amortizing loan)"}
              </p>
            </div>
          )}
        </div>

        {/* Leverage Summary */}
        {hasLeverage && (
          <div className="mt-4 p-3 bg-orange-100 rounded-md">
            <h5 className="font-medium text-orange-800 mb-2">
              📊 Leverage Summary
            </h5>
            <div className="text-sm text-orange-700 space-y-1">
              <p>• Collateral: {formData.collateralPct}% of BTC stack</p>
              <p>• Initial LTV: {formData.ltvRatio}%</p>
              <p>• Loan Rate: {formData.loanRate}% annually</p>
              <p>• Loan Term: {formData.loanTermYears} years</p>
              <p>
                • Payment Type:{" "}
                {formData.interestOnly
                  ? "Interest-only"
                  : "Principal + Interest"}
              </p>
            </div>
          </div>
        )}

        {!hasLeverage && (
          <div className="mt-4 p-3 bg-green-100 rounded-md">
            <h5 className="font-medium text-green-800 mb-2">
              ✅ Pure BTC Strategy
            </h5>
            <p className="text-sm text-green-700">
              No leverage is being used. Your strategy is 100% BTC-based without
              any loan risk.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
