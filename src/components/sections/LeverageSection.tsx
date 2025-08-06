import React from "react";
import { usePortfolioCompat } from "../../store";
import { formatCurrency, formatNumber } from "../../utils/formatNumber";
import { CollapsibleSection } from "../common/CollapsibleSection";

export const LeverageSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolioCompat();
  // Create descriptive title
  const getSectionTitle = () => {
    if (formData.collateralPct === 0) {
      return "4. 🏦 Leverage & Borrowing: No leverage (Pure BTC strategy)";
    }
    return `4. 🏦 Leverage & Borrowing: ${formData.collateralPct}% collateral, ${formData.ltvRatio}% LTV, ${formData.loanRate}% rate, ${formData.loanTermYears}yr ${formData.interestOnly ? "interest-only" : "amortizing"}`;
  };

  return (
    <CollapsibleSection title={getSectionTitle()}>
      <div>
        <label className="block font-medium mb-1">
          Collateralized BTC (% of Savings):
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
          {formData.collateralPct}% used as collateral
        </span>
      </div>
      <div>
        <label className="block font-medium mb-1">
          Loan-to-Value Ratio (LTV %):
        </label>
        <input
          type="range"
          value={formData.ltvRatio}
          onChange={(e) => updateFormData({ ltvRatio: Number(e.target.value) })}
          className="w-full"
          min="0"
          max="50"
        />
        <span className="text-sm text-gray-600">
          {formData.ltvRatio}% LTV (borrow {formData.ltvRatio}% of collateral
          value)
        </span>
      </div>
      <div>
        <label className="block font-medium mb-1">
          Loan Interest Rate (%):
        </label>
        <input
          type="number"
          value={formData.loanRate}
          onChange={(e) => updateFormData({ loanRate: Number(e.target.value) })}
          className="w-full p-2 border rounded"
          min="0"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Loan Term (Years):</label>
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
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.interestOnly}
            onChange={(e) => updateFormData({ interestOnly: e.target.checked })}
            className="mr-2"
          />
          <span className="font-medium">Interest Only Payments</span>
        </label>
        <p className="text-xs text-gray-600 mt-1">
          {formData.interestOnly
            ? "Pay only interest, principal remains unchanged"
            : `Amortized payments over ${formData.loanTermYears}-year term`}
        </p>
      </div>

      {/* Live Loan Calculations */}
      {formData.collateralPct > 0 && (
        <div className="col-span-2 mt-4 p-3 bg-blue-50 rounded-lg border">
          <h4 className="font-semibold text-blue-800 mb-2">💰 Loan Details</h4>
          {(() => {
            // Calculate BTC stack at activation year with growth
            let btcStackAtActivation = formData.btcStack;
            for (let year = 0; year < formData.activationYear; year++) {
              const investmentsYield =
                formData.investmentsStartYield -
                (formData.investmentsStartYield -
                  formData.investmentsEndYield) *
                  (year / formData.timeHorizon);
              const speculationYield =
                formData.speculationStartYield -
                (formData.speculationStartYield -
                  formData.speculationEndYield) *
                  (year / formData.timeHorizon);

              const savings =
                btcStackAtActivation * (formData.savingsPct / 100);
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
            let btcPriceAtActivation = formData.exchangeRate;
            for (let i = 0; i < formData.activationYear; i++) {
              const appreciationRate =
                (formData.btcPriceCustomRates?.[i] || 50) / 100;
              btcPriceAtActivation =
                btcPriceAtActivation * (1 + appreciationRate);
            }

            const loanPrincipal =
              collateralBtc * (formData.ltvRatio / 100) * btcPriceAtActivation;

            const annualInterest = loanPrincipal * (formData.loanRate / 100);
            const monthlyPayment = formData.interestOnly
              ? annualInterest / 12
              : (loanPrincipal *
                  (formData.loanRate / 100 / 12) *
                  Math.pow(
                    1 + formData.loanRate / 100 / 12,
                    formData.loanTermYears * 12,
                  )) /
                (Math.pow(
                  1 + formData.loanRate / 100 / 12,
                  formData.loanTermYears * 12,
                ) -
                  1);
            const annualPayment = monthlyPayment * 12;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Collateral BTC:</strong>{" "}
                  {formatNumber(collateralBtc, 3)} BTC
                </div>
                <div>
                  <strong>BTC Price (Year {formData.activationYear}):</strong>{" "}
                  {formatCurrency(btcPriceAtActivation, 0)}
                </div>
                <div>
                  <strong>Collateral Value:</strong>{" "}
                  {formatCurrency(collateralBtc * btcPriceAtActivation, 0)}
                </div>
                <div>
                  <strong>LTV Ratio:</strong> {formData.ltvRatio}%
                </div>
                <div>
                  <strong>Loan Principal:</strong>{" "}
                  {formatCurrency(loanPrincipal, 0)}
                </div>
                <div>
                  <strong>Annual Payment:</strong>{" "}
                  {formatCurrency(annualPayment, 0)}
                </div>
                {formData.interestOnly && (
                  <div className="col-span-2 text-orange-600 text-xs">
                    ⚠️ Interest-only: Principal of{" "}
                    {formatCurrency(loanPrincipal, 0)} remains due
                  </div>
                )}
                <div className="col-span-2 text-blue-600 text-xs">
                  💡 Liquidation risk if BTC drops below{" "}
                  {formatCurrency(
                    btcPriceAtActivation * (formData.ltvRatio / 80),
                    0,
                  )}
                  (assuming 80% liquidation threshold)
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </CollapsibleSection>
  );
};
