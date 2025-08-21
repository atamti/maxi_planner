import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../../config/defaults";
import { BtcPriceSection } from "./BtcPriceSection";

// Mock child components
vi.mock("../charts/BtcExchangeChart", () => ({
  BtcExchangeChart: () => (
    <div data-testid="btc-exchange-chart">BTC Exchange Chart</div>
  ),
}));

vi.mock("../common/RateAssumptionsSection", () => ({
  RateAssumptionsSection: ({ formData, updateFormData, config }: any) => (
    <div data-testid="rate-assumptions-section">
      <div data-testid="rate-assumptions-title">{config.title}</div>
      <div data-testid="rate-assumptions-emoji">{config.emoji}</div>
      <button
        data-testid="mock-rate-update"
        onClick={() => updateFormData({ btcPriceFlat: 45 })}
      >
        Mock Rate Update
      </button>
      <div data-testid="max-value">{config.maxValue}</div>
      <div data-testid="y-axis-label">{config.yAxisLabel}</div>
      <div data-testid="unit">{config.unit}</div>
    </div>
  ),
}));

const defaultProps = {
  formData: DEFAULT_FORM_DATA,
  updateFormData: vi.fn(),
};

describe("BtcPriceSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all main sections", () => {
    render(<BtcPriceSection {...defaultProps} />);

    expect(screen.getByText("💰 CURRENT BTC PRICE")).toBeInTheDocument();
    expect(
      screen.getByText("💹 PROJECTED USD EXCHANGE RATE"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("rate-assumptions-section")).toBeInTheDocument();
    expect(screen.getByTestId("btc-exchange-chart")).toBeInTheDocument();
  });

  it("should render exchange rate input with correct value", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    expect(exchangeRateInput).toBeInTheDocument();
    expect(exchangeRateInput).toHaveAttribute("placeholder", "100,000");
  });

  it("should update exchange rate when input changes", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    fireEvent.change(exchangeRateInput, { target: { value: "150,000" } });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      exchangeRate: 150000,
    });
  });

  it("should handle exchange rate input with no commas", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    fireEvent.change(exchangeRateInput, { target: { value: "75000" } });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      exchangeRate: 75000,
    });
  });

  it("should handle invalid exchange rate input gracefully", () => {
    render(<BtcPriceSection {...defaultProps} />);

    // Clear any previous calls from initialization
    vi.clearAllMocks();

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    fireEvent.change(exchangeRateInput, { target: { value: "invalid" } });

    // Should not call updateFormData for invalid input
    expect(defaultProps.updateFormData).not.toHaveBeenCalled();
  });

  it("should pass correct config to RateAssumptionsSection", () => {
    render(<BtcPriceSection {...defaultProps} />);

    expect(screen.getByTestId("rate-assumptions-title")).toHaveTextContent(
      "Appreciation Rate Assumptions",
    );
    expect(screen.getByTestId("rate-assumptions-emoji")).toHaveTextContent(
      "📊",
    );
    expect(screen.getByTestId("y-axis-label")).toHaveTextContent(
      "BTC appreciation (nominal)",
    );
    expect(screen.getByTestId("unit")).toHaveTextContent("%");
  });

  it("should set correct max value for default scenario", () => {
    render(<BtcPriceSection {...defaultProps} />);

    // Default should be 100 for debasement scenario
    expect(screen.getByTestId("max-value")).toHaveTextContent("100");
  });

  it("should set correct max value for custom manual scenario", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      btcPriceInputType: "manual" as const,
      btcPricePreset: "custom" as const,
    };

    render(<BtcPriceSection {...defaultProps} formData={customFormData} />);

    // Should default to 200 for custom/manual scenarios
    expect(screen.getByTestId("max-value")).toHaveTextContent("200");
  });

  it("should propagate updates from RateAssumptionsSection", async () => {
    const user = userEvent.setup();
    render(<BtcPriceSection {...defaultProps} />);

    const mockUpdateButton = screen.getByTestId("mock-rate-update");
    await user.click(mockUpdateButton);

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      btcPriceFlat: 45,
    });
  });

  it("should render exchange rate input label correctly", () => {
    render(<BtcPriceSection {...defaultProps} />);

    expect(
      screen.getByText("Starting USD Exchange Rate ($/₿):"),
    ).toBeInTheDocument();
  });

  it("should format large numbers with commas in exchange rate input", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      exchangeRate: 1234567,
    };

    render(<BtcPriceSection {...defaultProps} formData={customFormData} />);

    expect(screen.getByDisplayValue("1,234,567")).toBeInTheDocument();
  });

  it("should handle decimal exchange rates correctly", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    fireEvent.change(exchangeRateInput, { target: { value: "99,999.99" } });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      exchangeRate: 99999.99,
    });
  });

  it("should handle empty exchange rate input", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    fireEvent.change(exchangeRateInput, { target: { value: "" } });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      exchangeRate: 0,
    });
  });

  it("should have correct input styling and attributes", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    expect(exchangeRateInput).toHaveClass(
      "w-full",
      "p-2",
      "border",
      "border-themed",
      "bg-surface",
      "text-primary",
      "font-mono",
      "rounded-none",
      "focus-ring-themed",
    );
    expect(exchangeRateInput).toHaveAttribute("type", "text");
  });

  it("should render BtcExchangeChart component", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const chartContainer = screen.getByTestId("btc-exchange-chart");
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer.parentElement).toHaveStyle({ height: "400px" });
  });

  it("should have correct section styling", () => {
    render(<BtcPriceSection {...defaultProps} />);

    // Check BTC Price section styling
    const btcPriceSection = screen
      .getByText("💰 CURRENT BTC PRICE")
      .closest(".p-4");
    expect(btcPriceSection).toHaveClass(
      "p-4",
      "card-themed",
      "border",
      "border-bitcoin-orange",
    );

    // Check Projected USD section styling
    const projectedSection = screen
      .getByText("💹 PROJECTED USD EXCHANGE RATE")
      .closest(".p-4");
    expect(projectedSection).toHaveClass(
      "card-themed",
      "border",
      "border-bitcoin-orange",
    );
  });

  it("should handle updateFormData prop correctly", () => {
    const mockUpdate = vi.fn();
    render(<BtcPriceSection {...defaultProps} updateFormData={mockUpdate} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    fireEvent.change(exchangeRateInput, { target: { value: "200,000" } });

    expect(mockUpdate).toHaveBeenCalledWith({
      exchangeRate: 200000,
    });
  });

  it("should pass formData correctly to child components", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      exchangeRate: 250000,
      timeHorizon: 15,
    };

    render(<BtcPriceSection {...defaultProps} formData={customFormData} />);

    expect(screen.getByDisplayValue("250,000")).toBeInTheDocument();
  });

  it("should handle very large exchange rate numbers", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    fireEvent.change(exchangeRateInput, { target: { value: "10,000,000" } });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      exchangeRate: 10000000,
    });
  });

  it("should handle negative exchange rates", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const exchangeRateInput = screen.getByDisplayValue("100,000");
    fireEvent.change(exchangeRateInput, { target: { value: "-50000" } });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      exchangeRate: -50000,
    });
  });

  it("should have correct main container structure", () => {
    const { container } = render(<BtcPriceSection {...defaultProps} />);

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass("space-y-6");
  });
});

