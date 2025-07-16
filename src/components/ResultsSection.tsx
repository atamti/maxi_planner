import React from "react";
import { Line } from "react-chartjs-2";
import { CalculationResults, FormDataSubset } from "../types";
import { formatCurrency, formatNumber } from "../utils/formatNumber";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
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
        borderColor: "#1A73E8",
        backgroundColor: "rgba(26, 115, 232, 0.2)",
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
        borderColor: "#1A73E8",
        backgroundColor: "rgba(26, 115, 232, 0.2)",
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

  // Helper function to calculate dynamic loan values
  const calculateDynamicLoanValues = () => {
    // Calculate BTC stack at activation year with growth
    let btcStackAtActivation = formData.btcStack;
    for (let year = 0; year < formData.activationYear; year++) {
      const investmentsYield =
        formData.investmentsStartYield -
        (formData.investmentsStartYield - formData.investmentsEndYield) *
          (year / formData.timeHorizon);
      const speculationYield =
        formData.speculationStartYield -
        (formData.speculationStartYield - formData.speculationEndYield) *
          (year / formData.timeHorizon);

      const savings = btcStackAtActivation * (formData.savingsPct / 100);
      const investments =
        btcStackAtActivation *
        (formData.investmentsPct / 100) *
        (1 + investmentsYield / 100);
      const speculation =
        btcStackAtActivation *
        (formData.speculationPct / 100) *
        (1 + speculationYield / 100);

      btcStackAtActivation = savings + investments + speculation;
    }

    const btcSavingsAtActivation =
      btcStackAtActivation * (formData.savingsPct / 100);
    const collateralBtc =
      btcSavingsAtActivation * (formData.collateralPct / 100);

    // Use BTC price at activation year from custom rates
    let btcPriceAtActivation = formData.exchangeRate;
    for (let i = 0; i < formData.activationYear; i++) {
      const appreciationRate = (formData.btcPriceCustomRates?.[i] || 50) / 100;
      btcPriceAtActivation = btcPriceAtActivation * (1 + appreciationRate);
    }

    const loanPrincipal =
      collateralBtc * (formData.ltvRatio / 100) * btcPriceAtActivation;
    const liquidationPrice = btcPriceAtActivation * (formData.ltvRatio / 80); // 80% liquidation threshold

    // Calculate annual payments
    const annualInterest = loanPrincipal * (formData.loanRate / 100);
    const annualPayments = formData.interestOnly
      ? annualInterest
      : (loanPrincipal *
          ((formData.loanRate / 100) *
            Math.pow(1 + formData.loanRate / 100, formData.loanTermYears))) /
        (Math.pow(1 + formData.loanRate / 100, formData.loanTermYears) - 1);

    return { loanPrincipal, liquidationPrice, annualPayments };
  };

  // Calculate escape velocity - when income exceeds expenses
  const calculateEscapeVelocity = () => {
    let escapeYearBase = null;
    let escapeYearLeveraged = null;

    for (let year = 0; year <= formData.timeHorizon; year++) {
      const income = results.incomeAtActivationYears[year] || 0;
      const incomeWithLeverage =
        results.incomeAtActivationYearsWithLeverage[year] || 0;
      const expenses = results.expensesAtActivationYears[year] || 0;

      // Check base scenario
      if (escapeYearBase === null && income > expenses) {
        escapeYearBase = year;
      }

      // Check leveraged scenario
      if (
        escapeYearLeveraged === null &&
        incomeWithLeverage > expenses &&
        formData.collateralPct > 0
      ) {
        escapeYearLeveraged = year;
      }

      // Break if we found both (or don't need leveraged)
      if (
        escapeYearBase !== null &&
        (escapeYearLeveraged !== null || formData.collateralPct === 0)
      ) {
        break;
      }
    }

    return { escapeYearBase, escapeYearLeveraged };
  };

  const dynamicLoanValues =
    formData.collateralPct > 0 ? calculateDynamicLoanValues() : null;
  const escapeVelocity = calculateEscapeVelocity();

  // Calculate USD cashflows (income minus expenses)
  const calculateCashflows = () => {
    const activationYearExpenses =
      results.annualExpenses[formData.activationYear] || 0;
    const finalYearExpenses =
      results.annualExpenses[results.annualExpenses.length - 1] || 0;

    const activationYearIncome =
      results.usdIncome[formData.activationYear] || 0;
    const activationYearIncomeWithLeverage =
      results.usdIncomeWithLeverage[formData.activationYear] || 0;

    const finalYearIncome =
      results.usdIncome[results.usdIncome.length - 1] || 0;
    const finalYearIncomeWithLeverage =
      results.usdIncomeWithLeverage[results.usdIncomeWithLeverage.length - 1] ||
      0;

    return {
      activationYear: {
        withoutLeverage: activationYearIncome - activationYearExpenses,
        withLeverage: activationYearIncomeWithLeverage - activationYearExpenses,
      },
      finalYear: {
        withoutLeverage: finalYearIncome - finalYearExpenses,
        withLeverage: finalYearIncomeWithLeverage - finalYearExpenses,
      },
    };
  };

  const cashflows = calculateCashflows();

  // Helper function to format cashflow values
  const formatCashflow = (value: number): React.ReactElement => {
    if (value < 0) {
      return (
        <span className="text-red-600">
          ({formatCurrency(Math.abs(value), 0)})
        </span>
      );
    }
    return <span>{formatCurrency(value, 0)}</span>;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Results</h2>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Section 1: Final BTC Stack */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">
            ₿ Final BTC Stack (Year {timeHorizon})
          </h3>
          <div className="space-y-2">
            <p>
              <strong>With Income Strategy:</strong>
              <br />
              {formatNumber(
                calculationResults[calculationResults.length - 1].btcWithIncome,
              )}{" "}
              BTC
            </p>
            {showUSD && (
              <p className="text-sm text-gray-600">
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
              <strong>Pure Growth (No Income):</strong>
              <br />
              {formatNumber(
                calculationResults[calculationResults.length - 1]
                  .btcWithoutIncome,
              )}{" "}
              BTC
            </p>
            {showUSD && (
              <p className="text-sm text-gray-600">
                (
                {formatCurrency(
                  calculationResults[calculationResults.length - 1]
                    .btcWithoutIncome * getBtcPriceAtYear(timeHorizon),
                  0,
                )}
                )
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Income Activation Year Analysis */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            🚀 Income Activation Year Analysis (Year {formData.activationYear})
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">
                💰 Income:
              </p>
              <p className="text-sm">
                <strong>Base:</strong>{" "}
                {formatCurrency(
                  results.usdIncome[formData.activationYear] || 0,
                  0,
                )}
              </p>
              {formData.collateralPct > 0 && (
                <p className="text-sm">
                  <strong>Leveraged:</strong>{" "}
                  {formatCurrency(
                    results.usdIncomeWithLeverage[formData.activationYear] || 0,
                    0,
                  )}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-green-700 mb-1">
                💸 Expenses:
              </p>
              <p className="text-sm">
                {formatCurrency(
                  results.annualExpenses[formData.activationYear] || 0,
                  0,
                )}
              </p>
            </div>

            <div className="pt-2 border-t border-green-300">
              <p className="text-sm font-medium text-green-700 mb-1">
                📊 Net Cashflow:
              </p>
              <p className="text-sm">
                <strong>Base:</strong>{" "}
                {formatCashflow(cashflows.activationYear.withoutLeverage)}
              </p>
              {formData.collateralPct > 0 && (
                <p className="text-sm">
                  <strong>Leveraged:</strong>{" "}
                  {formatCashflow(cashflows.activationYear.withLeverage)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Final Year Analysis */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🎯 Year {timeHorizon} Analysis
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                💰 Income:
              </p>
              <p className="text-sm">
                <strong>USD:</strong>{" "}
                {formatCurrency(usdIncome[usdIncome.length - 1], 0)}
              </p>
              <p className="text-sm">
                <strong>BTC:</strong>{" "}
                {formatNumber(btcIncome[btcIncome.length - 1], 3)} BTC
              </p>
              {formData.collateralPct > 0 && (
                <p className="text-sm">
                  <strong>USD (Leveraged):</strong>{" "}
                  {formatCurrency(
                    usdIncomeWithLeverage[usdIncomeWithLeverage.length - 1],
                    0,
                  )}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                💸 Expenses:
              </p>
              <p className="text-sm">
                {formatCurrency(annualExpenses[annualExpenses.length - 1], 0)}
              </p>
            </div>

            <div className="pt-2 border-t border-blue-300">
              <p className="text-sm font-medium text-blue-700 mb-1">
                📊 Net Cashflow:
              </p>
              <p className="text-sm">
                <strong>Base:</strong>{" "}
                {formatCashflow(cashflows.finalYear.withoutLeverage)}
              </p>
              {formData.collateralPct > 0 && (
                <p className="text-sm">
                  <strong>Leveraged:</strong>{" "}
                  {formatCashflow(cashflows.finalYear.withLeverage)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Loan Details - Now in first row */}
        {collateralPct > 0 && dynamicLoanValues && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">
              🏦 Loan Details (Year {formData.activationYear})
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-purple-700">Principal:</p>
                <p>{formatCurrency(dynamicLoanValues.loanPrincipal, 0)}</p>
              </div>
              <div>
                <p className="font-medium text-purple-700">Annual Interest:</p>
                <p>
                  {formatCurrency(
                    dynamicLoanValues.loanPrincipal * (formData.loanRate / 100),
                    0,
                  )}
                </p>
              </div>
              <div>
                <p className="font-medium text-purple-700">Annual Payments:</p>
                <p>{formatCurrency(dynamicLoanValues.annualPayments, 0)}</p>
                {formData.interestOnly && (
                  <p className="text-xs text-purple-600">(Interest only)</p>
                )}
              </div>
              <div>
                <p className="font-medium text-purple-700">LTV Ratio:</p>
                <p>{formData.ltvRatio}%</p>
              </div>
              <div>
                <p className="font-medium text-purple-700">Liquidation Risk:</p>
                <p>{formatCurrency(dynamicLoanValues.liquidationPrice, 0)}</p>
                <p className="text-xs text-purple-600">
                  (BTC @{" "}
                  {formatCurrency(
                    getBtcPriceAtYear(formData.activationYear),
                    0,
                  )}{" "}
                  in Year {formData.activationYear})
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Insights Section - Spans full width below first row */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-3">
          🧠 Portfolio Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const insights = [];

            // BTC Stack Growth Analysis
            const finalBtcWithIncome =
              calculationResults[calculationResults.length - 1].btcWithIncome;
            const finalBtcWithoutIncome =
              calculationResults[calculationResults.length - 1]
                .btcWithoutIncome;
            const btcGrowthWithIncome =
              ((finalBtcWithIncome - formData.btcStack) / formData.btcStack) *
              100;
            const btcGrowthWithoutIncome =
              ((finalBtcWithoutIncome - formData.btcStack) /
                formData.btcStack) *
              100;

            if (btcGrowthWithIncome > 1000) {
              insights.push(
                <div key="growth-huge" className="bg-white p-3 rounded border">
                  <p className="text-green-700 text-sm">
                    🚀 <strong>Exponential Growth:</strong> ~
                    {Math.round(btcGrowthWithIncome / 100) * 100}% BTC stack
                    growth
                    <br />
                    <span className="text-gray-600">
                      ({formatNumber(formData.btcStack, 1)} → ~
                      {formatNumber(finalBtcWithIncome, 1)} BTC)
                    </span>
                  </p>
                </div>,
              );
            } else if (btcGrowthWithIncome > 500) {
              insights.push(
                <div key="growth-high" className="bg-white p-3 rounded border">
                  <p className="text-green-700 text-sm">
                    📈 <strong>High Growth:</strong> ~
                    {Math.round(btcGrowthWithIncome / 50) * 50}% BTC stack
                    growth
                    <br />
                    <span className="text-gray-600">
                      ({formatNumber(formData.btcStack, 1)} → ~
                      {formatNumber(finalBtcWithIncome, 1)} BTC)
                    </span>
                  </p>
                </div>,
              );
            } else if (btcGrowthWithIncome > 100) {
              insights.push(
                <div
                  key="growth-moderate"
                  className="bg-white p-3 rounded border"
                >
                  <p className="text-blue-700 text-sm">
                    💰 <strong>Solid Growth:</strong> ~
                    {Math.round(btcGrowthWithIncome / 25) * 25}% BTC stack
                    growth
                    <br />
                    <span className="text-gray-600">
                      ({formatNumber(formData.btcStack, 1)} → ~
                      {formatNumber(finalBtcWithIncome, 1)} BTC)
                    </span>
                  </p>
                </div>,
              );
            } else if (btcGrowthWithIncome > 0) {
              insights.push(
                <div key="growth-low" className="bg-white p-3 rounded border">
                  <p className="text-yellow-700 text-sm">
                    📊 <strong>Modest Growth:</strong> ~
                    {Math.round(btcGrowthWithIncome / 10) * 10}% BTC stack
                    growth
                    <br />
                    <span className="text-gray-600">
                      ({formatNumber(formData.btcStack, 1)} → ~
                      {formatNumber(finalBtcWithIncome, 1)} BTC)
                    </span>
                  </p>
                </div>,
              );
            } else {
              insights.push(
                <div key="growth-neg" className="bg-white p-3 rounded border">
                  <p className="text-red-700 text-sm">
                    ⚠️ <strong>Stack Decline:</strong> ~
                    {Math.round(Math.abs(btcGrowthWithIncome) / 10) * 10}% BTC
                    stack loss
                    <br />
                    <span className="text-gray-600">
                      ({formatNumber(formData.btcStack, 1)} → ~
                      {formatNumber(finalBtcWithIncome, 1)} BTC)
                    </span>
                  </p>
                </div>,
              );
            }

            // Income vs No Income Impact
            const btcGrowthDifference =
              btcGrowthWithoutIncome - btcGrowthWithIncome;
            if (formData.incomeAllocationPct > 0) {
              if (btcGrowthDifference > 50) {
                insights.push(
                  <div
                    key="income-high-cost"
                    className="bg-white p-3 rounded border"
                  >
                    <p className="text-red-700 text-sm">
                      🔥 <strong>High Income Cost:</strong> ~
                      {Math.round(btcGrowthDifference / 10) * 10}% BTC growth
                      sacrificed
                      <br />
                      <span className="text-gray-600">
                        (Could have ~{formatNumber(finalBtcWithoutIncome, 1)}{" "}
                        BTC vs ~{formatNumber(finalBtcWithIncome, 1)} BTC)
                      </span>
                    </p>
                  </div>,
                );
              } else if (btcGrowthDifference > 20) {
                insights.push(
                  <div
                    key="income-moderate-cost"
                    className="bg-white p-3 rounded border"
                  >
                    <p className="text-yellow-700 text-sm">
                      💰 <strong>Balanced Strategy:</strong> ~
                      {Math.round(btcGrowthDifference / 5) * 5}% BTC growth
                      traded for income
                      <br />
                      <span className="text-gray-600">
                        (Trade-off: ~
                        {formatNumber(
                          finalBtcWithoutIncome - finalBtcWithIncome,
                          1,
                        )}{" "}
                        BTC for income stream)
                      </span>
                    </p>
                  </div>,
                );
              }
            }

            // Liquidation Risk Analysis
            if (formData.collateralPct > 0 && dynamicLoanValues) {
              const liquidationPrice = dynamicLoanValues.liquidationPrice;

              // Check BTC prices during leverage period (activation to end)
              let minBtcPrice = Infinity;
              let maxBtcPrice = 0;
              for (
                let year = formData.activationYear;
                year <= formData.timeHorizon;
                year++
              ) {
                const btcPrice = getBtcPriceAtYear(year);
                minBtcPrice = Math.min(minBtcPrice, btcPrice);
                maxBtcPrice = Math.max(maxBtcPrice, btcPrice);
              }

              if (minBtcPrice !== Infinity) {
                const liquidationBuffer =
                  ((minBtcPrice - liquidationPrice) / liquidationPrice) * 100;

                if (liquidationBuffer < 25) {
                  insights.push(
                    <div
                      key="liquidation-danger"
                      className="bg-white p-3 rounded border"
                    >
                      <p className="text-red-700 text-sm">
                        🚨 <strong>Liquidation Risk:</strong> Only ~
                        {Math.round(liquidationBuffer / 5) * 5}% buffer above
                        liquidation price
                        <br />
                        <span className="text-gray-600">
                          (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs
                          Liquidation: ~{formatCurrency(liquidationPrice, 0)})
                        </span>
                      </p>
                    </div>,
                  );
                } else if (liquidationBuffer < 50) {
                  insights.push(
                    <div
                      key="liquidation-moderate"
                      className="bg-white p-3 rounded border"
                    >
                      <p className="text-orange-700 text-sm">
                        ⚠️ <strong>Moderate Liquidation Risk:</strong> ~
                        {Math.round(liquidationBuffer / 10) * 10}% buffer above
                        liquidation
                        <br />
                        <span className="text-gray-600">
                          (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs
                          Liquidation: ~{formatCurrency(liquidationPrice, 0)})
                        </span>
                      </p>
                    </div>,
                  );
                } else if (liquidationBuffer < 100) {
                  insights.push(
                    <div
                      key="liquidation-safe"
                      className="bg-white p-3 rounded border"
                    >
                      <p className="text-yellow-700 text-sm">
                        🛡️ <strong>Safe Liquidation Buffer:</strong> ~
                        {Math.round(liquidationBuffer / 10) * 10}% above
                        liquidation price
                        <br />
                        <span className="text-gray-600">
                          (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs
                          Liquidation: ~{formatCurrency(liquidationPrice, 0)})
                        </span>
                      </p>
                    </div>,
                  );
                } else {
                  insights.push(
                    <div
                      key="liquidation-very-safe"
                      className="bg-white p-3 rounded border"
                    >
                      <p className="text-green-700 text-sm">
                        ✅ <strong>Very Safe Leverage:</strong> ~
                        {Math.round(liquidationBuffer / 25) * 25}% above
                        liquidation price
                        <br />
                        <span className="text-gray-600">
                          (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs
                          Liquidation: ~{formatCurrency(liquidationPrice, 0)})
                        </span>
                      </p>
                    </div>,
                  );
                }
              }
            }

            // Cashflow Insights
            if (cashflows.activationYear.withoutLeverage > 0) {
              insights.push(
                <div
                  key="activation-base-pos"
                  className="bg-white p-3 rounded border"
                >
                  <p className="text-green-700 text-sm">
                    ✅ <strong>Early Success:</strong> Income covers expenses
                    from year {formData.activationYear}
                    <br />
                    <span className="text-gray-600">
                      (Surplus: ~
                      {formatCurrency(
                        Math.round(
                          cashflows.activationYear.withoutLeverage / 1000,
                        ) * 1000,
                        0,
                      )}{" "}
                      annually)
                    </span>
                  </p>
                </div>,
              );
            } else {
              insights.push(
                <div
                  key="activation-base-neg"
                  className="bg-white p-3 rounded border"
                >
                  <p className="text-orange-700 text-sm">
                    ⚠️ <strong>Early Deficit:</strong> Income shortfall of ~
                    {formatCurrency(
                      Math.round(
                        Math.abs(cashflows.activationYear.withoutLeverage) /
                          1000,
                      ) * 1000,
                      0,
                    )}{" "}
                    in year {formData.activationYear}
                    <br />
                    <span className="text-gray-600">
                      (Need ~
                      {formatCurrency(
                        Math.round(
                          results.annualExpenses[formData.activationYear] /
                            1000,
                        ) * 1000,
                        0,
                      )}{" "}
                      expenses vs ~
                      {formatCurrency(
                        Math.round(
                          results.usdIncome[formData.activationYear] / 1000,
                        ) * 1000,
                        0,
                      )}{" "}
                      income)
                    </span>
                  </p>
                </div>,
              );
            }

            // Leveraged insights
            if (formData.collateralPct > 0) {
              if (cashflows.activationYear.withLeverage > 0) {
                if (cashflows.activationYear.withoutLeverage <= 0) {
                  insights.push(
                    <div
                      key="activation-lev-saves"
                      className="bg-white p-3 rounded border"
                    >
                      <p className="text-blue-700 text-sm">
                        🚀 <strong>Leverage Advantage:</strong> Turns year{" "}
                        {formData.activationYear} deficit into ~
                        {formatCurrency(
                          Math.round(
                            cashflows.activationYear.withLeverage / 1000,
                          ) * 1000,
                          0,
                        )}{" "}
                        surplus
                        <br />
                        <span className="text-gray-600">
                          (Leverage income: ~
                          {formatCurrency(
                            Math.round(
                              (results.usdIncomeWithLeverage[
                                formData.activationYear
                              ] -
                                results.usdIncome[formData.activationYear]) /
                                1000,
                            ) * 1000,
                            0,
                          )}{" "}
                          additional)
                        </span>
                      </p>
                    </div>,
                  );
                }
              } else {
                insights.push(
                  <div
                    key="activation-lev-neg"
                    className="bg-white p-3 rounded border"
                  >
                    <p className="text-red-700 text-sm">
                      ❌ <strong>Leverage Burden:</strong> Debt service creates
                      ~
                      {formatCurrency(
                        Math.round(
                          Math.abs(cashflows.activationYear.withLeverage) /
                            1000,
                        ) * 1000,
                        0,
                      )}{" "}
                      deficit in year {formData.activationYear}
                      <br />
                      <span className="text-gray-600">
                        (Debt service: ~
                        {formatCurrency(
                          Math.round(
                            (dynamicLoanValues?.annualPayments || 0) / 1000,
                          ) * 1000,
                          0,
                        )}{" "}
                        annually)
                      </span>
                    </p>
                  </div>,
                );
              }
            }

            // Strategy insights
            if (formData.incomeAllocationPct === 0) {
              insights.push(
                <div key="no-income" className="bg-white p-3 rounded border">
                  <p className="text-gray-700 text-sm">
                    📈 <strong>Pure Growth:</strong> No income allocation -
                    focused on BTC appreciation
                    <br />
                    <span className="text-gray-600">
                      (100% stack growth potential:{" "}
                      {formatNumber(formData.btcStack, 1)} → ~
                      {formatNumber(finalBtcWithoutIncome, 1)} BTC)
                    </span>
                  </p>
                </div>,
              );
            }

            // Portfolio Mix Evolution (if not 100% savings)
            if (formData.savingsPct < 100) {
              // Calculate final year allocation percentages
              const finalYearStack = finalBtcWithIncome;
              const finalYearSavings =
                finalYearStack * (formData.savingsPct / 100);

              // Calculate what investments and speculation would be at final year
              let investmentGrowth = 1;
              let speculationGrowth = 1;

              for (let year = 0; year < formData.timeHorizon; year++) {
                const investmentsYield =
                  formData.investmentsStartYield -
                  (formData.investmentsStartYield -
                    formData.investmentsEndYield) *
                    (year / formData.timeHorizon);
                const speculationYield =
                  formData.speculationStartYield -
                  (formData.speculationStartYield -
                    formData.speculationEndYield) *
                    (year / formData.timeHorizon);

                investmentGrowth *= 1 + investmentsYield / 100;
                speculationGrowth *= 1 + speculationYield / 100;
              }

              const finalInvestmentsPct =
                ((formData.investmentsPct * investmentGrowth) /
                  (formData.savingsPct +
                    formData.investmentsPct * investmentGrowth +
                    formData.speculationPct * speculationGrowth)) *
                100;
              const finalSpeculationPct =
                ((formData.speculationPct * speculationGrowth) /
                  (formData.savingsPct +
                    formData.investmentsPct * investmentGrowth +
                    formData.speculationPct * speculationGrowth)) *
                100;
              const finalSavingsPct =
                100 - finalInvestmentsPct - finalSpeculationPct;

              const mixChange = Math.abs(finalSavingsPct - formData.savingsPct);

              if (mixChange > 5) {
                insights.push(
                  <div
                    key="portfolio-mix"
                    className="bg-white p-3 rounded border"
                  >
                    <p className="text-blue-700 text-sm">
                      📊 <strong>Portfolio Drift:</strong> Mix shifts from{" "}
                      {formData.savingsPct}/{formData.investmentsPct}/
                      {formData.speculationPct}% to approximately{" "}
                      {Math.round(finalSavingsPct / 5) * 5}/
                      {Math.round(finalInvestmentsPct / 5) * 5}/
                      {Math.round(finalSpeculationPct / 5) * 5}%
                      <br />
                      <span className="text-gray-600">
                        (Savings/Investments/Speculation - no rebalancing)
                      </span>
                    </p>
                  </div>,
                );
              }
            }

            return insights.slice(0, 6); // Show up to 6 insights in the grid
          })()}
        </div>
      </div>

      {/* Loan Details Section - Now removed from here since it's in the first row */}

      {/* Escape Velocity Section */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          🚀 Escape Velocity Analysis
        </h3>
        <p className="text-sm text-yellow-700 mb-3">
          When income exceeds expenses by activation year:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <p className="font-medium text-yellow-800 mb-1">Base Scenario:</p>
            {escapeVelocity.escapeYearBase !== null ? (
              <p className="text-lg font-bold text-green-600">
                Year {escapeVelocity.escapeYearBase}
              </p>
            ) : (
              <p className="text-lg font-bold text-red-600">Never reached</p>
            )}
            <p className="text-xs text-gray-600">
              When unleveraged income first exceeds expenses
            </p>
          </div>

          {formData.collateralPct > 0 && (
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-yellow-800 mb-1">
                Leveraged Scenario:
              </p>
              {escapeVelocity.escapeYearLeveraged !== null ? (
                <p className="text-lg font-bold text-green-600">
                  Year {escapeVelocity.escapeYearLeveraged}
                </p>
              ) : (
                <p className="text-lg font-bold text-red-600">Never reached</p>
              )}
              <p className="text-xs text-gray-600">
                When leveraged income (after debt service) exceeds expenses
              </p>
            </div>
          )}
        </div>

        {escapeVelocity.escapeYearBase !== null &&
          escapeVelocity.escapeYearLeveraged !== null &&
          formData.collateralPct > 0 && (
            <div className="mt-3 p-2 bg-blue-100 rounded border">
              <p className="text-sm text-blue-800">
                💡 <strong>Leverage advantage:</strong>{" "}
                {escapeVelocity.escapeYearBase -
                  escapeVelocity.escapeYearLeveraged >
                0
                  ? `Leverage achieves escape velocity ${escapeVelocity.escapeYearBase - escapeVelocity.escapeYearLeveraged} year(s) earlier`
                  : escapeVelocity.escapeYearLeveraged -
                        escapeVelocity.escapeYearBase >
                      0
                    ? `Base scenario achieves escape velocity ${escapeVelocity.escapeYearLeveraged - escapeVelocity.escapeYearBase} year(s) earlier`
                    : "Both scenarios achieve escape velocity in the same year"}
              </p>
            </div>
          )}
      </div>

      {/* Risk Insights Section */}
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
        <h3 className="text-lg font-semibold text-red-800 mb-3">
          ⚠️ Risk Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check if we have any risks to show */}
          {formData.savingsPct < 100 ||
          speculationPct > 0 ||
          formData.incomeAllocationPct > 0 ||
          (collateralPct > 0 && dynamicLoanValues) ? (
            <>
              <ul className="list-disc pl-5 text-red-700 space-y-1">
                {formData.savingsPct < 100 && (
                  <li>
                    All investment & speculation carries counterparty risk
                  </li>
                )}
                {speculationPct > 0 && (
                  <li>
                    Speculation ({speculationPct}% of portfolio) has high
                    potential yields ({speculationStartYield}%→
                    {speculationEndYield}%) but greater loss risk
                  </li>
                )}
                {formData.incomeAllocationPct > 0 && (
                  <li>USD income decays in BTC terms as Bitcoin appreciates</li>
                )}
              </ul>
              {collateralPct > 0 && dynamicLoanValues && (
                <ul className="list-disc pl-5 text-red-700 space-y-1">
                  <li>
                    Borrowing{" "}
                    {formatCurrency(dynamicLoanValues.loanPrincipal, 0)} risks
                    liquidation if BTC drops below{" "}
                    {formatCurrency(dynamicLoanValues.liquidationPrice, 0)}
                    <br />
                    <span className="text-sm">
                      (80% liquidation threshold means liquidation triggers when
                      collateral value drops to 80% of loan amount)
                    </span>
                    {(() => {
                      // Calculate what liquidation price would be if using 100% of BTC savings as collateral
                      const btcStackAtActivation = (() => {
                        let stack = formData.btcStack;
                        for (
                          let year = 0;
                          year < formData.activationYear;
                          year++
                        ) {
                          const investmentsYield =
                            formData.investmentsStartYield -
                            (formData.investmentsStartYield -
                              formData.investmentsEndYield) *
                              (year / formData.timeHorizon);
                          const speculationYield =
                            formData.speculationStartYield -
                            (formData.speculationStartYield -
                              formData.speculationEndYield) *
                              (year / formData.timeHorizon);
                          const savings = stack * (formData.savingsPct / 100);
                          const investments =
                            stack *
                            (formData.investmentsPct / 100) *
                            (1 + investmentsYield / 100);
                          const speculation =
                            stack *
                            (formData.speculationPct / 100) *
                            (1 + speculationYield / 100);
                          stack = savings + investments + speculation;
                        }
                        return stack;
                      })();

                      const fullBtcSavings =
                        btcStackAtActivation * (formData.savingsPct / 100);
                      const btcPriceAtActivation = getBtcPriceAtYear(
                        formData.activationYear,
                      );
                      const fullCollateralValue =
                        fullBtcSavings * btcPriceAtActivation;
                      const potentialLoanPrincipal =
                        fullCollateralValue * (formData.ltvRatio / 100);
                      const potentialLiquidationPrice =
                        btcPriceAtActivation * (formData.ltvRatio / 80);

                      if (formData.collateralPct < 100) {
                        const currentCollateralBtc =
                          btcStackAtActivation *
                          (formData.savingsPct / 100) *
                          (formData.collateralPct / 100);
                        const additionalBtcAvailable =
                          fullBtcSavings - currentCollateralBtc;

                        // Calculate improved liquidation price with additional collateral
                        // Current loan amount stays the same, but total collateral increases
                        const currentLoanAmount =
                          dynamicLoanValues.loanPrincipal;
                        const newTotalCollateralBtc =
                          currentCollateralBtc + additionalBtcAvailable;
                        // Liquidation happens when collateral value = loan amount / 0.8
                        const improvedLiquidationPrice =
                          currentLoanAmount / (newTotalCollateralBtc * 0.8);

                        return (
                          <div className="mt-1">
                            <span className="text-sm text-red-600">
                              💡 If margin called, you could add up to ~
                              {formatNumber(
                                Math.round(additionalBtcAvailable * 4) / 4,
                                1,
                              )}{" "}
                              BTC to the collateral position to lower
                              liquidation price to ~
                              {formatCurrency(
                                Math.round(improvedLiquidationPrice / 1000) *
                                  1000,
                                0,
                              )}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </li>
                </ul>
              )}
            </>
          ) : (
            <div className="col-span-2 text-center py-4">
              <p className="text-green-700 font-medium">
                ✅ Conservative Configuration
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Your current settings represent a low-risk approach with 100%
                savings allocation and no income generation or leverage.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Activation Year Control */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <label className="block font-medium mb-2 text-lg">
          📅 Activation Year: {activationYear}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">📈 BTC Stack Growth</h3>
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
          <h3 className="text-lg font-semibold mb-2">💵 USD Income Stream</h3>
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
            ₿ USD Income in BTC Terms (Purchasing Power)
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
            📊 Income vs Expenses by Activation Year
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
    </div>
  );
};
