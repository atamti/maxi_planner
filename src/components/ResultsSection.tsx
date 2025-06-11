import React from "react";
import { Bar, Line } from "react-chartjs-2";
import { CalculationResults } from "../types";

interface Props {
  results: CalculationResults;
  formData: {
    timeHorizon: number;
    exchangeRate: number;
    btcGrowth: number;
    priceCrash: number;
    speculationPct: number;
    collateralPct: number;
  };
  showUSD: boolean;
}

export const ResultsSection: React.FC<Props> = ({
  results,
  formData,
  showUSD,
}) => {
  const {
    results: calculationResults,
    usdIncome,
    btcIncome,
    loanPrincipal,
    loanInterest,
  } = results;
  const {
    timeHorizon,
    exchangeRate,
    btcGrowth,
    priceCrash,
    speculationPct,
    collateralPct,
  } = formData;

  const resultChartData = {
    labels: calculationResults.map((r) => r.year),
    datasets: [
      {
        label: "BTC Stack with Income (BTC)",
        data: calculationResults.map((r) => r.btcWithIncome.toFixed(2)),
        borderColor: "#F7931A",
        backgroundColor: "rgba(247, 147, 26, 0.2)",
        fill: false,
      },
      {
        label: "BTC Stack without Income (BTC)",
        data: calculationResults.map((r) => r.btcWithoutIncome.toFixed(2)),
        borderColor: "#666666",
        backgroundColor: "rgba(102, 102, 102, 0.2)",
        fill: false,
      },
      {
        label: "BTC Income (BTC/year, Decaying)",
        data: btcIncome.map((v) => v.toFixed(3)),
        borderColor: "#333333",
        backgroundColor: "rgba(51, 51, 51, 0.2)",
        fill: false,
      },
    ],
  };

  const incomeChartData = {
    labels: calculationResults.map((r) => r.year),
    datasets: [
      {
        label: "USD Income ($/year)",
        data: usdIncome.map((v) => (v / 1000).toFixed(2)),
        borderColor: "#1A73E8",
        backgroundColor: "rgba(26, 115, 232, 0.2)",
        fill: true,
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p>
            <strong>Ending BTC Stack (Year {timeHorizon}):</strong>{" "}
            {calculationResults[
              calculationResults.length - 1
            ].btcWithIncome.toFixed(2)}{" "}
            BTC
          </p>
          {showUSD && (
            <p>
              (
              {(
                calculationResults[calculationResults.length - 1]
                  .btcWithIncome *
                exchangeRate *
                Math.pow(1 + btcGrowth / 100, timeHorizon)
              ).toFixed(2)}{" "}
              USD)
            </p>
          )}
          <p>
            <strong>Without Income Allocation:</strong>{" "}
            {calculationResults[
              calculationResults.length - 1
            ].btcWithoutIncome.toFixed(2)}{" "}
            BTC
          </p>
          {showUSD && (
            <p>
              (
              {(
                calculationResults[calculationResults.length - 1]
                  .btcWithoutIncome *
                exchangeRate *
                Math.pow(1 + btcGrowth / 100, timeHorizon)
              ).toFixed(2)}{" "}
              USD)
            </p>
          )}
          <p>
            <strong>USD Income (Year {timeHorizon}):</strong> $
            {usdIncome[usdIncome.length - 1].toFixed(2)}
          </p>
          <p>
            <strong>BTC Income (Year {timeHorizon}):</strong>{" "}
            {btcIncome[btcIncome.length - 1].toFixed(3)} BTC
          </p>
          <p>
            <strong>Loan Principal:</strong> ${loanPrincipal.toFixed(2)}
          </p>
          <p>
            <strong>Loan Interest (Annual):</strong> ${loanInterest.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-red-600">Risk Insights:</p>
          <ul className="list-disc pl-5 text-red-600">
            <li>
              High BTC growth ({btcGrowth}%) assumes volatility; a {priceCrash}%
              crash reduces stack.
            </li>
            {speculationPct > 0 && (
              <li>
                Speculation ({speculationPct}%) has high yields (60%→20%) but
                greater loss risk.
              </li>
            )}
            {collateralPct > 0 && (
              <li>
                Borrowing ${loanPrincipal.toFixed(0)} risks liquidation if BTC
                drops below ${(exchangeRate * 0.4).toFixed(0)}.
              </li>
            )}
            <li>
              USD income decays in BTC terms (e.g., 0.06 BTC/year to 0.008
              BTC/year).
            </li>
          </ul>
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
                  title: { display: true, text: "BTC Amount" },
                },
                x: { title: { display: true, text: "Years" } },
              },
              plugins: {
                title: {
                  display: true,
                  text: "Bitcoin Stack Size Over Time",
                },
                legend: {
                  position: "bottom",
                },
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
                  title: { display: true, text: "USD Income (thousands)" },
                },
                x: { title: { display: true, text: "Years" } },
              },
              plugins: {
                title: {
                  display: true,
                  text: "Annual USD Income Generation",
                },
                legend: {
                  position: "bottom",
                },
              },
            }}
          />
        </div>
      </div>

      <p className="text-red-600 mt-4">
        USD income and borrowing carry liquidation risk. BTC income decays as
        Bitcoin appreciates.
      </p>
    </div>
  );
};
