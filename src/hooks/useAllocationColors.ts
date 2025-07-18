import { useCallback } from "react";

export const useAllocationColors = () => {
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

  return {
    getBarColor,
    getIndicatorColor,
  };
};
