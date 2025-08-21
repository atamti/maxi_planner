import { useCallback, useEffect, useMemo, useState } from "react";
import { useResponsiveSize } from "../../hooks/useResponsiveSize";

interface UseInteractiveChartSystemProps {
  data: number[];
  onChange: (newData: number[]) => void;
  onStartDrag?: () => void;
  readOnly?: boolean;
  height?: number;
  maxValue?: number;
  minValue?: number;
  maxYears?: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

/**
 * Consolidated interactive chart system for SVG-based draggable charts
 * Combines useChartCoordinates + useChartDrag + useChartRendering functionality
 */
export const useInteractiveChartSystem = ({
  data,
  onChange,
  onStartDrag,
  readOnly = false,
  height = 300,
  maxValue,
  minValue,
  maxYears,
  svgRef,
}: UseInteractiveChartSystemProps) => {
  // Get responsive container dimensions
  const { containerRef, containerWidth } = useResponsiveSize();

  // Process data
  const effectiveMaxYears = maxYears || data.length;
  const displayData = data.slice(0, effectiveMaxYears);

  // Drag state management
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Calculate chart dimensions and bounds
  const dimensions = useMemo(() => {
    const paddingLeft = 90;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 60;
    const chartWidth = containerWidth - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    return {
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartWidth,
      chartHeight,
    };
  }, [containerWidth, height]);

  // Calculate data bounds
  const dataBounds = useMemo(() => {
    const autoMaxValue = Math.max(...displayData) * 1.1;
    const autoMinValue = Math.min(...displayData, 0) * 0.9;

    return {
      maxValue: maxValue ?? autoMaxValue,
      minValue: minValue ?? autoMinValue,
      maxYears: effectiveMaxYears,
    };
  }, [displayData, maxValue, minValue, effectiveMaxYears]);

  // Coordinate conversion utilities
  const getPointCoordinates = useCallback(
    (index: number, value: number) => {
      const x =
        dimensions.paddingLeft +
        (index / Math.max(1, dataBounds.maxYears - 1)) * dimensions.chartWidth;
      const y =
        dimensions.paddingTop +
        ((dataBounds.maxValue - value) /
          (dataBounds.maxValue - dataBounds.minValue)) *
          dimensions.chartHeight;

      return { x, y };
    },
    [dimensions, dataBounds],
  );

  const getNearestIndex = useCallback(
    (x: number): number => {
      const relativeX = x - dimensions.paddingLeft;
      const index = Math.round(
        (relativeX / dimensions.chartWidth) * (dataBounds.maxYears - 1),
      );
      return Math.max(0, Math.min(dataBounds.maxYears - 1, index));
    },
    [dimensions, dataBounds],
  );

  const getValueFromCoordinates = useCallback(
    (x: number, y: number): number => {
      const relativeY = y - dimensions.paddingTop;
      const normalizedY = relativeY / dimensions.chartHeight;
      const rawValue =
        dataBounds.maxValue -
        normalizedY * (dataBounds.maxValue - dataBounds.minValue);

      // Snap to 2% increments
      const snappedValue = Math.round(rawValue / 2) * 2;

      return Math.max(
        dataBounds.minValue,
        Math.min(dataBounds.maxValue, snappedValue),
      );
    },
    [dimensions, dataBounds],
  );

  // Chart rendering data
  const renderingData = useMemo(() => {
    // Generate SVG path
    const pathData = displayData
      .map((value, index) => {
        const { x, y } = getPointCoordinates(index, value);
        return `${index === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");

    // Generate grid lines
    const yGridLines = Array.from({ length: 6 }, (_, i) => {
      const value =
        dataBounds.minValue +
        (i / 5) * (dataBounds.maxValue - dataBounds.minValue);
      const y =
        dimensions.paddingTop +
        ((dataBounds.maxValue - value) /
          (dataBounds.maxValue - dataBounds.minValue)) *
          dimensions.chartHeight;

      return {
        y,
        value,
        label: value.toFixed(1),
      };
    });

    const xGridLines = Array.from(
      { length: Math.min(dataBounds.maxYears, 11) },
      (_, i) => {
        const index = Math.floor((i / 10) * (dataBounds.maxYears - 1));
        const { x } = getPointCoordinates(index, data[index] || 0);

        return {
          x,
          index,
          label: `Year ${index}`,
        };
      },
    );

    // Generate data points for interaction
    const dataPoints = displayData.map((value, index) => {
      const { x, y } = getPointCoordinates(index, value);
      // Larger radius for every 5th point (indices 0, 5, 10, etc.)
      const baseRadius = index % 5 === 0 ? 4 : 2;
      return { x, y, value, index, baseRadius };
    });

    return {
      pathData,
      yGridLines,
      xGridLines,
      dataPoints,
    };
  }, [displayData, getPointCoordinates, dimensions, dataBounds]);

  // Drag interaction handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      if (readOnly || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const index = getNearestIndex(x);
      const newValue = getValueFromCoordinates(x, y);

      setIsDragging(true);
      setDragIndex(index);
      onStartDrag?.();

      const newData = [...data];
      newData[index] = newValue;
      onChange(newData);
    },
    [
      readOnly,
      svgRef,
      getNearestIndex,
      getValueFromCoordinates,
      data,
      onChange,
      onStartDrag,
    ],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent | React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging || dragIndex === null || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newValue = getValueFromCoordinates(x, y);
      const newData = [...data];
      newData[dragIndex] = newValue;
      onChange(newData);
    },
    [isDragging, dragIndex, svgRef, getValueFromCoordinates, data, onChange],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragIndex(null);
    }
  }, [isDragging]);

  const handleMouseHover = useCallback(
    (event: React.MouseEvent) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const index = getNearestIndex(x);
      setHoverIndex(index);

      // Convert SVG coordinates to screen coordinates for tooltip
      const screenX = event.clientX;
      const screenY = event.clientY;
      setHoverPosition({ x: screenX, y: screenY });
    },
    [svgRef, getNearestIndex],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
    setHoverPosition(null);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    // Container and sizing
    containerRef,
    containerWidth,
    height,
    displayData,

    // Dimensions and bounds
    dimensions,
    dataBounds,

    // Coordinate utilities
    getPointCoordinates,
    getNearestIndex,
    getValueFromCoordinates,

    // Rendering data
    ...renderingData,

    // Interaction state
    isDragging,
    dragIndex,
    hoverIndex,
    hoverPosition,

    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseHover,
    handleMouseLeave,

    // Configuration
    readOnly,
  };
};
