import React from "react";
import { CalculationResults, FormDataSubset } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatNumber";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
  getBtcPriceAtYear: (year: number) => number;
}

export const RiskInsightsSection: React.FC<Props> = ({
  results,
  formData,
  getBtcPriceAtYear,
}) => {
  // Helper function to calculate dynamic loan values
  const calculateDynamicLoanValues = () => {
    if (formData.collateralPct === 0) return null;

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

    const btcPriceAtActivation = getBtcPriceAtYear(formData.activationYear);

    const loanPrincipal =
      collateralBtc * (formData.ltvRatio / 100) * btcPriceAtActivation;
    const liquidationPrice = btcPriceAtActivation * (formData.ltvRatio / 80);

    const annualPayments = formData.interestOnly
      ? loanPrincipal * (formData.loanRate / 100)
      : (loanPrincipal *
          ((formData.loanRate / 100) *
            Math.pow(1 + formData.loanRate / 100, formData.loanTermYears))) /
        (Math.pow(1 + formData.loanRate / 100, formData.loanTermYears) - 1);

    return { loanPrincipal, liquidationPrice, annualPayments };
  };

  const dynamicLoanValues = calculateDynamicLoanValues();

  const hasRisks =
    formData.savingsPct < 100 ||
    formData.speculationPct > 0 ||
    formData.incomeAllocationPct > 0 ||
    (formData.collateralPct > 0 && dynamicLoanValues);

  return (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
      <h3 className="text-lg font-semibold text-red-800 mb-3">
        ⚠️ Risk Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasRisks ? (
          <>
            <ul className="list-disc pl-5 text-red-700 space-y-1">
              {formData.savingsPct < 100 && (
                <li>All investment & speculation carries counterparty risk</li>
              )}
              {formData.speculationPct > 0 && (
                <li>
                  Speculation ({formData.speculationPct}% of portfolio) has high
                  potential yields ({formData.speculationStartYield}%→
                  {formData.speculationEndYield}%) but greater loss risk
                </li>
              )}
              {formData.incomeAllocationPct > 0 && (
                <li>USD income decays in BTC terms as Bitcoin appreciates</li>
              )}
            </ul>
            {formData.collateralPct > 0 && dynamicLoanValues && (
              <ul className="list-disc pl-5 text-red-700 space-y-1">
                <li>
                  Borrowing {formatCurrency(dynamicLoanValues.loanPrincipal, 0)}{" "}
                  risks liquidation if BTC drops below{" "}
                  {formatCurrency(dynamicLoanValues.liquidationPrice, 0)}
                  <br />
                  <span className="text-sm">
                    (80% liquidation threshold means liquidation triggers when
                    collateral value drops to 80% of loan amount)
                  </span>
                  {(() => {
                    // Calculate what liquidation price would be if using 100% of BTC savings as collateral
                    const btcStackAtActivation = (() => {
                      let stack = formData.btcStack;
                      for (
                        let year = 0;
                        year < formData.activationYear;
                        year++
                      ) {
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
                        const savings = stack * (formData.savingsPct / 100);
                        const investments =
                          stack *
                          (formData.investmentsPct / 100) *
                          (1 + investmentsYield / 100);
                        const speculation =
                          stack *
                          (formData.speculationPct / 100) *
                          (1 + speculationYield / 100);
                        stack = savings + investments + speculation;
                      }
                      return stack;
                    })();

                    const fullBtcSavings =
                      btcStackAtActivation * (formData.savingsPct / 100);
                    const btcPriceAtActivation = getBtcPriceAtYear(
                      formData.activationYear,
                    );
                    const currentCollateralBtc =
                      btcStackAtActivation *
                      (formData.savingsPct / 100) *
                      (formData.collateralPct / 100);
                    const additionalBtcAvailable =
                      fullBtcSavings - currentCollateralBtc;

                    if (formData.collateralPct < 100) {
                      // Calculate improved liquidation price with additional collateral
                      const currentLoanAmount = dynamicLoanValues.loanPrincipal;
                      const newTotalCollateralBtc =
                        currentCollateralBtc + additionalBtcAvailable;
                      const improvedLiquidationPrice =
                        currentLoanAmount / (newTotalCollateralBtc * 0.8);

                      return (
                        <div className="mt-1">
                          <span className="text-sm text-red-600">
                            💡 If margin called, you could add up to ~
                            {formatNumber(
                              Math.round(additionalBtcAvailable * 4) / 4,
                              1,
                            )}{" "}
                            BTC to the collateral position to lower liquidation
                            price to ~
                            {formatCurrency(
                              Math.round(improvedLiquidationPrice / 1000) *
                                1000,
                              0,
                            )}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </li>
              </ul>
            )}
          </>
        ) : (
          <div className="col-span-2 text-center py-4">
            <p className="text-green-700 font-medium">
              ✅ Conservative Configuration
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Your current settings represent a low-risk approach with 100%
              savings allocation and no income generation or leverage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
