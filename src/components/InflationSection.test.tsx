import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { InflationSection } from "./InflationSection";

// Mock child components
vi.mock("./UsdPurchasingPowerChart", () => ({
  UsdPurchasingPowerChart: () => (
    <div data-testid="usd-purchasing-power-chart">
      USD Purchasing Power Chart
    </div>
  ),
}));

vi.mock("./common/RateAssumptionsSection", () => ({
  RateAssumptionsSection: ({ formData, updateFormData, config }: any) => (
    <div data-testid="rate-assumptions-section">
      <div data-testid="rate-assumptions-title">{config.title}</div>
      <div data-testid="rate-assumptions-emoji">{config.emoji}</div>
      <button
        data-testid="mock-inflation-update"
        onClick={() => updateFormData({ inflationFlat: 12 })}
      >
        Mock Inflation Update
      </button>
      <div data-testid="max-value">{config.maxValue}</div>
      <div data-testid="y-axis-label">{config.yAxisLabel}</div>
      <div data-testid="unit">{config.unit}</div>
      <div data-testid="data-key">{config.dataKey}</div>
      <div data-testid="flat-rate-key">{config.flatRateKey}</div>
      <div data-testid="start-rate-key">{config.startRateKey}</div>
      <div data-testid="end-rate-key">{config.endRateKey}</div>
    </div>
  ),
}));

const defaultProps = {
  formData: DEFAULT_FORM_DATA,
  updateFormData: vi.fn(),
};

describe("InflationSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render main components", () => {
    render(<InflationSection {...defaultProps} />);

    expect(screen.getByTestId("rate-assumptions-section")).toBeInTheDocument();
    expect(
      screen.getByText("📉 USD Purchasing Power Decay"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("usd-purchasing-power-chart"),
    ).toBeInTheDocument();
  });

  it("should pass correct config to RateAssumptionsSection", () => {
    render(<InflationSection {...defaultProps} />);

    expect(screen.getByTestId("rate-assumptions-title")).toHaveTextContent(
      "Inflation Rate Assumptions",
    );
    expect(screen.getByTestId("rate-assumptions-emoji")).toHaveTextContent(
      "💵",
    );
    expect(screen.getByTestId("y-axis-label")).toHaveTextContent(
      "Annual Inflation Rate (%)",
    );
    expect(screen.getByTestId("unit")).toHaveTextContent("%");
    expect(screen.getByTestId("data-key")).toHaveTextContent(
      "inflationCustomRates",
    );
    expect(screen.getByTestId("flat-rate-key")).toHaveTextContent(
      "inflationFlat",
    );
    expect(screen.getByTestId("start-rate-key")).toHaveTextContent(
      "inflationStart",
    );
    expect(screen.getByTestId("end-rate-key")).toHaveTextContent(
      "inflationEnd",
    );
  });

  it("should set correct max value for default preset scenario", () => {
    render(<InflationSection {...defaultProps} />);

    // Default debasement scenario should have its preset max value
    expect(screen.getByTestId("max-value")).toHaveTextContent("20");
  });

  it("should calculate correct max value for flat rate", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      inflationInputType: "flat" as const,
      inflationFlat: 25,
    };

    render(<InflationSection {...defaultProps} formData={customFormData} />);

    // Should be Math.max(100, Math.ceil((25 * 1.2) / 10) * 10) = Math.max(100, 30) = 100
    expect(screen.getByTestId("max-value")).toHaveTextContent("100");
  });

  it("should calculate correct max value for high flat rate", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      inflationInputType: "flat" as const,
      inflationFlat: 120,
    };

    render(<InflationSection {...defaultProps} formData={customFormData} />);

    // Should be Math.max(100, Math.ceil((120 * 1.2) / 10) * 10) = Math.max(100, 150) = 150
    expect(screen.getByTestId("max-value")).toHaveTextContent("150");
  });

  it("should calculate correct max value for linear progression", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      inflationInputType: "linear" as const,
      inflationStart: 5,
      inflationEnd: 80,
    };

    render(<InflationSection {...defaultProps} formData={customFormData} />);

    // Should use max of start/end: Math.max(100, Math.ceil((80 * 1.2) / 10) * 10) = Math.max(100, 100) = 100
    expect(screen.getByTestId("max-value")).toHaveTextContent("100");
  });

  it("should calculate correct max value for high linear progression", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      inflationInputType: "linear" as const,
      inflationStart: 200,
      inflationEnd: 50,
    };

    render(<InflationSection {...defaultProps} formData={customFormData} />);

    // Should use max of start/end: Math.max(100, Math.ceil((200 * 1.2) / 10) * 10) = Math.max(100, 240) = 240
    expect(screen.getByTestId("max-value")).toHaveTextContent("240");
  });

  it("should use default max value for custom preset", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      inflationInputType: "preset" as const,
      inflationPreset: "custom" as const,
    };

    render(<InflationSection {...defaultProps} formData={customFormData} />);

    // Should default to 100 for custom preset
    expect(screen.getByTestId("max-value")).toHaveTextContent("100");
  });

  it("should use default max value for unknown input type", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      inflationInputType: "flat" as const,
      inflationPreset: "unknown" as any,
    };

    render(<InflationSection {...defaultProps} formData={customFormData} />);

    // Should default to 100 for unknown scenarios
    expect(screen.getByTestId("max-value")).toHaveTextContent("100");
  });

  it("should propagate updates from RateAssumptionsSection", async () => {
    const user = userEvent.setup();
    render(<InflationSection {...defaultProps} />);

    const mockUpdateButton = screen.getByTestId("mock-inflation-update");
    await user.click(mockUpdateButton);

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      inflationFlat: 12,
    });
  });

  it("should render USD purchasing power chart with correct styling", () => {
    render(<InflationSection {...defaultProps} />);

    const chartContainer = screen.getByTestId("usd-purchasing-power-chart");
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer.parentElement).toHaveStyle({ height: "400px" });

    // Check section styling
    const section = screen
      .getByText("📉 USD Purchasing Power Decay")
      .closest(".p-4");
    expect(section).toHaveClass(
      "bg-red-50",
      "rounded-lg",
      "border-l-4",
      "border-red-400",
    );
  });

  it("should have correct main container structure", () => {
    const { container } = render(<InflationSection {...defaultProps} />);

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass("space-y-6");
  });

  it("should handle updateFormData prop correctly", () => {
    const mockUpdate = vi.fn();
    render(<InflationSection {...defaultProps} updateFormData={mockUpdate} />);

    // Test that the mock update function is passed correctly
    const mockUpdateButton = screen.getByTestId("mock-inflation-update");
    mockUpdateButton.click();

    expect(mockUpdate).toHaveBeenCalledWith({
      inflationFlat: 12,
    });
  });

  it("should pass formData correctly to child components", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      inflationFlat: 15,
      timeHorizon: 25,
    };

    render(<InflationSection {...defaultProps} formData={customFormData} />);

    // Should pass custom formData to children
    expect(screen.getByTestId("rate-assumptions-section")).toBeInTheDocument();
    expect(
      screen.getByTestId("usd-purchasing-power-chart"),
    ).toBeInTheDocument();
  });

  it("should handle different economic scenarios", () => {
    const testScenarios = [
      { preset: "spiral", expected: "100" }, // Hyperinflationary spiral: maxAxis 100
      { preset: "crisis", expected: "40" }, // Accelerated crisis: maxAxis 40
      { preset: "tight", expected: "10" }, // Tight monetary policy: maxAxis 10
    ];

    testScenarios.forEach(({ preset, expected }) => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        inflationInputType: "preset" as const,
        inflationPreset: preset as any,
      };

      const { unmount } = render(
        <InflationSection {...defaultProps} formData={customFormData} />,
      );
      expect(screen.getByTestId("max-value")).toHaveTextContent(expected);
      unmount();
    });
  });
});

