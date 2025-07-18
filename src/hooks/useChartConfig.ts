import { useMemo } from "react";
import { CalculationResults, FormData } from "../types";
import { formatNumber } from "../utils/formatNumber";

interface UseChartConfigProps {
  calculationResults: CalculationResults;
  formData: FormData;
  onUpdateFormData?: (updates: Partial<FormData>) => void;
}

export const useChartConfig = ({
  calculationResults,
  formData,
  onUpdateFormData,
}: UseChartConfigProps) => {
  const btcGrowthChartConfig = useMemo(
    () => ({
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "BTC" },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        title: {
          display: true,
          text: "Bitcoin stack size over time",
        },
        legend: {
          position: "bottom" as const,
        },
        tooltip: {
          displayColors: true,
          callbacks: {
            title: function () {
              return ""; // Remove year from title
            },
            label: function (context: any) {
              return `${formatNumber(context.parsed.y, 1)} : ${context.dataset.label}`;
            },
            labelTextColor: function (context: any) {
              // Use darker colors for better contrast against tooltip background
              if (context.dataset.label?.includes("Pure growth")) {
                return "#EFEFEF"; // Dark gray instead of light gray
              }
              return context.dataset.borderColor as string;
            },
            afterLabel: function (context: any) {
              const year = context.dataIndex;
              const withIncome = calculationResults.results[year].btcWithIncome;
              const withoutIncome =
                calculationResults.results[year].btcWithoutIncome;
              const gap = withoutIncome - withIncome;

              if (context.dataset.label?.includes("Minus income allocation")) {
                return `${formatNumber(gap, 1)} : Gap`;
              }
              return;
            },
          },
        },
      },
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
    }),
    [calculationResults],
  );

  const usdIncomeChartConfig = useMemo(
    () => ({
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "USD Income/Expenses (thousands)",
          },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        title: {
          display: true,
          text: "Annual USD income vs expenses",
        },
        legend: {
          position: "bottom" as const,
        },
      },
    }),
    [],
  );

  const incomeBtcChartConfig = useMemo(
    () => ({
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "BTC Equivalent",
          },
        },
        x: { title: { display: true, text: "Years" } },
      },
      plugins: {
        title: {
          display: true,
          text: "Income and expenses in BTC terms over time",
        },
        legend: {
          position: "bottom" as const,
        },
      },
    }),
    [],
  );

  const incomePotentialChartConfig = useMemo(
    () => ({
      scales: {
        y: {
          type: "logarithmic" as const,
          title: {
            display: true,
            text: "USD Income/Expenses (thousands, log scale)",
          },
        },
        x: { title: { display: true, text: "Activation Year" } },
      },
      plugins: {
        title: {
          display: true,
          text: "Annual income potential vs expenses if activated in each year",
        },
        legend: {
          position: "bottom" as const,
        },
      },
      onClick: (event: any, elements: any) => {
        if (elements.length > 0) {
          const elementIndex = elements[0].index;
          onUpdateFormData?.({ activationYear: elementIndex });
        }
      },
    }),
    [onUpdateFormData],
  );

  return {
    btcGrowthChartConfig,
    usdIncomeChartConfig,
    incomeBtcChartConfig,
    incomePotentialChartConfig,
  };
};
