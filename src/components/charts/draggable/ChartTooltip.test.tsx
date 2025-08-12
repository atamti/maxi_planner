import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartTooltip } from "./ChartTooltip";

describe("ChartTooltip", () => {
  const defaultProps = {
    position: { x: 150, y: 100 },
    value: 75.5,
    yearIndex: 4,
    yAxisLabel: "Portfolio Value",
  };

  it("should render tooltip when position is provided", () => {
    const { container } = render(<ChartTooltip {...defaultProps} />);

    const tooltip = container.firstChild;
    expect(tooltip).toBeInTheDocument();
  });

  it("should not render tooltip when position is null", () => {
    const hiddenProps = {
      ...defaultProps,
      position: null,
    };

    const { container } = render(<ChartTooltip {...hiddenProps} />);

    expect(container.firstChild).toBeNull();
  });

  it("should position tooltip at correct coordinates", () => {
    const { container } = render(<ChartTooltip {...defaultProps} />);

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({ left: "150px", top: "90px" }); // top: position.y - 10
  });

  it("should apply correct CSS classes and styling", () => {
    const { container } = render(<ChartTooltip {...defaultProps} />);

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveClass(
      "fixed",
      "z-50",
      "bg-gray-800",
      "text-white",
      "text-sm",
      "rounded-lg",
      "px-3",
      "py-2",
      "shadow-lg",
      "pointer-events-none",
      "transform",
      "-translate-x-1/2",
      "-translate-y-full",
    );
  });

  it("should display formatted year and value", () => {
    const { getByText } = render(<ChartTooltip {...defaultProps} />);

    expect(getByText("Year 5")).toBeInTheDocument(); // yearIndex + 1
    expect(getByText("76% Portfolio Value")).toBeInTheDocument(); // value.toFixed(0)
  });

  it("should handle integer values", () => {
    const integerProps = {
      ...defaultProps,
      value: 50,
    };

    const { getByText } = render(<ChartTooltip {...integerProps} />);

    expect(getByText("50% Portfolio Value")).toBeInTheDocument();
  });

  it("should round decimal values to nearest integer", () => {
    const decimalProps = {
      ...defaultProps,
      value: 33.9,
    };

    const { getByText } = render(<ChartTooltip {...decimalProps} />);

    expect(getByText("34% Portfolio Value")).toBeInTheDocument();
  });

  it("should handle zero values", () => {
    const zeroProps = {
      ...defaultProps,
      value: 0,
      yearIndex: 0,
    };

    const { getByText } = render(<ChartTooltip {...zeroProps} />);

    expect(getByText("Year 1")).toBeInTheDocument(); // yearIndex + 1
    expect(getByText("0% Portfolio Value")).toBeInTheDocument();
  });

  it("should handle large values", () => {
    const largeProps = {
      ...defaultProps,
      value: 250.75,
      yearIndex: 24,
    };

    const { getByText } = render(<ChartTooltip {...largeProps} />);

    expect(getByText("Year 25")).toBeInTheDocument();
    expect(getByText("251% Portfolio Value")).toBeInTheDocument(); // Rounded
  });

  it("should handle negative coordinates", () => {
    const negativeProps = {
      ...defaultProps,
      position: { x: -50, y: -100 },
    };

    const { container } = render(<ChartTooltip {...negativeProps} />);

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({ left: "-50px", top: "-110px" });
  });

  it("should handle missing yAxisLabel", () => {
    const noLabelProps = {
      ...defaultProps,
      yAxisLabel: undefined,
    };

    const { getByText } = render(<ChartTooltip {...noLabelProps} />);

    expect(getByText("76%")).toBeInTheDocument(); // Should just show percentage without label
  });

  it("should handle empty yAxisLabel", () => {
    const emptyLabelProps = {
      ...defaultProps,
      yAxisLabel: "",
    };

    const { getByText } = render(<ChartTooltip {...emptyLabelProps} />);

    expect(getByText("76%")).toBeInTheDocument();
  });

  it("should handle custom yAxisLabel", () => {
    const customProps = {
      ...defaultProps,
      yAxisLabel: "Bitcoin Price",
    };

    const { getByText } = render(<ChartTooltip {...customProps} />);

    expect(getByText("76% Bitcoin Price")).toBeInTheDocument();
  });

  it("should handle edge case with very small values", () => {
    const smallProps = {
      ...defaultProps,
      value: 0.4,
    };

    const { getByText } = render(<ChartTooltip {...smallProps} />);

    expect(getByText("0% Portfolio Value")).toBeInTheDocument(); // Rounds down
  });

  it("should handle very large coordinates", () => {
    const largeCoordProps = {
      ...defaultProps,
      position: { x: 5000, y: 3000 },
    };

    const { container } = render(<ChartTooltip {...largeCoordProps} />);

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({ left: "5000px", top: "2990px" });
  });

  it("should maintain consistent structure", () => {
    const { container } = render(<ChartTooltip {...defaultProps} />);

    // Should have main tooltip div with three child elements (2 content + 1 arrow)
    const tooltip = container.firstChild as HTMLElement;
    const children = tooltip.children;

    expect(children).toHaveLength(3);
    expect(children[0]).toHaveClass("font-medium");
    expect(children[1]).toHaveClass("text-gray-200");
    expect(children[2]).toHaveClass("absolute"); // Arrow element
  });

  it("should handle position changes", () => {
    const { container, rerender } = render(<ChartTooltip {...defaultProps} />);

    let tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({ left: "150px", top: "90px" });

    const newProps = {
      ...defaultProps,
      position: { x: 300, y: 200 },
    };

    rerender(<ChartTooltip {...newProps} />);

    tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({ left: "300px", top: "190px" });
  });

  it("should handle visibility toggle by position", () => {
    const { container, rerender } = render(<ChartTooltip {...defaultProps} />);

    expect(container.firstChild).toBeInTheDocument();

    rerender(<ChartTooltip {...defaultProps} position={null} />);

    expect(container.firstChild).toBeNull();

    rerender(<ChartTooltip {...defaultProps} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
