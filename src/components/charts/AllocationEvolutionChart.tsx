import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { FormDataSubset } from "../../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
  formData: FormDataSubset;
  className?: string;
}

export const AllocationEvolutionChart: React.FC<Props> = ({
  formData,
  className = "",
}) => {
  const chartData = useMemo(() => {
    const {
      timeHorizon,
      btcStack,
      savingsPct,
      investmentsPct,
      speculationPct,
      investmentsStartYield,
      investmentsEndYield,
      speculationStartYield,
      speculationEndYield,
      enableAnnualReallocation = false,
    } = formData;

    // Calculate initial allocation in BTC based on full stack
    const initialSavings = btcStack * (savingsPct / 100);
    const initialInvestments = btcStack * (investmentsPct / 100);
    const initialSpeculation = btcStack * (speculationPct / 100);

    // Calculate evolution over time
    const years = Array.from({ length: timeHorizon + 1 }, (_, i) => i);
    const savingsData: number[] = [];
    const investmentsData: number[] = [];
    const speculationData: number[] = [];

    if (enableAnnualReallocation) {
      // Annual reallocation method: rebalance to target percentages each year
      let currentTotal = btcStack;

      years.forEach((year) => {
        // Apply allocation percentages to current total
        savingsData.push(currentTotal * (savingsPct / 100));
        investmentsData.push(currentTotal * (investmentsPct / 100));
        speculationData.push(currentTotal * (speculationPct / 100));

        // Calculate growth for next year if not the last year
        if (year < timeHorizon) {
          const progressRatio = timeHorizon > 0 ? year / timeHorizon : 0;
          const currentInvestmentYield =
            investmentsStartYield -
            (investmentsStartYield - investmentsEndYield) * progressRatio;
          const currentSpeculationYield =
            speculationStartYield -
            (speculationStartYield - speculationEndYield) * progressRatio;

          // Apply yields and calculate new total
          const savingsAfterYield = currentTotal * (savingsPct / 100) * 1; // No yield
          const investmentsAfterYield =
            currentTotal *
            (investmentsPct / 100) *
            (1 + currentInvestmentYield / 100);
          const speculationAfterYield =
            currentTotal *
            (speculationPct / 100) *
            (1 + currentSpeculationYield / 100);

          currentTotal =
            savingsAfterYield + investmentsAfterYield + speculationAfterYield;
        }
      });
    } else {
      // Compound growth method: let each bucket grow independently
      let savingsAmount = initialSavings;
      let investmentsAmount = initialInvestments;
      let speculationAmount = initialSpeculation;

      years.forEach((year) => {
        // Record current values
        savingsData.push(savingsAmount);
        investmentsData.push(investmentsAmount);
        speculationData.push(speculationAmount);

        // Calculate growth for next year if not the last year
        if (year < timeHorizon) {
          const progressRatio = timeHorizon > 0 ? year / timeHorizon : 0;
          const currentInvestmentYield =
            investmentsStartYield -
            (investmentsStartYield - investmentsEndYield) * progressRatio;
          const currentSpeculationYield =
            speculationStartYield -
            (speculationStartYield - speculationEndYield) * progressRatio;

          // Apply compound growth to each bucket independently
          // Savings stay constant (no yield)
          investmentsAmount *= 1 + currentInvestmentYield / 100;
          speculationAmount *= 1 + currentSpeculationYield / 100;
        }
      });
    }

    return {
      labels: years.map((year) => `Year ${year}`),
      datasets: [
        {
          label: "Savings (₿)",
          data: savingsData,
          backgroundColor: "rgba(34, 197, 94, 0.8)", // green
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
        {
          label: "Investments (₿)",
          data: investmentsData,
          backgroundColor: "rgba(59, 130, 246, 0.8)", // blue
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Speculation (₿)",
          data: speculationData,
          backgroundColor: "rgba(239, 68, 68, 0.8)", // red
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [formData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "BTC Allocation Evolution Over Time",
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          afterLabel: (context: any) => {
            const datasetIndex = context.datasetIndex;
            const year = context.dataIndex;
            const total = chartData.datasets.reduce(
              (sum, dataset) => sum + dataset.data[year],
              0,
            );
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${percentage}% of total`;
          },
          footer: (tooltipItems: any[]) => {
            const year = tooltipItems[0].dataIndex;
            const total = chartData.datasets.reduce(
              (sum, dataset) => sum + dataset.data[year],
              0,
            );
            return `Total: ${total.toFixed(3)} ₿`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "BTC Amount",
        },
        ticks: {
          callback: function (value: any) {
            return `${value.toFixed(2)} ₿`;
          },
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <div style={{ height: "400px" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
