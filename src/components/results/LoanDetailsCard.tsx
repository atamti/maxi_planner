import React from "react";
import { useLoanCalculations } from "../../hooks/useLoanCalculations";
import { FormDataSubset } from "../../types";
import { formatCurrency } from "../../utils/formatNumber";

interface Props {
  formData: FormDataSubset;
  getBtcPriceAtYear: (year: number) => number;
}

export const LoanDetailsCard: React.FC<Props> = ({
  formData,
  getBtcPriceAtYear,
}) => {
  const { calculateLoanDetails } = useLoanCalculations(
    formData,
    getBtcPriceAtYear,
  );

  if (formData.collateralPct === 0) {
    return null;
  }

  const loanDetails = calculateLoanDetails(formData.activationYear);

  if (!loanDetails) {
    return null;
  }

  return (
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-3">
        🏦 Loan Details (Year {formData.activationYear})
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-purple-700">Principal:</p>
          <p>{formatCurrency(loanDetails.loanPrincipal, 0)}</p>
        </div>
        <div>
          <p className="font-medium text-purple-700">Annual Interest:</p>
          <p>
            {formatCurrency(
              loanDetails.loanPrincipal * (formData.loanRate / 100),
              0,
            )}
          </p>
        </div>
        <div>
          <p className="font-medium text-purple-700">Annual Payments:</p>
          <p>{formatCurrency(loanDetails.annualPayments, 0)}</p>
          {formData.interestOnly && (
            <p className="text-xs text-purple-600">(Interest only)</p>
          )}
        </div>
        <div>
          <p className="font-medium text-purple-700">LTV Ratio:</p>
          <p>{formData.ltvRatio}%</p>
        </div>
        <div>
          <p className="font-medium text-purple-700">Liquidation Risk:</p>
          <p>{formatCurrency(loanDetails.liquidationPrice, 0)}</p>
          <p className="text-xs text-purple-600">
            (BTC @{" "}
            {formatCurrency(getBtcPriceAtYear(formData.activationYear), 0)} in
            Year {formData.activationYear})
          </p>
        </div>
      </div>
    </div>
  );
};
