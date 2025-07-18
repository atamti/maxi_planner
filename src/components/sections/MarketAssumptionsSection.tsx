import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { YieldChart } from "../charts/YieldChart";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { BtcPriceSection } from "./BtcPriceSection";
import { InflationSection } from "./InflationSection";

export const MarketAssumptionsSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolio();

  return (
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
  );
};
