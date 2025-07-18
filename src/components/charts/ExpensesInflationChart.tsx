import React from "react";
import { Line } from "react-chartjs-2";
import { FormData } from "../types";

interface Props {
  formData: FormData;
}

export const ExpensesInflationChart: React.FC<Props> = ({ formData }) => {
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

  const expensesChartData = {
    labels: Array.from({ length: timeHorizon + 1 }, (_, i) => `Year ${i}`),
    datasets: [
      {
        label: "Annual Expenses (USD)",
        data: expenseValues,
        borderColor: "#DC2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: expenseValues.map((_, i) =>
          i === activationYear ? "#F59E0B" : "#DC2626",
        ),
        pointBorderColor: expenseValues.map((_, i) =>
          i === activationYear ? "#F59E0B" : "#DC2626",
        ),
        pointRadius: expenseValues.map((_, i) =>
          i === activationYear ? 6 : 3,
        ),
      },
    ],
  };

  const formatExpenses = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${Math.round(value / 1000)}K`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  return (
    <Line
      data={expensesChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Annual Expenses (USD)" },
            ticks: {
              callback: function (value) {
                return formatExpenses(Number(value));
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
            text: "Projected Annual Expenses Growth",
          },
          legend: {
            position: "bottom",
          },
          tooltip: {
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
