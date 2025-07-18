import { useMemo } from "react";
import { CalculationResults, FormData } from "../types";

interface UseChartDataProps {
  calculationResults: CalculationResults;
  formData: FormData;
  getBtcPriceAtYear: (yearIndex: number) => number;
}

export const useChartData = ({
  calculationResults,
  formData,
  getBtcPriceAtYear,
}: UseChartDataProps) => {
  const resultChartData = useMemo(
    () => ({
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "Pure growth (no income)",
          data: calculationResults.results.map((r) => r.btcWithoutIncome),
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Minus income allocation",
          data: calculationResults.results.map((r) => r.btcWithIncome),
          borderColor: "#1A73E8",
          backgroundColor: "rgba(26, 115, 232, 0.2)",
          fill: false,
          tension: 0.1,
        },
      ],
    }),
    [calculationResults.results],
  );

  const incomeChartData = useMemo(
    () => ({
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "USD Income ($k/year)",
          data: calculationResults.usdIncome.map((v) => v / 1000),
          borderColor: "#1A73E8",
          backgroundColor: "rgba(26, 115, 232, 0.2)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Annual Expenses ($k/year)",
          data: calculationResults.annualExpenses.map((v) => v / 1000),
          borderColor: "#DC2626",
          backgroundColor: "rgba(220, 38, 38, 0.2)",
          fill: false,
          tension: 0.1,
        },
        ...(formData.collateralPct > 0
          ? [
              {
                label: "USD Income with Leverage ($k/year)",
                data: calculationResults.usdIncomeWithLeverage.map(
                  (v) => v / 1000,
                ),
                borderColor: "#8B5CF6",
                backgroundColor: "rgba(139, 92, 246, 0.2)",
                fill: false,
                tension: 0.1,
              },
            ]
          : []),
      ],
    }),
    [
      calculationResults.results,
      calculationResults.usdIncome,
      calculationResults.annualExpenses,
      calculationResults.usdIncomeWithLeverage,
      formData.collateralPct,
    ],
  );

  const incomePotentialChartData = useMemo(
    () => ({
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "Annual Income Potential ($k/year)",
          data: calculationResults.incomeAtActivationYears.map((v) => v / 1000),
          borderColor: "#1A73E8",
          backgroundColor: "rgba(26, 115, 232, 0.2)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Annual Expenses at Activation ($k/year)",
          data: calculationResults.expensesAtActivationYears.map(
            (v) => v / 1000,
          ),
          borderColor: "#DC2626",
          backgroundColor: "rgba(220, 38, 38, 0.2)",
          fill: false,
          tension: 0.1,
        },
        ...(formData.collateralPct > 0
          ? [
              {
                label: "Income Potential with Leverage ($k/year)",
                data: calculationResults.incomeAtActivationYearsWithLeverage.map(
                  (v) => v / 1000,
                ),
                borderColor: "#8B5CF6",
                backgroundColor: "rgba(139, 92, 246, 0.2)",
                fill: false,
                tension: 0.1,
              },
            ]
          : []),
      ],
    }),
    [
      calculationResults.results,
      calculationResults.incomeAtActivationYears,
      calculationResults.expensesAtActivationYears,
      calculationResults.incomeAtActivationYearsWithLeverage,
      formData.collateralPct,
    ],
  );

  const incomeBtcChartData = useMemo(
    () => ({
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "USD Income (BTC equivalent)",
          data: calculationResults.usdIncome.map((income, index) => {
            if (income === 0) return 0;
            const btcPriceAtYear = getBtcPriceAtYear(index);
            return income / btcPriceAtYear;
          }),
          borderColor: "#1A73E8",
          backgroundColor: "rgba(26, 115, 232, 0.2)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Annual Expenses (BTC equivalent)",
          data: calculationResults.annualExpenses.map((expenses, index) => {
            const btcPriceAtYear = getBtcPriceAtYear(index);
            return expenses / btcPriceAtYear;
          }),
          borderColor: "#DC2626",
          backgroundColor: "rgba(220, 38, 38, 0.2)",
          fill: false,
          tension: 0.1,
        },
        ...(formData.collateralPct > 0
          ? [
              {
                label: "USD Income with Leverage (BTC equivalent)",
                data: calculationResults.usdIncomeWithLeverage.map(
                  (income, index) => {
                    if (income === 0) return 0;
                    const btcPriceAtYear = getBtcPriceAtYear(index);
                    return income / btcPriceAtYear;
                  },
                ),
                borderColor: "#8B5CF6",
                backgroundColor: "rgba(139, 92, 246, 0.2)",
                fill: false,
                tension: 0.1,
              },
            ]
          : []),
      ],
    }),
    [
      calculationResults.results,
      calculationResults.usdIncome,
      calculationResults.annualExpenses,
      calculationResults.usdIncomeWithLeverage,
      getBtcPriceAtYear,
      formData.collateralPct,
    ],
  );

  return {
    resultChartData,
    incomeChartData,
    incomePotentialChartData,
    incomeBtcChartData,
  };
};
