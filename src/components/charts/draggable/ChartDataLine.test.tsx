import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartDataLine } from "./ChartDataLine";

describe("ChartDataLine", () => {
  const defaultProps = {
    pathData: "M50,100 L150,200 L250,150 L350,300",
    dataPoints: [
      { x: 50, y: 100, index: 0, value: 100, baseRadius: 4 },
      { x: 150, y: 200, index: 1, value: 75, baseRadius: 4 },
      { x: 250, y: 150, index: 2, value: 85, baseRadius: 4 },
      { x: 350, y: 300, index: 3, value: 50, baseRadius: 4 },
    ],
    dragIndex: null,
  };

  it("should render data line path", () => {
    const { container } = render(
      <svg>
        <ChartDataLine {...defaultProps} />
      </svg>,
    );

    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });

  it("should apply correct stroke color and width", () => {
    const { container } = render(
      <svg>
        <ChartDataLine {...defaultProps} />
      </svg>,
    );

    const path = container.querySelector("path");
    expect(path).toHaveAttribute("stroke", "#DC2626");
    expect(path).toHaveAttribute("stroke-width", "2"); // SVG uses stroke-width, not strokeWidth
  });

  it("should have no fill", () => {
    const { container } = render(
      <svg>
        <ChartDataLine {...defaultProps} />
      </svg>,
    );

    const path = container.querySelector("path");
    expect(path).toHaveAttribute("fill", "none");
  });

  it("should render with provided path data", () => {
    const { container } = render(
      <svg>
        <ChartDataLine {...defaultProps} />
      </svg>,
    );

    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M50,100 L150,200 L250,150 L350,300");
  });

  it("should render data points as circles", () => {
    const { container } = render(
      <svg>
        <ChartDataLine {...defaultProps} />
      </svg>,
    );

    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(4);

    // Check first circle
    expect(circles[0]).toHaveAttribute("cx", "50");
    expect(circles[0]).toHaveAttribute("cy", "100");
    expect(circles[0]).toHaveAttribute("r", "4");
  });

  it("should handle drag index highlighting", () => {
    const dragProps = {
      ...defaultProps,
      dragIndex: 1,
    };

    const { container } = render(
      <svg>
        <ChartDataLine {...dragProps} />
      </svg>,
    );

    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(4);

    // All circles should be present regardless of drag state
    expect(circles[1]).toHaveAttribute("cx", "150");
    expect(circles[1]).toHaveAttribute("cy", "200");
  });

  it("should handle hover index highlighting", () => {
    const hoverProps = {
      ...defaultProps,
      hoverIndex: 2,
    };

    const { container } = render(
      <svg>
        <ChartDataLine {...hoverProps} />
      </svg>,
    );

    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(4);

    // Check hover point
    expect(circles[2]).toHaveAttribute("cx", "250");
    expect(circles[2]).toHaveAttribute("cy", "150");
  });

  it("should handle read-only mode", () => {
    const readOnlyProps = {
      ...defaultProps,
      readOnly: true,
    };

    const { container } = render(
      <svg>
        <ChartDataLine {...readOnlyProps} />
      </svg>,
    );

    const path = container.querySelector("path");
    const circles = container.querySelectorAll("circle");

    expect(path).toBeInTheDocument();
    expect(circles).toHaveLength(4);
  });

  it("should handle empty data points", () => {
    const emptyProps = {
      ...defaultProps,
      dataPoints: [],
    };

    const { container } = render(
      <svg>
        <ChartDataLine {...emptyProps} />
      </svg>,
    );

    const path = container.querySelector("path");
    const circles = container.querySelectorAll("circle");

    expect(path).toBeInTheDocument();
    expect(circles).toHaveLength(0);
  });

  it("should handle single data point", () => {
    const singlePointProps = {
      ...defaultProps,
      dataPoints: [{ x: 100, y: 200, index: 0, value: 100, baseRadius: 6 }],
    };

    const { container } = render(
      <svg>
        <ChartDataLine {...singlePointProps} />
      </svg>,
    );

    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(1);
    expect(circles[0]).toHaveAttribute("cx", "100");
    expect(circles[0]).toHaveAttribute("cy", "200");
    expect(circles[0]).toHaveAttribute("r", "6");
  });

  it("should handle different base radius values", () => {
    const customRadiusProps = {
      ...defaultProps,
      dataPoints: [
        { x: 50, y: 100, index: 0, value: 100, baseRadius: 8 },
        { x: 150, y: 200, index: 1, value: 75, baseRadius: 3 },
      ],
    };

    const { container } = render(
      <svg>
        <ChartDataLine {...customRadiusProps} />
      </svg>,
    );

    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
    expect(circles[0]).toHaveAttribute("r", "8");
    expect(circles[1]).toHaveAttribute("r", "3");
  });

  it("should handle complex path data", () => {
    const complexProps = {
      ...defaultProps,
      pathData: "M0,0 Q50,100 100,0 T200,50 L300,25",
    };

    const { container } = render(
      <svg>
        <ChartDataLine {...complexProps} />
      </svg>,
    );

    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M0,0 Q50,100 100,0 T200,50 L300,25");
  });

  it("should handle negative coordinates", () => {
    const negativeProps = {
      ...defaultProps,
      dataPoints: [
        { x: -50, y: -100, index: 0, value: 100, baseRadius: 4 },
        { x: 50, y: 100, index: 1, value: 75, baseRadius: 4 },
      ],
      pathData: "M-50,-100 L50,100",
    };

    const { container } = render(
      <svg>
        <ChartDataLine {...negativeProps} />
      </svg>,
    );

    const circles = container.querySelectorAll("circle");
    expect(circles[0]).toHaveAttribute("cx", "-50");
    expect(circles[0]).toHaveAttribute("cy", "-100");
  });
});
