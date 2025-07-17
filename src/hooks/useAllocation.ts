import { usePortfolio } from "../context/PortfolioContext";

/**
 * Custom hook for managing portfolio allocation logic
 */
export const useAllocation = () => {
  const { formData, updateFormData, allocationError } = usePortfolio();

  const updateAllocation = (updates: {
    savingsPct?: number;
    investmentsPct?: number;
    speculationPct?: number;
  }) => {
    updateFormData(updates);
  };

  const getAllocationPercentages = () => ({
    savingsPct: formData.savingsPct,
    investmentsPct: formData.investmentsPct,
    speculationPct: formData.speculationPct,
  });

  const getTotalAllocation = () =>
    formData.savingsPct + formData.investmentsPct + formData.speculationPct;

  const isAllocationValid = () => getTotalAllocation() === 100;

  return {
    ...getAllocationPercentages(),
    updateAllocation,
    allocationError,
    totalAllocation: getTotalAllocation(),
    isValid: isAllocationValid(),
  };
};
