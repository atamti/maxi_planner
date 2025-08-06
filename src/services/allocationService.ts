// Allocation business logic service
import { AllocationService } from "./types";

export const createAllocationService = (): AllocationService => {
  const validateAllocation = (allocation: {
    savingsPct: number;
    investmentsPct: number;
    speculationPct: number;
  }) => {
    const total =
      allocation.savingsPct +
      allocation.investmentsPct +
      allocation.speculationPct;
    const isValid = total === 100;
    const error = !isValid
      ? `Allocations must sum to 100% (current: ${total}%)`
      : "";

    return { isValid, error, total };
  };

  const adjustAllocation = (
    current: {
      savingsPct: number;
      investmentsPct: number;
      speculationPct: number;
    },
    updates: Partial<{
      savingsPct: number;
      investmentsPct: number;
      speculationPct: number;
    }>,
    minThreshold = 0,
  ) => {
    // Apply updates while respecting minimum thresholds
    const newAllocation = { ...current, ...updates };

    // Ensure no allocation goes below minimum threshold
    if (newAllocation.savingsPct < minThreshold) {
      newAllocation.savingsPct = minThreshold;
    }
    if (newAllocation.investmentsPct < minThreshold) {
      newAllocation.investmentsPct = minThreshold;
    }
    if (newAllocation.speculationPct < minThreshold) {
      newAllocation.speculationPct = minThreshold;
    }

    // Auto-adjust other allocations to maintain 100% total if possible
    const total =
      newAllocation.savingsPct +
      newAllocation.investmentsPct +
      newAllocation.speculationPct;
    if (total !== 100) {
      // If only one field was updated, try to adjust the others proportionally
      const updatedFields = Object.keys(updates);
      if (updatedFields.length === 1) {
        const updatedField = updatedFields[0] as keyof typeof current;
        const otherFields = [
          "savingsPct",
          "investmentsPct",
          "speculationPct",
        ].filter((field) => field !== updatedField) as (keyof typeof current)[];

        const remaining = 100 - newAllocation[updatedField];
        const currentOtherTotal = otherFields.reduce(
          (sum, field) => sum + current[field],
          0,
        );

        if (currentOtherTotal > 0) {
          // Proportionally adjust other fields
          otherFields.forEach((field) => {
            const proportion = current[field] / currentOtherTotal;
            newAllocation[field] = Math.max(
              minThreshold,
              remaining * proportion,
            );
          });
        }
      }
    }

    return newAllocation;
  };

  const getHighlightStatus = (field: string, activeField: string | null) => {
    const isHighlighted = activeField === field;
    const classes = isHighlighted
      ? "border-2 border-blue-500 shadow-lg transform scale-105 transition-all duration-200"
      : "border border-gray-300 transition-all duration-200";

    return { isHighlighted, classes };
  };

  return {
    validateAllocation,
    adjustAllocation,
    getHighlightStatus,
  };
};
