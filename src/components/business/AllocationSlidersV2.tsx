// Refactored AllocationSliders with clean architecture
import React, { useState } from "react";
import { createAllocationService } from "../../services";
import { useCentralizedStateContext } from "../../store";
import {
  AllocationVisualization,
  Card,
  SliderInput,
  StatusIndicator,
} from "../ui";

export const AllocationSlidersV2: React.FC = () => {
  const { formData, updateFormData, selectors } = useCentralizedStateContext();
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Business logic service
  const allocationService = createAllocationService();

  // Current allocation state
  const currentAllocation = selectors.getAllocationPercentages();
  const totalAllocation = selectors.getTotalAllocation();
  const isValid = selectors.isAllocationValid();

  // Handle allocation changes with business logic
  const handleAllocationChange = (
    field: keyof typeof currentAllocation,
    value: number,
  ) => {
    const adjustedAllocation = allocationService.adjustAllocation(
      currentAllocation,
      { [field]: value },
    );

    updateFormData(adjustedAllocation);
  };

  // Validation using business logic
  const validation = allocationService.validateAllocation(currentAllocation);

  // Visualization data
  const allocationData = [
    {
      label: "Savings",
      percentage: currentAllocation.savingsPct,
      color: "#10B981", // green
    },
    {
      label: "Investments",
      percentage: currentAllocation.investmentsPct,
      color: "#3B82F6", // blue
    },
    {
      label: "Speculation",
      percentage: currentAllocation.speculationPct,
      color: "#F59E0B", // amber
    },
  ];

  // Highlight management using business logic
  const getHighlightClasses = (field: string) => {
    return allocationService.getHighlightStatus(field, highlightedField)
      .classes;
  };

  return (
    <Card title="Asset Allocation Strategy" className="mb-6">
      {/* Allocation Visualization */}
      <AllocationVisualization allocations={allocationData} className="mb-6" />

      {/* Validation Status */}
      {!validation.isValid && (
        <StatusIndicator
          status="error"
          message="Invalid Allocation"
          details={validation.error}
          className="mb-4"
        />
      )}

      {/* Allocation Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SliderInput
          label="Savings (₿)"
          value={currentAllocation.savingsPct}
          onChange={(value) => handleAllocationChange("savingsPct", value)}
          min={0}
          max={100}
          displayValue={`${currentAllocation.savingsPct}%`}
          error={!isValid ? "Adjust to total 100%" : undefined}
          className={getHighlightClasses("savings")}
        />

        <SliderInput
          label="Investments (Traditional)"
          value={currentAllocation.investmentsPct}
          onChange={(value) => handleAllocationChange("investmentsPct", value)}
          min={0}
          max={100}
          displayValue={`${currentAllocation.investmentsPct}%`}
          error={!isValid ? "Adjust to total 100%" : undefined}
          className={getHighlightClasses("investments")}
        />

        <SliderInput
          label="Speculation (Alt coins)"
          value={currentAllocation.speculationPct}
          onChange={(value) => handleAllocationChange("speculationPct", value)}
          min={0}
          max={100}
          displayValue={`${currentAllocation.speculationPct}%`}
          error={!isValid ? "Adjust to total 100%" : undefined}
          className={getHighlightClasses("speculation")}
        />
      </div>

      {/* Total Display */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Allocation:</span>
          <span
            className={`font-bold ${isValid ? "text-green-600" : "text-red-600"}`}
          >
            {totalAllocation}%
          </span>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          • <strong>Savings (₿):</strong> Conservative BTC holdings
        </p>
        <p>
          • <strong>Investments:</strong> Traditional assets (stocks, bonds,
          real estate)
        </p>
        <p>
          • <strong>Speculation:</strong> Higher risk assets (altcoins, growth
          stocks)
        </p>
      </div>
    </Card>
  );
};
