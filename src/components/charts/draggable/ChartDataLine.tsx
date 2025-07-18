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
}

export const ChartDataLine: React.FC<ChartDataLineProps> = ({
  pathData,
  dataPoints,
  dragIndex,
}) => {
  return (
    <g>
      {/* Data line */}
      <path d={pathData} fill="none" stroke="#DC2626" strokeWidth="2" />

      {/* Data points */}
      {dataPoints.map(({ x, y, index, baseRadius }) => {
        const radius = dragIndex === index ? 6 : baseRadius;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={radius}
            fill="#DC2626"
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer"
          />
        );
      })}
    </g>
  );
};
