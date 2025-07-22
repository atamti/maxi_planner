import React from "react";

interface ChartDataLineProps {
  pathData: string;
  dataPoints: Array<{
    x: number;
    y: number;
    index: number;
    value: number;
    baseRadius: number;
  }>;
  dragIndex: number | null;
  hoverIndex?: number | null;
  readOnly?: boolean;
}

export const ChartDataLine: React.FC<ChartDataLineProps> = ({
  pathData,
  dataPoints,
  dragIndex,
  hoverIndex = null,
  readOnly = false,
}) => {
  return (
    <g>
      {/* Data line */}
      <path d={pathData} fill="none" stroke="#DC2626" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map(({ x, y, index, baseRadius }) => {
        const isDragging = dragIndex === index;
        const isHovering = hoverIndex === index;
        const radius = isDragging ? 6 : isHovering ? 5 : baseRadius;
        const fillColor = isDragging
          ? "#DC2626"
          : isHovering
            ? "#EF4444"
            : "#DC2626";

        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={radius}
            fill={fillColor}
            stroke="white"
            strokeWidth="2"
            className={readOnly ? "cursor-not-allowed" : "cursor-pointer"}
          />
        );
      })}
    </g>
  );
};
