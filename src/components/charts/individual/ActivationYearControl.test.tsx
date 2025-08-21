import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormData } from "../../../types";
import { ActivationYearControl } from "./ActivationYearControl";

describe("ActivationYearControl", () => {
  const mockFormData: FormData = {
    // Basic portfolio configuration
    timeHorizon: 20,
    activationYear: 5,
    exchangeRate: 50000,
    priceCrash: 0.8,
    btcStack: 2.5,

    // Portfolio allocations
    savingsPct: 60,
    investmentsPct: 30,
    speculationPct: 10,
    collateralPct: 50,

    // Loan configuration
    ltvRatio: 0.7,
    loanRate: 6,
    loanTermYears: 10,
    interestOnly: false,

    // Yield settings
    investmentsStartYield: 5,
    investmentsEndYield: 7,
    speculationStartYield: 12,
    speculationEndYield: 8,
    incomeYield: 4,
    incomeReinvestmentPct: 80,

    // Income configuration
    incomeAllocationPct: 80,
    startingExpenses: 50000,

    // Economic scenario configuration
    economicScenario: "tight",
    followEconomicScenarioInflation: true,
    followEconomicScenarioBtc: true,
    followEconomicScenarioIncome: true,

    // Inflation settings
    inflationMode: "simple",
    inflationInputType: "flat",
    inflationFlat: 3,
    inflationStart: 2,
    inflationEnd: 4,
    inflationPreset: "tight",
    inflationCustomRates: [],
    inflationManualMode: false,

    // BTC Price settings
    btcPriceMode: "simple",
    btcPriceInputType: "flat",
    btcPriceFlat: 20,
    btcPriceStart: 15,
    btcPriceEnd: 25,
    btcPricePreset: "tight",
    btcPriceCustomRates: [],
    btcPriceManualMode: false,

    // Income settings
    incomeMode: "simple",
    incomeInputType: "flat",
    incomeFlat: 5,
    incomeStart: 3,
    incomeEnd: 7,
    incomePreset: "tight",
    incomeCustomRates: [],
    incomeManualMode: false,

    // Allocation strategy
    enableAnnualReallocation: false,
  };

  const mockOnUpdateFormData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the activation year label with current year", () => {
    render(
      <ActivationYearControl
        formData={mockFormData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    expect(screen.getByText(/📅 ACTIVATION YEAR:/)).toBeInTheDocument();
    expect(screen.getByText(/📅 ACTIVATION YEAR: 5/)).toBeInTheDocument();
  });

  it("should render the range input with correct properties", () => {
    render(
      <ActivationYearControl
        formData={mockFormData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toBeInTheDocument();
    expect(rangeInput).toHaveAttribute("type", "range");
    expect(rangeInput).toHaveAttribute("value", "5");
    expect(rangeInput).toHaveAttribute("min", "0");
    expect(rangeInput).toHaveAttribute("max", "20");
  });

  it("should render the year indicators", () => {
    render(
      <ActivationYearControl
        formData={mockFormData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    expect(screen.getByText("Year 0")).toBeInTheDocument();
    expect(screen.getByText("Year 5 - When income starts")).toBeInTheDocument();
    expect(screen.getByText("Year 20")).toBeInTheDocument();
  });

  it("should call onUpdateFormData when slider value changes", () => {
    render(
      <ActivationYearControl
        formData={mockFormData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    const rangeInput = screen.getByRole("slider");
    fireEvent.change(rangeInput, { target: { value: "8" } });

    expect(mockOnUpdateFormData).toHaveBeenCalledWith({ activationYear: 8 });
  });

  it("should handle minimum activation year (0)", () => {
    const formDataMinYear = { ...mockFormData, activationYear: 0 };

    render(
      <ActivationYearControl
        formData={formDataMinYear}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    expect(screen.getByText(/📅 ACTIVATION YEAR:/)).toBeInTheDocument();
    expect(screen.getByText(/📅 ACTIVATION YEAR: 0/)).toBeInTheDocument();
    expect(screen.getByText("Year 0 - When income starts")).toBeInTheDocument();

    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toHaveAttribute("value", "0");
  });

  it("should handle maximum activation year (time horizon)", () => {
    const formDataMaxYear = { ...mockFormData, activationYear: 20 };

    render(
      <ActivationYearControl
        formData={formDataMaxYear}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    expect(screen.getByText(/📅 ACTIVATION YEAR:/)).toBeInTheDocument();
    expect(screen.getByText(/📅 ACTIVATION YEAR: 20/)).toBeInTheDocument();
    expect(
      screen.getByText("Year 20 - When income starts"),
    ).toBeInTheDocument();

    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toHaveAttribute("value", "20");
  });

  it("should work without onUpdateFormData callback", () => {
    render(
      <ActivationYearControl
        formData={mockFormData}
        onUpdateFormData={undefined}
      />,
    );

    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toBeInTheDocument();

    // Should not throw error when changing without callback
    expect(() => {
      fireEvent.change(rangeInput, { target: { value: "10" } });
    }).not.toThrow();
  });

  it("should have proper component structure and styling", () => {
    const { container } = render(
      <ActivationYearControl
        formData={mockFormData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      "mb-6",
      "p-4",
      "card-themed",
      "border",
      "border-bitcoin-orange",
    );

    const label = screen.getByText(/📅 ACTIVATION YEAR:/);
    expect(label).toHaveClass("block", "font-medium", "mb-2", "text-lg");

    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toHaveClass(
      "w-full",
      "h-2",
      "bg-surface",
      "border",
      "appearance-none",
      "cursor-pointer",
    );
  });

  it("should handle different time horizons correctly", () => {
    const shortTimeHorizonData = {
      ...mockFormData,
      timeHorizon: 5,
      activationYear: 3,
    };

    render(
      <ActivationYearControl
        formData={shortTimeHorizonData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    expect(screen.getByText("Year 5")).toBeInTheDocument();
    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toHaveAttribute("max", "5");
  });

  it("should handle long time horizons correctly", () => {
    const longTimeHorizonData = {
      ...mockFormData,
      timeHorizon: 50,
      activationYear: 25,
    };

    render(
      <ActivationYearControl
        formData={longTimeHorizonData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    expect(screen.getByText(/📅 ACTIVATION YEAR:/)).toBeInTheDocument();
    expect(screen.getByText(/📅 ACTIVATION YEAR: 25/)).toBeInTheDocument();
    expect(screen.getByText("Year 50")).toBeInTheDocument();

    const rangeInput = screen.getByRole("slider");
    expect(rangeInput).toHaveAttribute("max", "50");
    expect(rangeInput).toHaveAttribute("value", "25");
  });

  it("should handle slider changes to edge values", () => {
    render(
      <ActivationYearControl
        formData={mockFormData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    const rangeInput = screen.getByRole("slider");

    // Test changing to minimum
    fireEvent.change(rangeInput, { target: { value: "0" } });
    expect(mockOnUpdateFormData).toHaveBeenCalledWith({ activationYear: 0 });

    // Test changing to maximum
    fireEvent.change(rangeInput, { target: { value: "20" } });
    expect(mockOnUpdateFormData).toHaveBeenCalledWith({ activationYear: 20 });
  });

  it("should render helper text correctly", () => {
    render(
      <ActivationYearControl
        formData={mockFormData}
        onUpdateFormData={mockOnUpdateFormData}
      />,
    );

    const helperDiv = screen.getByText("Year 0").closest("div");
    expect(helperDiv).toHaveClass(
      "flex",
      "justify-between",
      "text-sm",
      "text-secondary",
      "mt-2",
      "font-mono",
    );

    const middleText = screen.getByText("Year 5 - When income starts");
    expect(middleText).toHaveClass("font-medium");
  });
});
