import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../contexts/ThemeContext";
import { FormData } from "../../types";
import { getAllChartColors } from "../../utils/chartTheme";

interface Props {
  formData: FormData;
}

export const ExpensesInflationChart: React.FC<Props> = ({ formData }) => {
  const { theme } = useTheme();
  const { timeHorizon, inflationCustomRates, activationYear } = formData;

  // Calculate expenses for each year based on inflation rates
  const expenseValues = [];
  let currentExpenses = formData.startingExpenses || 50000; // Default starting expenses
  expenseValues.push(currentExpenses);

  for (let year = 0; year < timeHorizon; year++) {
    const inflationRate = inflationCustomRates[year] || 0;
    // Expenses increase by the inflation rate each year
    currentExpenses = currentExpenses * (1 + inflationRate / 100);
    expenseValues.push(currentExpenses);
  }

  const colors = getAllChartColors(theme).theme;
  const datasetColors = getAllChartColors(theme).datasets;

  const formatExpenses = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${Math.round(value / 1000)}K`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  const expensesChartData = {
    labels: Array.from({ length: timeHorizon + 1 }, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: "Annual Expenses (USD)",
        data: expenseValues,
        borderColor: datasetColors.error,
        backgroundColor: datasetColors.errorBg,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: expenseValues.map((_, i) =>
          i === activationYear ? datasetColors.warning : datasetColors.error,
        ),
        pointBorderColor: expenseValues.map((_, i) =>
          i === activationYear ? datasetColors.warning : datasetColors.error,
        ),
        pointRadius: expenseValues.map((_, i) =>
          i === activationYear ? 6 : 3,
        ),
      },
    ],
  };

  return (
    <Line
      key={theme} // Force re-render when theme changes
      data={expensesChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: false, // Remove redundant axis title
            },
            ticks: {
              color: colors.textSecondary,
              callback: function (value) {
                // Simplify format, remove unnecessary decimals
                const num = Number(value);
                if (num >= 1000000) return `$${(num / 1000000).toFixed(0)}M`;
                if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
                return `$${Math.round(num)}`;
              },
              maxTicksLimit: 6,
            },
            grid: {
              color: colors.border,
              lineWidth: 0.5,
            },
          },
          x: {
            title: {
              display: false, // Remove redundant "Years" title
            },
            ticks: {
              color: colors.textSecondary,
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
          title: {
            display: false, // Remove redundant chart title (already in component header)
          },
          legend: {
            position: "bottom",
            labels: {
              color: colors.textSecondary,
              font: { weight: "bold" },
            },
          },
          tooltip: {
            backgroundColor: colors.surfaceAlt,
            titleColor: colors.textPrimary,
            bodyColor: colors.textPrimary,
            borderColor: colors.accent,
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const isActivationYear = context.dataIndex === activationYear;
                const baseLabel = `Annual Expenses: ${formatExpenses(context.parsed.y)}`;
                return isActivationYear
                  ? `${baseLabel} (Activation Year)`
                  : baseLabel;
              },
            },
          },
        },
      }}
    />
  );
};
