import { useMemo } from "react";

interface UseChartRenderingProps {
  displayData: number[];
  maxValue: number;
  containerWidth: number;
  height: number;
  getPointCoordinates: (
    index: number,
    value: number,
  ) => { x: number; y: number };
  dimensions: {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
    chartWidth: number;
    chartHeight: number;
  };
}

export const useChartRendering = ({
  displayData,
  maxValue,
  containerWidth,
  height,
  getPointCoordinates,
  dimensions,
}: UseChartRenderingProps) => {
  const {
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    chartWidth,
    chartHeight,
  } = dimensions;

  // Generate path for the line
  const pathData = useMemo(() => {
    return displayData
      .map((value, index) => {
        const { x, y } = getPointCoordinates(index, value);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [displayData, getPointCoordinates]);

  // Generate grid lines - adjust density based on max value
  const getYGridLineCount = useMemo(() => {
    if (maxValue <= 20) return 11; // 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
    if (maxValue <= 40) return 9; // 0, 5, 10, 15, 20, 25, 30, 35, 40
    return 11; // 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
  }, [maxValue]);

  const yGridLines = useMemo(() => {
    return Array.from({ length: getYGridLineCount }, (_, i) => {
      const value = (i / (getYGridLineCount - 1)) * maxValue;
      const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
      return { y, value };
    });
  }, [getYGridLineCount, maxValue, paddingTop, chartHeight]);

  // Show every 5th year for x-axis labels to avoid crowding
  const xGridLines = useMemo(() => {
    return Array.from({ length: Math.ceil(displayData.length / 5) }, (_, i) => {
      const index = i * 5;
      if (index < displayData.length) {
        const { x } = getPointCoordinates(index, 0);
        return { x, index };
      }
      return null;
    }).filter((item): item is { x: number; index: number } => item !== null);
  }, [displayData.length, getPointCoordinates]);

  // Generate data points with appropriate sizing
  const dataPoints = useMemo(() => {
    return displayData.map((value, index) => {
      const { x, y } = getPointCoordinates(index, value);
      const isEveryFifth = index % 5 === 0;
      return {
        x,
        y,
        index,
        value,
        baseRadius: isEveryFifth ? 4 : 2,
      };
    });
  }, [displayData, getPointCoordinates]);

  return {
    pathData,
    yGridLines,
    xGridLines,
    dataPoints,
  };
};
