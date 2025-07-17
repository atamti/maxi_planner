import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { PortfolioForm } from "./PortfolioForm";

// Mock child components to focus on PortfolioForm logic
vi.mock("./AllocationSliders", () => ({
  AllocationSliders: ({ onUpdate }: { onUpdate: (updates: any) => void }) => (
    <div data-testid="allocation-sliders">
      <button
        onClick={() =>
          onUpdate({ savingsPct: 70, investmentsPct: 20, speculationPct: 10 })
        }
      >
        Mock Update Allocation
      </button>
    </div>
  ),
}));

vi.mock("./BtcPriceSection", () => ({
  BtcPriceSection: () => (
    <div data-testid="btc-price-section">BTC Price Section</div>
  ),
}));

vi.mock("./EconomicScenariosSection", () => ({
  EconomicScenariosSection: () => (
    <div data-testid="economic-scenarios-section">Economic Scenarios</div>
  ),
}));

vi.mock("./IncomeExpensesSection", () => ({
  IncomeExpensesSection: () => (
    <div data-testid="income-expenses-section">Income Expenses</div>
  ),
}));

vi.mock("./InflationSection", () => ({
  InflationSection: () => (
    <div data-testid="inflation-section">Inflation Section</div>
  ),
}));

vi.mock("./YieldChart", () => ({
  YieldChart: () => <div data-testid="yield-chart">Yield Chart</div>,
}));

const defaultProps = {
  formData: DEFAULT_FORM_DATA,
  updateFormData: vi.fn(),
  allocationError: "",
  onReset: vi.fn(),
};

