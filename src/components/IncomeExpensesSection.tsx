import React from "react";
import economicScenarios, { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";
import { ExpensesInflationChart } from "./ExpensesInflationChart";
import { RateAssumptionsSection } from "./common/RateAssumptionsSection";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const IncomeExpensesSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  const getIncomeScenarioPresets = () => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      // Include "custom" scenario in presets so we can access its values
      presets[key] = scenario.incomeYield;
    });
    return presets;
  };

  const incomePresetScenarios = getIncomeScenarioPresets();

  // Format number with commas for display
  const formatNumberForDisplay = (value: number): string => {
    return Math.round(value).toLocaleString();
  };

  // Parse number from formatted string
  const parseFormattedNumber = (value: string): number => {
    return Number(value.replace(/,/g, ""));
  };

  // Handle starting expenses input change
  const handleStartingExpensesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputValue = e.target.value;
    const numericValue = parseFormattedNumber(inputValue);
    if (!isNaN(numericValue)) {
      updateFormData({ startingExpenses: numericValue });
    }
  };

  // Determine chart max value for income yields
  const getIncomeChartMaxValue = (): number => {
    if (
      formData.incomeInputType === "preset" &&
      formData.incomePreset !== "custom"
    ) {
      return (
        incomePresetScenarios[formData.incomePreset as ScenarioKey]?.maxAxis ||
        100
      );
    }
    // For flat and linear modes, use a reasonable max based on the values
    if (formData.incomeInputType === "flat") {
      return Math.max(50, Math.ceil((formData.incomeFlat * 1.2) / 10) * 10);
    }
    if (formData.incomeInputType === "linear") {
      const maxValue = Math.max(formData.incomeStart, formData.incomeEnd);
      return Math.max(50, Math.ceil((maxValue * 1.2) / 10) * 10);
    }
    return 100; // Default
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Income Configuration */}
      <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
        <h4 className="font-semibold text-purple-800 mb-3">
          💰 Income Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">
              Income Bucket Allocation (%):
            </label>
            <input
              type="number"
              value={formData.incomeAllocationPct}
              onChange={(e) =>
                updateFormData({ incomeAllocationPct: Number(e.target.value) })
              }
              className="w-full p-2 border rounded"
              min="0"
              max="50"
            />
            <p className="text-xs text-gray-600 mt-1">
              Percentage of BTC stack to convert to USD income pool at
              activation year
            </p>
          </div>
          <div>
            <label className="block font-medium mb-1">
              Reinvestment Rate (%):
            </label>
            <input
              type="range"
              value={formData.incomeReinvestmentPct}
              onChange={(e) =>
                updateFormData({
                  incomeReinvestmentPct: Number(e.target.value),
                })
              }
              className="w-full"
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-600">
              {formData.incomeReinvestmentPct}% reinvested,{" "}
              {100 - formData.incomeReinvestmentPct}% available for expenses
            </span>
          </div>
          <div>
            <label className="block font-medium mb-1">Activation Year:</label>
            <input
              type="range"
              value={formData.activationYear}
              onChange={(e) =>
                updateFormData({ activationYear: Number(e.target.value) })
              }
              className="w-full"
              min="0"
              max={formData.timeHorizon}
            />
            <span className="text-sm text-gray-600">
              Year {formData.activationYear} - When income starts
            </span>
          </div>
          <div>
            <label className="block font-medium mb-1">
              Starting Annual Expenses (USD):
            </label>
            <input
              type="text"
              value={formatNumberForDisplay(formData.startingExpenses || 50000)}
              onChange={handleStartingExpensesChange}
              className="w-full p-2 border rounded font-mono"
              placeholder="50,000"
            />
            <p className="text-xs text-gray-600 mt-1">
              Current: $
              {Math.round(formData.startingExpenses || 50000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Income Yield Assumptions - Using Reusable Component */}
      <RateAssumptionsSection
        formData={formData}
        updateFormData={updateFormData}
        config={{
          title: "Income Yield Assumptions",
          emoji: "📈",
          colorClass: {
            background: "bg-gray-50",
            border: "border-gray-400",
            text: "text-gray-800",
          },
          dataKey: "incomeCustomRates",
          flatRateKey: "incomeFlat",
          startRateKey: "incomeStart",
          endRateKey: "incomeEnd",
          inputTypeKey: "incomeInputType",
          manualModeKey: "incomeManualMode",
          followScenarioKey: "followEconomicScenarioIncome",
          presetKey: "incomePreset",
          maxValue: getIncomeChartMaxValue(),
          yAxisLabel: "Income Yield (% annually)",
          unit: "%",
        }}
        economicScenarios={economicScenarios}
        presetScenarios={incomePresetScenarios}
      />

      {/* Section 3: Expenses Inflation Chart */}
      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
        <h4 className="font-semibold text-red-800 mb-3">
          📊 Projected Expenses Growth
        </h4>
        <div style={{ height: "400px" }}>
          <ExpensesInflationChart formData={formData} />
        </div>
      </div>
    </div>
  );
};
