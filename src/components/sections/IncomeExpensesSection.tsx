import React, { useEffect, useState } from "react";
import economicScenarios, { ScenarioKey } from "../../config/economicScenarios";
import { FormData } from "../../types";
import { ExpensesInflationChart } from "../charts/ExpensesInflationChart";
import { RateAssumptionsSection } from "../common/RateAssumptionsSection";
import { ScenarioRestoreMessage } from "../common/ScenarioRestoreMessage";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

export const IncomeExpensesSection: React.FC<Props> = ({
  formData,
  updateFormData,
}) => {
  const [showRestoreMessage, setShowRestoreMessage] = useState(false);
  const getIncomeScenarioPresets = () => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      // Include "custom" scenario in presets so we can access its values
      presets[key] = scenario.incomeYield;
    });
    return presets;
  };

  // Get presets for dropdown (excludes custom)
  const getIncomeDropdownPresets = () => {
    const presets: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      if (key !== "custom") {
        presets[key] = scenario.incomeYield;
      }
    });
    return presets;
  };

  const incomePresetScenarios = getIncomeScenarioPresets();
  const incomeDropdownPresets = getIncomeDropdownPresets();

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

  // Check if we should show the scenario restore message
  const sectionsInManualMode = [];
  if (formData.economicScenario !== "custom") {
    if (!formData.followEconomicScenarioIncome) {
      sectionsInManualMode.push("Income Yield Assumptions");
    }
  }

  const shouldShowRestoreMessage =
    sectionsInManualMode.length > 0 && showRestoreMessage;

  // Show restore message when scenario changes from custom to non-custom
  useEffect(() => {
    if (
      formData.economicScenario !== "custom" &&
      sectionsInManualMode.length > 0
    ) {
      setShowRestoreMessage(true);
    } else {
      setShowRestoreMessage(false);
    }
  }, [formData.economicScenario, formData.followEconomicScenarioIncome]);

  // Handler to restore all sections to follow scenario
  const handleRestoreAllToScenario = () => {
    updateFormData({
      followEconomicScenarioIncome: true,
      incomePreset: formData.economicScenario,
    });
    setShowRestoreMessage(false);
  };

  // Handler to dismiss the restore message
  const handleDismissRestoreMessage = () => {
    setShowRestoreMessage(false);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Restore Message */}
      <ScenarioRestoreMessage
        show={shouldShowRestoreMessage}
        onRestoreAll={handleRestoreAllToScenario}
        onDismiss={handleDismissRestoreMessage}
        sectionCount={sectionsInManualMode.length}
      />

      {/* Section 1: Income Configuration */}
      <div className="p-6 bg-surface-alt rounded-none border-l-4 border-bitcoin-orange">
        <h4 className="font-poppins text-lg font-bold text-bitcoin-orange mb-4 uppercase tracking-wide">
          💰 INCOME CONFIGURATION
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
              INCOME BUCKET ALLOCATION (%):
            </label>
            <input
              type="number"
              value={formData.incomeAllocationPct}
              onChange={(e) =>
                updateFormData({ incomeAllocationPct: Number(e.target.value) })
              }
              className="w-full p-3 bg-surface border-2 border-themed rounded-none text-primary font-mono text-lg focus-ring-themed"
              min="0"
              max="50"
            />
            <p className="text-xs text-secondary mt-2 font-mono">
              Percentage of BTC stack to convert to USD income pool at
              activation year
            </p>
          </div>
          <div>
            <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
              REINVESTMENT RATE (%):
            </label>
            <input
              type="range"
              value={formData.incomeReinvestmentPct}
              onChange={(e) =>
                updateFormData({
                  incomeReinvestmentPct: Number(e.target.value),
                })
              }
              className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
              min="0"
              max="100"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-secondary font-mono">0%</span>
              <span className="text-sm font-bold text-bitcoin-orange font-inter">
                {formData.incomeReinvestmentPct}% REINVESTED,{" "}
                {100 - formData.incomeReinvestmentPct}% AVAILABLE
              </span>
              <span className="text-xs text-secondary font-mono">100%</span>
            </div>
          </div>
          <div>
            <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
              ACTIVATION YEAR:
            </label>
            <input
              type="range"
              value={formData.activationYear}
              onChange={(e) =>
                updateFormData({ activationYear: Number(e.target.value) })
              }
              className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
              min="0"
              max={formData.timeHorizon}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-secondary font-mono">0</span>
              <span className="text-sm font-bold text-bitcoin-orange font-inter">
                YEAR {formData.activationYear} - WHEN INCOME STARTS
              </span>
              <span className="text-xs text-secondary font-mono">
                {formData.timeHorizon}
              </span>
            </div>
          </div>
          <div>
            <label className="block font-inter text-sm font-bold text-primary mb-2 uppercase tracking-wide">
              STARTING ANNUAL EXPENSES (USD):
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
            background: "bg-surface-alt",
            border: "border-themed",
            text: "text-primary",
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
        dropdownPresets={incomeDropdownPresets}
      />

      {/* Section 3: Expenses Inflation Chart */}
      <div className="p-4 card-themed border border-bitcoin-orange">
        <h4 className="font-semibold text-bitcoin-orange mb-3 font-heading tracking-wide uppercase">
          📊 PROJECTED EXPENSES GROWTH
        </h4>
        <div style={{ height: "400px" }}>
          <ExpensesInflationChart formData={formData} />
        </div>
      </div>
    </div>
  );
};