describe("PortfolioForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render main form title", () => {
    render(<PortfolioForm {...defaultProps} />);
    expect(screen.getByText("Portfolio Configuration")).toBeInTheDocument();
  });

  it("should render all main sections", () => {
    render(<PortfolioForm {...defaultProps} />);

    // Check section titles
    expect(screen.getByText("1. 💼 Portfolio Setup")).toBeInTheDocument();
    expect(screen.getByText("2. 🌍 Economic Scenario")).toBeInTheDocument();
    expect(screen.getByText("3. 📊 Market Assumptions")).toBeInTheDocument();
  });

  it("should have Portfolio Setup section expanded by default", () => {
    render(<PortfolioForm {...defaultProps} />);

    // Should show BTC Stack input since section is expanded
    expect(screen.getByDisplayValue("5")).toBeInTheDocument(); // BTC input
    expect(screen.getByDisplayValue("20")).toBeInTheDocument(); // Time horizon slider
    expect(screen.getByText("20 years")).toBeInTheDocument(); // Time horizon display
  });

  it("should render BTC stack input with correct value", () => {
    render(<PortfolioForm {...defaultProps} />);

    const btcInput = screen.getByDisplayValue("5") as HTMLInputElement;
    expect(btcInput.value).toBe("5");
    expect(btcInput.type).toBe("number");
  });

  it("should update BTC stack when input changes", async () => {
    render(<PortfolioForm {...defaultProps} />);

    const btcInput = screen.getByDisplayValue("5");
    fireEvent.change(btcInput, { target: { value: "10" } });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({ btcStack: 10 });
  });

  it("should render time horizon slider with correct value", () => {
    render(<PortfolioForm {...defaultProps} />);

    const timeSlider = screen.getByDisplayValue("20") as HTMLInputElement;
    expect(timeSlider.value).toBe("20");
    expect(screen.getByText("20 years")).toBeInTheDocument();
  });

  it("should update time horizon when slider changes", async () => {
    render(<PortfolioForm {...defaultProps} />);

    const timeSlider = screen.getByDisplayValue("20");
    fireEvent.change(timeSlider, { target: { value: "25" } });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      timeHorizon: 25,
    });
  });

  it("should render allocation sliders in portfolio setup", () => {
    render(<PortfolioForm {...defaultProps} />);

    expect(screen.getByTestId("allocation-sliders")).toBeInTheDocument();
    expect(screen.getByText("Asset Allocation Strategy")).toBeInTheDocument();
  });

  it("should pass allocation updates to updateFormData", async () => {
    const user = userEvent.setup();
    render(<PortfolioForm {...defaultProps} />);

    const mockUpdateButton = screen.getByText("Mock Update Allocation");
    await user.click(mockUpdateButton);

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      savingsPct: 70,
      investmentsPct: 20,
      speculationPct: 10,
    });
  });

  it("should render economic scenarios section", () => {
    render(<PortfolioForm {...defaultProps} />);
    expect(
      screen.getByTestId("economic-scenarios-section"),
    ).toBeInTheDocument();
  });

  it("should toggle collapsible sections", async () => {
    const user = userEvent.setup();
    render(<PortfolioForm {...defaultProps} />);

    // Market Assumptions should be collapsed by default
    const marketAssumptionsButton = screen.getByText(
      "3. 📊 Market Assumptions",
    );

    // Click to expand
    await user.click(marketAssumptionsButton);

    // Should now show the sub-sections
    await screen.findByText("3a. 💵 USD Inflation");
    expect(
      screen.getByText("3b. ₿ BTC Price Appreciation"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("3c. 📈 BTC Yield Assumptions"),
    ).toBeInTheDocument();
  });

  it("should show inflation section when market assumptions expanded", async () => {
    const user = userEvent.setup();
    render(<PortfolioForm {...defaultProps} />);

    // Expand Market Assumptions
    const marketAssumptionsButton = screen.getByText(
      "3. 📊 Market Assumptions",
    );
    await user.click(marketAssumptionsButton);

    expect(screen.getByTestId("inflation-section")).toBeInTheDocument();
  });

  it("should show btc price section when market assumptions expanded", async () => {
    const user = userEvent.setup();
    render(<PortfolioForm {...defaultProps} />);

    // Expand Market Assumptions
    const marketAssumptionsButton = screen.getByText(
      "3. 📊 Market Assumptions",
    );
    await user.click(marketAssumptionsButton);

    expect(screen.getByTestId("btc-price-section")).toBeInTheDocument();
  });

  it("should handle BTC stack input edge cases", async () => {
    render(<PortfolioForm {...defaultProps} />);

    const btcInput = screen.getByDisplayValue("5");

    // Test negative value
    fireEvent.change(btcInput, { target: { value: "-5" } });
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({ btcStack: -5 });

    // Test decimal value
    fireEvent.change(btcInput, { target: { value: "2.5" } });
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({ btcStack: 2.5 });
  });

  it("should handle time horizon slider edge cases", async () => {
    render(<PortfolioForm {...defaultProps} />);

    const timeSlider = screen.getByDisplayValue("20");

    // Test minimum value
    fireEvent.change(timeSlider, { target: { value: "1" } });
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      timeHorizon: 1,
    });

    // Test maximum value
    fireEvent.change(timeSlider, { target: { value: "50" } });
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      timeHorizon: 50,
    });
  });

  it("should have correct input constraints", () => {
    render(<PortfolioForm {...defaultProps} />);

    const btcInput = screen.getByDisplayValue("5") as HTMLInputElement;
    expect(btcInput.min).toBe("0");
    expect(btcInput.step).toBe("0.1");

    const timeSlider = screen.getByDisplayValue("20") as HTMLInputElement;
    expect(timeSlider.min).toBe("1");
    expect(timeSlider.max).toBe("50");
  });

  it("should show section indicators properly", async () => {
    const user = userEvent.setup();
    render(<PortfolioForm {...defaultProps} />);

    // Portfolio Setup should show "−" (expanded)
    const portfolioButton = screen.getByText("1. 💼 Portfolio Setup");
    expect(portfolioButton.parentElement).toHaveTextContent("−");

    // Market Assumptions should show "+" (collapsed)
    const marketButton = screen.getByText("3. 📊 Market Assumptions");
    expect(marketButton.parentElement).toHaveTextContent("+");

    // Click to toggle
    await user.click(marketButton);
    expect(marketButton.parentElement).toHaveTextContent("−");
  });

  it("should pass formData to child components", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      btcStack: 10,
      timeHorizon: 25,
    };

    render(<PortfolioForm {...defaultProps} formData={customFormData} />);

    const btcInput = screen.getByDisplayValue("10") as HTMLInputElement;
    expect(btcInput.value).toBe("10");

    const timeSlider = screen.getByDisplayValue("25") as HTMLInputElement;
    expect(timeSlider.value).toBe("25");
    expect(screen.getByText("25 years")).toBeInTheDocument();
  });

  it("should handle updateFormData prop correctly", () => {
    const mockUpdate = vi.fn();
    render(<PortfolioForm {...defaultProps} updateFormData={mockUpdate} />);

    const btcInput = screen.getByDisplayValue("5");
    fireEvent.change(btcInput, { target: { value: "7.5" } });

    expect(mockUpdate).toHaveBeenCalledWith({ btcStack: 7.5 });
  });
});

describe("PortfolioForm - CollapsibleSection", () => {
  it("should expand and collapse sections correctly", async () => {
    const user = userEvent.setup();
    render(<PortfolioForm {...defaultProps} />);

    // Test Portfolio Setup (initially expanded)
    const portfolioButton = screen.getByText("1. 💼 Portfolio Setup");
    expect(screen.getByDisplayValue("5")).toBeInTheDocument(); // BTC input should be visible

    // Click to collapse
    await user.click(portfolioButton);
    expect(screen.queryByDisplayValue("5")).not.toBeInTheDocument(); // BTC input should be hidden

    // Click to expand again
    await user.click(portfolioButton);
    expect(screen.getByDisplayValue("5")).toBeInTheDocument(); // BTC input should be visible again
  });
});
