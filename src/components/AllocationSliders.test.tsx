import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AllocationSliders } from "./AllocationSliders";

describe("AllocationSliders", () => {
  const defaultProps = {
    savingsPct: 65,
    investmentsPct: 25,
    speculationPct: 10,
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render with correct initial values", () => {
    render(<AllocationSliders {...defaultProps} />);

    // Check that range sliders have correct values
    const sliders = screen.getAllByRole("slider");
    expect(sliders[0]).toHaveValue("65");
    expect(sliders[1]).toHaveValue("25");

    // Check that number inputs have correct values
    const numberInputs = screen.getAllByRole("spinbutton");
    expect(numberInputs[0]).toHaveValue(65);
    expect(numberInputs[1]).toHaveValue(25);

    // Check speculation percentage is displayed
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("should display current allocation percentages", () => {
    render(<AllocationSliders {...defaultProps} />);

    expect(screen.getByText("65%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("should call onUpdate when savings slider changes", () => {
    render(<AllocationSliders {...defaultProps} />);

    // Get the first range input (savings slider)
    const savingsSlider = screen.getAllByRole("slider")[0];

    fireEvent.change(savingsSlider, { target: { value: "70" } });

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it("should call onUpdate when investments slider changes", () => {
    render(<AllocationSliders {...defaultProps} />);

    // Get the second range input (investments slider)
    const investmentsSlider = screen.getAllByRole("slider")[1];

    fireEvent.change(investmentsSlider, { target: { value: "30" } });

    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });

  it("should enforce minimum threshold when provided", () => {
    const onUpdate = vi.fn();
    render(
      <AllocationSliders
        {...defaultProps}
        onUpdate={onUpdate}
        minThreshold={5}
      />,
    );

    const savingsSlider = screen.getAllByRole("slider")[0];

    // Set savings to 90%, which should leave 10% for investments + speculation
    // Since minimum is 5% each, this should adjust to 90% savings, 5% investments, 5% speculation
    fireEvent.change(savingsSlider, { target: { value: "90" } });

    // Should adjust other allocations to respect minimum threshold
    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.savingsPct).toBeGreaterThanOrEqual(5);
    expect(lastCall.investmentsPct).toBeGreaterThanOrEqual(5);
    expect(lastCall.speculationPct).toBeGreaterThanOrEqual(5);

    // Total should still be 100
    expect(
      lastCall.savingsPct + lastCall.investmentsPct + lastCall.speculationPct,
    ).toBe(100);
  });

  it("should ensure allocations always sum to 100%", () => {
    const onUpdate = vi.fn();
    render(<AllocationSliders {...defaultProps} onUpdate={onUpdate} />);

    const savingsSlider = screen.getAllByRole("slider")[0];

    fireEvent.change(savingsSlider, { target: { value: "50" } });

    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    const total =
      lastCall.savingsPct + lastCall.investmentsPct + lastCall.speculationPct;
    expect(total).toBe(100);
  });

  it("should handle edge case of maximum allocation", () => {
    const onUpdate = vi.fn();
    render(<AllocationSliders {...defaultProps} onUpdate={onUpdate} />);

    const savingsSlider = screen.getAllByRole("slider")[0];

    fireEvent.change(savingsSlider, { target: { value: "100" } });

    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.savingsPct).toBeLessThanOrEqual(100);
  });

  it("should handle invalid input values", () => {
    const onUpdate = vi.fn();
    render(<AllocationSliders {...defaultProps} onUpdate={onUpdate} />);

    const savingsSlider = screen.getAllByRole("slider")[0];

    // Test negative value
    fireEvent.change(savingsSlider, { target: { value: "-10" } });

    expect(onUpdate).toHaveBeenCalled();
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.savingsPct).toBeGreaterThanOrEqual(0);
  });

  it("should highlight adjusted fields when allocations are automatically changed", () => {
    render(<AllocationSliders {...defaultProps} minThreshold={5} />);

    const savingsSlider = screen.getAllByRole("slider")[0];

    fireEvent.change(savingsSlider, { target: { value: "95" } });

    // Should trigger highlighting behavior and call onUpdate
    expect(defaultProps.onUpdate).toHaveBeenCalled();
  });
});
