import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { AllocationSliders } from "./AllocationSliders";
import { BtcPriceSection } from "./BtcPriceSection";
import { EconomicScenariosSection } from "./EconomicScenariosSection";
import { IncomeExpensesSection } from "./IncomeExpensesSection";
import { InflationSection } from "./InflationSection";
import { YieldChart } from "./YieldChart";

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

export const PortfolioForm: React.FC = () => {
  const { formData, updateFormData, resetForm, allocationError } =
    usePortfolio();

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-xl font-semibold mb-4">Portfolio Configuration</h2>

      {/* Section 1: Portfolio Setup */}
      <CollapsibleSection title="1. 💼 Portfolio Setup" defaultExpanded={true}>
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

        {/* Asset allocation section integrated here */}
        <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold mb-3">Asset Allocation Strategy</h4>
          <AllocationSliders />
        </div>
      </CollapsibleSection>

      {/* Section 2: Economic Scenario */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          2. 🌍 Economic Scenario
        </h3>
        <EconomicScenariosSection
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>

      {/* Section 3: Market Assumptions */}
      <CollapsibleSection title="3. 📊 Market Assumptions">
        <div className="col-span-2 space-y-6">
          {/* Subsection 3a: USD Inflation */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700">
              3a. 💵 USD Inflation
            </h4>
            <InflationSection
              formData={formData}
              updateFormData={updateFormData}
            />
          </div>

          {/* Subsection 3b: BTC Price Appreciation */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700">
              3b. ₿ BTC Price Appreciation
            </h4>
            <BtcPriceSection
              formData={formData}
              updateFormData={updateFormData}
            />
          </div>

          {/* Subsection 3c: BTC Yield Assumptions */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700">
              3c. 📈 BTC Yield Assumptions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">
                  Investments Start Yield (BTC %):
                </label>
                <input
                  type="range"
                  value={formData.investmentsStartYield}
                  onChange={(e) =>
                    updateFormData({
                      investmentsStartYield: Number(e.target.value),
                    })
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
                    updateFormData({
                      speculationStartYield: Number(e.target.value),
                    })
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
                    updateFormData({
                      investmentsEndYield: Number(e.target.value),
                    })
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
                    updateFormData({
                      speculationEndYield: Number(e.target.value),
                    })
                  }
                  className="w-full"
                  min="0"
                  max="50"
                />
                <span className="text-sm text-gray-600">
                  {formData.speculationEndYield}% final yield
                </span>
              </div>
            </div>

            {/* Yield Projection Chart */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">📈 Yield Projection Chart</h4>
              <div style={{ height: "300px" }}>
                <YieldChart formData={formData} />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 4: Income & Cashflow */}
      <CollapsibleSection title="4. 💰 Income & Cashflow">
        <div className="col-span-2">
          <IncomeExpensesSection
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>
      </CollapsibleSection>

      {/* Reset Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={resetForm}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 Reset to Defaults
        </button>
      </div>
    </div>
  );
};
