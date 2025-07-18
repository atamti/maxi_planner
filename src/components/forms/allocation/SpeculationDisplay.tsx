import React from "react";
import { useAllocationColors } from "../../../hooks/useAllocationColors";

interface SpeculationDisplayProps {
  speculationPct: number;
}

export const SpeculationDisplay: React.FC<SpeculationDisplayProps> = ({
  speculationPct,
}) => {
  const { getIndicatorColor } = useAllocationColors();

  return (
    <div>
      <div className="flex items-center mb-2">
        <div
          className={`w-3 h-3 ${getIndicatorColor("speculation")} rounded mr-2`}
        ></div>
        <label className="block font-medium text-sm">
          Speculation ({speculationPct}%)
        </label>
      </div>
      <div className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
        Auto-adjusted to {speculationPct}%
      </div>
      <span className="text-xs text-gray-600 block mt-1 text-center">
        High risk/yield
      </span>
    </div>
  );
};
