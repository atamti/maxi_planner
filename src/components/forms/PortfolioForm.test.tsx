import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CentralizedStateProvider } from "../../store";
import { PortfolioForm } from "./PortfolioForm";

// Mock child components to focus on PortfolioForm logic
vi.mock("./AllocationSliders", () => ({
  AllocationSliders: () => (
    <div data-testid="allocation-sliders-v2">Allocation Sliders V2</div>
  ),
}));

vi.mock("../sections/BtcPriceSection", () => ({
  BtcPriceSection: () => (
    <div data-testid="btc-price-section">BTC Price Section</div>
  ),
}));

vi.mock("../sections/EconomicScenariosSection", () => ({
  EconomicScenariosSection: () => (
    <div data-testid="economic-scenarios-section">
      <div>2. 🌍 Economic Scenario: Debasement • 8% USD • 50% BTC</div>
      Economic Scenarios
    </div>
  ),
}));

vi.mock("../sections/IncomeExpensesSection", () => ({
  IncomeExpensesSection: () => (
    <div data-testid="income-expenses-section">Income Expenses</div>
  ),
}));

vi.mock("../sections/InflationSection", () => ({
  InflationSection: () => (
    <div data-testid="inflation-section">Inflation Section</div>
  ),
}));

vi.mock("../charts/YieldChart", () => ({
  YieldChart: () => <div data-testid="yield-chart">Yield Chart</div>,
}));

// Wrapper component for tests
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <CentralizedStateProvider>{children}</CentralizedStateProvider>
);

