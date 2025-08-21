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
import { useTheme } from "../../contexts/ThemeContext";
import { FormDataSubset } from "../../types";
import { getAllChartColors } from "../../utils/chartTheme";

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
  const { theme } = useTheme();

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

    const { datasets: datasetColors } = getAllChartColors(theme);

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
          label: "Savings",
          data: savingsData,
          backgroundColor: datasetColors.success, // Use solid color instead of transparent
          borderColor: datasetColors.success,
          borderWidth: 0, // Remove border to eliminate wireframe effect
          barThickness: "flex" as const,
        },
        {
          label: "Investments",
          data: investmentsData,
          backgroundColor: datasetColors.info, // Use solid color instead of transparent
          borderColor: datasetColors.info,
          borderWidth: 0, // Remove border to eliminate wireframe effect
          barThickness: "flex" as const,
        },
        {
          label: "Speculation",
          data: speculationData,
          backgroundColor: datasetColors.error, // Use solid color instead of transparent
          borderColor: datasetColors.error,
          borderWidth: 0, // Remove border to eliminate wireframe effect
          barThickness: "flex" as const,
        },
      ],
    };
  }, [formData, theme]);

  const options = useMemo(() => {
    const { theme: themeColors } = getAllChartColors(theme);

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            color: themeColors.textPrimary,
            font: {
              family: "Inter, system-ui, sans-serif",
            },
          },
        },
        title: {
          display: false, // Using custom header instead
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          backgroundColor: themeColors.surfaceAlt,
          titleColor: themeColors.textPrimary,
          bodyColor: themeColors.textPrimary,
          borderColor: themeColors.accent,
          borderWidth: 1,
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
              return `Total: ${Math.round(total)}₿`; // Remove decimals
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: false, // Remove redundant "Time" label
          },
          ticks: {
            color: themeColors.textSecondary,
            font: {
              family: "JetBrains Mono, monospace",
            },
            callback: function (value: any, index: number) {
              // Show only every 2nd or 3rd year to reduce clutter
              const totalTicks = chartData.labels?.length || 0;
              if (totalTicks <= 6) return `Y${value}`;
              if (index === 0 || index === totalTicks - 1) return `Y${value}`;
              return index % 2 === 0 ? `Y${value}` : "";
            },
          },
          grid: {
            display: false, // Remove vertical grid lines
          },
        },
        y: {
          stacked: true,
          title: {
            display: false, // Remove redundant "BTC Amount" label
          },
          ticks: {
            color: themeColors.textSecondary,
            font: {
              family: "JetBrains Mono, monospace",
            },
            callback: function (value: any) {
              // Smart formatting based on scale to handle small BTC amounts
              if (value >= 1000) {
                return Math.round(value).toLocaleString();
              } else if (value >= 10) {
                return Math.round(value);
              } else if (value >= 1) {
                return Math.round(value * 10) / 10;
              } else if (value > 0) {
                return Math.round(value * 100) / 100;
              } else {
                return 0;
              }
            },
          },
          grid: {
            color: themeColors.border,
            lineWidth: 0.5, // Thinner grid lines
          },
        },
      },
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
    };
  }, [chartData, theme]); // Re-compute when theme changes

  return (
    <div
      className={`card-themed p-4 border border-bitcoin-orange shadow ${className}`}
    >
      <h3 className="font-heading text-lg font-bold text-bitcoin-orange mb-1 uppercase tracking-wide">
        📊 BTC ALLOCATION EVOLUTION OVER TIME
      </h3>
      <p className="text-sm text-secondary mb-4 font-mono">₿</p>
      <div style={{ height: "400px" }}>
        <Bar key={theme} data={chartData} options={options} />
      </div>
    </div>
  );
};
