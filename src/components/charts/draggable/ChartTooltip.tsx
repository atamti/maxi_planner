import React from "react";

interface ChartTooltipProps {
  position: { x: number; y: number } | null;
  value: number;
  yearIndex: number;
  yAxisLabel?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  position,
  value,
  yearIndex,
  yAxisLabel = "",
}) => {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{
        left: position.x,
        top: position.y - 10,
      }}
    >
      <div className="font-medium">Year {yearIndex + 1}</div>
      <div className="text-gray-200">
        {value.toFixed(0)}% {yAxisLabel}
      </div>
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid #1f2937",
        }}
      />
    </div>
  );
};
