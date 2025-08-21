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
              display: true,
              text: "Purchasing Power (%)",
              color: colors.textSecondary,
              font: { weight: "bold" },
            },
            ticks: {
              color: colors.textSecondary,
              callback: function (value) {
                return formatPurchasingPower(Number(value));
              },
            },
            grid: {
              color: colors.border,
            },
          },
          x: {
            title: {
              display: true,
              text: "Years",
              color: colors.textSecondary,
              font: { weight: "bold" },
            },
            ticks: {
              color: colors.textSecondary,
            },
            grid: {
              color: colors.border,
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: "USD PURCHASING POWER DECAY OVER TIME",
            color: colors.textPrimary,
            font: {
              weight: "bold",
              size: 14,
            },
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
