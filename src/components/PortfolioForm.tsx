import React, { useState } from "react";
import { FormData } from "../types";
import { AllocationSliders } from "./AllocationSliders";
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
      </CollapsibleSection>

      <CollapsibleSection title="⚠️ Risk Scenarios">
        <div>
          <label className="block font-medium mb-1">BTC Price Crash (%):</label>
          <input
            type="range"
            value={formData.priceCrash}
            onChange={(e) =>
              updateFormData({ priceCrash: Number(e.target.value) })
            }
            className="w-full"
            min="0"
            max="80"
          />
          <span className="text-sm text-gray-600">
            {formData.priceCrash}% price decline scenario
          </span>
        </div>
        <div className="flex items-center p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <span className="text-yellow-800 text-sm">
            📊 Stress test your portfolio with various crash scenarios
          </span>
        </div>
      </CollapsibleSection>

      <div className="my-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">
          📈 Yield Projection Chart
        </h3>
        <YieldChart formData={formData} />
      </div>

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
