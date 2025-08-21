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
    expect(tooltip).toHaveStyle({ left: "150px", top: "85px" }); // top: position.y - 15
  });

  it("should apply correct CSS classes and styling", () => {
    const { container } = render(<ChartTooltip {...defaultProps} />);

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveClass(
      "fixed",
      "z-50",
      "bg-gray-900",
      "text-white",
      "text-sm",
      "rounded-none",
      "border",
      "border-bitcoin-orange",
      "px-3",
      "py-2",
      "shadow-lg",
      "pointer-events-none",
      "transform",
      "-translate-x-1/2",
      "-translate-y-full",
      "font-mono",
    );
  });

  it("should display formatted year and value", () => {
    const { getByText } = render(<ChartTooltip {...defaultProps} />);

    expect(getByText("Year 5")).toBeInTheDocument(); // yearIndex + 1
    expect(getByText("75.5% Portfolio Value")).toBeInTheDocument(); // value.toFixed(1)
  });

  it("should handle integer values", () => {
    const integerProps = {
      ...defaultProps,
      value: 50,
    };

    const { getByText } = render(<ChartTooltip {...integerProps} />);

    expect(getByText("50.0% Portfolio Value")).toBeInTheDocument();
  });

  it("should round decimal values to one decimal place", () => {
    const decimalProps = {
      ...defaultProps,
      value: 33.9,
    };

    const { getByText } = render(<ChartTooltip {...decimalProps} />);

    expect(getByText("33.9% Portfolio Value")).toBeInTheDocument();
  });

  it("should handle zero values", () => {
    const zeroProps = {
      ...defaultProps,
      value: 0,
      yearIndex: 0,
    };

    const { getByText } = render(<ChartTooltip {...zeroProps} />);

    expect(getByText("Year 1")).toBeInTheDocument(); // yearIndex + 1
    expect(getByText("0.0% Portfolio Value")).toBeInTheDocument();
  });

  it("should handle large values", () => {
    const largeProps = {
      ...defaultProps,
      value: 250.75,
      yearIndex: 24,
    };

    const { getByText } = render(<ChartTooltip {...largeProps} />);

    expect(getByText("Year 25")).toBeInTheDocument();
    expect(getByText("250.8% Portfolio Value")).toBeInTheDocument(); // 250.75 rounded to 1 decimal
  });

  it("should handle negative coordinates", () => {
    const negativeProps = {
      ...defaultProps,
      position: { x: -50, y: -100 },
    };

    const { container } = render(<ChartTooltip {...negativeProps} />);

    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({ left: "60px", top: "-115px" }); // Clamped to minimum 60px
  });

  it("should handle missing yAxisLabel", () => {
    const noLabelProps = {
      ...defaultProps,
      yAxisLabel: undefined,
    };

    const { getByText } = render(<ChartTooltip {...noLabelProps} />);

    expect(getByText("75.5%")).toBeInTheDocument(); // Should just show percentage without label
  });

  it("should handle empty yAxisLabel", () => {
    const emptyLabelProps = {
      ...defaultProps,
      yAxisLabel: "",
    };

    const { getByText } = render(<ChartTooltip {...emptyLabelProps} />);

    expect(getByText("75.5%")).toBeInTheDocument();
  });

  it("should handle custom yAxisLabel", () => {
    const customProps = {
      ...defaultProps,
      yAxisLabel: "Bitcoin Price",
    };

    const { getByText } = render(<ChartTooltip {...customProps} />);

    expect(getByText("75.5% Bitcoin Price")).toBeInTheDocument();
  });

  it("should handle edge case with very small values", () => {
    const smallProps = {
      ...defaultProps,
      value: 0.4,
    };

    const { getByText } = render(<ChartTooltip {...smallProps} />);

    expect(getByText("0.4% Portfolio Value")).toBeInTheDocument(); // Shows to 1 decimal place
  });

  it("should handle very large coordinates", () => {
    const largeCoordProps = {
      ...defaultProps,
      position: { x: 5000, y: 3000 },
    };

    const { container } = render(<ChartTooltip {...largeCoordProps} />);

    const tooltip = container.firstChild as HTMLElement;
    // Mock window.innerWidth for the test
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      configurable: true,
    });
    expect(tooltip).toHaveStyle({ left: "964px", top: "2985px" }); // Clamped to max width - 60px
  });

  it("should maintain consistent structure", () => {
    const { container } = render(<ChartTooltip {...defaultProps} />);

    // Should have main tooltip div with three child elements (2 content + 1 arrow)
    const tooltip = container.firstChild as HTMLElement;
    const children = tooltip.children;

    expect(children).toHaveLength(3);
    expect(children[0]).toHaveClass(
      "font-medium",
      "text-bitcoin-orange",
      "uppercase",
      "tracking-wide",
    );
    expect(children[1]).toHaveClass("text-gray-200");
    expect(children[2]).toHaveClass("absolute"); // Arrow element
  });

  it("should handle position changes", () => {
    const { container, rerender } = render(<ChartTooltip {...defaultProps} />);

    let tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({ left: "150px", top: "85px" });

    const newProps = {
      ...defaultProps,
      position: { x: 300, y: 200 },
    };

    rerender(<ChartTooltip {...newProps} />);

    tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveStyle({ left: "300px", top: "185px" });
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
