import React from "react";

interface ChartGridProps {
  yGridLines: Array<{ y: number; value: number }>;
  xGridLines: Array<{ x: number; index: number }>;
  containerWidth: number;
  height: number;
  dimensions: {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
    chartWidth: number;
    chartHeight: number;
  };
}

export const ChartGrid: React.FC<ChartGridProps> = ({
  yGridLines,
  xGridLines,
  containerWidth,
  height,
  dimensions,
}) => {
  const { paddingLeft, paddingRight, paddingTop, paddingBottom } = dimensions;

  return (
    <g>
      {/* Y-axis grid lines and labels */}
      {yGridLines.map(({ y, value }, i) => (
        <g key={i}>
          <line
            x1={paddingLeft}
            y1={y}
            x2={containerWidth - paddingRight}
            y2={y}
            stroke="#e5e5e5"
            strokeWidth="1"
          />
          <text
            x={paddingLeft - 10}
            y={y + 4}
            textAnchor="end"
            fontSize="12"
            fill="#666"
          >
            {value.toFixed(0)}%
          </text>
        </g>
      ))}

      {/* X-axis grid lines and labels */}
      {xGridLines.map(({ x, index }, i) => (
        <g key={i}>
          <line
            x1={x}
            y1={paddingTop}
            x2={x}
            y2={height - paddingBottom}
            stroke="#e5e5e5"
            strokeWidth="1"
          />
          <text
            x={x}
            y={height - paddingBottom + 20}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            {index}
          </text>
        </g>
      ))}
    </g>
  );
};
