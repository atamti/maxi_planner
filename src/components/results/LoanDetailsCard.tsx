import React from "react";
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
  // Helper function to calculate dynamic loan values
  const calculateDynamicLoanValues = () => {
    // Calculate BTC stack at activation year with growth
    let btcStackAtActivation = formData.btcStack;
    for (let year = 0; year < formData.activationYear; year++) {
      const investmentsYield =
        formData.investmentsStartYield -
        (formData.investmentsStartYield - formData.investmentsEndYield) *
          (year / formData.timeHorizon);
      const speculationYield =
        formData.speculationStartYield -
        (formData.speculationStartYield - formData.speculationEndYield) *
          (year / formData.timeHorizon);

      const savings = btcStackAtActivation * (formData.savingsPct / 100);
      const investments =
        btcStackAtActivation *
        (formData.investmentsPct / 100) *
        (1 + investmentsYield / 100);
      const speculation =
        btcStackAtActivation *
        (formData.speculationPct / 100) *
        (1 + speculationYield / 100);

      btcStackAtActivation = savings + investments + speculation;
    }

    const btcSavingsAtActivation =
      btcStackAtActivation * (formData.savingsPct / 100);
    const collateralBtc =
      btcSavingsAtActivation * (formData.collateralPct / 100);

    // Use BTC price at activation year from custom rates
    const btcPriceAtActivation = getBtcPriceAtYear(formData.activationYear);

    const loanPrincipal =
      collateralBtc * (formData.ltvRatio / 100) * btcPriceAtActivation;
    const liquidationPrice = btcPriceAtActivation * (formData.ltvRatio / 80); // 80% liquidation threshold

    // Calculate annual payments
    const annualInterest = loanPrincipal * (formData.loanRate / 100);
    const annualPayments = formData.interestOnly
      ? annualInterest
      : (loanPrincipal *
          ((formData.loanRate / 100) *
            Math.pow(1 + formData.loanRate / 100, formData.loanTermYears))) /
        (Math.pow(1 + formData.loanRate / 100, formData.loanTermYears) - 1);

    return { loanPrincipal, liquidationPrice, annualPayments };
  };

  if (formData.collateralPct === 0) {
    return null;
  }

  const dynamicLoanValues = calculateDynamicLoanValues();

  return (
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-3">
        🏦 Loan Details (Year {formData.activationYear})
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-purple-700">Principal:</p>
          <p>{formatCurrency(dynamicLoanValues.loanPrincipal, 0)}</p>
        </div>
        <div>
          <p className="font-medium text-purple-700">Annual Interest:</p>
          <p>
            {formatCurrency(
              dynamicLoanValues.loanPrincipal * (formData.loanRate / 100),
              0,
            )}
          </p>
        </div>
        <div>
          <p className="font-medium text-purple-700">Annual Payments:</p>
          <p>{formatCurrency(dynamicLoanValues.annualPayments, 0)}</p>
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
          <p>{formatCurrency(dynamicLoanValues.liquidationPrice, 0)}</p>
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
