import React from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../contexts/ThemeContext";
import { FormData } from "../../types";
import { getAllChartColors } from "../../utils/chartTheme";

interface Props {
  formData: FormData;
}

export const BtcExchangeChart: React.FC<Props> = ({ formData }) => {
  const { theme } = useTheme();
  const { timeHorizon, exchangeRate, btcPriceCustomRates } = formData;

  // Calculate BTC price for each year based on appreciation rates
  const btcPrices = [];
  let currentPrice = exchangeRate;
  btcPrices.push(currentPrice);

  for (let year = 0; year < timeHorizon; year++) {
    const appreciationRate = btcPriceCustomRates[year] || 0;
    currentPrice = currentPrice * (1 + appreciationRate / 100);
    btcPrices.push(currentPrice);
  }

  const colors = getAllChartColors(theme).theme;
  const datasetColors = getAllChartColors(theme).datasets;

  const formatPriceWithCommas = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}`;
    } else if (value >= 1000) {
      return `${Math.round(value / 1000).toLocaleString()}K`;
    } else {
      return `${Math.round(value).toLocaleString()}`;
    }
  };

  const priceChartData = {
    labels: Array.from({ length: timeHorizon + 1 }, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: "BTC / USD ($Ms)",
        data: btcPrices,
        borderColor: datasetColors.warning,
        backgroundColor: datasetColors.warningBg,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Line
      key={theme} // Force re-render when theme changes
      data={priceChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "USD  /  BTC  ($Ms)",
              color: colors.textPrimary,
              font: {
                family: "Inter, system-ui, sans-serif",
              },
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                family: "JetBrains Mono, monospace",
              },
              callback: function (value) {
                return formatPriceWithCommas(Number(value));
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
              color: colors.textPrimary,
              font: {
                family: "Inter, system-ui, sans-serif",
              },
            },
            ticks: {
              color: colors.textSecondary,
              font: {
                family: "JetBrains Mono, monospace",
              },
            },
            grid: {
              color: colors.border,
            },
          },
        },
        plugins: {
          title: {
            display: false,
            text: "Projected USD Exchange Rate",
          },
          legend: {
            display: false,
            position: "bottom",
          },
          tooltip: {
            backgroundColor: colors.surfaceAlt,
            titleColor: colors.textPrimary,
            bodyColor: colors.textPrimary,
            borderColor: colors.accent,
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `USD / BTC: $${formatPriceWithCommas(context.parsed.y)}${
                  context.parsed.y >= 1000000 ? "M" : ""
                }`;
              },
            },
          },
        },
      }}
    />
  );
};
