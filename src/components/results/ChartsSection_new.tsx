import React from "react";
import { useChartConfig } from "../../hooks/useChartConfig";
import { useChartData } from "../../hooks/useChartData";
import { CalculationResults, FormDataSubset } from "../../types";
import { ActivationYearControl } from "../charts/individual/ActivationYearControl";
import { BtcGrowthChart } from "../charts/individual/BtcGrowthChart";
import { IncomeBtcChart } from "../charts/individual/IncomeBtcChart";
import { IncomePotentialChart } from "../charts/individual/IncomePotentialChart";
import { UsdIncomeChart } from "../charts/individual/UsdIncomeChart";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
  getBtcPriceAtYear: (year: number) => number;
  onUpdateFormData?: (updates: { activationYear: number }) => void;
}

export const ChartsSection: React.FC<Props> = ({
  results,
  formData,
  getBtcPriceAtYear,
  onUpdateFormData,
}) => {
  const {
    resultChartData,
    incomeChartData,
    incomePotentialChartData,
    incomeBtcChartData,
  } = useChartData({
    calculationResults: results,
    formData: formData as any, // Type assertion for compatibility
    getBtcPriceAtYear,
  });

  const {
    btcGrowthChartConfig,
    usdIncomeChartConfig,
    incomeBtcChartConfig,
    incomePotentialChartConfig,
  } = useChartConfig({
    calculationResults: results,
    formData: formData as any, // Type assertion for compatibility
    onUpdateFormData: onUpdateFormData
      ? (updates) =>
          onUpdateFormData({ activationYear: updates.activationYear! })
      : undefined,
  });

  return (
    <>
      <ActivationYearControl
        formData={formData as any} // Type assertion for compatibility
        onUpdateFormData={
          onUpdateFormData
            ? (updates) =>
                onUpdateFormData({ activationYear: updates.activationYear! })
            : undefined
        }
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <BtcGrowthChart data={resultChartData} config={btcGrowthChartConfig} />
        <UsdIncomeChart data={incomeChartData} config={usdIncomeChartConfig} />
      </div>

      {/* Income Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <IncomeBtcChart
          data={incomeBtcChartData}
          config={incomeBtcChartConfig}
        />
        <IncomePotentialChart
          data={incomePotentialChartData}
          config={incomePotentialChartConfig}
        />
      </div>
    </>
  );
};
