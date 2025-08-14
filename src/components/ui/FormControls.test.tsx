import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  CheckboxInput,
  CheckboxInputProps,
  NumericInput,
  NumericInputProps,
  SelectInput,
  SelectInputProps,
  SliderInput,
  SliderInputProps,
} from "./FormControls";

describe("FormControls Components", () => {
  describe("NumericInput", () => {
    const defaultProps: NumericInputProps = {
      label: "Test Numeric Input",
      value: 10,
      onChange: vi.fn(),
    };

    it("should render with label and value", () => {
      render(<NumericInput {...defaultProps} />);

      // Use getByRole instead of getByLabelText since labels aren't properly associated
      expect(screen.getByText("Test Numeric Input")).toBeInTheDocument();
      expect(screen.getByRole("spinbutton")).toHaveValue(10);
    });

    it("should call onChange when value changes", () => {
      const mockOnChange = vi.fn();
      render(<NumericInput {...defaultProps} onChange={mockOnChange} />);

      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "25" } });

      expect(mockOnChange).toHaveBeenCalledWith(25);
    });

    it("should render with unit in label", () => {
      render(<NumericInput {...defaultProps} unit="%" />);

      expect(screen.getByText("(%)")).toBeInTheDocument();
    });

    it("should render with error styling and message", () => {
      render(<NumericInput {...defaultProps} error="This is an error" />);

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveClass("border-red-500", "bg-red-50");
      expect(screen.getByText("This is an error")).toBeInTheDocument();
    });

    it("should render with warning styling and message", () => {
      render(<NumericInput {...defaultProps} warning="This is a warning" />);

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveClass("border-yellow-500", "bg-yellow-50");
      expect(screen.getByText("This is a warning")).toBeInTheDocument();
    });

    it("should prioritize error over warning", () => {
      render(
        <NumericInput {...defaultProps} error="Error" warning="Warning" />,
      );

      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.queryByText("Warning")).not.toBeInTheDocument();
    });

    it("should handle disabled state", () => {
      render(<NumericInput {...defaultProps} disabled />);

      const input = screen.getByRole("spinbutton");
      expect(input).toBeDisabled();
      expect(input).toHaveClass("bg-gray-100");
    });

    it("should apply min, max, and step attributes", () => {
      render(<NumericInput {...defaultProps} min={0} max={100} step={5} />);

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("min", "0");
      expect(input).toHaveAttribute("max", "100");
      expect(input).toHaveAttribute("step", "5");
    });

    it("should apply custom className", () => {
      render(<NumericInput {...defaultProps} className="custom-class" />);

      expect(screen.getByRole("spinbutton").closest(".mb-4")).toHaveClass(
        "custom-class",
      );
    });
  });

  describe("SliderInput", () => {
    const defaultProps: SliderInputProps = {
      label: "Test Slider",
      value: 50,
      onChange: vi.fn(),
      min: 0,
      max: 100,
    };

    it("should render with label and value", () => {
      render(<SliderInput {...defaultProps} />);

      expect(screen.getByText("Test Slider")).toBeInTheDocument();
      expect(screen.getByRole("slider")).toHaveValue("50");
    });

    it("should call onChange when value changes", () => {
      const mockOnChange = vi.fn();
      render(<SliderInput {...defaultProps} onChange={mockOnChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "75" } });

      expect(mockOnChange).toHaveBeenCalledWith(75);
    });

    it("should display min and max values", () => {
      render(<SliderInput {...defaultProps} min={10} max={90} />);

      expect(screen.getByText("10 - 90")).toBeInTheDocument();
    });

    it("should display current value", () => {
      render(<SliderInput {...defaultProps} value={65} />);

      expect(screen.getByText("65")).toBeInTheDocument();
    });

    it("should display custom display value when provided", () => {
      render(<SliderInput {...defaultProps} displayValue="Custom: 50" />);

      expect(screen.getByText("Custom: 50")).toBeInTheDocument();
    });

    it("should render with error styling and message", () => {
      render(<SliderInput {...defaultProps} error="Slider error" />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveClass("accent-red-500");
      expect(screen.getByText("Slider error")).toBeInTheDocument();
    });

    it("should render with warning styling and message", () => {
      render(<SliderInput {...defaultProps} warning="Slider warning" />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveClass("accent-yellow-500");
      expect(screen.getByText("Slider warning")).toBeInTheDocument();
    });

    it("should handle disabled state", () => {
      render(<SliderInput {...defaultProps} disabled />);

      const slider = screen.getByRole("slider");
      expect(slider).toBeDisabled();
      expect(slider).toHaveClass("opacity-50");
    });

    it("should apply step attribute", () => {
      render(<SliderInput {...defaultProps} step={10} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("step", "10");
    });
  });

  describe("SelectInput", () => {
    const defaultOptions = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3", disabled: true },
    ];

    const defaultProps: SelectInputProps = {
      label: "Test Select",
      value: "option1",
      onChange: vi.fn(),
      options: defaultOptions,
    };

    it("should render with label and selected value", () => {
      render(<SelectInput {...defaultProps} />);

      expect(screen.getByText("Test Select")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveValue("option1");
    });

    it("should render all options", () => {
      render(<SelectInput {...defaultProps} />);

      expect(
        screen.getByRole("option", { name: "Option 1" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Option 2" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Option 3" }),
      ).toBeInTheDocument();
    });

    it("should handle disabled options", () => {
      render(<SelectInput {...defaultProps} />);

      const disabledOption = screen.getByRole("option", { name: "Option 3" });
      expect(disabledOption).toBeDisabled();
    });

    it("should call onChange when selection changes", () => {
      const mockOnChange = vi.fn();
      render(<SelectInput {...defaultProps} onChange={mockOnChange} />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "option2" } });

      expect(mockOnChange).toHaveBeenCalledWith("option2");
    });

    it("should render with error styling and message", () => {
      render(<SelectInput {...defaultProps} error="Select error" />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("border-red-500", "bg-red-50");
      expect(screen.getByText("Select error")).toBeInTheDocument();
    });

    it("should render with warning styling and message", () => {
      render(<SelectInput {...defaultProps} warning="Select warning" />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("border-yellow-500", "bg-yellow-50");
      expect(screen.getByText("Select warning")).toBeInTheDocument();
    });

    it("should handle disabled state", () => {
      render(<SelectInput {...defaultProps} disabled />);

      const select = screen.getByRole("combobox");
      expect(select).toBeDisabled();
      expect(select).toHaveClass("bg-gray-100");
    });

    it("should apply custom className", () => {
      render(<SelectInput {...defaultProps} className="select-custom" />);

      expect(screen.getByRole("combobox").closest(".mb-4")).toHaveClass(
        "select-custom",
      );
    });
  });

  describe("CheckboxInput", () => {
    const defaultProps: CheckboxInputProps = {
      label: "Test Checkbox",
      checked: false,
      onChange: vi.fn(),
    };

    it("should render with label", () => {
      render(<CheckboxInput {...defaultProps} />);

      expect(screen.getByText("Test Checkbox")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should render checked state", () => {
      render(<CheckboxInput {...defaultProps} checked />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should render unchecked state", () => {
      render(<CheckboxInput {...defaultProps} checked={false} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("should call onChange when clicked", () => {
      const mockOnChange = vi.fn();
      render(<CheckboxInput {...defaultProps} onChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it("should render description when provided", () => {
      render(
        <CheckboxInput {...defaultProps} description="This is a description" />,
      );

      expect(screen.getByText("This is a description")).toBeInTheDocument();
    });

    it("should render with error styling and message", () => {
      render(<CheckboxInput {...defaultProps} error="Checkbox error" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("accent-red-500");
      expect(screen.getByText("Checkbox error")).toBeInTheDocument();
    });

    it("should render with warning message", () => {
      render(<CheckboxInput {...defaultProps} warning="Checkbox warning" />);

      expect(screen.getByText("Checkbox warning")).toBeInTheDocument();
    });

    it("should handle disabled state", () => {
      render(<CheckboxInput {...defaultProps} disabled />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveClass("opacity-50");

      const label = screen.getByText("Test Checkbox");
      expect(label).toHaveClass("text-gray-500");
    });

    it("should apply custom className", () => {
      render(<CheckboxInput {...defaultProps} className="checkbox-custom" />);

      expect(screen.getByRole("checkbox").closest(".mb-4")).toHaveClass(
        "checkbox-custom",
      );
    });

    it("should handle toggle from checked to unchecked", () => {
      const mockOnChange = vi.fn();
      render(
        <CheckboxInput {...defaultProps} checked onChange={mockOnChange} />,
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Accessibility and Edge Cases", () => {
    it("should handle empty options in SelectInput", () => {
      const props: SelectInputProps = {
        label: "Empty Select",
        value: "",
        onChange: vi.fn(),
        options: [],
      };

      render(<SelectInput {...props} />);

      expect(screen.getByText("Empty Select")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should handle zero value in NumericInput", () => {
      render(<NumericInput label="Zero Input" value={0} onChange={vi.fn()} />);

      expect(screen.getByRole("spinbutton")).toHaveValue(0);
    });

    it("should handle negative values in NumericInput", () => {
      render(
        <NumericInput label="Negative Input" value={-10} onChange={vi.fn()} />,
      );

      expect(screen.getByRole("spinbutton")).toHaveValue(-10);
    });

    it("should handle edge values in SliderInput", () => {
      render(
        <SliderInput
          label="Edge Slider"
          value={0}
          onChange={vi.fn()}
          min={0}
          max={0}
        />,
      );

      expect(screen.getByRole("slider")).toHaveValue("0");
      expect(screen.getByText("0 - 0")).toBeInTheDocument();
    });

    it("should handle empty string value in SelectInput", () => {
      const options = [
        { value: "", label: "Select an option" },
        { value: "option1", label: "Option 1" },
      ];

      render(
        <SelectInput
          label="Test"
          value=""
          onChange={vi.fn()}
          options={options}
        />,
      );

      expect(screen.getByRole("combobox")).toHaveValue("");
    });
  });

  describe("Event Handling Edge Cases", () => {
    it("should handle non-numeric input in NumericInput", () => {
      const mockOnChange = vi.fn();
      render(<NumericInput label="Test" value={10} onChange={mockOnChange} />);

      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "abc" } });

      // Number('abc') returns NaN, but browsers may handle this differently
      // The actual behavior is it converts invalid input to 0
      expect(mockOnChange).toHaveBeenCalledWith(0);
    });

    it("should handle empty string input in NumericInput", () => {
      const mockOnChange = vi.fn();
      render(<NumericInput label="Test" value={10} onChange={mockOnChange} />);

      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith(0);
    });

    it("should handle decimal values in SliderInput", () => {
      const mockOnChange = vi.fn();
      render(
        <SliderInput
          label="Test"
          value={50.5}
          onChange={mockOnChange}
          min={0}
          max={100}
        />,
      );

      const slider = screen.getByRole("slider");
      fireEvent.change(slider, { target: { value: "25.7" } });

      expect(mockOnChange).toHaveBeenCalledWith(25.7);
    });
  });
});
