import React from "react";
import { Line } from "react-chartjs-2";
import { FormData } from "../../types";

interface Props {
  formData: FormData;
}

export const UsdPurchasingPowerChart: React.FC<Props> = ({ formData }) => {
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

  const purchasingPowerChartData = {
    labels: Array.from({ length: timeHorizon + 1 }, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: "USD Purchasing Power",
        data: purchasingPowerValues,
        borderColor: "#DC2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const formatPurchasingPower = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Line
      data={purchasingPowerChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: "Purchasing Power (%)" },
            ticks: {
              callback: function (value) {
                return formatPurchasingPower(Number(value));
              },
            },
          },
          x: {
            title: { display: true, text: "Years" },
          },
        },
        plugins: {
          title: {
            display: true,
            text: "USD Purchasing Power Decay Over Time",
          },
          legend: {
            position: "bottom",
          },
          tooltip: {
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
