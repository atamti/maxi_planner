import React from "react";
import { useAllocationColors } from "../../../hooks/useAllocationColors";

interface AllocationSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  minThreshold: number;
  category: "savings" | "investments";
  description: string;
  highlightClasses: string;
}

export const AllocationSlider: React.FC<AllocationSliderProps> = ({
  label,
  value,
  onChange,
  minThreshold,
  category,
  description,
  highlightClasses,
}) => {
  const { getIndicatorColor } = useAllocationColors();

  return (
    <div className={`transition-all duration-300 ${highlightClasses}`}>
      <div className="flex items-center mb-3">
        <div
          className={`w-3 h-3 ${getIndicatorColor(category)} rounded mr-2`}
        ></div>
        <label className="block font-inter text-sm font-bold text-primary uppercase tracking-wide">
          {label} ({value}%)
        </label>
      </div>
      <div className="py-2 mb-3">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-surface border border-themed rounded-none appearance-none slider-bitcoin focus-ring-themed m-0"
          min={minThreshold}
          max={100}
        />
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full p-2 bg-surface border-2 border-themed rounded-none text-center font-mono text-sm text-primary focus-ring-themed"
        min={minThreshold}
        max={100}
      />
      <span className="text-xs text-secondary block mt-2 text-center font-mono">
        {description}
      </span>
    </div>
  );
};
