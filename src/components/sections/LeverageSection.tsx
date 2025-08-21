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
        <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
          COLLATERALIZED BTC (% OF SAVINGS):
        </label>
        <input
          type="range"
          value={formData.collateralPct}
          onChange={(e) =>
            updateFormData({ collateralPct: Number(e.target.value) })
          }
          className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
          min="0"
          max="100"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-secondary font-mono">0%</span>
          <span className="text-sm font-bold text-bitcoin-orange font-inter">
            {formData.collateralPct}% USED AS COLLATERAL
          </span>
          <span className="text-xs text-secondary font-mono">100%</span>
        </div>
      </div>
      <div>
        <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
          LOAN-TO-VALUE RATIO (LTV %):
        </label>
        <input
          type="range"
          value={formData.ltvRatio}
          onChange={(e) => updateFormData({ ltvRatio: Number(e.target.value) })}
          className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
          min="0"
          max="50"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-secondary font-mono">0%</span>
          <span className="text-sm font-bold text-bitcoin-orange font-inter">
            {formData.ltvRatio}% LTV (BORROW {formData.ltvRatio}% OF COLLATERAL
            VALUE)
          </span>
          <span className="text-xs text-secondary font-mono">50%</span>
        </div>
      </div>
      <div>
        <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
          LOAN INTEREST RATE (%):
        </label>
        <input
          type="number"
          value={formData.loanRate}
          onChange={(e) => updateFormData({ loanRate: Number(e.target.value) })}
          className="w-full p-3 bg-surface border-2 border-themed rounded-none text-primary font-mono text-lg focus-ring-themed"
          min="0"
        />
      </div>
      <div>
        <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
          LOAN TERM (YEARS):
        </label>
        <input
          type="range"
          value={formData.loanTermYears}
          onChange={(e) =>
            updateFormData({ loanTermYears: Number(e.target.value) })
          }
          className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
          min="1"
          max="30"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-secondary font-mono">1 yr</span>
          <span className="text-sm font-bold text-bitcoin-orange font-inter">
            {formData.loanTermYears} YEARS
          </span>
          <span className="text-xs text-secondary font-mono">30 yrs</span>
        </div>
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
        <p className="text-xs text-secondary mt-1 font-ui">
          {formData.interestOnly
            ? "Pay only interest, principal remains unchanged"
            : `Amortized payments over ${formData.loanTermYears}-year term`}
        </p>
      </div>

      {/* Live Loan Calculations */}
      {formData.collateralPct > 0 && (
        <div className="col-span-2 mt-4 p-3 card-themed border border-bitcoin-orange">
          <h4 className="font-semibold text-bitcoin-orange mb-2 font-heading tracking-wide uppercase">
            💰 LOAN DETAILS
          </h4>
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
                <div className="text-primary font-ui">
                  <strong>Collateral BTC:</strong>{" "}
                  {formatNumber(collateralBtc, 3)} BTC
                </div>
                <div className="text-primary font-ui">
                  <strong>BTC Price (Year {formData.activationYear}):</strong>{" "}
                  {formatCurrency(btcPriceAtActivation, 0)}
                </div>
                <div className="text-primary font-ui">
                  <strong>Collateral Value:</strong>{" "}
                  {formatCurrency(collateralBtc * btcPriceAtActivation, 0)}
                </div>
                <div className="text-primary font-ui">
                  <strong>LTV Ratio:</strong> {formData.ltvRatio}%
                </div>
                <div className="text-primary font-ui">
                  <strong>Loan Principal:</strong>{" "}
                  {formatCurrency(loanPrincipal, 0)}
                </div>
                <div className="text-primary font-ui">
                  <strong>Annual Payment:</strong>{" "}
                  {formatCurrency(annualPayment, 0)}
                </div>
                {formData.interestOnly && (
                  <div className="col-span-2 text-warning text-xs font-mono">
                    ⚠️ Interest-only: Principal of{" "}
                    {formatCurrency(loanPrincipal, 0)} remains due
                  </div>
                )}
                <div className="col-span-2 text-primary text-xs font-mono">
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
