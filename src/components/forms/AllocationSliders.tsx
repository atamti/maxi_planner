import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { useAllocation } from "../../hooks/useAllocation";
import { useAllocationAdjustment } from "../../hooks/useAllocationAdjustment";
import { useAllocationHighlight } from "../../hooks/useAllocationHighlight";
import { useFormValidation } from "../../hooks/useFormValidation";
import { AllocationBar } from "./allocation/AllocationBar";
import { AllocationErrorDisplay } from "./allocation/AllocationErrorDisplay";
import { AllocationSlider } from "./allocation/AllocationSlider";
import { AllocationSummary } from "./allocation/AllocationSummary";
import { SpeculationDisplay } from "./allocation/SpeculationDisplay";

interface Props {
  minThreshold?: number;
}

export const AllocationSliders: React.FC<Props> = ({ minThreshold = 0 }) => {
  const { formData } = usePortfolio();
  const { allocationError } = useAllocation();
  const { validateAllocation } = useFormValidation(formData);

  const { savingsPct, investmentsPct, speculationPct, handleAllocationChange } =
    useAllocationAdjustment({ minThreshold });

  const { getHighlightClasses, isHighlighted, setHighlightField } =
    useAllocationHighlight();

  return (
    <div className="space-y-4">
      <AllocationErrorDisplay error={allocationError} />

      <AllocationBar
        savingsPct={savingsPct}
        investmentsPct={investmentsPct}
        speculationPct={speculationPct}
        isHighlighted={isHighlighted}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AllocationSlider
          label="Savings"
          value={savingsPct}
          onChange={(value) => handleAllocationChange("savings", value)}
          minThreshold={minThreshold}
          category="savings"
          description="Conservative storage"
          highlightClasses={getHighlightClasses("savings")}
        />

        <AllocationSlider
          label="Investments"
          value={investmentsPct}
          onChange={(value) => handleAllocationChange("investments", value)}
          minThreshold={minThreshold}
          category="investments"
          description="Medium risk/yield"
          highlightClasses={getHighlightClasses("investments")}
        />

        <SpeculationDisplay speculationPct={speculationPct} />
      </div>

      <AllocationSummary
        savingsPct={savingsPct}
        investmentsPct={investmentsPct}
        speculationPct={speculationPct}
      />
    </div>
  );
};
