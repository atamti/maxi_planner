import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartLabels } from "./ChartLabels";

describe("ChartLabels", () => {
  const defaultProps = {
    containerWidth: 600,
    height: 400,
    yAxisLabel: "Portfolio Value (%)",
  };

  it("should render X-axis and Y-axis labels", () => {
    const { container } = render(
      <svg>
        <ChartLabels {...defaultProps} />
      </svg>,
    );

    const labels = container.querySelectorAll("text");
    expect(labels).toHaveLength(2);
  });

  it("should position X-axis label at bottom center", () => {
    const { container } = render(
      <svg>
        <ChartLabels {...defaultProps} />
      </svg>,
    );

    const labels = container.querySelectorAll("text");
    const xLabel = labels[0];

    expect(xLabel).toHaveAttribute("x", "300"); // containerWidth / 2
    expect(xLabel).toHaveAttribute("y", "390"); // height - 10
    expect(xLabel).toHaveAttribute("text-anchor", "middle"); // SVG uses text-anchor
    expect(xLabel).toHaveTextContent("Years");
  });

  it("should position Y-axis label on the left side", () => {
    const { container } = render(
      <svg>
        <ChartLabels {...defaultProps} />
      </svg>,
    );

    const labels = container.querySelectorAll("text");
    const yLabel = labels[1];

    expect(yLabel).toHaveAttribute("x", "35");
    expect(yLabel).toHaveTextContent("Portfolio Value (%)");
  });

  it("should apply correct styling to X-axis label", () => {
    const { container } = render(
      <svg>
        <ChartLabels {...defaultProps} />
      </svg>,
    );

    const xLabel = container.querySelectorAll("text")[0];

    expect(xLabel).toHaveAttribute("font-size", "14"); // SVG uses font-size
    expect(xLabel).toHaveAttribute("fill", "#333");
    expect(xLabel).toHaveAttribute("font-weight", "bold"); // SVG uses font-weight
  });

  it("should handle different container widths", () => {
    const wideProps = {
      ...defaultProps,
      containerWidth: 800,
    };

    const { container } = render(
      <svg>
        <ChartLabels {...wideProps} />
      </svg>,
    );

    const xLabel = container.querySelectorAll("text")[0];
    expect(xLabel).toHaveAttribute("x", "400"); // 800 / 2
  });

  it("should handle different heights", () => {
    const tallProps = {
      ...defaultProps,
      height: 600,
    };

    const { container } = render(
      <svg>
        <ChartLabels {...tallProps} />
      </svg>,
    );

    const xLabel = container.querySelectorAll("text")[0];
    expect(xLabel).toHaveAttribute("y", "590"); // 600 - 10
  });

  it("should display custom Y-axis label", () => {
    const customProps = {
      ...defaultProps,
      yAxisLabel: "Bitcoin Price ($)",
    };

    const { container } = render(
      <svg>
        <ChartLabels {...customProps} />
      </svg>,
    );

    const yLabel = container.querySelectorAll("text")[1];
    expect(yLabel).toHaveTextContent("Bitcoin Price ($)");
  });

  it("should handle empty Y-axis label", () => {
    const emptyProps = {
      ...defaultProps,
      yAxisLabel: "",
    };

    const { container } = render(
      <svg>
        <ChartLabels {...emptyProps} />
      </svg>,
    );

    const yLabel = container.querySelectorAll("text")[1];
    expect(yLabel).toHaveTextContent("");
  });

  it("should handle long Y-axis label", () => {
    const longProps = {
      ...defaultProps,
      yAxisLabel: "Very Long Portfolio Value Percentage Label",
    };

    const { container } = render(
      <svg>
        <ChartLabels {...longProps} />
      </svg>,
    );

    const yLabel = container.querySelectorAll("text")[1];
    expect(yLabel).toHaveTextContent(
      "Very Long Portfolio Value Percentage Label",
    );
  });

  it("should handle minimum dimensions", () => {
    const minProps = {
      containerWidth: 100,
      height: 100,
      yAxisLabel: "Min",
    };

    const { container } = render(
      <svg>
        <ChartLabels {...minProps} />
      </svg>,
    );

    const labels = container.querySelectorAll("text");
    expect(labels).toHaveLength(2);

    const xLabel = labels[0];
    expect(xLabel).toHaveAttribute("x", "50"); // 100 / 2
    expect(xLabel).toHaveAttribute("y", "90"); // 100 - 10
  });

  it("should handle large dimensions", () => {
    const largeProps = {
      containerWidth: 2000,
      height: 1500,
      yAxisLabel: "Large Chart",
    };

    const { container } = render(
      <svg>
        <ChartLabels {...largeProps} />
      </svg>,
    );

    const labels = container.querySelectorAll("text");
    expect(labels).toHaveLength(2);

    const xLabel = labels[0];
    expect(xLabel).toHaveAttribute("x", "1000"); // 2000 / 2
    expect(xLabel).toHaveAttribute("y", "1490"); // 1500 - 10
  });

  it("should handle zero dimensions gracefully", () => {
    const zeroProps = {
      containerWidth: 0,
      height: 0,
      yAxisLabel: "Zero",
    };

    const { container } = render(
      <svg>
        <ChartLabels {...zeroProps} />
      </svg>,
    );

    const labels = container.querySelectorAll("text");
    expect(labels).toHaveLength(2);

    const xLabel = labels[0];
    expect(xLabel).toHaveAttribute("x", "0"); // 0 / 2
    expect(xLabel).toHaveAttribute("y", "-10"); // 0 - 10
  });
});
