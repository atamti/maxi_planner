import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../contexts/ThemeContext";
import { FormData } from "../../types";
import { getAllChartColors } from "../../utils/chartTheme";

interface Props {
  formData: FormData;
}

export const YieldChart: React.FC<Props> = ({ formData }) => {
  const { theme } = useTheme();
  const {
    timeHorizon,
    investmentsStartYield,
    investmentsEndYield,
    speculationStartYield,
    speculationEndYield,
  } = formData;

  const colors = getAllChartColors(theme).theme;
  const datasetColors = getAllChartColors(theme).datasets;

  const yieldChartData = {
    labels: Array.from({ length: timeHorizon + 1 }, (_, i) => i),
    datasets: [
      {
        label: "Investments Yield (BTC %)",
        data: Array.from({ length: timeHorizon + 1 }, (_, i) =>
          (
            investmentsStartYield -
            (investmentsStartYield - investmentsEndYield) * (i / timeHorizon)
          ).toFixed(1),
        ),
        borderColor: datasetColors.warning,
        backgroundColor: datasetColors.warningBg,
        fill: false,
      },
      {
        label: "Speculation Yield (BTC %)",
        data: Array.from({ length: timeHorizon + 1 }, (_, i) =>
          (
            speculationStartYield -
            (speculationStartYield - speculationEndYield) * (i / timeHorizon)
          ).toFixed(1),
        ),
        borderColor: datasetColors.secondary,
        backgroundColor: datasetColors.secondaryBg,
        fill: false,
      },
    ],
  };

  return (
    <Line
      key={theme} // Force re-render when theme changes
      data={yieldChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Yield %",
              color: colors.textSecondary,
            },
            ticks: {
              color: colors.textSecondary,
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
            text: "Yield projections over time",
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
            },
          },
          tooltip: {
            backgroundColor: colors.surfaceAlt,
            titleColor: colors.textPrimary,
            bodyColor: colors.textPrimary,
            borderColor: colors.accent,
            borderWidth: 1,
          },
        },
      }}
    />
  );
};
