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
        label: "Investments",
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
        label: "Speculation",
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
              display: false, // Remove redundant "Yield %" title
            },
            ticks: {
              color: colors.textSecondary,
              callback: function (value: any) {
                return `${Math.round(value)}%`; // Remove decimals from percentages
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
            },
          },
          tooltip: {
            backgroundColor: colors.surfaceAlt,
            titleColor: colors.textPrimary,
            bodyColor: colors.textPrimary,
            borderColor: colors.accent,
            borderWidth: 1,
            callbacks: {
              label: function (context: any) {
                const value = parseFloat(context.parsed.y);
                return `${context.dataset.label}: ${value}%/year ₿`;
              },
              afterBody: function () {
                return "Annual yield on bitcoin stack";
              },
            },
          },
        },
      }}
    />
  );
};
