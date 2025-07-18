import { useCallback } from "react";
import { useAllocation } from "./useAllocation";

interface AllocationAdjustmentProps {
  minThreshold: number;
}

export const useAllocationAdjustment = ({
  minThreshold,
}: AllocationAdjustmentProps) => {
  const { savingsPct, investmentsPct, speculationPct, updateAllocation } =
    useAllocation();

  const handleAllocationChange = useCallback(
    (field: "savings" | "investments", newValue: number) => {
      let newSavings = savingsPct;
      let newInvestments = investmentsPct;
      let newSpeculation = speculationPct;

      if (field === "savings") {
        newSavings = Math.max(minThreshold, Math.min(100, newValue));
        const remaining = 100 - newSavings;

        // If speculation would go below threshold, reduce investments
        if (remaining - investmentsPct < minThreshold) {
          newInvestments = Math.max(minThreshold, remaining - minThreshold);
          newSpeculation = remaining - newInvestments;
        } else {
          newSpeculation = Math.max(minThreshold, remaining - investmentsPct);
          newInvestments = remaining - newSpeculation;
        }
      } else if (field === "investments") {
        newInvestments = Math.max(minThreshold, Math.min(100, newValue));
        const remaining = 100 - newInvestments;

        // If speculation would go below threshold, reduce savings
        if (remaining - savingsPct < minThreshold) {
          newSavings = Math.max(minThreshold, remaining - minThreshold);
          newSpeculation = remaining - newSavings;
        } else {
          newSpeculation = Math.max(minThreshold, remaining - savingsPct);
          newSavings = remaining - newSpeculation;
        }
      }

      updateAllocation({
        savingsPct: newSavings,
        investmentsPct: newInvestments,
        speculationPct: newSpeculation,
      });
    },
    [
      savingsPct,
      investmentsPct,
      speculationPct,
      updateAllocation,
      minThreshold,
    ],
  );

  return {
    savingsPct,
    investmentsPct,
    speculationPct,
    handleAllocationChange,
  };
};
