import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../contexts/ThemeContext";
import { FormData } from "../../types";
import { getAllChartColors } from "../../utils/chartTheme";

interface Props {
  formData: FormData;
}

export const UsdPurchasingPowerChart: React.FC<Props> = ({ formData }) => {
  const { theme } = useTheme();
  const { timeHorizon, inflationCustomRates } = formData;

  // Calculate purchasing power for each year based on inflation rates
  const purchasingPowerValues = [];
  let currentPurchasingPower = 100; // Start at 100% (current value)
  purchasingPowerValues.push(currentPurchasingPower);

  for (let year = 0; year < timeHorizon; year++) {
    const inflationRate = inflationCustomRates[year] || 0;
    // Purchasing power decreases by the inflation rate each year
    currentPurchasingPower = currentPurchasingPower / (1 + inflationRate / 100);
    purchasingPowerValues.push(currentPurchasingPower);
  }

  const colors = getAllChartColors(theme).theme;
  const datasetColors = getAllChartColors(theme).datasets;

  const formatPurchasingPower = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const purchasingPowerChartData = {
    labels: Array.from({ length: timeHorizon + 1 }, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: "USD Purchasing Power",
        data: purchasingPowerValues,
        borderColor: datasetColors.error,
        backgroundColor: datasetColors.errorBg,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Line
      key={theme} // Force re-render when theme changes
      data={purchasingPowerChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: false, // Remove redundant axis title
            },
            ticks: {
              color: colors.textSecondary,
              callback: function (value) {
                return `${Math.round(Number(value))}%`; // Simplify format, remove decimals
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
                return `Purchasing Power: ${formatPurchasingPower(context.parsed.y)}`;
              },
            },
          },
        },
      }}
    />
  );
};