describe("PortfolioForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render main form title", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );
    expect(screen.getByText("PORTFOLIO CONFIGURATION")).toBeInTheDocument();
  });

  it("should render all main sections", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    // Check section titles
    expect(screen.getByText(/1\. 💼 PORTFOLIO SETUP/)).toBeInTheDocument();
    expect(screen.getByText(/2\. 🌍 Economic Scenario/)).toBeInTheDocument();
    expect(screen.getByText(/3\. 📊 MARKET ASSUMPTIONS/)).toBeInTheDocument();
  });

  it("should have PORTFOLIO SETUP section expanded by default", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    // Should show BTC Stack input since section is expanded
    expect(screen.getByDisplayValue("5")).toBeInTheDocument(); // BTC input
    expect(screen.getByDisplayValue("20")).toBeInTheDocument(); // Time horizon slider
    expect(screen.getByText("20 YEARS")).toBeInTheDocument(); // Time horizon display
  });

  it("should render BTC stack input with correct value", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    const btcInput = screen.getByDisplayValue("5") as HTMLInputElement;
    expect(btcInput.value).toBe("5");
    expect(btcInput.type).toBe("number");
  });

  it("should update BTC stack when input changes", async () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    const btcInput = screen.getByDisplayValue("5");
    fireEvent.change(btcInput, { target: { value: "10" } });

    // After the change, the input should reflect the new value
    // We can't easily test the context update directly, but we can verify
    // the input value changes (which happens when context updates)
    expect(btcInput).toHaveValue(10);
  });

  it("should render time horizon slider with correct value", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    const slider = screen.getByDisplayValue("20") as HTMLInputElement;
    expect(slider.type).toBe("range");
    expect(slider.value).toBe("20");
    expect(slider.min).toBe("1");
    expect(slider.max).toBe("50");
  });

  it("should update time horizon when slider changes", async () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    const slider = screen.getByDisplayValue("20");
    fireEvent.change(slider, { target: { value: "30" } });

    // Check that the display text updates
    expect(screen.getByText("30 YEARS")).toBeInTheDocument();
  });

  it("should render allocation sliders in PORTFOLIO SETUP", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    expect(screen.getByTestId("allocation-sliders-v2")).toBeInTheDocument();
    expect(screen.getByText("INITIAL ASSET ALLOCATION")).toBeInTheDocument();
  });

  it("should render economic scenarios section", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    expect(
      screen.getByTestId("economic-scenarios-section"),
    ).toBeInTheDocument();
  });

  it("should toggle collapsible sections", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    // MARKET ASSUMPTIONS should be collapsed by default
    const marketButton = screen.getByText(/3\. 📊 MARKET ASSUMPTIONS/);
    expect(marketButton.parentElement).toHaveTextContent("+");

    // Click to expand
    await user.click(marketButton);
    expect(marketButton.parentElement).toHaveTextContent("−");

    // Click to collapse
    await user.click(marketButton);
    expect(marketButton.parentElement).toHaveTextContent("+");
  });

  it("should show inflation section when MARKET ASSUMPTIONS expanded", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    // Expand MARKET ASSUMPTIONS
    const marketButton = screen.getByText(/3\. 📊 MARKET ASSUMPTIONS/);
    await user.click(marketButton);

    // Should show inflation section header
    expect(screen.getByText(/3A\. 💵 USD INFLATION/)).toBeInTheDocument();

    // Click to expand inflation subsection
    const inflationButton = screen.getByText(/3A\. 💵 USD INFLATION/);
    await user.click(inflationButton);

    // Now should show the actual inflation section component
    expect(screen.getByTestId("inflation-section")).toBeInTheDocument();
  });

  it("should show btc price section when MARKET ASSUMPTIONS expanded", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    // Expand MARKET ASSUMPTIONS
    const marketButton = screen.getByText(/3\. 📊 MARKET ASSUMPTIONS/);
    await user.click(marketButton);

    // Should show BTC price section header
    expect(
      screen.getByText(/3B\. ₿ BTC PRICE APPRECIATION/),
    ).toBeInTheDocument();

    // Click to expand BTC price subsection
    const btcButton = screen.getByText(/3B\. ₿ BTC PRICE APPRECIATION/);
    await user.click(btcButton);

    // Now should show the actual BTC price section component
    expect(screen.getByTestId("btc-price-section")).toBeInTheDocument();
  });

  it("should handle BTC stack input edge cases", async () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    const btcInput = screen.getByDisplayValue("5");

    // Test negative value
    fireEvent.change(btcInput, { target: { value: "-5" } });
    expect(btcInput).toHaveValue(-5);

    // Test decimal value
    fireEvent.change(btcInput, { target: { value: "2.5" } });
    expect(btcInput).toHaveValue(2.5);
  });

  it("should handle time horizon slider edge cases", async () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    const slider = screen.getByDisplayValue("20");

    // Test minimum value
    fireEvent.change(slider, { target: { value: "1" } });
    expect(screen.getByText("1 YEARS")).toBeInTheDocument();

    // Test maximum value
    fireEvent.change(slider, { target: { value: "50" } });
    expect(screen.getByText("50 YEARS")).toBeInTheDocument();
  });

  it("should have correct input constraints", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    const btcInput = screen.getByDisplayValue("5") as HTMLInputElement;
    const timeSlider = screen.getByDisplayValue("20") as HTMLInputElement;

    // BTC input constraints
    expect(btcInput.min).toBe("0");
    expect(btcInput.step).toBe("0.1");

    // Time horizon constraints
    expect(timeSlider.min).toBe("1");
    expect(timeSlider.max).toBe("50");
  });

  it("should show section indicators properly", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    // PORTFOLIO SETUP should show "−" (expanded)
    const portfolioButton = screen.getByText(/1\. 💼 PORTFOLIO SETUP/);
    expect(portfolioButton.parentElement).toHaveTextContent("−");

    // MARKET ASSUMPTIONS should show "+" (collapsed)
    const marketButton = screen.getByText(/3\. 📊 MARKET ASSUMPTIONS/);
    expect(marketButton.parentElement).toHaveTextContent("+");

    // Click to toggle
    await user.click(marketButton);
    expect(marketButton.parentElement).toHaveTextContent("−");
  });

  it("should use context for form data", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    // Verify default values from context are displayed
    expect(screen.getByDisplayValue("5")).toBeInTheDocument(); // btcStack
    expect(screen.getByText("20 YEARS")).toBeInTheDocument(); // timeHorizon
  });

  it("should render reset button", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    expect(screen.getByText("🔄 RESET TO DEFAULTS")).toBeInTheDocument();
  });

  it("should render income & cashflow section", () => {
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    expect(screen.getByText(/5\. 💰 INCOME & CASHFLOW/)).toBeInTheDocument();
  });
});

// Test CollapsibleSection component separately
describe("PortfolioForm - CollapsibleSection", () => {
  it("should expand and collapse sections correctly", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PortfolioForm />
      </TestWrapper>,
    );

    const marketButton = screen.getByText(/3\. 📊 MARKET ASSUMPTIONS/);

    // Should be collapsed initially (showing "+")
    expect(marketButton.parentElement).toHaveTextContent("+");

    // Should not show inflation section when collapsed
    expect(screen.queryByText("3a. 💵 USD Inflation")).not.toBeInTheDocument();

    // Click to expand
    await user.click(marketButton);
    expect(marketButton.parentElement).toHaveTextContent("−");

    // Should show inflation section when expanded
    expect(screen.getByText(/3A\. 💵 USD INFLATION/)).toBeInTheDocument();
  });
});
