import { useCallback, useState } from "react";

export const useAllocationHighlight = () => {
  const [highlightField, setHighlightField] = useState<string | null>(null);

  const getHighlightClasses = useCallback(
    (field: string): string => {
      return highlightField === field
        ? "ring-2 ring-yellow-400 rounded-lg p-2"
        : "";
    },
    [highlightField],
  );

  const isHighlighted = useCallback(
    (field: string): boolean => {
      return highlightField === field;
    },
    [highlightField],
  );

  return {
    highlightField,
    setHighlightField,
    getHighlightClasses,
    isHighlighted,
  };
};
