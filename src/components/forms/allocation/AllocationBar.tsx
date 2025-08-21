import React, { useEffect, useRef, useState } from "react";
import { useAllocationColors } from "../../../hooks/useAllocationColors";

interface AllocationBarProps {
  savingsPct: number;
  investmentsPct: number;
  speculationPct: number;
  isHighlighted: (field: string) => boolean;
}

export const AllocationBar: React.FC<AllocationBarProps> = ({
  savingsPct,
  investmentsPct,
  speculationPct,
  isHighlighted,
}) => {
  const { getBarColor } = useAllocationColors();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate minimum width needed for percentage text (roughly 30px for "XX%")
  const getMinWidthForText = (percentage: number): number => {
    const textLength = `${Math.round(percentage)}%`.length;
    return textLength * 8 + 10; // Rough estimate: 8px per character + 10px padding
  };

  // Check if segment is wide enough to show percentage
  const shouldShowPercentage = (percentage: number): boolean => {
    if (containerWidth === 0) return percentage > 15; // Fallback to old logic

    const segmentWidth = (percentage / 100) * containerWidth;
    const minWidth = getMinWidthForText(percentage);

    return segmentWidth >= minWidth;
  };

  return (
    <div
      ref={containerRef}
      className="flex h-8 rounded-none overflow-hidden border-2 border-themed"
    >
      <div
        className={`${getBarColor(
          "savings",
          isHighlighted("savings"),
        )} flex items-center justify-center text-white text-xs font-mono font-bold`}
        style={{ width: `${savingsPct}%` }}
      >
        {shouldShowPercentage(savingsPct) ? `${Math.round(savingsPct)}%` : ""}
      </div>
      <div
        className={`${getBarColor(
          "investments",
          isHighlighted("investments"),
        )} flex items-center justify-center text-white text-xs font-mono font-bold`}
        style={{ width: `${investmentsPct}%` }}
      >
        {shouldShowPercentage(investmentsPct)
          ? `${Math.round(investmentsPct)}%`
          : ""}
      </div>
      <div
        className={`${getBarColor("speculation", false)} flex items-center justify-center text-white text-xs font-mono font-bold`}
        style={{ width: `${speculationPct}%` }}
      >
        {shouldShowPercentage(speculationPct)
          ? `${Math.round(speculationPct)}%`
          : ""}
      </div>
    </div>
  );
};
