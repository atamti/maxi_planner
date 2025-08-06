import { useCallback } from "react";
import { usePortfolioCompat } from "../store";
import {
  useFormState,
  useInteractionEffects,
  useNumberFormatting,
} from "../utils/shared";

interface AllocationSystemProps {
  minThreshold?: number;
}

/**
 * Consolidated allocation management system using shared utilities
 * Replaces: useAllocation, useAllocationAdjustment, useAllocationColors, useAllocationHighlight
 */
export const useAllocationSystem = ({
  minThreshold = 0,
}: AllocationSystemProps = {}) => {
  const { formData, updateFormData, allocationError } = usePortfolioCompat();
  const { clampNumber, formatPercentage } = useNumberFormatting();

  // Use interaction effects for highlighting
  const highlightEffects = useInteractionEffects<string | null>(null, 2000);

  // Core allocation values
  const savingsPct = formData.savingsPct;
  const investmentsPct = formData.investmentsPct;
  const speculationPct = formData.speculationPct;
  const totalAllocation = savingsPct + investmentsPct + speculationPct;
  const isValid = totalAllocation === 100;

  // Form state management for each allocation type
  const savingsState = useFormState(savingsPct, (value: number) => ({
    isValid: value >= minThreshold && value <= 100,
    error:
      value < minThreshold
        ? `Must be at least ${minThreshold}%`
        : value > 100
          ? "Cannot exceed 100%"
          : undefined,
  }));

  const investmentsState = useFormState(investmentsPct, (value: number) => ({
    isValid: value >= minThreshold && value <= 100,
    error:
      value < minThreshold
        ? `Must be at least ${minThreshold}%`
        : value > 100
          ? "Cannot exceed 100%"
          : undefined,
  }));

  // Smart allocation adjustment that maintains constraints
  const handleAllocationChange = useCallback(
    (field: "savings" | "investments", newValue: number) => {
      let newSavings = savingsPct;
      let newInvestments = investmentsPct;
      let newSpeculation = speculationPct;

      // Highlight the field being changed
      highlightEffects.triggerEffect(field);

      if (field === "savings") {
        newSavings = clampNumber(newValue, minThreshold, 100);
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
        newInvestments = clampNumber(newValue, minThreshold, 100);
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

      updateFormData({
        savingsPct: newSavings,
        investmentsPct: newInvestments,
        speculationPct: newSpeculation,
      });
    },
    [
      savingsPct,
      investmentsPct,
      speculationPct,
      updateFormData,
      minThreshold,
      clampNumber,
      highlightEffects,
    ],
  );

  // Color management
  const getBarColor = useCallback(
    (
      category: "savings" | "investments" | "speculation",
      isHighlighted: boolean,
    ): string => {
      const baseColors = {
        savings: "bg-green-500",
        investments: "bg-blue-500",
        speculation: "bg-red-500",
      };

      const highlightColors = {
        savings: "bg-green-600",
        investments: "bg-blue-600",
        speculation: "bg-red-600",
      };

      return isHighlighted ? highlightColors[category] : baseColors[category];
    },
    [],
  );

  const getIndicatorColor = useCallback(
    (category: "savings" | "investments" | "speculation"): string => {
      const colors = {
        savings: "bg-green-500",
        investments: "bg-blue-500",
        speculation: "bg-red-500",
      };

      return colors[category];
    },
    [],
  );

  // Highlight utilities
  const getHighlightClasses = useCallback(
    (field: string): string => {
      return highlightEffects.state === field
        ? "ring-2 ring-yellow-400 rounded-lg p-2 transition-all duration-300"
        : "transition-all duration-300";
    },
    [highlightEffects.state],
  );

  const isHighlighted = useCallback(
    (field: string): boolean => {
      return highlightEffects.state === field;
    },
    [highlightEffects.state],
  );

  // Formatting utilities
  const getFormattedPercentage = useCallback(
    (value: number): string => {
      return formatPercentage(value, 0).replace("%", ""); // Just the number for inputs
    },
    [formatPercentage],
  );

  const getFormattedTotal = useCallback((): string => {
    return formatPercentage(totalAllocation, 0);
  }, [totalAllocation, formatPercentage]);

  return {
    // Core values
    savingsPct,
    investmentsPct,
    speculationPct,
    totalAllocation,
    isValid,

    // State management
    savingsState,
    investmentsState,

    // Actions
    handleAllocationChange,
    setHighlightField: highlightEffects.triggerEffect,

    // Color utilities
    getBarColor,
    getIndicatorColor,

    // Highlight utilities
    getHighlightClasses,
    isHighlighted,
    isHighlightActive: highlightEffects.isActive,

    // Formatting utilities
    getFormattedPercentage,
    getFormattedTotal,

    // Error state
    allocationError,
    hasValidationErrors:
      !savingsState.isValid || !investmentsState.isValid || !isValid,
  };
};
