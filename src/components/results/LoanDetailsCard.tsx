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
    <div className="card-themed rounded-none p-4 border border-themed bg-surface">
      <h3 className="font-poppins text-lg font-bold text-bitcoin-orange mb-4 uppercase tracking-wide">
        🏦 LOAN DETAILS (YEAR {formData.activationYear})
      </h3>
      <div className="space-y-4">
        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
            PRINCIPAL:
          </p>
          <p className="text-primary font-mono text-lg font-bold">
            {formatCurrency(loanDetails.loanPrincipal, 0)}
          </p>
        </div>

        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
            ANNUAL INTEREST:
          </p>
          <p className="text-primary font-mono">
            {formatCurrency(
              loanDetails.loanPrincipal * (formData.loanRate / 100),
              0,
            )}
          </p>
        </div>

        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
            ANNUAL PAYMENTS:
          </p>
          <p className="text-primary font-mono">
            {formatCurrency(loanDetails.annualPayments, 0)}
          </p>
          {formData.interestOnly && (
            <p className="text-xs text-secondary font-mono uppercase tracking-wide">
              (Interest only)
            </p>
          )}
        </div>

        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
            LTV RATIO:
          </p>
          <p className="text-primary font-mono text-lg font-bold">
            {formData.ltvRatio}%
          </p>
        </div>

        <div className="p-3 bg-surface-alt rounded-none border-2 border-loss/50">
          <p className="font-inter text-sm font-bold text-loss mb-2 uppercase tracking-wide">
            ⚠️ LIQUIDATION RISK:
          </p>
          <p className="text-loss font-mono text-lg font-bold">
            {formatCurrency(loanDetails.liquidationPrice, 0)}
          </p>
          <p className="text-xs text-secondary font-mono mt-1">
            (BTC @{" "}
            {formatCurrency(getBtcPriceAtYear(formData.activationYear), 0)} in
            Year {formData.activationYear})
          </p>
        </div>
      </div>
    </div>
  );
};
