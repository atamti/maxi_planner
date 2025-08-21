import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "./NumberInput";

describe("NumberInput", () => {
  it("renders with initial value", () => {
    const handleChange = vi.fn();
    render(<NumberInput value={5} onChange={handleChange} />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(5);
  });

  it("calls onChange when input value changes", () => {
    const handleChange = vi.fn();
    render(<NumberInput value={5} onChange={handleChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "10" } });

    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it("increments value when increment button is clicked", () => {
    const handleChange = vi.fn();
    render(<NumberInput value={5} onChange={handleChange} step={1} />);

    const incrementButton = screen.getByText("▲");
    fireEvent.click(incrementButton);

    expect(handleChange).toHaveBeenCalledWith(6);
  });

  it("decrements value when decrement button is clicked", () => {
    const handleChange = vi.fn();
    render(<NumberInput value={5} onChange={handleChange} step={1} />);

    const decrementButton = screen.getByText("▼");
    fireEvent.click(decrementButton);

    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("respects min/max constraints", () => {
    const handleChange = vi.fn();
    render(
      <NumberInput
        value={5}
        onChange={handleChange}
        min={0}
        max={10}
        step={1}
      />,
    );

    const incrementButton = screen.getByText("▲");
    const decrementButton = screen.getByText("▼");

    // Test max constraint
    render(
      <NumberInput
        value={10}
        onChange={handleChange}
        min={0}
        max={10}
        step={1}
      />,
    );
    fireEvent.click(incrementButton);
    expect(handleChange).not.toHaveBeenCalledWith(11);

    // Test min constraint
    render(
      <NumberInput
        value={0}
        onChange={handleChange}
        min={0}
        max={10}
        step={1}
      />,
    );
    fireEvent.click(decrementButton);
    expect(handleChange).not.toHaveBeenCalledWith(-1);
  });

  it("handles decimal step values", () => {
    const handleChange = vi.fn();
    render(<NumberInput value={5.0} onChange={handleChange} step={0.1} />);

    const incrementButton = screen.getByText("▲");
    fireEvent.click(incrementButton);

    expect(handleChange).toHaveBeenCalledWith(5.1);
  });

  it("disables buttons when input is disabled", () => {
    const handleChange = vi.fn();
    render(<NumberInput value={5} onChange={handleChange} disabled />);

    const incrementButton = screen.getByText("▲");
    const decrementButton = screen.getByText("▼");

    expect(incrementButton).toBeDisabled();
    expect(decrementButton).toBeDisabled();
  });
});
