import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AllocationSlider } from "./AllocationSlider";

// Mock the useAllocationColors hook
vi.mock("../../../hooks/useAllocationColors", () => ({
  useAllocationColors: () => ({
    getIndicatorColor: vi.fn((category: string) => {
      if (category === "savings") return "bg-blue-500";
      if (category === "investments") return "bg-green-500";
      return "bg-gray-500";
    }),
  }),
}));

describe("AllocationSlider", () => {
  const defaultProps = {
    label: "Test Allocation",
    value: 50,
    onChange: vi.fn(),
    minThreshold: 10,
    category: "savings" as const,
    description: "Test description",
    highlightClasses: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with correct label and value", () => {
    render(<AllocationSlider {...defaultProps} />);

    expect(screen.getByText("Test Allocation (50%)")).toBeInTheDocument();
  });

  it("should render range input with correct attributes", () => {
    render(<AllocationSlider {...defaultProps} />);

    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toHaveAttribute("type", "range");
    expect(rangeInput).toHaveAttribute("min", "10");
    expect(rangeInput).toHaveAttribute("max", "100");
    expect(rangeInput).toHaveValue("50");
  });

  it("should render number input with correct attributes", () => {
    render(<AllocationSlider {...defaultProps} />);

    const numberInputs = screen.getAllByDisplayValue("50");
    const numberInput = numberInputs.find(
      (input) => input.getAttribute("type") === "number",
    );

    expect(numberInput).toHaveAttribute("type", "number");
    expect(numberInput).toHaveAttribute("min", "10");
    expect(numberInput).toHaveAttribute("max", "100");
  });

  it("should call onChange when range input changes", () => {
    const onChange = vi.fn();
    render(<AllocationSlider {...defaultProps} onChange={onChange} />);

    const rangeInput = screen.getByRole("slider");
    fireEvent.change(rangeInput, { target: { value: "75" } });

    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("should call onChange when number input changes", () => {
    const onChange = vi.fn();
    render(<AllocationSlider {...defaultProps} onChange={onChange} />);

    const numberInputs = screen.getAllByDisplayValue("50");
    const numberInput = numberInputs.find(
      (input) => input.getAttribute("type") === "number",
    );

    fireEvent.change(numberInput!, { target: { value: "30" } });

    expect(onChange).toHaveBeenCalledWith(30);
  });

  it("should display correct indicator color for savings category", () => {
    render(<AllocationSlider {...defaultProps} category="savings" />);

    const indicator = screen
      .getByText("Test Allocation (50%)")
      .parentElement?.querySelector(".w-3.h-3");
    expect(indicator).toHaveClass("bg-blue-500");
  });

  it("should display correct indicator color for investments category", () => {
    render(<AllocationSlider {...defaultProps} category="investments" />);

    const indicator = screen
      .getByText("Test Allocation (50%)")
      .parentElement?.querySelector(".w-3.h-3");
    expect(indicator).toHaveClass("bg-green-500");
  });

  it("should apply highlight classes", () => {
    const highlightClasses = "border-2 border-red-500";
    render(
      <AllocationSlider
        {...defaultProps}
        highlightClasses={highlightClasses}
      />,
    );

    const container = screen
      .getByText("Test Allocation (50%)")
      .closest(".transition-all");
    expect(container).toHaveClass("border-2", "border-red-500");
  });

  it("should handle edge case values", () => {
    const onChange = vi.fn();
    render(
      <AllocationSlider
        {...defaultProps}
        onChange={onChange}
        value={0}
        minThreshold={0}
      />,
    );

    expect(screen.getByText("Test Allocation (0%)")).toBeInTheDocument();

    const rangeInput = screen.getByRole("slider");
    fireEvent.change(rangeInput, { target: { value: "100" } });

    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("should respect minimum threshold", () => {
    render(<AllocationSlider {...defaultProps} minThreshold={25} />);

    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toHaveAttribute("min", "25");

    const numberInputs = screen.getAllByDisplayValue("50");
    const numberInput = numberInputs.find(
      (input) => input.getAttribute("type") === "number",
    );
    expect(numberInput).toHaveAttribute("min", "25");
  });

  it("should handle zero value correctly", () => {
    const onChange = vi.fn();
    render(
      <AllocationSlider {...defaultProps} value={0} onChange={onChange} />,
    );

    expect(screen.getByText("Test Allocation (0%)")).toBeInTheDocument();

    const numberInputs = screen.getAllByDisplayValue("0");
    expect(numberInputs.length).toBeGreaterThan(0);
  });
});
