import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../../config/defaults";
import economicScenarios from "../../config/economicScenarios";
import { IncomeExpensesSection } from "./IncomeExpensesSection";

// Mock child components
vi.mock("../charts/ExpensesInflationChart", () => ({
  ExpensesInflationChart: ({ formData }: { formData: any }) => (
    <div data-testid="expenses-inflation-chart">
      Expenses Chart - Starting: ${formData.startingExpenses}
    </div>
  ),
}));

vi.mock("../common/RateAssumptionsSection", () => ({
  RateAssumptionsSection: ({
    config,
    formData,
    updateFormData,
    presetScenarios,
  }: any) => (
    <div data-testid="rate-assumptions-section">
      <div data-testid="rate-title">{config.title}</div>
      <div data-testid="rate-max-value">{config.maxValue}</div>
      <div data-testid="rate-preset-scenarios">
        {Object.keys(presetScenarios).join(",")}
      </div>
      <button
        onClick={() => updateFormData({ [config.flatRateKey]: 15 })}
        data-testid="mock-rate-update"
      >
        Update Rate
      </button>
    </div>
  ),
}));

const defaultProps = {
  formData: DEFAULT_FORM_DATA,
  updateFormData: vi.fn(),
};

describe("IncomeExpensesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render main income configuration section", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      expect(screen.getByText("💰 INCOME CONFIGURATION")).toBeInTheDocument();
      expect(
        screen.getByText("INCOME BUCKET ALLOCATION (%):"),
      ).toBeInTheDocument();
      expect(screen.getByText("REINVESTMENT RATE (%):")).toBeInTheDocument();
      expect(screen.getByText("ACTIVATION YEAR:")).toBeInTheDocument();
      expect(
        screen.getByText("STARTING ANNUAL EXPENSES (USD):"),
      ).toBeInTheDocument();
    });

    it("should render RateAssumptionsSection with correct config", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      expect(
        screen.getByTestId("rate-assumptions-section"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("rate-title")).toHaveTextContent(
        "Income Yield Assumptions",
      );
    });

    it("should render ExpensesInflationChart", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      expect(
        screen.getByTestId("expenses-inflation-chart"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("📊 PROJECTED EXPENSES GROWTH"),
      ).toBeInTheDocument();
    });

    it("should pass preset scenarios to RateAssumptionsSection", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const presetScenarios = screen.getByTestId("rate-preset-scenarios");
      const expectedKeys = Object.keys(economicScenarios).filter(
        (key) => key !== "custom",
      );
      expectedKeys.forEach((key) => {
        expect(presetScenarios.textContent).toContain(key);
      });
    });
  });

  describe("Income Allocation Input", () => {
    it("should display correct income allocation value", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeAllocationPct: 15,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      // Find the number input with max="50" (income allocation) with value "15"
      const input = screen.getByDisplayValue("15") as HTMLInputElement;
      expect(input.value).toBe("15");
      expect(input.type).toBe("number");
      expect(input.max).toBe("50");
    });

    it("should update income allocation when input changes", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      // Find the number input with max="50" (income allocation)
      const inputs = screen.getAllByDisplayValue("10");
      const input = inputs.find(
        (el) =>
          el.getAttribute("type") === "number" &&
          el.getAttribute("max") === "50",
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "20" } });

      expect(defaultProps.updateFormData).toHaveBeenCalledWith({
        incomeAllocationPct: 20,
      });
    });

    it("should have correct input constraints for income allocation", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      // Find the number input with max="50" (income allocation)
      const inputs = screen.getAllByDisplayValue("10");
      const input = inputs.find(
        (el) =>
          el.getAttribute("type") === "number" &&
          el.getAttribute("max") === "50",
      ) as HTMLInputElement;

      expect(input.min).toBe("0");
      expect(input.max).toBe("50");
      expect(input.type).toBe("number");
    });
  });

  describe("Reinvestment Rate Slider", () => {
    it("should display correct reinvestment rate value", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeReinvestmentPct: 40,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      const slider = screen.getByDisplayValue("40") as HTMLInputElement;
      expect(slider.value).toBe("40");
      expect(
        screen.getByText("40% REINVESTED, 60% AVAILABLE"),
      ).toBeInTheDocument();
    });

    it("should update reinvestment rate when slider changes", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const slider = screen.getByDisplayValue("30"); // Default value from DEFAULT_FORM_DATA
      fireEvent.change(slider, { target: { value: "75" } });

      expect(defaultProps.updateFormData).toHaveBeenCalledWith({
        incomeReinvestmentPct: 75,
      });
    });

    it("should display correct available percentage calculation", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeReinvestmentPct: 25,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      expect(
        screen.getByText("25% REINVESTED, 75% AVAILABLE"),
      ).toBeInTheDocument();
    });

    it("should have correct slider constraints", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const slider = screen.getByDisplayValue("30") as HTMLInputElement; // Default value
      expect(slider.min).toBe("0");
      expect(slider.max).toBe("100");
      expect(slider.type).toBe("range");
    });
  });

  describe("Activation Year Slider", () => {
    it("should display correct activation year value", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        activationYear: 15,
        timeHorizon: 25,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      const slider = screen.getByDisplayValue("15") as HTMLInputElement;
      expect(slider.value).toBe("15");
      expect(
        screen.getByText("YEAR 15 - WHEN INCOME STARTS"),
      ).toBeInTheDocument();
    });

    it("should update activation year when slider changes", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      // Find the activation year slider by its value
      const sliders = screen.getAllByDisplayValue("10");
      const activationSlider = sliders.find(
        (slider) =>
          (slider as HTMLInputElement).type === "range" &&
          (slider as HTMLInputElement).max === "20",
      );

      fireEvent.change(activationSlider!, { target: { value: "12" } });

      expect(defaultProps.updateFormData).toHaveBeenCalledWith({
        activationYear: 12,
      });
    });

    it("should have correct slider constraints based on time horizon", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        timeHorizon: 30,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      // Find the activation year slider by its max value
      const sliders = screen.getAllByDisplayValue("10");
      const activationSlider = sliders.find(
        (slider) =>
          (slider as HTMLInputElement).type === "range" &&
          (slider as HTMLInputElement).max === "30",
      ) as HTMLInputElement;

      expect(activationSlider.min).toBe("0");
      expect(activationSlider.max).toBe("30");
      expect(activationSlider.type).toBe("range");
    });
  });

  describe("Starting Expenses Input", () => {
    it("should display formatted starting expenses value", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        startingExpenses: 75000,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      expect(screen.getByDisplayValue("75,000")).toBeInTheDocument();
      expect(screen.getByText("Current: $75,000")).toBeInTheDocument();
    });

    it("should handle starting expenses input change with commas", async () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const input = screen.getByDisplayValue("50,000");
      fireEvent.change(input, { target: { value: "100,000" } });

      expect(defaultProps.updateFormData).toHaveBeenCalledWith({
        startingExpenses: 100000,
      });
    });

    it("should handle starting expenses input without commas", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const input = screen.getByDisplayValue("50,000");
      fireEvent.change(input, { target: { value: "85000" } });

      expect(defaultProps.updateFormData).toHaveBeenCalledWith({
        startingExpenses: 85000,
      });
    });

    it("should handle invalid starting expenses input gracefully", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const input = screen.getByDisplayValue("50,000");
      fireEvent.change(input, { target: { value: "invalid" } });

      // Should not call updateFormData for invalid input
      expect(defaultProps.updateFormData).not.toHaveBeenCalled();
    });

    it("should display default value when startingExpenses is undefined", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        startingExpenses: undefined as any,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      expect(screen.getByDisplayValue("50,000")).toBeInTheDocument();
      expect(screen.getByText("Current: $50,000")).toBeInTheDocument();
    });

    it("should have correct input styling and attributes", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const input = screen.getByDisplayValue("50,000") as HTMLInputElement;
      expect(input.type).toBe("text");
      expect(input.placeholder).toBe("50,000");
      expect(input.className).toContain("font-mono");
    });
  });

  describe("Chart Max Value Calculation", () => {
    it("should calculate max value for preset income scenarios", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeInputType: "preset" as const,
        incomePreset: "debasement" as const,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      const maxValueElement = screen.getByTestId("rate-max-value");
      const expectedMaxValue =
        economicScenarios.debasement.incomeYield.maxAxis || 100;
      expect(maxValueElement.textContent).toBe(expectedMaxValue.toString());
    });

    it("should calculate max value for flat income rate", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeInputType: "flat" as const,
        incomeFlat: 25,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      const maxValueElement = screen.getByTestId("rate-max-value");
      const expectedMaxValue = Math.max(50, Math.ceil((25 * 1.2) / 10) * 10);
      expect(maxValueElement.textContent).toBe(expectedMaxValue.toString());
    });

    it("should calculate max value for linear income rate", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeInputType: "linear" as const,
        incomeStart: 20,
        incomeEnd: 40,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      const maxValueElement = screen.getByTestId("rate-max-value");
      const expectedMaxValue = Math.max(50, Math.ceil((40 * 1.2) / 10) * 10);
      expect(maxValueElement.textContent).toBe(expectedMaxValue.toString());
    });

    it("should return default max value for custom scenarios", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeInputType: "preset" as const,
        incomePreset: "custom" as const,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      const maxValueElement = screen.getByTestId("rate-max-value");
      expect(maxValueElement.textContent).toBe("100");
    });

    it("should handle edge case for low flat income rates", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeInputType: "flat" as const,
        incomeFlat: 5,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      const maxValueElement = screen.getByTestId("rate-max-value");
      // Should return minimum of 50 for low values
      expect(maxValueElement.textContent).toBe("50");
    });
  });

  describe("Integration with Child Components", () => {
    it("should pass formData to ExpensesInflationChart", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        startingExpenses: 80000,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      expect(
        screen.getByText("Expenses Chart - Starting: $80000"),
      ).toBeInTheDocument();
    });

    it("should handle updates from RateAssumptionsSection", async () => {
      const user = userEvent.setup();
      render(<IncomeExpensesSection {...defaultProps} />);

      const updateButton = screen.getByTestId("mock-rate-update");
      await user.click(updateButton);

      expect(defaultProps.updateFormData).toHaveBeenCalledWith({
        incomeFlat: 15,
      });
    });

    it("should pass correct config to RateAssumptionsSection", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      // Check that RateAssumptionsSection is called with expected config
      expect(
        screen.getByTestId("rate-assumptions-section"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("rate-title")).toHaveTextContent(
        "Income Yield Assumptions",
      );
    });
  });

  describe("Number Formatting Utilities", () => {
    it("should format numbers with commas correctly", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        startingExpenses: 123456,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      expect(screen.getByDisplayValue("123,456")).toBeInTheDocument();
      expect(screen.getByText("Current: $123,456")).toBeInTheDocument();
    });

    it("should parse formatted numbers correctly", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const input = screen.getByDisplayValue("50,000");
      fireEvent.change(input, { target: { value: "1,234,567" } });

      expect(defaultProps.updateFormData).toHaveBeenCalledWith({
        startingExpenses: 1234567,
      });
    });

    it("should round numbers for display", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        startingExpenses: 75432.89,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      expect(screen.getByDisplayValue("75,433")).toBeInTheDocument();
      expect(screen.getByText("Current: $75,433")).toBeInTheDocument();
    });
  });

  describe("Economic Scenarios Integration", () => {
    it("should generate income scenario presets from economic scenarios", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      const presetScenarios = screen.getByTestId("rate-preset-scenarios");

      // Should include all economic scenario keys except custom (which is excluded from dropdown)
      const expectedKeys = Object.keys(economicScenarios).filter(
        (key) => key !== "custom",
      );
      expectedKeys.forEach((key) => {
        expect(presetScenarios.textContent).toContain(key);
      });
    });
  });

  describe("Accessibility and UX", () => {
    it("should have descriptive labels and help text", () => {
      render(<IncomeExpensesSection {...defaultProps} />);

      expect(
        screen.getByText(
          "Percentage of BTC stack to convert to USD income pool at activation year",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("YEAR 10 - WHEN INCOME STARTS"),
      ).toBeInTheDocument();
    });

    it("should display current values for user feedback", () => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        incomeReinvestmentPct: 60,
        activationYear: 8,
      };

      render(
        <IncomeExpensesSection {...defaultProps} formData={customFormData} />,
      );

      expect(
        screen.getByText("60% REINVESTED, 40% AVAILABLE"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("YEAR 8 - WHEN INCOME STARTS"),
      ).toBeInTheDocument();
    });
  });
});
