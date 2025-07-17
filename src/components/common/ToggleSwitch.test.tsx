import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToggleSwitch } from "./ToggleSwitch";

describe("ToggleSwitch", () => {
  const defaultProps = {
    checked: false,
    onChange: vi.fn(),
    id: "test-toggle",
  };

  it("should render with label", () => {
    render(<ToggleSwitch {...defaultProps} label="Test Toggle" />);

    expect(screen.getByText("Test Toggle")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("should render without label", () => {
    render(<ToggleSwitch {...defaultProps} />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.queryByText("Test Toggle")).not.toBeInTheDocument();
  });

  it("should be checked when checked prop is true", () => {
    render(<ToggleSwitch {...defaultProps} checked={true} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should not be checked when checked prop is false", () => {
    render(<ToggleSwitch {...defaultProps} checked={false} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should call onChange when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ToggleSwitch {...defaultProps} onChange={onChange} checked={false} />,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<ToggleSwitch {...defaultProps} disabled={true} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("should not call onChange when disabled and clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ToggleSwitch {...defaultProps} onChange={onChange} disabled={true} />,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should render description when provided", () => {
    const description = { on: "Enabled", off: "Disabled" };

    render(
      <ToggleSwitch
        {...defaultProps}
        description={description}
        checked={true}
      />,
    );

    expect(screen.getByText("Enabled")).toBeInTheDocument();
  });

  it("should show off description when unchecked", () => {
    const description = { on: "Enabled", off: "Disabled" };

    render(
      <ToggleSwitch
        {...defaultProps}
        description={description}
        checked={false}
      />,
    );

    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });
});
