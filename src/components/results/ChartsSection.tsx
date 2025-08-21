import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { CalculationResults, FormDataSubset } from "../../types";
import { useStaticChartSystem } from "../../utils/shared";
import { AllocationEvolutionChart } from "../charts/AllocationEvolutionChart";
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
  const { theme } = useTheme();

  const {
    resultChartData,
    incomeChartData,
    incomePotentialChartData,
    incomeBtcChartData,
    btcGrowthChartConfig,
    usdIncomeChartConfig,
    incomeBtcChartConfig,
    incomePotentialChartConfig,
  } = useStaticChartSystem({
    calculationResults: results,
    formData: formData as any, // Type assertion for compatibility
    theme: theme,
    onUpdateFormData: onUpdateFormData
      ? (updates: Partial<any>) =>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <BtcGrowthChart
          key={`btc-growth-${theme}`}
          data={resultChartData}
          config={btcGrowthChartConfig}
        />
        <UsdIncomeChart
          key={`usd-income-${theme}`}
          data={incomeChartData}
          config={usdIncomeChartConfig}
        />
      </div>

      {/* Income Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <IncomeBtcChart
          key={`income-btc-${theme}`}
          data={incomeBtcChartData}
          config={incomeBtcChartConfig}
        />
        <IncomePotentialChart
          key={`income-potential-${theme}`}
          data={incomePotentialChartData}
          config={incomePotentialChartConfig}
        />
      </div>

      {/* Allocation Evolution Chart */}
      <div className="mt-4">
        <AllocationEvolutionChart formData={formData} />
      </div>
    </>
  );
};
