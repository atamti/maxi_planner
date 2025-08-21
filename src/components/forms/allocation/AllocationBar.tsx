import React from "react";
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

  return (
    <div className="flex h-8 rounded-none overflow-hidden border-2 border-themed">
      <div
        className={`${getBarColor(
          "savings",
          isHighlighted("savings"),
        )} flex items-center justify-center text-white text-xs font-mono font-bold`}
        style={{ width: `${savingsPct}%` }}
      >
        {savingsPct > 15 ? `${savingsPct}%` : ""}
      </div>
      <div
        className={`${getBarColor(
          "investments",
          isHighlighted("investments"),
        )} flex items-center justify-center text-white text-xs font-mono font-bold`}
        style={{ width: `${investmentsPct}%` }}
      >
        {investmentsPct > 15 ? `${investmentsPct}%` : ""}
      </div>
      <div
        className={`${getBarColor("speculation", false)} flex items-center justify-center text-white text-xs font-mono font-bold`}
        style={{ width: `${speculationPct}%` }}
      >
        {speculationPct > 15 ? `${speculationPct}%` : ""}
      </div>
    </div>
  );
};
