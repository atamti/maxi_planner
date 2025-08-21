import React from "react";

interface ChartLabelsProps {
  containerWidth: number;
  height: number;
  yAxisLabel: string;
}

export const ChartLabels: React.FC<ChartLabelsProps> = ({
  containerWidth,
  height,
  yAxisLabel,
}) => {
  return (
    <g>
      {/* X-axis label */}
      <text
        x={containerWidth / 2}
        y={height - 10}
        textAnchor="middle"
        fontSize="14"
        fill="var(--color-text-secondary)"
        fontWeight="bold"
        opacity="0.9"
      >
        Years
      </text>

      {/* Y-axis label */}
      <text
        x={35}
        y={height / 2}
        textAnchor="middle"
        fontSize="14"
        fill="var(--color-text-secondary)"
        fontWeight="bold"
        opacity="0.9"
        transform={`rotate(-90, 30, ${height / 2})`}
      >
        {yAxisLabel}
      </text>
    </g>
  );
};
