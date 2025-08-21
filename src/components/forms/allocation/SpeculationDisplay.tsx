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
      <div className="flex items-center mb-3">
        <div
          className={`w-3 h-3 ${getIndicatorColor("speculation")} rounded mr-2`}
        ></div>
        <label className="block font-inter text-sm font-bold text-primary uppercase tracking-wide">
          Speculation ({speculationPct}%)
        </label>
      </div>
      {/* Match the height and spacing of the slider from AllocationSlider */}
      <div className="py-2 mb-3">
        <input
          type="range"
          value={speculationPct}
          disabled
          className="w-full h-2 bg-surface border border-surface rounded-none appearance-none m-0 opacity-50 cursor-not-allowed speculation-slider-gray"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-surface)",
          }}
          min="0"
          max="100"
        />
      </div>
      <div
        className="w-full p-2 bg-surface border-2 border-surface rounded-none text-center font-mono text-sm text-secondary flex items-center justify-center opacity-50"
        style={{ height: "auto", minHeight: "2.5rem" }}
      >
        Auto-adjusted to {speculationPct}%
      </div>
      <span className="text-xs text-secondary block mt-2 text-center font-mono">
        High risk/yield
      </span>
    </div>
  );
};
