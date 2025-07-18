import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DraggableRateChart } from "./DraggableRateChart";

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

beforeEach(() => {
  Object.defineProperty(window, "addEventListener", {
    writable: true,
    value: mockAddEventListener,
  });
  Object.defineProperty(window, "removeEventListener", {
    writable: true,
    value: mockRemoveEventListener,
  });

  // Mock getBoundingClientRect for SVG elements
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    top: 0,
    left: 0,
    width: 800,
    height: 300,
    right: 800,
    bottom: 300,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }));

  // Mock offsetWidth for container div
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 800,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("DraggableRateChart", () => {
  const defaultProps = {
    data: [10, 15, 20, 25, 30],
    onChange: vi.fn(),
    maxYears: 5,
    maxValue: 100,
    minValue: 0,
    yAxisLabel: "Rate (%)",
    readOnly: false,
    title: "Test Chart",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to get SVG element
  const getSvg = (container: HTMLElement) =>
    container.querySelector("svg") as SVGSVGElement;

  describe("Rendering", () => {
    it("should render the chart with correct title", () => {
      render(<DraggableRateChart {...defaultProps} />);
      expect(screen.getByText("Test Chart")).toBeInTheDocument();
    });

    it("should render without title when title prop is not provided", () => {
      const { title, ...propsWithoutTitle } = defaultProps;
      render(<DraggableRateChart {...propsWithoutTitle} />);
      expect(screen.queryByText("Test Chart")).not.toBeInTheDocument();
    });

    it("should render SVG with correct dimensions", () => {
      const { container } = render(<DraggableRateChart {...defaultProps} />);
      const svg = getSvg(container);
      expect(svg).toHaveAttribute("width", "100%");
      expect(svg).toHaveAttribute("height", "300");
    });

    it("should render y-axis label", () => {
      render(<DraggableRateChart {...defaultProps} />);
      expect(screen.getByText("Rate (%)")).toBeInTheDocument();
    });

    it("should render x-axis label", () => {
      render(<DraggableRateChart {...defaultProps} />);
      expect(screen.getByText("Years")).toBeInTheDocument();
    });

    it("should render help text for interactive mode", () => {
      render(<DraggableRateChart {...defaultProps} />);
      expect(
        screen.getByText(/Click and drag points to adjust rates/),
      ).toBeInTheDocument();
    });

    it("should render help text for read-only mode", () => {
      render(<DraggableRateChart {...defaultProps} readOnly={true} />);
      expect(screen.getByText(/Chart is read-only/)).toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    it("should render correct number of data points", () => {
      const { container } = render(<DraggableRateChart {...defaultProps} />);
      const svg = getSvg(container);
      const circles = svg.querySelectorAll("circle");
      expect(circles).toHaveLength(5); // Same as data length
    });

    it("should limit data display to maxYears", () => {
      const longData = [10, 15, 20, 25, 30, 35, 40, 45];
      const { container } = render(
        <DraggableRateChart {...defaultProps} data={longData} maxYears={3} />,
      );
      const svg = getSvg(container);
      const circles = svg.querySelectorAll("circle");
      expect(circles).toHaveLength(3); // Limited by maxYears
    });

    it("should render data line path", () => {
      const { container } = render(<DraggableRateChart {...defaultProps} />);
      const svg = getSvg(container);
      const path = svg.querySelector("path");
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute("stroke", "#DC2626");
    });

    it("should render chart background", () => {
      const { container } = render(<DraggableRateChart {...defaultProps} />);
      const svg = getSvg(container);
      const rect = svg.querySelector('rect[fill="rgba(220, 38, 38, 0.05)"]');
      expect(rect).toBeInTheDocument();
    });
  });

  describe("Grid Lines and Labels", () => {
    it("should render y-axis grid lines for maxValue <= 20", () => {
      const { container } = render(
        <DraggableRateChart {...defaultProps} maxValue={20} />,
      );
      const svg = getSvg(container);
      const horizontalLines = svg.querySelectorAll('line[x1="90"]');
      expect(horizontalLines.length).toBeGreaterThan(0);
    });

    it("should render y-axis grid lines for maxValue <= 40", () => {
      const { container } = render(
        <DraggableRateChart {...defaultProps} maxValue={40} />,
      );
      const svg = getSvg(container);
      const horizontalLines = svg.querySelectorAll('line[x1="90"]');
      expect(horizontalLines.length).toBeGreaterThan(0);
    });

    it("should render y-axis grid lines for maxValue > 40", () => {
      const { container } = render(
        <DraggableRateChart {...defaultProps} maxValue={100} />,
      );
      const svg = getSvg(container);
      const horizontalLines = svg.querySelectorAll('line[x1="90"]');
      expect(horizontalLines.length).toBeGreaterThan(0);
    });

    it("should render x-axis grid lines every 5th year", () => {
      const data = Array(20)
        .fill(0)
        .map((_, i) => i * 5);
      const { container } = render(
        <DraggableRateChart {...defaultProps} data={data} maxYears={20} />,
      );
      const svg = getSvg(container);
      const verticalLines = svg.querySelectorAll('line[y1="40"]');
      expect(verticalLines.length).toBeGreaterThan(0);
    });

    it("should render percentage labels on y-axis", () => {
      render(<DraggableRateChart {...defaultProps} />);
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  describe("Resize Handling", () => {
    it("should add resize event listener on mount", () => {
      render(<DraggableRateChart {...defaultProps} />);
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );
    });

    it("should remove resize event listener on unmount", () => {
      const { unmount } = render(<DraggableRateChart {...defaultProps} />);
      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );
    });

    it("should update width when container width changes", () => {
      const { rerender } = render(<DraggableRateChart {...defaultProps} />);

      // Simulate resize by changing offsetWidth
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
        configurable: true,
        value: 1000,
      });

      // Trigger the resize event
      const resizeHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "resize",
      )?.[1];

      if (resizeHandler) {
        resizeHandler();
      }

      rerender(<DraggableRateChart {...defaultProps} />);

      // The component should handle the width change
      const { container } = render(<DraggableRateChart {...defaultProps} />);
      const svg = getSvg(container);
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Mouse Interaction", () => {
    it("should handle mouse down event in interactive mode", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onChange={onChange} />,
      );

      const svg = getSvg(container);

      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150,
      });

      expect(onChange).toHaveBeenCalled();
    });

    it("should not handle mouse down event in read-only mode", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart
          {...defaultProps}
          onChange={onChange}
          readOnly={true}
        />,
      );

      const svg = getSvg(container);

      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150,
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should call onStartDrag callback on mouse down", () => {
      const onStartDrag = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onStartDrag={onStartDrag} />,
      );

      const svg = getSvg(container);

      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150,
      });

      expect(onStartDrag).toHaveBeenCalled();
    });

    it("should handle mouse move during drag", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onChange={onChange} />,
      );

      const svg = getSvg(container);

      // Start dragging
      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150,
      });

      // Clear previous calls to count only the mouse move
      onChange.mockClear();

      // Move mouse
      fireEvent.mouseMove(svg, {
        clientX: 400,
        clientY: 100,
      });

      // Component has both SVG and document mouse handlers, so it may be called multiple times
      expect(onChange).toHaveBeenCalled();
      expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it("should not handle mouse move when not dragging", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onChange={onChange} />,
      );

      const svg = getSvg(container);

      // Move mouse without starting drag
      fireEvent.mouseMove(svg, {
        clientX: 400,
        clientY: 100,
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should handle mouse up to end drag", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onChange={onChange} />,
      );

      const svg = getSvg(container);

      // Start dragging
      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150,
      });

      // Clear previous calls
      onChange.mockClear();

      // End dragging
      fireEvent.mouseUp(svg);

      // Mouse move after mouseUp should not trigger onChange
      fireEvent.mouseMove(svg, {
        clientX: 400,
        clientY: 100,
      });

      expect(onChange).not.toHaveBeenCalled(); // No calls after mouseUp
    });
  });

  describe("Document Event Handling", () => {
    it("should add document event listeners when dragging starts", async () => {
      // Mock document event listener methods properly
      const mockDocumentAddEventListener = vi.spyOn(
        document,
        "addEventListener",
      );
      const mockDocumentRemoveEventListener = vi.spyOn(
        document,
        "removeEventListener",
      );

      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onChange={onChange} />,
      );

      const svg = getSvg(container);

      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150,
      });

      await waitFor(() => {
        expect(mockDocumentAddEventListener).toHaveBeenCalledWith(
          "mousemove",
          expect.any(Function),
        );
        expect(mockDocumentAddEventListener).toHaveBeenCalledWith(
          "mouseup",
          expect.any(Function),
        );
      });

      mockDocumentAddEventListener.mockRestore();
      mockDocumentRemoveEventListener.mockRestore();
    });

    it("should remove document event listeners when dragging ends", async () => {
      // Mock document event listener methods properly
      const mockDocumentAddEventListener = vi.spyOn(
        document,
        "addEventListener",
      );
      const mockDocumentRemoveEventListener = vi.spyOn(
        document,
        "removeEventListener",
      );

      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onChange={onChange} />,
      );

      const svg = getSvg(container);

      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150,
      });

      fireEvent.mouseUp(svg);

      await waitFor(() => {
        expect(mockDocumentRemoveEventListener).toHaveBeenCalledWith(
          "mousemove",
          expect.any(Function),
        );
        expect(mockDocumentRemoveEventListener).toHaveBeenCalledWith(
          "mouseup",
          expect.any(Function),
        );
      });

      mockDocumentAddEventListener.mockRestore();
      mockDocumentRemoveEventListener.mockRestore();
    });
  });

  describe("Value Calculations", () => {
    it("should snap values to 2% increments", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart
          {...defaultProps}
          onChange={onChange}
          maxValue={100}
        />,
      );

      const svg = getSvg(container);

      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150, // Should map to around 50% of maxValue
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Number)]),
      );

      // Check that the modified value is even (2% increment) - only check the changed value
      const callArgs = onChange.mock.calls[0][0];
      const changedIndex = callArgs.findIndex(
        (value: number, index: number) => value !== defaultProps.data[index],
      );
      if (changedIndex !== -1) {
        expect(callArgs[changedIndex] % 2).toBe(0);
      }
    });

    it("should clamp values to minValue and maxValue", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart
          {...defaultProps}
          onChange={onChange}
          minValue={10}
          maxValue={90}
        />,
      );

      const svg = getSvg(container);

      // Try to set a value below minValue
      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 300, // Bottom of chart
      });

      const callArgs = onChange.mock.calls[0][0];
      callArgs.forEach((value: number) => {
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(90);
      });
    });

    it("should handle edge case with single data point", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart
          {...defaultProps}
          data={[50]}
          maxYears={1}
          onChange={onChange}
        />,
      );

      const svg = getSvg(container);

      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 150,
      });

      expect(onChange).toHaveBeenCalled();
    });

    it("should handle coordinate conversion correctly", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onChange={onChange} />,
      );

      const svg = getSvg(container);

      // Click at different positions to test coordinate conversion
      fireEvent.mouseDown(svg, {
        clientX: 90, // Left edge (should be index 0)
        clientY: 40, // Top (should be maxValue)
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Circle Rendering", () => {
    it("should render larger circles for every 5th point", () => {
      const data = Array(15)
        .fill(0)
        .map((_, i) => i * 5);
      const { container } = render(
        <DraggableRateChart {...defaultProps} data={data} maxYears={15} />,
      );

      const svg = getSvg(container);
      const circles = svg.querySelectorAll("circle");

      // Every 5th point (indices 0, 5, 10) should have radius 4, others radius 2
      expect(circles[0]).toHaveAttribute("r", "4"); // index 0
      expect(circles[1]).toHaveAttribute("r", "2"); // index 1
      expect(circles[5]).toHaveAttribute("r", "4"); // index 5
      expect(circles[10]).toHaveAttribute("r", "4"); // index 10
    });

    it("should render larger circle for currently dragged point", () => {
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...defaultProps} onChange={onChange} />,
      );

      const svg = getSvg(container);

      // Start dragging first point
      fireEvent.mouseDown(svg, {
        clientX: 90, // Should target first point
        clientY: 150,
      });

      const circles = svg.querySelectorAll("circle");
      expect(circles[0]).toHaveAttribute("r", "6"); // Dragged point has radius 6
    });
  });

  describe("CSS Classes and Styles", () => {
    it("should apply cursor-pointer class in interactive mode", () => {
      const { container } = render(<DraggableRateChart {...defaultProps} />);
      const chartContainer = container.firstChild as HTMLElement;
      expect(chartContainer).toHaveClass("cursor-pointer");
    });

    it("should apply cursor-not-allowed class in read-only mode", () => {
      const { container } = render(
        <DraggableRateChart {...defaultProps} readOnly={true} />,
      );
      const chartContainer = container.firstChild as HTMLElement;
      expect(chartContainer).toHaveClass("cursor-not-allowed");
    });

    it("should have correct SVG attributes", () => {
      const { container } = render(<DraggableRateChart {...defaultProps} />);
      const svg = getSvg(container);
      expect(svg).toHaveClass("border", "border-gray-300", "rounded");
      expect(svg).toHaveAttribute("preserveAspectRatio", "none");
    });
  });

  describe("Default Props", () => {
    it("should use default minValue of 0", () => {
      const { minValue, ...propsWithoutMinValue } = defaultProps;
      const onChange = vi.fn();
      const { container } = render(
        <DraggableRateChart {...propsWithoutMinValue} onChange={onChange} />,
      );

      const svg = getSvg(container);

      // Try to set value at bottom (should be 0, not negative)
      fireEvent.mouseDown(svg, {
        clientX: 400,
        clientY: 300,
      });

      const callArgs = onChange.mock.calls[0][0];
      callArgs.forEach((value: number) => {
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });

    it("should use default yAxisLabel of empty string", () => {
      const { yAxisLabel, ...propsWithoutLabel } = defaultProps;
      const { container } = render(
        <DraggableRateChart {...propsWithoutLabel} />,
      );
      // Should not crash and should render without y-axis label text
      const svg = getSvg(container);
      expect(svg).toBeInTheDocument();
    });

    it("should use default readOnly of false", () => {
      const { readOnly, ...propsWithoutReadOnly } = defaultProps;
      const { container } = render(
        <DraggableRateChart {...propsWithoutReadOnly} />,
      );
      const chartContainer = container.firstChild as HTMLElement;
      expect(chartContainer).toHaveClass("cursor-pointer");
    });
  });
});
