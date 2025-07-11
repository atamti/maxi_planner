import React from "react";
import { Line } from "react-chartjs-2";
import { CalculationResults } from "../types";
import { formatCurrency, formatNumber } from "../utils/formatNumber";

interface Props {
  results: CalculationResults;
  formData: {
    timeHorizon: number;
    exchangeRate: number;
    priceCrash: number;
    speculationPct: number;
    collateralPct: number;
    investmentsStartYield: number;
    investmentsEndYield: number;
    speculationStartYield: number;
    speculationEndYield: number;
    activationYear: number;
    btcPriceCustomRates: number[];
    inflationCustomRates: number[];
    incomeCustomRates: number[];
    startingExpenses: number;
  };
  showUSD: boolean;
  onUpdateFormData?: (updates: { activationYear: number }) => void;
}

export const ResultsSection: React.FC<Props> = ({
  results,
  formData,
  showUSD,
  onUpdateFormData,
}) => {
  const {
    results: calculationResults,
    usdIncome,
    usdIncomeWithLeverage,
    btcIncome,
    annualExpenses,
    incomeAtActivationYears,
    incomeAtActivationYearsWithLeverage,
    expensesAtActivationYears,
    loanPrincipal,
    loanInterest,
  } = results;
  const {
    timeHorizon,
    exchangeRate,
    priceCrash,
    speculationPct,
    collateralPct,
    investmentsStartYield,
    investmentsEndYield,
    speculationStartYield,
    speculationEndYield,
    activationYear,
  } = formData;

  const resultChartData = {
    labels: calculationResults.map((r) => r.year),
    datasets: [
      {
        label: "Pure growth",
        data: calculationResults.map((r) => r.btcWithoutIncome),
        borderColor: "#666666",
        backgroundColor: "rgba(102, 102, 102, 0.1)",
        fill: false,
        order: 2,
      },
      {
        label: "Minus income allocation",
        data: calculationResults.map((r) => r.btcWithIncome),
        borderColor: "#F7931A",
        backgroundColor: "rgba(247, 147, 26, 0.4)",
        fill: "+1",
        order: 1,
      },
    ],
  };

  // Helper function to get BTC price at a specific year using custom rates
  const getBtcPriceAtYear = (year: number): number => {
    let price = formData.exchangeRate;
    for (let i = 0; i < year; i++) {
      const appreciationRate = (formData.btcPriceCustomRates?.[i] || 50) / 100;
      price = price * (1 + appreciationRate);
    }
    return price;
  };

  const incomeChartData = {
    labels: calculationResults.map((r) => r.year),
    datasets: [
      {
        label: "USD Income ($k/year)",
        data: usdIncome.map((v) => v / 1000),
        borderColor: "#1A73E8",
        backgroundColor: "rgba(26, 115, 232, 0.2)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Annual Expenses ($k/year)",
        data: annualExpenses.map((v) => v / 1000),
        borderColor: "#DC2626",
        backgroundColor: "rgba(220, 38, 38, 0.2)",
        fill: false,
        tension: 0.1,
      },
      ...(formData.collateralPct > 0
        ? [
            {
              label: "USD Income with Leverage ($k/year)",
              data: usdIncomeWithLeverage.map((v) => v / 1000),
              borderColor: "#8B5CF6",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              fill: false,
              tension: 0.1,
            },
          ]
        : []),
    ],
  };

  const incomePotentialChartData = {
    labels: calculationResults.map((r) => r.year),
    datasets: [
      {
        label: "Annual Income Potential ($k/year)",
        data: incomeAtActivationYears.map((v) => v / 1000),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Annual Expenses at Activation ($k/year)",
        data: expensesAtActivationYears.map((v) => v / 1000),
        borderColor: "#DC2626",
        backgroundColor: "rgba(220, 38, 38, 0.2)",
        fill: false,
        tension: 0.1,
      },
      ...(formData.collateralPct > 0
        ? [
            {
              label: "Income Potential with Leverage ($k/year)",
              data: incomeAtActivationYearsWithLeverage.map((v) => v / 1000),
              borderColor: "#8B5CF6",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              fill: false,
              tension: 0.1,
            },
          ]
        : []),
    ],
  };

  const incomeBtcChartData = {
    labels: calculationResults.map((r) => r.year),
    datasets: [
      {
        label: "USD Income (BTC equivalent)",
        data: usdIncome.map((income, index) => {
          if (income === 0) return 0;
          const btcPriceAtYear = getBtcPriceAtYear(index);
          return income / btcPriceAtYear;
        }),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Annual Expenses (BTC equivalent)",
        data: annualExpenses.map((expenses, index) => {
          const btcPriceAtYear = getBtcPriceAtYear(index);
          return expenses / btcPriceAtYear;
        }),
        borderColor: "#DC2626",
        backgroundColor: "rgba(220, 38, 38, 0.2)",
        fill: false,
        tension: 0.1,
      },
      ...(formData.collateralPct > 0
        ? [
            {
              label: "USD Income with Leverage (BTC equivalent)",
              data: usdIncomeWithLeverage.map((income, index) => {
                if (income === 0) return 0;
                const btcPriceAtYear = getBtcPriceAtYear(index);
                return income / btcPriceAtYear;
              }),
              borderColor: "#8B5CF6",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              fill: false,
              tension: 0.1,
            },
          ]
        : []),
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p>
            <strong>Ending BTC Stack (Year {timeHorizon}):</strong>{" "}
            {formatNumber(
              calculationResults[calculationResults.length - 1].btcWithIncome,
            )}{" "}
            BTC
          </p>
          {showUSD && (
            <p>
              (
              {formatCurrency(
                calculationResults[calculationResults.length - 1]
                  .btcWithIncome * getBtcPriceAtYear(timeHorizon),
                0,
              )}
              )
            </p>
          )}
          <p>
            <strong>Without Income Allocation:</strong>{" "}
            {formatNumber(
              calculationResults[calculationResults.length - 1]
                .btcWithoutIncome,
            )}{" "}
            BTC
          </p>
          {showUSD && (
            <p>
              (
              {formatCurrency(
                calculationResults[calculationResults.length - 1]
                  .btcWithoutIncome * getBtcPriceAtYear(timeHorizon),
                0,
              )}
              )
            </p>
          )}
          <p>
            <strong>USD Income (Year {timeHorizon}):</strong>{" "}
            {formatCurrency(usdIncome[usdIncome.length - 1], 0)}
          </p>
          <p>
            <strong>BTC Income (Year {timeHorizon}):</strong>{" "}
            {formatNumber(btcIncome[btcIncome.length - 1], 3)} BTC
          </p>
          <p>
            <strong>Loan Principal:</strong> {formatCurrency(loanPrincipal, 0)}
          </p>
          <p>
            <strong>Loan Interest (Annual):</strong>{" "}
            {formatCurrency(loanInterest, 0)}
          </p>
        </div>
        <div>
          <p className="text-red-600">Risk Insights:</p>
          <ul className="list-disc pl-5 text-red-600">
            <li>
              High BTC growth assumes volatility; a {priceCrash}% crash reduces
              stack.
            </li>
            {speculationPct > 0 && (
              <li>
                Speculation ({speculationPct}%) has high potential yields (
                {speculationStartYield}%→{speculationEndYield}%) but greater
                loss risk.
              </li>
            )}
            {collateralPct > 0 && (
              <li>
                Borrowing {formatCurrency(loanPrincipal, 0)} risks liquidation
                if BTC drops below {formatCurrency(exchangeRate * 0.4, 0)}.
              </li>
            )}
            <li>USD income decays in BTC terms as Bitcoin appreciates.</li>
          </ul>
        </div>
      </div>

      {/* Activation Year Control - Moved to top and full width */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <label className="block font-medium mb-2 text-lg">
          Activation Year: {activationYear}
        </label>
        <input
          type="range"
          value={activationYear}
          onChange={(e) =>
            onUpdateFormData?.({ activationYear: Number(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          min="0"
          max={timeHorizon}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Year 0</span>
          <span className="font-medium">
            Year {activationYear} - When income starts
          </span>
          <span>Year {timeHorizon}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">BTC Stack Growth</h3>
          <Line
            data={resultChartData}
            options={{
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
                  position: "bottom",
                },
                tooltip: {
                  displayColors: true,
                  callbacks: {
                    title: function () {
                      return ""; // Remove year from title
                    },
                    label: function (context) {
                      return `${formatNumber(context.parsed.y, 1)} : ${context.dataset.label}`;
                    },
                    labelTextColor: function (context) {
                      // Use darker colors for better contrast against tooltip background
                      if (context.dataset.label?.includes("Pure growth")) {
                        return "#EFEFEF"; // Dark gray instead of light gray
                      }
                      return context.dataset.borderColor as string;
                    },
                    afterLabel: function (context) {
                      const year = context.dataIndex;
                      const withIncome = calculationResults[year].btcWithIncome;
                      const withoutIncome =
                        calculationResults[year].btcWithoutIncome;
                      const gap = withoutIncome - withIncome;

                      if (
                        context.dataset.label?.includes(
                          "Minus income allocation",
                        )
                      ) {
                        return `${formatNumber(gap, 1)} : Gap`;
                      }
                      return;
                    },
                  },
                },
              },
              interaction: {
                mode: "index",
                intersect: false,
              },
            }}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">USD Income Stream</h3>
          <Line
            data={incomeChartData}
            options={{
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
                  position: "bottom",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Income Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            USD Income in BTC Terms (Purchasing Power)
          </h3>
          <Line
            data={incomeBtcChartData}
            options={{
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
                  position: "bottom",
                },
              },
            }}
          />
          <p className="text-xs text-gray-600 mt-2">
            📉 Shows how USD income and expenses lose purchasing power as BTC
            appreciates
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Income vs Expenses by Activation Year
          </h3>
          <Line
            data={incomePotentialChartData}
            options={{
              scales: {
                y: {
                  type: "logarithmic",
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
                  position: "bottom",
                },
              },
              onClick: (event, elements) => {
                if (elements.length > 0) {
                  const elementIndex = elements[0].index;
                  onUpdateFormData?.({ activationYear: elementIndex });
                }
              },
            }}
          />
          <p className="text-xs text-gray-600 mt-2">
            💡 Click on any point to set that year as your activation year
          </p>
        </div>
      </div>

      <p className="text-red-600 mt-4">
        USD income and borrowing carry liquidation risk. BTC income decays as
        Bitcoin appreciates.
      </p>
    </div>
  );
};
