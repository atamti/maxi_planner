import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChartDrag } from "./useChartDrag";

describe("useChartDrag", () => {
  let mockProps: any;
  let mockSvgRef: any;
  let mockSvgElement: any;

  beforeEach(() => {
    // Mock SVG element
    mockSvgElement = {
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 300,
        right: 800,
        bottom: 300,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      })),
    };

    mockSvgRef = {
      current: mockSvgElement,
    };

    mockProps = {
      data: [10, 20, 30, 40, 50],
      onChange: vi.fn(),
      onStartDrag: vi.fn(),
      readOnly: false,
      height: 300,
      containerWidth: 800,
      getNearestIndex: vi.fn((x: number) => Math.round(x / 160)), // 800 / 5 = 160 per point
      getValueFromCoordinates: vi.fn((x: number, y: number) => {
        // Simple mock that returns a value based on y position
        const maxValue = 100;
        return maxValue - (y / 300) * maxValue;
      }),
      getPointCoordinates: vi.fn((index: number, value: number) => ({
        x: index * 160,
        y: (100 - value) * 3, // Scale value to height
      })),
      svgRef: mockSvgRef,
    };

    // Mock document event listeners
    vi.spyOn(document, "addEventListener");
    vi.spyOn(document, "removeEventListener");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    expect(result.current.isDragging).toBe(false);
    expect(result.current.dragIndex).toBe(null);
    expect(result.current.hoverIndex).toBe(null);
    expect(result.current.hoverPosition).toBe(null);
  });

  it("should not start dragging when readOnly is true", () => {
    const readOnlyProps = { ...mockProps, readOnly: true };
    const { result } = renderHook(() => useChartDrag(readOnlyProps));

    const mockEvent = {
      clientX: 100,
      clientY: 150,
    } as React.MouseEvent<SVGSVGElement>;

    act(() => {
      result.current.handleMouseDown(mockEvent);
    });

    expect(result.current.isDragging).toBe(false);
    expect(mockProps.onChange).not.toHaveBeenCalled();
  });

  it("should not start dragging when svgRef is null", () => {
    const nullRefProps = { ...mockProps, svgRef: { current: null } };
    const { result } = renderHook(() => useChartDrag(nullRefProps));

    const mockEvent = {
      clientX: 100,
      clientY: 150,
    } as React.MouseEvent<SVGSVGElement>;

    act(() => {
      result.current.handleMouseDown(mockEvent);
    });

    expect(result.current.isDragging).toBe(false);
    expect(mockProps.onChange).not.toHaveBeenCalled();
  });

  it("should start dragging on mouse down", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    const mockEvent = {
      clientX: 160, // Should hit index 1
      clientY: 150,
    } as React.MouseEvent<SVGSVGElement>;

    act(() => {
      result.current.handleMouseDown(mockEvent);
    });

    expect(result.current.isDragging).toBe(true);
    expect(result.current.dragIndex).toBe(1);
    expect(mockProps.onStartDrag).toHaveBeenCalled();
    expect(mockProps.onChange).toHaveBeenCalled();
  });

  it("should call getNearestIndex with correct coordinates", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    const mockEvent = {
      clientX: 320,
      clientY: 150,
    } as React.MouseEvent<SVGSVGElement>;

    act(() => {
      result.current.handleMouseDown(mockEvent);
    });

    // Should call getNearestIndex with SVG coordinates
    expect(mockProps.getNearestIndex).toHaveBeenCalledWith(320); // Same as clientX since rect.left = 0
  });

  it("should call getValueFromCoordinates on mouse down", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    const mockEvent = {
      clientX: 160,
      clientY: 100,
    } as React.MouseEvent<SVGSVGElement>;

    act(() => {
      result.current.handleMouseDown(mockEvent);
    });

    expect(mockProps.getValueFromCoordinates).toHaveBeenCalledWith(160, 100);
  });

  it("should stop dragging on mouse up", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    // Start dragging
    act(() => {
      result.current.handleMouseDown({
        clientX: 160,
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    expect(result.current.isDragging).toBe(true);

    // Stop dragging
    act(() => {
      result.current.handleMouseUp();
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.dragIndex).toBe(null);
  });

  it("should handle mouse move during dragging", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    // Start dragging
    act(() => {
      result.current.handleMouseDown({
        clientX: 160,
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    const changeCallsBefore = mockProps.onChange.mock.calls.length;

    // Move mouse while dragging
    act(() => {
      result.current.handleMouseMove({
        clientX: 160,
        clientY: 100, // Different Y position
      } as React.MouseEvent<SVGSVGElement>);
    });

    expect(mockProps.onChange.mock.calls.length).toBe(changeCallsBefore + 1);
  });

  it("should not handle mouse move when not dragging", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    const changeCallsBefore = mockProps.onChange.mock.calls.length;

    act(() => {
      result.current.handleMouseMove({
        clientX: 160,
        clientY: 100,
      } as React.MouseEvent<SVGSVGElement>);
    });

    expect(mockProps.onChange.mock.calls.length).toBe(changeCallsBefore);
  });

  it("should not handle mouse move when readOnly", () => {
    const readOnlyProps = { ...mockProps, readOnly: true };
    const { result } = renderHook(() => useChartDrag(readOnlyProps));

    const changeCallsBefore = mockProps.onChange.mock.calls.length;

    act(() => {
      result.current.handleMouseMove({
        clientX: 160,
        clientY: 100,
      } as React.MouseEvent<SVGSVGElement>);
    });

    expect(mockProps.onChange.mock.calls.length).toBe(changeCallsBefore);
  });

  it("should handle hover when not dragging", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    act(() => {
      result.current.handleMouseHover({
        clientX: 320, // Should hit index 2
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    expect(result.current.hoverIndex).toBe(2);
    expect(result.current.hoverPosition).toBeDefined();
  });

  it("should not set hover when dragging", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    // Start dragging
    act(() => {
      result.current.handleMouseDown({
        clientX: 160,
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    // Try to hover
    act(() => {
      result.current.handleMouseHover({
        clientX: 320,
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    expect(result.current.hoverIndex).toBe(null);
  });

  it("should clear hover on mouse leave", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    // Set hover first
    act(() => {
      result.current.handleMouseHover({
        clientX: 320,
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    expect(result.current.hoverIndex).toBe(2);

    // Clear hover
    act(() => {
      result.current.handleMouseLeave();
    });

    expect(result.current.hoverIndex).toBe(null);
    expect(result.current.hoverPosition).toBe(null);
  });

  it("should add document event listeners when dragging starts", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    act(() => {
      result.current.handleMouseDown({
        clientX: 160,
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    expect(document.addEventListener).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function),
    );
    expect(document.addEventListener).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function),
    );
  });

  it("should remove document event listeners when dragging ends", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    // Start dragging
    act(() => {
      result.current.handleMouseDown({
        clientX: 160,
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    // Stop dragging
    act(() => {
      result.current.handleMouseUp();
    });

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function),
    );
    expect(document.removeEventListener).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function),
    );
  });

  it("should provide all required handler functions", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    expect(typeof result.current.handleMouseDown).toBe("function");
    expect(typeof result.current.handleMouseMove).toBe("function");
    expect(typeof result.current.handleMouseUp).toBe("function");
    expect(typeof result.current.handleMouseHover).toBe("function");
    expect(typeof result.current.handleMouseLeave).toBe("function");
  });

  it("should clean up event listeners on unmount", () => {
    const { result, unmount } = renderHook(() => useChartDrag(mockProps));

    // Start dragging
    act(() => {
      result.current.handleMouseDown({
        clientX: 160,
        clientY: 150,
      } as React.MouseEvent<SVGSVGElement>);
    });

    // Unmount while dragging
    unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function),
    );
    expect(document.removeEventListener).toHaveBeenCalledWith(
      "mouseup",
      expect.any(Function),
    );
  });

  it("should update data correctly when dragging", () => {
    const { result } = renderHook(() => useChartDrag(mockProps));

    // Mock getValueFromCoordinates to return a specific value
    mockProps.getValueFromCoordinates.mockReturnValue(75);
    mockProps.getNearestIndex.mockReturnValue(2);

    act(() => {
      result.current.handleMouseDown({
        clientX: 320,
        clientY: 100,
      } as React.MouseEvent<SVGSVGElement>);
    });

    // Check that onChange was called with updated data
    expect(mockProps.onChange).toHaveBeenCalledWith([10, 20, 75, 40, 50]);
  });
});