describe("InflationSection - Chart Max Value Calculations", () => {
  it("should handle edge cases in max value calculation", () => {
    const testCases = [
      {
        name: "zero flat rate",
        formData: { inflationInputType: "flat" as const, inflationFlat: 0 },
        expected: "100",
      },
      {
        name: "small flat rate",
        formData: { inflationInputType: "flat" as const, inflationFlat: 5 },
        expected: "100",
      },
      {
        name: "linear with same start and end",
        formData: {
          inflationInputType: "linear" as const,
          inflationStart: 10,
          inflationEnd: 10,
        },
        expected: "100",
      },
      {
        name: "linear with zero values",
        formData: {
          inflationInputType: "linear" as const,
          inflationStart: 0,
          inflationEnd: 0,
        },
        expected: "100",
      },
    ];

    testCases.forEach(({ name, formData, expected }) => {
      const customFormData = { ...DEFAULT_FORM_DATA, ...formData };
      const { unmount } = render(
        <InflationSection {...defaultProps} formData={customFormData} />,
      );
      expect(screen.getByTestId("max-value")).toHaveTextContent(expected);
      unmount();
    });
  });

  it("should round max values correctly for flat rate", () => {
    const testCases = [
      { flatRate: 83, expected: "100" }, // 83 * 1.2 = 99.6, ceil(99.6/10)*10 = 100
      { flatRate: 84, expected: "110" }, // 84 * 1.2 = 100.8, ceil(100.8/10)*10 = 110
      { flatRate: 91, expected: "110" }, // 91 * 1.2 = 109.2, ceil(109.2/10)*10 = 110
      { flatRate: 92, expected: "120" }, // 92 * 1.2 = 110.4, ceil(110.4/10)*10 = 120
    ];

    testCases.forEach(({ flatRate, expected }) => {
      const customFormData = {
        ...DEFAULT_FORM_DATA,
        inflationInputType: "flat" as const,
        inflationFlat: flatRate,
      };

      const { unmount } = render(
        <InflationSection {...defaultProps} formData={customFormData} />,
      );
      expect(screen.getByTestId("max-value")).toHaveTextContent(expected);
      unmount();
    });
  });
});

describe("InflationSection - RateAssumptionsSection Integration", () => {
  it("should pass all required config properties to RateAssumptionsSection", () => {
    render(<InflationSection {...defaultProps} />);

    // Verify all the key config properties are passed correctly
    expect(screen.getByTestId("rate-assumptions-title")).toHaveTextContent(
      "Inflation Rate Assumptions",
    );
    expect(screen.getByTestId("rate-assumptions-emoji")).toHaveTextContent(
      "💵",
    );
    expect(screen.getByTestId("y-axis-label")).toHaveTextContent(
      "Annual Inflation Rate (%)",
    );
    expect(screen.getByTestId("unit")).toHaveTextContent("%");
    expect(screen.getByTestId("data-key")).toHaveTextContent(
      "inflationCustomRates",
    );
    expect(screen.getByTestId("flat-rate-key")).toHaveTextContent(
      "inflationFlat",
    );
    expect(screen.getByTestId("start-rate-key")).toHaveTextContent(
      "inflationStart",
    );
    expect(screen.getByTestId("end-rate-key")).toHaveTextContent(
      "inflationEnd",
    );
  });
});
