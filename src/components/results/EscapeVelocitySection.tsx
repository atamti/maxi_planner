import React from "react";
import { CalculationResults, FormDataSubset } from "../../types";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
  getBtcPriceAtYear: (year: number) => number;
}

export const EscapeVelocitySection: React.FC<Props> = ({
  results,
  formData,
  getBtcPriceAtYear,
}) => {
  // Calculate escape velocity - when income exceeds expenses
  const calculateEscapeVelocity = () => {
    let escapeYearBase = null;
    let escapeYearLeveraged = null;

    for (let year = 0; year <= formData.timeHorizon; year++) {
      const income = results.incomeAtActivationYears[year] || 0;
      const incomeWithLeverage =
        results.incomeAtActivationYearsWithLeverage[year] || 0;
      const expenses = results.expensesAtActivationYears[year] || 0;

      // Check base scenario
      if (escapeYearBase === null && income > expenses) {
        escapeYearBase = year;
      }

      // Check leveraged scenario
      if (
        escapeYearLeveraged === null &&
        incomeWithLeverage > expenses &&
        formData.collateralPct > 0
      ) {
        escapeYearLeveraged = year;
      }

      // Break if we found both (or don't need leveraged)
      if (
        escapeYearBase !== null &&
        (escapeYearLeveraged !== null || formData.collateralPct === 0)
      ) {
        break;
      }
    }

    return { escapeYearBase, escapeYearLeveraged };
  };

  const escapeVelocity = calculateEscapeVelocity();

  return (
    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
        🚀 Escape Velocity Analysis
      </h3>
      <p className="text-sm text-yellow-700 mb-3">
        When income exceeds expenses by activation year:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded border">
          <p className="font-medium text-yellow-800 mb-1">Base Scenario:</p>
          {escapeVelocity.escapeYearBase !== null ? (
            <p className="text-lg font-bold text-green-600">
              Year {escapeVelocity.escapeYearBase}
            </p>
          ) : (
            <p className="text-lg font-bold text-red-600">Never reached</p>
          )}
          <p className="text-xs text-gray-600">
            When unleveraged income first exceeds expenses
          </p>
        </div>

        {formData.collateralPct > 0 && (
          <div className="bg-white p-3 rounded border">
            <p className="font-medium text-yellow-800 mb-1">
              Leveraged Scenario:
            </p>
            {escapeVelocity.escapeYearLeveraged !== null ? (
              <p className="text-lg font-bold text-green-600">
                Year {escapeVelocity.escapeYearLeveraged}
              </p>
            ) : (
              <p className="text-lg font-bold text-red-600">Never reached</p>
            )}
            <p className="text-xs text-gray-600">
              When leveraged income (after debt service) exceeds expenses
            </p>
          </div>
        )}
      </div>

      {escapeVelocity.escapeYearBase !== null &&
        escapeVelocity.escapeYearLeveraged !== null &&
        formData.collateralPct > 0 && (
          <div className="mt-3 p-2 bg-blue-100 rounded border">
            <p className="text-sm text-blue-800">
              💡 <strong>Leverage advantage:</strong>{" "}
              {escapeVelocity.escapeYearBase -
                escapeVelocity.escapeYearLeveraged >
              0
                ? `Leverage achieves escape velocity ${
                    escapeVelocity.escapeYearBase -
                    escapeVelocity.escapeYearLeveraged
                  } year(s) earlier`
                : escapeVelocity.escapeYearLeveraged -
                      escapeVelocity.escapeYearBase >
                    0
                  ? `Base scenario achieves escape velocity ${
                      escapeVelocity.escapeYearLeveraged -
                      escapeVelocity.escapeYearBase
                    } year(s) earlier`
                  : "Both scenarios achieve escape velocity in the same year"}
            </p>
          </div>
        )}
    </div>
  );
};
