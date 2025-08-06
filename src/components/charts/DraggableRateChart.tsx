import React, { useRef } from "react";
import { useInteractiveChartSystem } from "../../utils/shared";
import { ChartBackground } from "./draggable/ChartBackground";
import { ChartDataLine } from "./draggable/ChartDataLine";
import { ChartGrid } from "./draggable/ChartGrid";
import { ChartLabels } from "./draggable/ChartLabels";
import { ChartTooltip } from "./draggable/ChartTooltip";

interface Props {
  data: number[];
  onChange: (newData: number[]) => void;
  onStartDrag?: () => void;
  maxYears: number;
  maxValue: number;
  minValue?: number;
  yAxisLabel?: string;
  readOnly?: boolean;
  title?: string;
}

export const DraggableRateChart: React.FC<Props> = ({
  data,
  onChange,
  onStartDrag,
  maxYears,
  maxValue,
  minValue = 0,
  yAxisLabel = "",
  readOnly = false,
  title,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    containerRef,
    containerWidth,
    height,
    dimensions,
    displayData,
    getPointCoordinates,
    getValueFromCoordinates,
    getNearestIndex,
    isDragging,
    dragIndex,
    hoverIndex,
    hoverPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseHover,
    handleMouseLeave,
    pathData,
    yGridLines,
    xGridLines,
    dataPoints,
  } = useInteractiveChartSystem({
    data,
    onChange,
    onStartDrag,
    readOnly,
    height: 300,
    maxValue,
    minValue,
    maxYears,
    svgRef,
  });

  return (
    <div
      ref={containerRef}
      className={`w-full ${readOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${containerWidth} ${height}`}
        className="border border-gray-300 rounded"
        onMouseDown={readOnly ? undefined : handleMouseDown}
        onMouseMove={readOnly ? undefined : handleMouseMove}
        onMouseUp={readOnly ? undefined : handleMouseUp}
        onMouseOver={handleMouseHover}
        onMouseLeave={handleMouseLeave}
        preserveAspectRatio="none"
      >
        <ChartGrid
          yGridLines={yGridLines}
          xGridLines={xGridLines}
          containerWidth={containerWidth}
          height={height}
          dimensions={dimensions}
        />

        <ChartBackground dimensions={dimensions} />

        <ChartDataLine
          pathData={pathData}
          dataPoints={dataPoints}
          dragIndex={dragIndex}
          hoverIndex={hoverIndex}
          readOnly={readOnly}
        />

        <ChartLabels
          containerWidth={containerWidth}
          height={height}
          yAxisLabel={yAxisLabel}
        />
      </svg>

      <p className="text-xs text-gray-600 mt-2">
        {readOnly
          ? "Chart is read-only. Enable editing to modify values."
          : "💡 Click and drag points to adjust rates. Values snap to 2% increments."}
      </p>

      {/* Tooltip */}
      {hoverIndex !== null && hoverPosition && (
        <ChartTooltip
          position={hoverPosition}
          value={displayData[hoverIndex]}
          yearIndex={hoverIndex}
          yAxisLabel={yAxisLabel}
        />
      )}
    </div>
  );
};
