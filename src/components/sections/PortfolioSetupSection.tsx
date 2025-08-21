import React from "react";
import { usePortfolioCompat } from "../../store";
import { CollapsibleSection } from "../common/CollapsibleSection";
import { AllocationSliders } from "../forms/AllocationSliders";
import { NumberInput } from "../ui/NumberInput";

export const PortfolioSetupSection: React.FC = () => {
  const { formData, updateFormData } = usePortfolioCompat();

  // Create descriptive title
  const getSectionTitle = () => {
    return `1. 💼 Portfolio Setup: ${formData.btcStack} BTC over ${formData.timeHorizon} years (${formData.savingsPct}% savings, ${formData.investmentsPct}% investments, ${formData.speculationPct}% speculation)`;
  };

  return (
    <CollapsibleSection
      title={getSectionTitle()}
      defaultExpanded={true}
      noGrid={true}
    >
      {/* Vertical grid layout */}
      <div className="space-y-8">
        {/* Section 1: BTC Stack Size and Time Horizon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-inter text-sm font-bold text-primary mb-3 uppercase tracking-wide">
              BTC STACK SIZE (₿):
            </label>
            <NumberInput
              value={formData.btcStack}
              onChange={(value) => updateFormData({ btcStack: value })}
              className="w-full p-3 bg-surface border-2 border-themed rounded-none text-primary font-mono text-lg focus-ring-themed"
              min={0}
              step={0.1}
            />
          </div>

          <div>
            <label className="block font-inter text-sm font-bold text-primary mb-3 uppercase tracking-wide">
              TIME HORIZON (YEARS):
            </label>
            <input
              type="range"
              value={formData.timeHorizon}
              onChange={(e) =>
                updateFormData({ timeHorizon: Number(e.target.value) })
              }
              className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed"
              min="1"
              max="50"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-secondary font-mono">1 yr</span>
              <span className="text-lg font-bold text-bitcoin-orange font-inter">
                {formData.timeHorizon} YEARS
              </span>
              <span className="text-xs text-secondary font-mono">50 yrs</span>
            </div>
          </div>
        </div>

        {/* Section 2: Asset Allocation - Full Width */}
        <div className="w-full">
          <h4 className="font-inter text-sm font-bold text-primary mb-4 uppercase tracking-wide">
            INITIAL ASSET ALLOCATION
          </h4>

          {/* Annual Reallocation Toggle */}
          <div className="mb-6 p-4 bg-surface-alt rounded-none border-2 border-navy-900/50">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableAnnualReallocation}
                    onChange={(e) =>
                      updateFormData({
                        enableAnnualReallocation: e.target.checked,
                      })
                    }
                    className="mr-3 h-5 w-5 text-bitcoin-orange focus:ring-bitcoin-orange border-themed rounded-none"
                  />
                  <span className="font-inter text-sm font-bold text-primary uppercase tracking-wide">
                    ENABLE ANNUAL REALLOCATION
                  </span>
                </label>
                <p className="text-sm text-secondary mt-2 ml-8 font-mono">
                  {formData.enableAnnualReallocation
                    ? "Rebalances to target percentages yearly (traditional portfolio management - default)"
                    : "Each allocation bucket grows independently with compound returns (advanced strategy)"}
                </p>
              </div>
            </div>
          </div>

          <AllocationSliders />
        </div>
      </div>
    </CollapsibleSection>
  );
};
