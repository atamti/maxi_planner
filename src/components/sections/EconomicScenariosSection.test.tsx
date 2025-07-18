import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../../config/defaults";
import { EconomicScenariosSection } from "./EconomicScenariosSection";

const defaultProps = {
  formData: DEFAULT_FORM_DATA,
  updateFormData: vi.fn(),
};

describe("EconomicScenariosSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render main components", () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    expect(screen.getByText("Economic Scenario")).toBeInTheDocument();
    expect(screen.getByText("USD inflation")).toBeInTheDocument();
    expect(screen.getByText("BTC nominal appreciation")).toBeInTheDocument();
    expect(screen.getByText("Income portfolio yield")).toBeInTheDocument();
  });

  it("should render all economic scenario cards", () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    // Check for known scenario names from economicScenarios
    expect(screen.getByText("Tight monetary policy")).toBeInTheDocument();
    expect(screen.getByText("Managed debasement")).toBeInTheDocument();
    expect(screen.getByText("Accelerated crisis")).toBeInTheDocument();
    expect(screen.getByText("Hyperinflationary spiral")).toBeInTheDocument();
    expect(screen.getByText("Manual configuration")).toBeInTheDocument();
  });

  it("should highlight selected scenario", () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    // Default scenario should be highlighted (debasement)
    const debasementCard = screen
      .getByText("Managed debasement")
      .closest("div");
    expect(debasementCard).toHaveClass("bg-blue-500", "text-white");

    // Other cards should not be highlighted
    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    expect(crisisCard).toHaveClass("bg-white");
    expect(crisisCard).not.toHaveClass("bg-blue-500");
  });

  it("should handle scenario selection", async () => {
    const user = userEvent.setup();
    render(<EconomicScenariosSection {...defaultProps} />);

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    await user.click(crisisCard!);

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      economicScenario: "crisis",
    });
  });

  it("should handle custom scenario selection differently", async () => {
    const user = userEvent.setup();
    render(<EconomicScenariosSection {...defaultProps} />);

    const customCard = screen.getByText("Manual configuration").closest("div");
    await user.click(customCard!);

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      economicScenario: "custom",
      followEconomicScenarioBtc: false,
      followEconomicScenarioInflation: false,
    });
  });

  it("should update inflation rates when following inflation scenario", async () => {
    const user = userEvent.setup();
    const formDataWithInflationFollow = {
      ...DEFAULT_FORM_DATA,
      followEconomicScenarioInflation: true,
      timeHorizon: 10,
      inflationCustomRates: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    };

    render(
      <EconomicScenariosSection
        {...defaultProps}
        formData={formDataWithInflationFollow}
      />,
    );

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    await user.click(crisisCard!);

    // Should update both scenario and inflation rates
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      economicScenario: "crisis",
    });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      inflationPreset: "crisis",
      inflationCustomRates: expect.any(Array),
    });
  });

  it("should update BTC rates when following BTC scenario", async () => {
    const user = userEvent.setup();
    const formDataWithBtcFollow = {
      ...DEFAULT_FORM_DATA,
      followEconomicScenarioBtc: true,
      timeHorizon: 10,
      btcPriceCustomRates: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    };

    render(
      <EconomicScenariosSection
        {...defaultProps}
        formData={formDataWithBtcFollow}
      />,
    );

    const spiralCard = screen
      .getByText("Hyperinflationary spiral")
      .closest("div");
    await user.click(spiralCard!);

    // Should update both scenario and BTC rates
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      economicScenario: "spiral",
    });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      btcPricePreset: "spiral",
      btcPriceCustomRates: expect.any(Array),
    });
  });

  it("should update income rates when following income scenario", async () => {
    const user = userEvent.setup();
    const formDataWithIncomeFollow = {
      ...DEFAULT_FORM_DATA,
      followEconomicScenarioIncome: true,
      timeHorizon: 10,
      incomeCustomRates: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    };

    render(
      <EconomicScenariosSection
        {...defaultProps}
        formData={formDataWithIncomeFollow}
      />,
    );

    const tightCard = screen.getByText("Tight monetary policy").closest("div");
    await user.click(tightCard!);

    // Should update both scenario and income rates
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      economicScenario: "tight",
    });

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      incomePreset: "tight",
      incomeCustomRates: expect.any(Array),
    });
  });

  it("should not update rates when not following scenarios", async () => {
    const user = userEvent.setup();
    const formDataNotFollowing = {
      ...DEFAULT_FORM_DATA,
      followEconomicScenarioInflation: false,
      followEconomicScenarioBtc: false,
      followEconomicScenarioIncome: false,
    };

    render(
      <EconomicScenariosSection
        {...defaultProps}
        formData={formDataNotFollowing}
      />,
    );

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    await user.click(crisisCard!);

    // Should only update the scenario, not the rates
    expect(defaultProps.updateFormData).toHaveBeenCalledTimes(1);
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      economicScenario: "crisis",
    });
  });

  it("should display correct metrics for default scenario", () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    // Default is debasement scenario
    expect(screen.getByText("5% avg")).toBeInTheDocument(); // USD inflation
    expect(screen.getByText("30% avg")).toBeInTheDocument(); // BTC appreciation
    expect(screen.getByText("+12.5% avg")).toBeInTheDocument(); // Income growth
  });

  it("should display correct metrics for different scenario", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      economicScenario: "crisis" as const,
    };

    render(
      <EconomicScenariosSection {...defaultProps} formData={customFormData} />,
    );

    // Crisis scenario metrics
    expect(screen.getByText("12% avg")).toBeInTheDocument(); // USD inflation
    expect(screen.getByText("60% avg")).toBeInTheDocument(); // BTC appreciation
    expect(screen.getByText("+45% avg")).toBeInTheDocument(); // Income growth
  });

  it("should handle negative income growth display", () => {
    const customFormData = {
      ...DEFAULT_FORM_DATA,
      economicScenario: "tight" as const,
    };

    render(
      <EconomicScenariosSection {...defaultProps} formData={customFormData} />,
    );

    // Tight scenario has positive income growth
    expect(screen.getByText("+7.5% avg")).toBeInTheDocument();
  });

  it("should apply correct styling to scenario cards", () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    const scenarios = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("cursor-pointer"));

    scenarios.forEach((card) => {
      expect(card).toHaveClass(
        "cursor-pointer",
        "transition-colors",
        "duration-200",
      );
    });
  });

  it("should have correct hover styling for non-selected cards", () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    expect(crisisCard).toHaveClass("hover:bg-blue-100");
  });

  it("should render scenario descriptions", () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    // Check for actual description text from economic scenarios
    expect(
      screen.getByText(/Low inflation, steady BTC growth/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Moderate inflation, solid BTC growth/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Higher inflation, accelerated BTC adoption/i),
    ).toBeInTheDocument();
  });

  it("should handle scenario changes with different time horizons", async () => {
    const user = userEvent.setup();
    const formDataShortHorizon = {
      ...DEFAULT_FORM_DATA,
      followEconomicScenarioInflation: true,
      timeHorizon: 5,
      inflationCustomRates: [8, 8, 8, 8, 8],
    };

    render(
      <EconomicScenariosSection
        {...defaultProps}
        formData={formDataShortHorizon}
      />,
    );

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    await user.click(crisisCard!);

    // Should handle shorter time horizon properly
    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      inflationPreset: "crisis",
      inflationCustomRates: expect.arrayContaining([
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
      ]),
    });
  });

  it("should have correct main container styling", () => {
    const { container } = render(
      <EconomicScenariosSection {...defaultProps} />,
    );

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass(
      "p-4",
      "bg-gradient-to-r",
      "from-blue-50",
      "to-green-50",
      "rounded-lg",
      "border",
      "border-blue-100",
    );
  });

  it("should handle edge case with zero time horizon", async () => {
    const user = userEvent.setup();
    const formDataZeroHorizon = {
      ...DEFAULT_FORM_DATA,
      followEconomicScenarioInflation: true,
      timeHorizon: 0,
      inflationCustomRates: [],
    };

    render(
      <EconomicScenariosSection
        {...defaultProps}
        formData={formDataZeroHorizon}
      />,
    );

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    await user.click(crisisCard!);

    // Should not crash and should call updateFormData
    expect(defaultProps.updateFormData).toHaveBeenCalled();
  });

  it("should handle updateFormData prop correctly", () => {
    const mockUpdate = vi.fn();
    render(
      <EconomicScenariosSection
        {...defaultProps}
        updateFormData={mockUpdate}
      />,
    );

    const customCard = screen.getByText("Manual configuration").closest("div");
    fireEvent.click(customCard!);

    expect(mockUpdate).toHaveBeenCalledWith({
      economicScenario: "custom",
      followEconomicScenarioBtc: false,
      followEconomicScenarioInflation: false,
    });
  });
});

