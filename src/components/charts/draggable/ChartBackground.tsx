import React from "react";

interface ChartBackgroundProps {
  dimensions: {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
    chartWidth: number;
    chartHeight: number;
  };
}

export const ChartBackground: React.FC<ChartBackgroundProps> = ({
  dimensions,
}) => {
  const { paddingLeft, paddingTop, chartWidth, chartHeight } = dimensions;

  return (
    <rect
      x={paddingLeft}
      y={paddingTop}
      width={chartWidth}
      height={chartHeight}
      fill="rgba(220, 38, 38, 0.05)"
    />
  );
};
