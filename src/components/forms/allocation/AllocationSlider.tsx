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
      <div className="flex items-center mb-2">
        <div
          className={`w-3 h-3 ${getIndicatorColor(category)} rounded mr-2`}
        ></div>
        <label className="block font-medium text-sm">
          {label} ({value}%)
        </label>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mb-2"
        min={minThreshold}
        max={100}
      />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full p-1 border rounded text-center text-sm"
        min={minThreshold}
        max={100}
      />
      <span className="text-xs text-gray-600 block mt-1 text-center">
        {description}
      </span>
    </div>
  );
};
