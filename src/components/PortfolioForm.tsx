import React, { useState } from "react";
import { FormData } from "../types";
import { formatCurrency, formatNumber } from "../utils/formatNumber";
import { AllocationSliders } from "./AllocationSliders";
import { InflationSection } from "./InflationSection";
import { YieldChart } from "./YieldChart";

interface Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  allocationError: string;
  onReset: () => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<SectionProps> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4 border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center rounded-t-lg"
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-gray-600">{isExpanded ? "−" : "+"}</span>
      </button>
      {isExpanded && (
        <div className="p-4 bg-white rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const PortfolioForm: React.FC<Props> = ({
  formData,
  updateFormData,
  allocationError,
  onReset,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-xl font-semibold mb-4">Portfolio Configuration</h2>

      <CollapsibleSection
        title="🏦 Core Portfolio Setup"
        defaultExpanded={true}
      >
        <div>
          <label className="block font-medium mb-1">BTC Stack Size (₿):</label>
          <input
            type="number"
            value={formData.btcStack}
            onChange={(e) =>
              updateFormData({ btcStack: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Starting USD Exchange Rate ($/₿):
          </label>
          <input
            type="number"
            value={formData.exchangeRate}
            onChange={(e) =>
              updateFormData({ exchangeRate: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
            min="0"
          />
          <p className="text-xs text-gray-600 mt-1">
            Current: {formatCurrency(formData.exchangeRate, 0)}
          </p>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Time Horizon (Years):
          </label>
          <input
            type="range"
            value={formData.timeHorizon}
            onChange={(e) =>
              updateFormData({ timeHorizon: Number(e.target.value) })
            }
            className="w-full"
            min="1"
            max="50"
          />
          <span className="text-sm text-gray-600">
            {formData.timeHorizon} years
          </span>
        </div>
        <div>
          <label className="block font-medium mb-1">
            BTC Annual Growth Rate (%):
          </label>
          <input
            type="range"
            value={formData.btcGrowth}
            onChange={(e) =>
              updateFormData({ btcGrowth: Number(e.target.value) })
            }
            className="w-full"
            min="0"
            max="100"
          />
          <span className="text-sm text-gray-600">
            {formData.btcGrowth}% annually
          </span>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="📊 Asset Allocation Strategy"
        defaultExpanded={true}
      >
        <div className="col-span-2">
          <AllocationSliders
            savingsPct={formData.savingsPct}
            investmentsPct={formData.investmentsPct}
            speculationPct={formData.speculationPct}
            onUpdate={(updates) => updateFormData(updates)}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="📈 BTC yield assumptions">
        <div>
          <label className="block font-medium mb-1">
            Investments Start Yield (BTC %):
          </label>
          <input
            type="range"
            value={formData.investmentsStartYield}
            onChange={(e) =>
              updateFormData({ investmentsStartYield: Number(e.target.value) })
            }
            className="w-full"
            min="0"
            max="100"
          />
          <span className="text-sm text-gray-600">
            {formData.investmentsStartYield}% initial yield
          </span>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Speculation Start Yield (BTC %):
          </label>
          <input
            type="range"
            value={formData.speculationStartYield}
            onChange={(e) =>
              updateFormData({ speculationStartYield: Number(e.target.value) })
            }
            className="w-full"
            min="0"
            max="100"
          />
          <span className="text-sm text-gray-600">
            {formData.speculationStartYield}% initial yield
          </span>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Investments End Yield (BTC %):
          </label>
          <input
            type="range"
            value={formData.investmentsEndYield}
            onChange={(e) =>
              updateFormData({ investmentsEndYield: Number(e.target.value) })
            }
            className="w-full"
            min="0"
            max="50"
          />
          <span className="text-sm text-gray-600">
            {formData.investmentsEndYield}% final yield
          </span>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Speculation End Yield (BTC %):
          </label>
          <input
            type="range"
            value={formData.speculationEndYield}
            onChange={(e) =>
              updateFormData({ speculationEndYield: Number(e.target.value) })
            }
            className="w-full"
            min="0"
            max="50"
          />
          <span className="text-sm text-gray-600">
            {formData.speculationEndYield}% final yield
          </span>
        </div>

        {/* Yield Projection Chart */}
        <div className="col-span-2 mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">📈 Yield Projection Chart</h4>
          <div style={{ height: "300px" }}>
            <YieldChart formData={formData} />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="💰 Income & Expenses">
        <div>
          <label className="block font-medium mb-1">
            Income Bucket Yield (USD %):
          </label>
          <input
            type="number"
            value={formData.incomeYield}
            onChange={(e) =>
              updateFormData({ incomeYield: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>
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
            Percentage of BTC stack to convert to USD income pool at activation
            year
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
              updateFormData({ incomeReinvestmentPct: Number(e.target.value) })
            }
            className="w-full"
            min="0"
            max={formData.incomeYield}
          />
          <span className="text-sm text-gray-600">
            {formData.incomeReinvestmentPct}% reinvested,{" "}
            {formData.incomeYield - formData.incomeReinvestmentPct}% income
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
      </CollapsibleSection>

      <CollapsibleSection title="🏦 Borrowing & Collateral">
        <div>
          <label className="block font-medium mb-1">
            Collateralized BTC (% of Savings):
          </label>
          <input
            type="range"
            value={formData.collateralPct}
            onChange={(e) =>
              updateFormData({ collateralPct: Number(e.target.value) })
            }
            className="w-full"
            min="0"
            max="50"
          />
          <span className="text-sm text-gray-600">
            {formData.collateralPct}% used as collateral
          </span>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Loan Interest Rate (%):
          </label>
          <input
            type="number"
            value={formData.loanRate}
            onChange={(e) =>
              updateFormData({ loanRate: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Loan Term (Years):</label>
          <input
            type="range"
            value={formData.loanTermYears}
            onChange={(e) =>
              updateFormData({ loanTermYears: Number(e.target.value) })
            }
            className="w-full"
            min="1"
            max="30"
          />
          <span className="text-sm text-gray-600">
            {formData.loanTermYears} years
          </span>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.interestOnly}
              onChange={(e) =>
                updateFormData({ interestOnly: e.target.checked })
              }
              className="mr-2"
            />
            <span className="font-medium">Interest Only Payments</span>
          </label>
          <p className="text-xs text-gray-600 mt-1">
            {formData.interestOnly
              ? "Pay only interest, principal remains unchanged"
              : `Amortized payments over ${formData.loanTermYears}-year term`}
          </p>
        </div>

        {/* Live Loan Calculations */}
        {formData.collateralPct > 0 && (
          <div className="col-span-2 mt-4 p-3 bg-blue-50 rounded-lg border">
            <h4 className="font-semibold text-blue-800 mb-2">
              💰 Loan Details
            </h4>
            {(() => {
              // Calculate BTC stack at activation year with growth
              let btcStackAtActivation = formData.btcStack;
              for (let year = 0; year < formData.activationYear; year++) {
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

                const savings =
                  btcStackAtActivation * (formData.savingsPct / 100);
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

              // Use BTC price at activation year
              const btcPriceAtActivation =
                formData.exchangeRate *
                Math.pow(1 + formData.btcGrowth / 100, formData.activationYear);
              const loanPrincipal = collateralBtc * 0.4 * btcPriceAtActivation;

              const annualInterest = loanPrincipal * (formData.loanRate / 100);
              const monthlyPayment = formData.interestOnly
                ? annualInterest / 12
                : (loanPrincipal *
                    (formData.loanRate / 100 / 12) *
                    Math.pow(
                      1 + formData.loanRate / 100 / 12,
                      formData.loanTermYears * 12,
                    )) /
                  (Math.pow(
                    1 + formData.loanRate / 100 / 12,
                    formData.loanTermYears * 12,
                  ) -
                    1);
              const annualPayment = monthlyPayment * 12;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Collateral BTC:</strong>{" "}
                    {formatNumber(collateralBtc, 3)} BTC
                  </div>
                  <div>
                    <strong>BTC Price (Year {formData.activationYear}):</strong>{" "}
                    {formatCurrency(btcPriceAtActivation, 0)}
                  </div>
                  <div>
                    <strong>Loan Principal:</strong>{" "}
                    {formatCurrency(loanPrincipal, 0)}
                  </div>
                  <div>
                    <strong>Annual Payment:</strong>{" "}
                    {formatCurrency(annualPayment, 0)}
                  </div>
                  {formData.interestOnly && (
                    <div className="col-span-2 text-orange-600 text-xs">
                      ⚠️ Interest-only: Principal of{" "}
                      {formatCurrency(loanPrincipal, 0)} remains due
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="💵 USD Inflation Assumptions">
        <div className="col-span-2">
          <InflationSection
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="⚠️ Risk Scenarios (TBC)">
        <div className="flex items-center p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <span className="text-yellow-800 text-sm">
            📊 Stress test your portfolio with various crash scenarios (TBC)
          </span>
        </div>
      </CollapsibleSection>

      <div className="flex gap-4 pt-4 border-t">
        <button
          onClick={onReset}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
};