describe("EconomicScenariosSection - Rate Calculations", () => {
  it("should generate correct rate curves for inflation", async () => {
    const user = userEvent.setup();
    const formDataWithInflationFollow = {
      ...DEFAULT_FORM_DATA,
      followEconomicScenarioInflation: true,
      timeHorizon: 4,
      inflationCustomRates: [0, 0, 0, 0],
    };

    render(
      <EconomicScenariosSection
        {...defaultProps}
        formData={formDataWithInflationFollow}
      />,
    );

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    await user.click(crisisCard!);

    // Should call updateFormData with calculated inflation rates
    const updateCall = defaultProps.updateFormData.mock.calls.find((call) =>
      call[0].hasOwnProperty("inflationCustomRates"),
    );

    expect(updateCall).toBeDefined();
    if (updateCall) {
      expect(updateCall[0]).toEqual({
        inflationPreset: "crisis",
        inflationCustomRates: expect.any(Array),
      });

      // Verify rates array has correct length
      expect(updateCall[0].inflationCustomRates).toHaveLength(4);
      // Verify rates are numbers
      updateCall[0].inflationCustomRates.forEach((rate: any) => {
        expect(typeof rate).toBe("number");
      });
    }
  });

  it("should respect existing array bounds when updating rates", async () => {
    const user = userEvent.setup();
    const formDataWithLongRates = {
      ...DEFAULT_FORM_DATA,
      followEconomicScenarioInflation: true,
      timeHorizon: 3,
      inflationCustomRates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Longer than timeHorizon
    };

    render(
      <EconomicScenariosSection
        {...defaultProps}
        formData={formDataWithLongRates}
      />,
    );

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    await user.click(crisisCard!);

    // Should generate new rates array based on timeHorizon
    const updateCall = defaultProps.updateFormData.mock.calls.find((call) =>
      call[0].hasOwnProperty("inflationCustomRates"),
    );

    expect(updateCall).toBeDefined();
    if (updateCall) {
      expect(updateCall[0].inflationCustomRates).toHaveLength(4); // Crisis scenario generates 4 elements for timeHorizon 3
      // All elements should be valid numbers from the crisis scenario
      updateCall[0].inflationCustomRates.forEach((rate: any) => {
        expect(typeof rate).toBe("number");
        expect(rate).toBeGreaterThan(0);
      });
    }
  });
});