describe("BtcPriceSection - RateAssumptionsSection Integration", () => {
  it("should pass correct dataKey and related keys to RateAssumptionsSection", () => {
    // Since we're mocking RateAssumptionsSection, we can test that it receives the right props
    // by checking the rendered config values
    render(<BtcPriceSection {...defaultProps} />);

    // The mocked component should receive the config and render the title
    expect(screen.getByTestId("rate-assumptions-title")).toHaveTextContent(
      "Appreciation Rate Assumptions",
    );
    expect(screen.getByTestId("rate-assumptions-emoji")).toHaveTextContent(
      "📊",
    );
    expect(screen.getByTestId("y-axis-label")).toHaveTextContent(
      "BTC appreciation (nominal)",
    );
    expect(screen.getByTestId("unit")).toHaveTextContent("%");
  });

  it("should handle updates from RateAssumptionsSection correctly", async () => {
    const user = userEvent.setup();
    render(<BtcPriceSection {...defaultProps} />);

    // Click the mock update button from RateAssumptionsSection
    const mockUpdateButton = screen.getByTestId("mock-rate-update");
    await user.click(mockUpdateButton);

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      btcPriceFlat: 45,
    });
  });
});

describe("BtcPriceSection - Number Formatting", () => {
  it("should format numbers correctly for display", () => {
    const testCases = [
      { input: 100000, expected: "100,000" },
      { input: 1000000, expected: "1,000,000" },
      { input: 50000, expected: "50,000" },
      { input: 999, expected: "999" },
      { input: 1000, expected: "1,000" },
    ];

    testCases.forEach(({ input, expected }) => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        exchangeRate: input,
      };

      const { unmount } = render(
        <BtcPriceSection {...defaultProps} formData={customFormData} />,
      );
      expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it("should parse formatted numbers correctly", () => {
    render(<BtcPriceSection {...defaultProps} />);

    const testInputs = [
      { input: "1,000,000", expected: 1000000 },
      { input: "500,000", expected: 500000 },
      { input: "75,000", expected: 75000 },
      { input: "1000", expected: 1000 },
    ];

    const exchangeRateInput = screen.getByDisplayValue("100,000");

    testInputs.forEach(({ input, expected }) => {
      fireEvent.change(exchangeRateInput, { target: { value: input } });
      expect(defaultProps.updateFormData).toHaveBeenCalledWith({
        exchangeRate: expected,
      });
    });
  });
});
