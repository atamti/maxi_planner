import React from "react";
import { CalculationResults, FormDataSubset } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatNumber";

interface Props {
  calculationResults: CalculationResults["results"];
  formData: FormDataSubset;
  showUSD: boolean;
  getBtcPriceAtYear: (year: number) => number;
}

export const FinalBtcStackCard: React.FC<Props> = ({
  calculationResults,
  formData,
  showUSD,
  getBtcPriceAtYear,
}) => {
  const { timeHorizon } = formData;
  const finalResult = calculationResults[calculationResults.length - 1];

  // Safety check: if no calculation results are available, return null
  if (!finalResult) {
    return null;
  }

  return (
    <div className="card-themed rounded-none p-6 border-2 border-bitcoin-orange bg-bitcoin-orange/5">
      <h3 className="font-poppins text-lg font-bold text-bitcoin-orange mb-4 uppercase tracking-wide">
        ₿ FINAL BTC STACK (YEAR {timeHorizon})
      </h3>
      <div className="space-y-4">
        <div className="metric-pulse p-3 bg-surface-alt rounded-none border border-themed">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide">
            WITH INCOME STRATEGY:
          </p>
          <p className="text-2xl font-bold text-bitcoin-orange font-inter">
            {formatNumber(finalResult.btcWithIncome)} BTC
          </p>
        </div>
        {showUSD && (
          <p className="text-sm text-secondary">
            ≈{" "}
            {formatCurrency(
              finalResult.btcWithIncome * getBtcPriceAtYear(timeHorizon),
              0,
            )}
          </p>
        )}

        <div className="p-3 bg-surface-alt rounded-none border border-themed">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide">
            PURE GROWTH (NO INCOME):
          </p>
          <p className="text-xl font-bold text-primary font-inter">
            {formatNumber(finalResult.btcWithoutIncome)} BTC
          </p>
        </div>
        {showUSD && (
          <p className="text-sm text-secondary">
            ≈{" "}
            {formatCurrency(
              finalResult.btcWithoutIncome * getBtcPriceAtYear(timeHorizon),
              0,
            )}
          </p>
        )}
      </div>
    </div>
  );
};
