import React from "react";
import { Line } from "react-chartjs-2";
import { FormData } from "../../types";

interface Props {
  formData: FormData;
}

export const BtcExchangeChart: React.FC<Props> = ({ formData }) => {
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

  const priceChartData = {
    labels: Array.from({ length: timeHorizon + 1 }, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: "BTC / USD ($Ms)",
        data: btcPrices,
        borderColor: "#F7931A",
        backgroundColor: "rgba(247, 147, 26, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const formatPriceWithCommas = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}`;
    } else if (value >= 1000) {
      return `${Math.round(value / 1000).toLocaleString()}K`;
    } else {
      return `${Math.round(value).toLocaleString()}`;
    }
  };

  return (
    <Line
      data={priceChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: "USD  /  BTC  ($Ms)" },
            ticks: {
              callback: function (value) {
                return formatPriceWithCommas(Number(value));
              },
            },
          },
          x: {
            title: { display: true, text: "Years" },
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
