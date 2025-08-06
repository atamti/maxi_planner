// Refactored Portfolio Setup Section with clean architecture
import React from "react";
import { createValidationService } from "../../services";
import { useCentralizedStateContext } from "../../store";
import { CollapsibleSection, Grid, NumericInput, SliderInput } from "../ui";
import { AllocationSlidersV2 } from "./AllocationSlidersV2";

export const PortfolioSetupSectionV2: React.FC = () => {
  const { formData, updateFormData, selectors } = useCentralizedStateContext();

  // Business logic service
  const validationService = createValidationService();

  // Validation
  const validation = validationService.validateFormData(formData);

  // Section state
  const isExpanded = selectors.isSectionExpanded("portfolio-setup");

  // Create descriptive title using selectors
  const allocation = selectors.getAllocationPercentages();
  const getSectionTitle = () => {
    return `1. 💼 Portfolio Setup: ${formData.btcStack} BTC over ${formData.timeHorizon} years (${allocation.savingsPct}% savings, ${allocation.investmentsPct}% investments, ${allocation.speculationPct}% speculation)`;
  };

  return (
    <CollapsibleSection
      title={getSectionTitle()}
      isExpanded={isExpanded}
      onToggle={() => {
        /* Will be handled by centralized state */
      }}
      icon="💼"
    >
      <Grid columns={2} gap="lg">
        {/* BTC Stack Configuration */}
        <NumericInput
          label="BTC Stack Size"
          value={formData.btcStack}
          onChange={(value) => updateFormData({ btcStack: value })}
          min={0.001}
          step={0.1}
          unit="₿"
          error={validation.errors.btcStack}
        />

        {/* Time Horizon */}
        <SliderInput
          label="Time Horizon"
          value={formData.timeHorizon}
          onChange={(value) => updateFormData({ timeHorizon: value })}
          min={1}
          max={50}
          displayValue={`${formData.timeHorizon} years`}
          error={validation.errors.timeHorizon}
        />
      </Grid>

      {/* Asset Allocation Strategy */}
      <div className="mt-6">
        <AllocationSlidersV2 />
      </div>
    </CollapsibleSection>
  );
};
