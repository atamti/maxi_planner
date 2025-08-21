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
      className="fixed z-50 bg-gray-900 text-white text-sm rounded-none border border-bitcoin-orange px-3 py-2 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full font-mono"
      style={{
        left: Math.max(60, Math.min(position.x, window.innerWidth - 60)), // Keep tooltip within viewport
        top: position.y - 15, // Better vertical positioning
      }}
    >
      <div className="font-medium text-bitcoin-orange uppercase tracking-wide">
        Year {yearIndex + 1}
      </div>
      <div className="text-gray-200">
        {value.toFixed(1)}% {yAxisLabel}
      </div>
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid #1a1a1a",
        }}
      />
    </div>
  );
};
