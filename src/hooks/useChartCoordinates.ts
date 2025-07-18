import { useCallback, useMemo } from "react";

interface UseChartCoordinatesProps {
  containerWidth: number;
  height: number;
  maxYears: number;
  maxValue: number;
  minValue: number;
  displayData: number[];
}

export const useChartCoordinates = ({
  containerWidth,
  height,
  maxYears,
  maxValue,
  minValue,
  displayData,
}: UseChartCoordinatesProps) => {
  const paddingLeft = 90;
  const paddingRight = 40;
  const paddingTop = 40;
  const paddingBottom = 60;
  const chartWidth = containerWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Convert data point to SVG coordinates
  const getPointCoordinates = useCallback(
    (index: number, value: number) => {
      const x =
        paddingLeft +
        (index / Math.max(1, displayData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
      return { x, y };
    },
    [
      paddingLeft,
      displayData.length,
      chartWidth,
      paddingTop,
      chartHeight,
      maxValue,
    ],
  );

  // Convert SVG coordinates to data value with 2% snap
  const getValueFromCoordinates = useCallback(
    (x: number, y: number) => {
      const relativeY = y - paddingTop;
      const value = maxValue - (relativeY / chartHeight) * maxValue;
      const clampedValue = Math.max(minValue, Math.min(maxValue, value));
      // Snap to 2% increments
      return Math.round(clampedValue / 2) * 2;
    },
    [paddingTop, maxValue, chartHeight, minValue],
  );

  // Get nearest point index from x coordinate
  const getNearestIndex = useCallback(
    (x: number) => {
      const relativeX = x - paddingLeft;
      const normalizedX = relativeX / chartWidth;
      const index = Math.round(normalizedX * (displayData.length - 1));
      return Math.max(0, Math.min(displayData.length - 1, index));
    },
    [paddingLeft, chartWidth, displayData.length],
  );

  const dimensions = useMemo(
    () => ({
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartWidth,
      chartHeight,
    }),
    [
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartWidth,
      chartHeight,
    ],
  );

  return {
    dimensions,
    getPointCoordinates,
    getValueFromCoordinates,
    getNearestIndex,
  };
};
