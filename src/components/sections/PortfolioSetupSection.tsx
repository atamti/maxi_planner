import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { AllocationSliders } from "../forms/AllocationSliders";

export const PortfolioSetupSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolio();

  return (
    <CollapsibleSection title="1. 💼 Portfolio Setup" defaultExpanded={true}>
      <div>
        <label className="block font-medium mb-1">BTC Stack Size (₿):</label>
        <input
          type="number"
          value={formData.btcStack}
          onChange={(e) => updateFormData({ btcStack: Number(e.target.value) })}
          className="w-full p-2 border rounded"
          min="0"
          step="0.1"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Time Horizon (Years):</label>
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
  );
};
