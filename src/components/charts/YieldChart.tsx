import React from "react";
import { Line } from "react-chartjs-2";
import { FormData } from "../../types";

interface Props {
  formData: FormData;
}

export const YieldChart: React.FC<Props> = ({ formData }) => {
  const {
    timeHorizon,
    investmentsStartYield,
    investmentsEndYield,
    speculationStartYield,
    speculationEndYield,
  } = formData;

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
        borderColor: "#F7931A",
        backgroundColor: "rgba(247, 147, 26, 0.2)",
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
        borderColor: "#666666",
        backgroundColor: "rgba(102, 102, 102, 0.2)",
        fill: false,
      },
    ],
  };

  return (
    <Line
      data={yieldChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Yield %" },
          },
          x: { title: { display: true, text: "Years" } },
        },
        plugins: {
          title: {
            display: true,
            text: "Yield projections over time",
          },
          legend: {
            position: "bottom",
          },
        },
      }}
    />
  );
};
