import React, { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  data: number[];
  onChange: (newData: number[]) => void;
  onStartDrag?: () => void;
  maxYears?: number;
  maxValue?: number;
  minValue?: number;
  yAxisLabel?: string; // New optional prop for Y-axis label
}

export const DraggableInflationChart: React.FC<Props> = ({
  data,
  onChange,
  onStartDrag,
  maxYears = 30,
  maxValue = 100,
  minValue = 0,
  yAxisLabel = "Value (%)", // Default label
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const height = 300;
  const paddingLeft = 70; // Increased left padding for axis labels
  const paddingRight = 40;
  const paddingTop = 40;
  const paddingBottom = 60;
  const chartWidth = containerWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const displayData = data.slice(0, maxYears);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Convert data point to SVG coordinates
  const getPointCoordinates = (index: number, value: number) => {
    const x =
      paddingLeft + (index / Math.max(1, displayData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
    return { x, y };
  };

  // Convert SVG coordinates to data value with 2% snap
  const getValueFromCoordinates = (x: number, y: number) => {
    const relativeY = y - paddingTop;
    const value = maxValue - (relativeY / chartHeight) * maxValue;
    const clampedValue = Math.max(minValue, Math.min(maxValue, value));
    // Snap to 2% increments
    return Math.round(clampedValue / 2) * 2;
  };

  // Get nearest point index from x coordinate
  const getNearestIndex = (x: number) => {
    const relativeX = x - paddingLeft;
    const normalizedX = relativeX / chartWidth;
    const index = Math.round(normalizedX * (displayData.length - 1));
    return Math.max(0, Math.min(displayData.length - 1, index));
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (event.clientX - rect.left) * (containerWidth / rect.width);
    const svgY = (event.clientY - rect.top) * (height / rect.height);

    const index = getNearestIndex(svgX);
    setIsDragging(true);
    setDragIndex(index);

    // Notify parent that dragging has started
    onStartDrag?.();

    const newValue = getValueFromCoordinates(svgX, svgY);
    const newData = [...data];
    newData[index] = newValue;
    onChange(newData);
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || dragIndex === null || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const svgY = (event.clientY - rect.top) * (height / rect.height);

      const newValue = getValueFromCoordinates(0, svgY);
      const newData = [...data];
      newData[dragIndex] = newValue;
      onChange(newData);
    },
    [isDragging, dragIndex, data, onChange, height],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragIndex(null);
  }, []);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate path for the line
  const pathData = displayData
    .map((value, index) => {
      const { x, y } = getPointCoordinates(index, value);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Generate grid lines - adjust density based on max value
  const getYGridLineCount = (): number => {
    if (maxValue <= 20) return 11; // 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
    if (maxValue <= 40) return 9; // 0, 5, 10, 15, 20, 25, 30, 35, 40
    return 11; // 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
  };

  const yGridLines = Array.from({ length: getYGridLineCount() }, (_, i) => {
    const value = (i / (getYGridLineCount() - 1)) * maxValue;
    const y = paddingTop + chartHeight - (value / maxValue) * chartHeight;
    return { y, value };
  });

  // Show every 5th year for x-axis labels to avoid crowding
  const xGridLines = Array.from(
    { length: Math.ceil(displayData.length / 5) },
    (_, i) => {
      const index = i * 5;
      if (index < displayData.length) {
        const { x } = getPointCoordinates(index, 0);
        return { x, index };
      }
      return null;
    },
  ).filter((item): item is { x: number; index: number } => item !== null);

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${containerWidth} ${height}`}
        className="border border-gray-300 rounded cursor-crosshair"
        onMouseDown={handleMouseDown}
        preserveAspectRatio="none"
      >
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

        {/* Chart area background */}
        <rect
          x={paddingLeft}
          y={paddingTop}
          width={chartWidth}
          height={chartHeight}
          fill="rgba(220, 38, 38, 0.05)"
        />

        {/* Data line */}
        <path d={pathData} fill="none" stroke="#DC2626" strokeWidth="2" />

        {/* Data points - show every point but make some smaller */}
        {displayData.map((value, index) => {
          const { x, y } = getPointCoordinates(index, value);
          const isEveryFifth = index % 5 === 0;
          const radius = dragIndex === index ? 6 : isEveryFifth ? 4 : 2;
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

        {/* Axis labels */}
        <text
          x={containerWidth / 2}
          y={height - 10}
          textAnchor="middle"
          fontSize="14"
          fill="#333"
          fontWeight="bold"
        >
          Years
        </text>
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#333"
          fontWeight="bold"
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          {yAxisLabel} {/* Use the new prop for Y-axis label */}
        </text>
      </svg>

      <p className="text-xs text-gray-600 mt-2">
        💡 Click and drag points to adjust inflation rates. Values snap to 2%
        increments.
      </p>
    </div>
  );
};
