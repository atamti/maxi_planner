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
    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
      <h3 className="text-lg font-semibold text-orange-800 mb-3">
        ₿ Final BTC Stack (Year {timeHorizon})
      </h3>
      <div className="space-y-2">
        <p>
          <strong>With Income Strategy:</strong>
          <br />
          {formatNumber(finalResult.btcWithIncome)} BTC
        </p>
        {showUSD && (
          <p className="text-sm text-gray-600">
            (
            {formatCurrency(
              finalResult.btcWithIncome * getBtcPriceAtYear(timeHorizon),
              0,
            )}
            )
          </p>
        )}
        <p>
          <strong>Pure Growth (No Income):</strong>
          <br />
          {formatNumber(finalResult.btcWithoutIncome)} BTC
        </p>
        {showUSD && (
          <p className="text-sm text-gray-600">
            (
            {formatCurrency(
              finalResult.btcWithoutIncome * getBtcPriceAtYear(timeHorizon),
              0,
            )}
            )
          </p>
        )}
      </div>
    </div>
  );
};
