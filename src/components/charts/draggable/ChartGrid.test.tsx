import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartGrid } from "./ChartGrid";

describe("ChartGrid", () => {
  const defaultProps = {
    yGridLines: [
      { y: 50, value: 100 },
      { y: 150, value: 50 },
      { y: 250, value: 0 },
    ],
    xGridLines: [
      { x: 100, index: 0 },
      { x: 200, index: 1 },
      { x: 300, index: 2 },
    ],
    containerWidth: 600,
    height: 400,
    dimensions: {
      paddingLeft: 50,
      paddingRight: 20,
      paddingTop: 20,
      paddingBottom: 40,
      chartWidth: 500,
      chartHeight: 300,
    },
  };

  it("should render grid lines and labels", () => {
    const { container } = render(
      <svg>
        <ChartGrid {...defaultProps} />
      </svg>,
    );

    const group = container.querySelector("g");
    expect(group).toBeInTheDocument();
  });

  it("should render Y-axis grid lines", () => {
    const { container } = render(
      <svg>
        <ChartGrid {...defaultProps} />
      </svg>,
    );

    const yLines = container.querySelectorAll('line[x1="50"]');
    expect(yLines).toHaveLength(3);

    // Check first Y line
    expect(yLines[0]).toHaveAttribute("x1", "50");
    expect(yLines[0]).toHaveAttribute("y1", "50");
    expect(yLines[0]).toHaveAttribute("x2", "580"); // containerWidth - paddingRight
    expect(yLines[0]).toHaveAttribute("y2", "50");
  });

  it("should render Y-axis labels with correct values", () => {
    const { container } = render(
      <svg>
        <ChartGrid {...defaultProps} />
      </svg>,
    );

    const yLabels = container.querySelectorAll('text[x="40"]'); // paddingLeft - 10
    expect(yLabels).toHaveLength(3);

    expect(yLabels[0]).toHaveTextContent("100%");
    expect(yLabels[1]).toHaveTextContent("50%");
    expect(yLabels[2]).toHaveTextContent("0%");
  });

  it("should render X-axis grid lines", () => {
    const { container } = render(
      <svg>
        <ChartGrid {...defaultProps} />
      </svg>,
    );

    const xLines = container.querySelectorAll('line[y1="20"]'); // paddingTop
    expect(xLines).toHaveLength(3);

    // Check first X line
    expect(xLines[0]).toHaveAttribute("x1", "100");
    expect(xLines[0]).toHaveAttribute("y1", "20");
    expect(xLines[0]).toHaveAttribute("x2", "100");
    expect(xLines[0]).toHaveAttribute("y2", "360"); // height - paddingBottom
  });

  it("should render X-axis labels with correct indices", () => {
    const { container } = render(
      <svg>
        <ChartGrid {...defaultProps} />
      </svg>,
    );

    const xLabels = container.querySelectorAll('text[y="380"]'); // height - paddingBottom + 20
    expect(xLabels).toHaveLength(3);

    expect(xLabels[0]).toHaveTextContent("0");
    expect(xLabels[1]).toHaveTextContent("1");
    expect(xLabels[2]).toHaveTextContent("2");
  });

  it("should apply correct styling to grid lines", () => {
    const { container } = render(
      <svg>
        <ChartGrid {...defaultProps} />
      </svg>,
    );

    const lines = container.querySelectorAll("line");
    lines.forEach((line) => {
      expect(line).toHaveAttribute("stroke", "#e5e5e5");
      expect(line).toHaveAttribute("stroke-width", "1"); // SVG uses stroke-width
    });
  });

  it("should apply correct styling to labels", () => {
    const { container } = render(
      <svg>
        <ChartGrid {...defaultProps} />
      </svg>,
    );

    const labels = container.querySelectorAll("text");
    labels.forEach((label) => {
      expect(label).toHaveAttribute("font-size", "12"); // SVG uses font-size
      expect(label).toHaveAttribute("fill", "#666");
    });
  });

  it("should handle empty grid lines", () => {
    const emptyProps = {
      ...defaultProps,
      yGridLines: [],
      xGridLines: [],
    };

    const { container } = render(
      <svg>
        <ChartGrid {...emptyProps} />
      </svg>,
    );

    const lines = container.querySelectorAll("line");
    const labels = container.querySelectorAll("text");

    expect(lines).toHaveLength(0);
    expect(labels).toHaveLength(0);
  });

  it("should handle single grid line", () => {
    const singleLineProps = {
      ...defaultProps,
      yGridLines: [{ y: 100, value: 75 }],
      xGridLines: [{ x: 150, index: 5 }],
    };

    const { container } = render(
      <svg>
        <ChartGrid {...singleLineProps} />
      </svg>,
    );

    const lines = container.querySelectorAll("line");
    const labels = container.querySelectorAll("text");

    expect(lines).toHaveLength(2); // One Y line, one X line
    expect(labels).toHaveLength(2); // One Y label, one X label
    expect(labels[0]).toHaveTextContent("75%");
    expect(labels[1]).toHaveTextContent("5");
  });

  it("should handle different container dimensions", () => {
    const customProps = {
      ...defaultProps,
      containerWidth: 800,
      height: 500,
      dimensions: {
        paddingLeft: 60,
        paddingRight: 30,
        paddingTop: 30,
        paddingBottom: 50,
        chartWidth: 700,
        chartHeight: 400,
      },
    };

    const { container } = render(
      <svg>
        <ChartGrid {...customProps} />
      </svg>,
    );

    // Check Y lines extend to new container width
    const yLines = container.querySelectorAll('line[x1="60"]');
    expect(yLines[0]).toHaveAttribute("x2", "770"); // 800 - 30

    // Check X lines extend to new height
    const xLines = container.querySelectorAll('line[y1="30"]');
    expect(xLines[0]).toHaveAttribute("y2", "450"); // 500 - 50
  });
});
