import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { YieldChart } from "../charts/YieldChart";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { BtcPriceSection } from "./BtcPriceSection";
import { InflationSection } from "./InflationSection";

export const MarketAssumptionsSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolio();

  // Calculate averages for use in titles
  const avgInflation = formData.inflationCustomRates
    ? (
        formData.inflationCustomRates.reduce((sum, rate) => sum + rate, 0) /
        formData.inflationCustomRates.length
      ).toFixed(1)
    : "0";
  const avgBtcGrowth = formData.btcPriceCustomRates
    ? (
        formData.btcPriceCustomRates.reduce((sum, rate) => sum + rate, 0) /
        formData.btcPriceCustomRates.length
      ).toFixed(1)
    : "0";

  // Create descriptive title with current settings
  const getSectionTitle = () => {
    return `3. 📊 Market Assumptions: ${avgInflation}% avg inflation, ${avgBtcGrowth}% avg BTC growth, ${formData.investmentsStartYield}-${formData.investmentsEndYield}% investment yields`;
  };

  return (
    <CollapsibleSection title={getSectionTitle()} noGrid={true}>
      <div className="space-y-4">
        {/* Subsection 3a: USD Inflation */}
        <CollapsibleSection
          title={`3a. 💵 USD Inflation: ${avgInflation}% average (${formData.inflationMode === "simple" ? formData.inflationFlat + "% flat" : formData.inflationStart + "-" + formData.inflationEnd + "% range"})`}
          defaultExpanded={false}
          noGrid={true}
        >
          <InflationSection
            formData={formData}
            updateFormData={updateFormData}
          />
        </CollapsibleSection>

        {/* Subsection 3b: BTC Price Appreciation */}
        <CollapsibleSection
          title={`3b. ₿ BTC Price Appreciation: ${avgBtcGrowth}% average (${formData.btcPriceMode === "simple" ? formData.btcPriceFlat + "% flat" : formData.btcPriceStart + "-" + formData.btcPriceEnd + "% range"})`}
          defaultExpanded={false}
          noGrid={true}
        >
          <BtcPriceSection
            formData={formData}
            updateFormData={updateFormData}
          />
        </CollapsibleSection>

        {/* Subsection 3c: BTC Yield Assumptions */}
        <CollapsibleSection
          title={`3c. 📈 BTC Yield Assumptions: ${formData.investmentsStartYield}-${formData.investmentsEndYield}% investments, ${formData.speculationStartYield}-${formData.speculationEndYield}% speculation`}
          defaultExpanded={false}
        >
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
        </CollapsibleSection>
      </div>
    </CollapsibleSection>
  );
};
