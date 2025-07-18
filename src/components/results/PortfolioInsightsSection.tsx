import React from "react";
import { useLoanCalculations } from "../../hooks/useLoanCalculations";
import { usePortfolioAnalysis } from "../../hooks/usePortfolioAnalysis";
import { CalculationResults, FormDataSubset } from "../../types";
import { formatCurrency, formatNumber } from "../../utils/formatNumber";

interface Props {
  results: CalculationResults;
  formData: FormDataSubset;
  getBtcPriceAtYear: (year: number) => number;
}

export const PortfolioInsightsSection: React.FC<Props> = ({
  results,
  formData,
  getBtcPriceAtYear,
}) => {
  const { results: calculationResults } = results;
  const { calculateLoanDetails } = useLoanCalculations(
    formData,
    getBtcPriceAtYear,
  );
  const { calculateCashflows, calculatePortfolioGrowth } = usePortfolioAnalysis(
    results,
    formData,
  );

  const dynamicLoanValues = calculateLoanDetails(formData.activationYear);

  // Use the centralized cashflow calculation from the hook
  const cashflows = calculateCashflows();

  // Use the centralized portfolio growth calculation from the hook
  const portfolioGrowth = calculatePortfolioGrowth();

  const insights = [];

  // BTC Stack Growth Analysis - use values from the hook
  const {
    btcGrowthWithIncome,
    btcGrowthWithoutIncome,
    finalBtcWithIncome,
    finalBtcWithoutIncome,
  } = portfolioGrowth;

  if (btcGrowthWithIncome > 1000) {
    insights.push(
      <div key="growth-huge" className="bg-white p-3 rounded border">
        <p className="text-green-700 text-sm">
          🚀 <strong>Exponential Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 100) * 100}% BTC stack growth
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
          {Math.round(btcGrowthWithIncome / 50) * 50}% BTC stack growth
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
      <div key="growth-moderate" className="bg-white p-3 rounded border">
        <p className="text-blue-700 text-sm">
          💰 <strong>Solid Growth:</strong> ~
          {Math.round(btcGrowthWithIncome / 25) * 25}% BTC stack growth
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
          {Math.round(btcGrowthWithIncome / 10) * 10}% BTC stack growth
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
          {Math.round(Math.abs(btcGrowthWithIncome) / 10) * 10}% BTC stack loss
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
  const btcGrowthDifference = btcGrowthWithoutIncome - btcGrowthWithIncome;
  if (formData.incomeAllocationPct > 0) {
    if (btcGrowthDifference > 50) {
      insights.push(
        <div key="income-high-cost" className="bg-white p-3 rounded border">
          <p className="text-red-700 text-sm">
            🔥 <strong>High Income Cost:</strong> ~
            {Math.round(btcGrowthDifference / 10) * 10}% BTC growth sacrificed
            <br />
            <span className="text-gray-600">
              (Could have ~{formatNumber(finalBtcWithoutIncome, 1)} BTC vs ~
              {formatNumber(finalBtcWithIncome, 1)} BTC)
            </span>
          </p>
        </div>,
      );
    } else if (btcGrowthDifference > 20) {
      insights.push(
        <div key="income-moderate-cost" className="bg-white p-3 rounded border">
          <p className="text-yellow-700 text-sm">
            💰 <strong>Balanced Strategy:</strong> ~
            {Math.round(btcGrowthDifference / 5) * 5}% BTC growth traded for
            income
            <br />
            <span className="text-gray-600">
              (Trade-off: ~
              {formatNumber(finalBtcWithoutIncome - finalBtcWithIncome, 1)} BTC
              for income stream)
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
          <div key="liquidation-danger" className="bg-white p-3 rounded border">
            <p className="text-red-700 text-sm">
              🚨 <strong>Liquidation Risk:</strong> Only ~
              {Math.round(liquidationBuffer / 5) * 5}% buffer above liquidation
              price
              <br />
              <span className="text-gray-600">
                (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs Liquidation: ~
                {formatCurrency(liquidationPrice, 0)})
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
                (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs Liquidation: ~
                {formatCurrency(liquidationPrice, 0)})
              </span>
            </p>
          </div>,
        );
      } else if (liquidationBuffer < 100) {
        insights.push(
          <div key="liquidation-safe" className="bg-white p-3 rounded border">
            <p className="text-yellow-700 text-sm">
              🛡️ <strong>Safe Liquidation Buffer:</strong> ~
              {Math.round(liquidationBuffer / 10) * 10}% above liquidation price
              <br />
              <span className="text-gray-600">
                (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs Liquidation: ~
                {formatCurrency(liquidationPrice, 0)})
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
              {Math.round(liquidationBuffer / 25) * 25}% above liquidation price
              <br />
              <span className="text-gray-600">
                (Min BTC: ~{formatCurrency(minBtcPrice, 0)} vs Liquidation: ~
                {formatCurrency(liquidationPrice, 0)})
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
      <div key="activation-base-pos" className="bg-white p-3 rounded border">
        <p className="text-green-700 text-sm">
          ✅ <strong>Early Success:</strong> Income covers expenses from year{" "}
          {formData.activationYear}
          <br />
          <span className="text-gray-600">
            (Surplus: ~
            {formatCurrency(
              Math.round(cashflows.activationYear.withoutLeverage / 1000) *
                1000,
              0,
            )}{" "}
            annually)
          </span>
        </p>
      </div>,
    );
  } else {
    insights.push(
      <div key="activation-base-neg" className="bg-white p-3 rounded border">
        <p className="text-orange-700 text-sm">
          ⚠️ <strong>Early Deficit:</strong> Income shortfall of ~
          {formatCurrency(
            Math.round(
              Math.abs(cashflows.activationYear.withoutLeverage) / 1000,
            ) * 1000,
            0,
          )}{" "}
          in year {formData.activationYear}
          <br />
          <span className="text-gray-600">
            (Need ~
            {formatCurrency(
              Math.round(
                results.annualExpenses[formData.activationYear] / 1000,
              ) * 1000,
              0,
            )}{" "}
            expenses vs ~
            {formatCurrency(
              Math.round(results.usdIncome[formData.activationYear] / 1000) *
                1000,
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
                Math.round(cashflows.activationYear.withLeverage / 1000) * 1000,
                0,
              )}{" "}
              surplus
              <br />
              <span className="text-gray-600">
                (Leverage income: ~
                {formatCurrency(
                  Math.round(
                    (results.usdIncomeWithLeverage[formData.activationYear] -
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
        <div key="activation-lev-neg" className="bg-white p-3 rounded border">
          <p className="text-red-700 text-sm">
            ❌ <strong>Leverage Burden:</strong> Debt service creates ~
            {formatCurrency(
              Math.round(
                Math.abs(cashflows.activationYear.withLeverage) / 1000,
              ) * 1000,
              0,
            )}{" "}
            deficit in year {formData.activationYear}
            <br />
            <span className="text-gray-600">
              (Debt service: ~
              {formatCurrency(
                Math.round((dynamicLoanValues?.annualPayments || 0) / 1000) *
                  1000,
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
          📈 <strong>Pure Growth:</strong> No income allocation - focused on BTC
          appreciation
          <br />
          <span className="text-gray-600">
            (100% stack growth potential: {formatNumber(formData.btcStack, 1)} →
            ~{formatNumber(finalBtcWithoutIncome, 1)} BTC)
          </span>
        </p>
      </div>,
    );
  }

  // Portfolio Mix Evolution (if not 100% savings)
  if (formData.savingsPct < 100) {
    // Calculate final year allocation percentages
    const finalYearStack = finalBtcWithIncome;

    // Calculate what investments and speculation would be at final year
    let investmentGrowth = 1;
    let speculationGrowth = 1;

    for (let year = 0; year < formData.timeHorizon; year++) {
      const investmentsYield =
        formData.investmentsStartYield -
        (formData.investmentsStartYield - formData.investmentsEndYield) *
          (year / formData.timeHorizon);
      const speculationYield =
        formData.speculationStartYield -
        (formData.speculationStartYield - formData.speculationEndYield) *
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
    const finalSavingsPct = 100 - finalInvestmentsPct - finalSpeculationPct;

    const mixChange = Math.abs(finalSavingsPct - formData.savingsPct);

    if (mixChange > 5) {
      insights.push(
        <div key="portfolio-mix" className="bg-white p-3 rounded border">
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

  return (
    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
      <h3 className="text-lg font-semibold text-indigo-800 mb-3">
        🧠 Portfolio Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.slice(0, 6)}
      </div>
    </div>
  );
};
