import { useCallback, useMemo } from "react";
import { CalculationResults, FormData } from "../../types";
import { formatNumber } from "../formatNumber";

interface UseStaticChartSystemProps {
  calculationResults: CalculationResults;
  formData: FormData;
  onUpdateFormData?: (updates: Partial<FormData>) => void;
}

/**
 * Consolidated static chart system for Chart.js visualizations
 * Combines useChartConfig + useChartData functionality
 */
export const useStaticChartSystem = ({
  calculationResults,
  formData,
  onUpdateFormData,
}: UseStaticChartSystemProps) => {
  // Helper function to get BTC price at specific year
  const getBtcPriceAtYear = useCallback(
    (yearIndex: number): number => {
      if (
        formData.btcPriceCustomRates &&
        formData.btcPriceCustomRates.length > yearIndex
      ) {
        return (
          formData.exchangeRate *
          Math.pow(1 + formData.btcPriceCustomRates[yearIndex] / 100, yearIndex)
        );
      }
      return formData.exchangeRate * Math.pow(1.15, yearIndex); // Default 15% growth
    },
    [formData.btcPriceCustomRates, formData.exchangeRate],
  );

  // Chart data generation
  const chartData = useMemo(() => {
    const resultChartData = {
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
    };

    const btcGrowthChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "BTC Stack",
          data: calculationResults.results.map((r) => r.btcWithIncome),
          borderColor: "#F59E0B",
          backgroundColor: "rgba(245, 158, 11, 0.2)",
          fill: false,
          tension: 0.1,
        },
      ],
    };

    const usdValueChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "USD Value of BTC Stack",
          data: calculationResults.results.map(
            (r, index) => r.btcWithIncome * getBtcPriceAtYear(index),
          ),
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.2)",
          fill: false,
          tension: 0.1,
        },
      ],
    };

    const inflationChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "Expenses (USD)",
          data: calculationResults.annualExpenses,
          borderColor: "#DC2626",
          backgroundColor: "rgba(220, 38, 38, 0.2)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "USD Purchasing Power",
          data: calculationResults.annualExpenses.map(
            (expense, index) => calculationResults.annualExpenses[0] / expense,
          ),
          borderColor: "#7C3AED",
          backgroundColor: "rgba(124, 58, 237, 0.2)",
          fill: false,
          tension: 0.1,
          yAxisID: "y1",
        },
      ],
    };

    const btcExchangeChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "BTC Exchange Rate (USD)",
          data: calculationResults.results.map((_, index) =>
            getBtcPriceAtYear(index),
          ),
          borderColor: "#F97316",
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          fill: false,
          tension: 0.1,
        },
      ],
    };

    const incomeChartData = {
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
    };

    const incomePotentialChartData = {
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
    };

    const incomeBtcChartData = {
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
    };

    return {
      resultChartData,
      incomeChartData,
      incomePotentialChartData,
      incomeBtcChartData,
      btcGrowthChartData,
      usdValueChartData,
      inflationChartData,
      btcExchangeChartData,
    };
  }, [calculationResults, getBtcPriceAtYear]);

  // Chart configurations
  const chartConfigs = useMemo(() => {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2, // Width to height ratio (2:1)
      interaction: { mode: "index" as const, intersect: false },
      plugins: { legend: { position: "top" as const } },
    };

    const btcGrowthChartConfig = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "BTC" },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: "Bitcoin stack size over time",
        },
      },
    };

    const resultChartConfig = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "BTC" },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: "Portfolio Growth Comparison",
        },
      },
    };

    const usdValueChartConfig = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "USD Value" },
          ticks: {
            callback: function (value: any) {
              return "$" + formatNumber(value, 0);
            },
          },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: "USD Value of BTC Stack",
        },
      },
    };

    const inflationChartConfig = {
      ...commonOptions,
      scales: {
        y: {
          type: "linear" as const,
          display: true,
          position: "left" as const,
          title: { display: true, text: "USD" },
          ticks: {
            callback: function (value: any) {
              return "$" + formatNumber(value, 0);
            },
          },
        },
        y1: {
          type: "linear" as const,
          display: true,
          position: "right" as const,
          title: { display: true, text: "Purchasing Power Multiplier" },
          grid: { drawOnChartArea: false },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: "Expenses & USD Purchasing Power",
        },
      },
    };

    const usdIncomeChartConfig = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "USD Income/Expenses (thousands)",
          },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: "Annual USD income vs expenses",
        },
        legend: {
          position: "bottom" as const,
        },
      },
    };

    const incomeBtcChartConfig = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "BTC Equivalent",
          },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: "Income and expenses in BTC terms over time",
        },
        legend: {
          position: "bottom" as const,
        },
      },
    };

    const incomePotentialChartConfig = {
      ...commonOptions,
      scales: {
        y: {
          type: "logarithmic" as const,
          title: {
            display: true,
            text: "USD Income/Expenses (thousands, log scale)",
          },
        },
        x: { title: { display: true, text: "Activation Year" } },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: "Annual income potential vs expenses if activated in each year",
        },
        legend: {
          position: "bottom" as const,
        },
      },
      onClick: (event: any, elements: any) => {
        if (elements.length > 0) {
          const elementIndex = elements[0].index;
          onUpdateFormData?.({ activationYear: elementIndex });
        }
      },
    };

    const btcExchangeChartConfig = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "USD per BTC" },
          ticks: {
            callback: function (value: any) {
              return "$" + formatNumber(value, 0);
            },
          },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: "BTC Exchange Rate Projection",
        },
      },
    };

    return {
      btcGrowthChartConfig,
      usdIncomeChartConfig,
      incomeBtcChartConfig,
      incomePotentialChartConfig,
      resultChartConfig,
      usdValueChartConfig,
      inflationChartConfig,
      btcExchangeChartConfig,
    };
  }, [formData.activationYear]); // Removed onUpdateFormData from dependencies

  return {
    // Chart data
    ...chartData,

    // Chart configurations
    ...chartConfigs,

    // Utility functions
    getBtcPriceAtYear,

    // Update handlers
    onUpdateFormData,
  };
};
