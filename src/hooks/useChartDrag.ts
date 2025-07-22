import { useCallback, useEffect, useState } from "react";

interface UseChartDragProps {
  data: number[];
  onChange: (newData: number[]) => void;
  onStartDrag?: () => void;
  readOnly: boolean;
  height: number;
  containerWidth: number;
  getNearestIndex: (x: number) => number;
  getValueFromCoordinates: (x: number, y: number) => number;
  getPointCoordinates: (
    index: number,
    value: number,
  ) => { x: number; y: number };
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const useChartDrag = ({
  data,
  onChange,
  onStartDrag,
  readOnly,
  height,
  containerWidth,
  getNearestIndex,
  getValueFromCoordinates,
  getPointCoordinates,
  svgRef,
}: UseChartDragProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) return;
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
    },
    [
      readOnly,
      svgRef,
      containerWidth,
      height,
      getNearestIndex,
      onStartDrag,
      getValueFromCoordinates,
      data,
      onChange,
    ],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (readOnly) return;
      if (!isDragging || dragIndex === null || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const svgY = (event.clientY - rect.top) * (height / rect.height);

      const newValue = getValueFromCoordinates(0, svgY);
      const newData = [...data];
      newData[dragIndex] = newValue;
      onChange(newData);
    },
    [
      readOnly,
      isDragging,
      dragIndex,
      svgRef,
      height,
      getValueFromCoordinates,
      data,
      onChange,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragIndex(null);
  }, []);

  // Hover handlers for tooltip
  const handleMouseHover = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (isDragging) return; // Only prevent hover during dragging, not when readOnly
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const svgX = (event.clientX - rect.left) * (containerWidth / rect.width);

      const index = getNearestIndex(svgX);

      // Use a more generous hover area - if mouse is within the chart area and near a point
      const paddingLeft = 90;
      const paddingRight = 40;

      if (svgX >= paddingLeft && svgX <= containerWidth - paddingRight) {
        setHoverIndex(index);

        // Calculate the actual data point position and convert to screen coordinates
        const dataPoint = getPointCoordinates(index, data[index]);
        const screenX = rect.left + (dataPoint.x / containerWidth) * rect.width;
        const screenY = rect.top + (dataPoint.y / height) * rect.height;

        setHoverPosition({ x: screenX, y: screenY });
      } else {
        setHoverIndex(null);
        setHoverPosition(null);
      }
    },
    [
      isDragging,
      svgRef,
      containerWidth,
      height,
      getNearestIndex,
      getPointCoordinates,
      data,
    ],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
    setHoverPosition(null);
  }, []);

  // Document-level mouse event handlers
  const handleDocumentMouseMove = useCallback(
    (event: MouseEvent) => {
      if (readOnly) return;
      if (!isDragging || dragIndex === null || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const svgY = (event.clientY - rect.top) * (height / rect.height);

      const newValue = getValueFromCoordinates(0, svgY);
      const newData = [...data];
      newData[dragIndex] = newValue;
      onChange(newData);
    },
    [
      readOnly,
      isDragging,
      dragIndex,
      svgRef,
      height,
      getValueFromCoordinates,
      data,
      onChange,
    ],
  );

  const handleDocumentMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragIndex(null);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDocumentMouseMove);
      document.addEventListener("mouseup", handleDocumentMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleDocumentMouseMove);
        document.removeEventListener("mouseup", handleDocumentMouseUp);
      };
    }
  }, [isDragging, handleDocumentMouseMove, handleDocumentMouseUp]);

  return {
    isDragging,
    dragIndex,
    hoverIndex,
    hoverPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseHover,
    handleMouseLeave,
  };
};
