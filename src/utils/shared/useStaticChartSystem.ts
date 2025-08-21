import { useCallback, useMemo } from "react";
import { CalculationResults, FormData } from "../../types";
import { getAllChartColors } from "../chartTheme";
import { formatNumber } from "../formatNumber";

interface UseStaticChartSystemProps {
  calculationResults: CalculationResults;
  formData: FormData;
  theme?: "light" | "dark";
  onUpdateFormData?: (updates: Partial<FormData>) => void;
}

/**
 * Consolidated static chart system for Chart.js visualizations
 * Combines useChartConfig + useChartData functionality
 */
export const useStaticChartSystem = ({
  calculationResults,
  formData,
  theme = "light",
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
    const datasetColors = getAllChartColors(theme).datasets;
    const resultChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "Full Stack",
          data: calculationResults.results.map((r) => r.btcWithoutIncome),
          borderColor: datasetColors.success,
          backgroundColor: datasetColors.successBg,
          fill: false,
          tension: 0.1,
        },
        {
          label: "After Income",
          data: calculationResults.results.map((r) => r.btcWithIncome),
          borderColor: datasetColors.primary,
          backgroundColor: datasetColors.primaryBg,
          fill: false,
          tension: 0.1,
        },
      ],
    };

    const btcGrowthChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "Stack",
          data: calculationResults.results.map((r) => r.btcWithIncome),
          borderColor: datasetColors.primary,
          backgroundColor: datasetColors.primaryBg,
          fill: false,
          tension: 0.1,
        },
      ],
    };

    const usdValueChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "USD Value",
          data: calculationResults.results.map(
            (r, index) => r.btcWithIncome * getBtcPriceAtYear(index),
          ),
          borderColor: datasetColors.success,
          backgroundColor: datasetColors.successBg,
          fill: false,
          tension: 0.1,
        },
      ],
    };

    const inflationChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "Expenses",
          data: calculationResults.annualExpenses,
          borderColor: datasetColors.error,
          backgroundColor: datasetColors.errorBg,
          fill: false,
          tension: 0.1,
        },
        {
          label: "Purchasing Power",
          data: calculationResults.annualExpenses.map(
            (expense, index) => calculationResults.annualExpenses[0] / expense,
          ),
          borderColor: datasetColors.purple,
          backgroundColor: datasetColors.purpleBg,
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
          label: "Exchange Rate",
          data: calculationResults.results.map((_, index) =>
            getBtcPriceAtYear(index),
          ),
          borderColor: datasetColors.warning,
          backgroundColor: datasetColors.warningBg,
          fill: false,
          tension: 0.1,
        },
      ],
    };

    const incomeChartData = {
      labels: calculationResults.results.map((r) => r.year),
      datasets: [
        {
          label: "Income",
          data: calculationResults.usdIncome.map((v) => v / 1000),
          borderColor: datasetColors.info,
          backgroundColor: datasetColors.infoBg,
          fill: false,
          tension: 0.1,
        },
        {
          label: "Expenses",
          data: calculationResults.annualExpenses.map((v) => v / 1000),
          borderColor: datasetColors.error,
          backgroundColor: datasetColors.errorBg,
          fill: false,
          tension: 0.1,
        },
        ...(formData.collateralPct > 0
          ? [
              {
                label: "Income + Leverage",
                data: calculationResults.usdIncomeWithLeverage.map(
                  (v) => v / 1000,
                ),
                borderColor: datasetColors.purple,
                backgroundColor: datasetColors.purpleBg,
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
          label: "Income Potential",
          data: calculationResults.incomeAtActivationYears.map((v) => v / 1000),
          borderColor: datasetColors.info,
          backgroundColor: datasetColors.infoBg,
          fill: false,
          tension: 0.1,
        },
        {
          label: "Expenses at Activation",
          data: calculationResults.expensesAtActivationYears.map(
            (v) => v / 1000,
          ),
          borderColor: datasetColors.error,
          backgroundColor: datasetColors.errorBg,
          fill: false,
          tension: 0.1,
        },
        ...(formData.collateralPct > 0
          ? [
              {
                label: "Income + Leverage",
                data: calculationResults.incomeAtActivationYearsWithLeverage.map(
                  (v) => v / 1000,
                ),
                borderColor: datasetColors.purple,
                backgroundColor: datasetColors.purpleBg,
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
          label: "Income",
          data: calculationResults.usdIncome.map((income, index) => {
            if (income === 0) return 0;
            const btcPriceAtYear = getBtcPriceAtYear(index);
            return income / btcPriceAtYear;
          }),
          borderColor: datasetColors.info,
          backgroundColor: datasetColors.infoBg,
          fill: false,
          tension: 0.1,
        },
        {
          label: "Expenses",
          data: calculationResults.annualExpenses.map((expenses, index) => {
            const btcPriceAtYear = getBtcPriceAtYear(index);
            return expenses / btcPriceAtYear;
          }),
          borderColor: datasetColors.error,
          backgroundColor: datasetColors.errorBg,
          fill: false,
          tension: 0.1,
        },
        ...(formData.collateralPct > 0
          ? [
              {
                label: "Income + Leverage",
                data: calculationResults.usdIncomeWithLeverage.map(
                  (income, index) => {
                    if (income === 0) return 0;
                    const btcPriceAtYear = getBtcPriceAtYear(index);
                    return income / btcPriceAtYear;
                  },
                ),
                borderColor: datasetColors.purple,
                backgroundColor: datasetColors.purpleBg,
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
  }, [calculationResults, getBtcPriceAtYear, theme]);

  // Chart configurations
  const chartConfigs = useMemo(() => {
    const { theme: themeColors } = getAllChartColors(theme);
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2, // Width to height ratio (2:1)
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            color: themeColors.textPrimary,
            font: {
              family: "Inter, system-ui, sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: themeColors.surfaceAlt,
          titleColor: themeColors.textPrimary,
          bodyColor: themeColors.textPrimary,
          borderColor: themeColors.accent,
          borderWidth: 1,
          callbacks: {
            label: function (context: any) {
              const value = context.parsed.y;
              let formattedValue;

              // Format based on the scale of the number
              if (value >= 1000) {
                formattedValue = Math.round(value).toLocaleString();
              } else if (value >= 10) {
                formattedValue = Math.round(value);
              } else if (value >= 1) {
                formattedValue = Math.round(value * 10) / 10;
              } else {
                formattedValue = Math.round(value * 100) / 100;
              }

              return `${context.dataset.label}: ${formattedValue}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: themeColors.textSecondary,
            font: {
              family: "JetBrains Mono, monospace",
            },
          },
          grid: {
            color: themeColors.border,
          },
          title: {
            color: themeColors.textPrimary,
            font: {
              family: "Inter, system-ui, sans-serif",
            },
          },
        },
        y: {
          ticks: {
            color: themeColors.textSecondary,
            font: {
              family: "JetBrains Mono, monospace",
            },
          },
          grid: {
            color: themeColors.border,
          },
          title: {
            color: themeColors.textPrimary,
            font: {
              family: "Inter, system-ui, sans-serif",
            },
          },
        },
      },
    };

    const btcGrowthChartConfig = {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales.y,
          beginAtZero: true,
          title: {
            ...commonOptions.scales.y.title,
            display: false, // Remove redundant y-axis title
          },
          ticks: {
            ...commonOptions.scales.y.ticks,
            callback: function (value: any) {
              return Math.round(value); // Remove ₿ symbol, just show numbers
            },
          },
        },
        x: {
          ...commonOptions.scales.x,
          title: {
            ...commonOptions.scales.x.title,
            display: false, // Remove redundant x-axis title
          },
          ticks: {
            ...commonOptions.scales.x.ticks,
            callback: function (value: any, index: number, values: any[]) {
              if (values.length <= 6) return `Y${value}`;
              if (index === 0 || index === values.length - 1)
                return `Y${value}`;
              return index % 2 === 0 ? `Y${value}` : "";
            },
          },
          grid: {
            display: false, // Remove vertical grid lines
          },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: false, // Remove redundant chart title
        },
      },
    };

    const resultChartConfig = {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales.y,
          beginAtZero: true,
          title: {
            ...commonOptions.scales.y.title,
            display: true,
            text: "BTC",
          },
        },
        x: {
          ...commonOptions.scales.x,
          title: {
            ...commonOptions.scales.x.title,
            display: true,
            text: "Years",
          },
        },
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
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales.y,
          beginAtZero: true,
          title: {
            ...commonOptions.scales.y.title,
            display: false, // Remove redundant y-axis title
          },
          ticks: {
            ...commonOptions.scales.y.ticks,
            callback: function (value: any) {
              return Math.round(value); // Just show numbers without $k
            },
          },
        },
        x: {
          ...commonOptions.scales.x,
          title: {
            ...commonOptions.scales.x.title,
            display: false, // Remove redundant x-axis title
          },
          ticks: {
            ...commonOptions.scales.x.ticks,
            callback: function (value: any, index: number, values: any[]) {
              if (values.length <= 6) return `Y${value}`;
              if (index === 0 || index === values.length - 1)
                return `Y${value}`;
              return index % 2 === 0 ? `Y${value}` : "";
            },
          },
          grid: {
            display: false, // Remove vertical grid lines
          },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: false, // Remove redundant chart title
        },
        legend: {
          position: "bottom" as const,
        },
      },
    };

    const incomeBtcChartConfig = {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales.y,
          beginAtZero: true,
          title: {
            ...commonOptions.scales.y.title,
            display: false, // Remove redundant y-axis title
          },
          ticks: {
            ...commonOptions.scales.y.ticks,
            callback: function (value: any) {
              return Math.round(value * 100) / 100; // Show clean decimal without ₿ symbol
            },
          },
        },
        x: {
          ...commonOptions.scales.x,
          title: {
            ...commonOptions.scales.x.title,
            display: false, // Remove redundant x-axis title
          },
          ticks: {
            ...commonOptions.scales.x.ticks,
            callback: function (value: any, index: number, values: any[]) {
              if (values.length <= 6) return `Y${value}`;
              if (index === 0 || index === values.length - 1)
                return `Y${value}`;
              return index % 2 === 0 ? `Y${value}` : "";
            },
          },
          grid: {
            display: false, // Remove vertical grid lines
          },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: false, // Remove chart title (already handled by component)
        },
        legend: {
          position: "bottom" as const,
        },
      },
    };

    const incomePotentialChartConfig = {
      ...commonOptions,
      scales: {
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales.y,
          type: "logarithmic" as const,
          title: {
            ...commonOptions.scales.y.title,
            display: false, // Remove redundant y-axis title
          },
          ticks: {
            ...commonOptions.scales.y.ticks,
            callback: function (value: any) {
              return Math.round(value); // Just show numbers without $k
            },
          },
        },
        x: {
          ...commonOptions.scales.x,
          title: {
            ...commonOptions.scales.x.title,
            display: false, // Remove redundant x-axis title
          },
          ticks: {
            ...commonOptions.scales.x.ticks,
            callback: function (value: any, index: number, values: any[]) {
              if (values.length <= 6) return `Y${value}`;
              if (index === 0 || index === values.length - 1)
                return `Y${value}`;
              return index % 2 === 0 ? `Y${value}` : "";
            },
          },
          grid: {
            display: false, // Remove vertical grid lines
          },
        },
      },
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: false, // Remove redundant chart title
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
  }, [formData.activationYear, theme]); // Include theme for chart options re-computation

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
