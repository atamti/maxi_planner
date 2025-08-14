import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import economicScenarios from "../../config/economicScenarios";
import { FormData } from "../../types";
import { RateAssumptionsSection } from "./RateAssumptionsSection";

// Mock the chart components to keep tests focused
vi.mock("../charts/DraggableRateChart", () => ({
  DraggableRateChart: ({ data, onChange, onStartDrag }: any) => (
    <div data-testid="draggable-rate-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <button
        data-testid="simulate-chart-change"
        onClick={() => onChange([8, 8, 8, 8, 8])}
      >
        Simulate Chart Change
      </button>
      <button data-testid="simulate-drag-start" onClick={() => onStartDrag()}>
        Simulate Drag Start
      </button>
    </div>
  ),
}));

vi.mock("../../hooks/useScenarioManagement", () => ({
  useScenarioManagement: () => ({
    handleScenarioChange: vi.fn(),
    handleScenarioToggle: vi.fn(),
    handleIncomeScenarioSync: vi.fn(),
  }),
}));

vi.mock("../../hooks/useUIStateManagement", () => ({
  useUIStateManagement: () => ({
    showLockedMessage: false,
    handleLockedInteraction: vi.fn(),
  }),
}));

const createMockFormData = (overrides: Partial<FormData> = {}): FormData => ({
  timeHorizon: 5,
  economicScenario: "custom",
  exchangeRate: 1,
  priceCrash: 80,
  savingsPct: 25,
  investmentsPct: 50,
  speculationPct: 25,
  collateralPct: 60,
  loanRate: 8,
  loanTermYears: 10,
  interestOnly: false,
  ltvRatio: 50,
  incomeAllocationPct: 25,
  incomeReinvestmentPct: 80,
  activationYear: 2,
  startingExpenses: 50000,
  followEconomicScenarioIncome: false,
  incomeMode: "simple",
  incomeInputType: "flat",
  incomePreset: "custom",
  incomeFlat: 5,
  incomeStart: 5,
  incomeEnd: 8,
  incomeCustomRates: [5, 5, 5, 5, 5],
  incomeManualMode: false,
  btcStack: 100000,
  inflationCustomRates: [3, 3, 3, 3, 3],
  btcPriceCustomRates: [20, 20, 20, 20, 20],
  inflationMode: "simple",
  inflationInputType: "preset",
  inflationPreset: "tight",
  inflationFlat: 3,
  inflationStart: 3,
  inflationEnd: 3,
  inflationManualMode: false,
  followEconomicScenarioInflation: true,
  btcPriceMode: "simple",
  btcPriceInputType: "preset",
  btcPricePreset: "tight",
  btcPriceFlat: 20,
  btcPriceStart: 20,
  btcPriceEnd: 20,
  btcPriceManualMode: false,
  followEconomicScenarioBtc: true,
  investmentsStartYield: 15,
  investmentsEndYield: 8,
  speculationStartYield: 25,
  speculationEndYield: 12,
  incomeYield: 8,
  ...overrides,
});

describe("RateAssumptionsSection - Chart Update Integration", () => {
  let mockFormData: FormData;
  let mockUpdateFormData: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFormData = createMockFormData();
    mockUpdateFormData = vi.fn((updates) => {
      Object.assign(mockFormData, updates);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should automatically update chart when flat rate changes", async () => {
    const config = {
      title: "Income Yield Assumptions",
      emoji: "📈",
      colorClass: {
        background: "bg-gray-50",
        border: "border-gray-400",
        text: "text-gray-800",
      },
      dataKey: "incomeCustomRates" as keyof FormData,
      flatRateKey: "incomeFlat" as keyof FormData,
      startRateKey: "incomeStart" as keyof FormData,
      endRateKey: "incomeEnd" as keyof FormData,
      inputTypeKey: "incomeInputType" as keyof FormData,
      manualModeKey: "incomeManualMode" as keyof FormData,
      followScenarioKey: "followEconomicScenarioIncome" as keyof FormData,
      presetKey: "incomePreset" as keyof FormData,
      maxValue: 50,
      yAxisLabel: "Income Yield (% annually)",
      unit: "%",
    };

    // Create preset scenarios for income
    const presetScenarios: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      presetScenarios[key] = scenario.incomeYield;
    });

    const { rerender } = render(
      <RateAssumptionsSection
        formData={mockFormData}
        updateFormData={mockUpdateFormData}
        config={config}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
        dropdownPresets={presetScenarios}
      />,
    );

    // Verify initial state
    expect(screen.getByTestId("chart-data")).toHaveTextContent(
      JSON.stringify([5, 5, 5, 5, 5]),
    );

    // Change the flat rate
    const newFormData = { ...mockFormData, incomeFlat: 10 };
    rerender(
      <RateAssumptionsSection
        formData={newFormData}
        updateFormData={mockUpdateFormData}
        config={config}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
        dropdownPresets={presetScenarios}
      />,
    );

    // Wait for the useEffect to trigger and update the chart
    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          incomeCustomRates: expect.arrayContaining([10, 10, 10, 10, 10]),
        }),
      );
    });
  });

  it("should automatically update chart when switching from preset to linear", async () => {
    const initialFormData = createMockFormData({
      incomeInputType: "preset",
      incomePreset: "tight",
      incomeCustomRates: [5, 5, 5, 5, 5], // tight scenario values
    });

    const config = {
      title: "Income Yield Assumptions",
      emoji: "📈",
      colorClass: {
        background: "bg-gray-50",
        border: "border-gray-400",
        text: "text-gray-800",
      },
      dataKey: "incomeCustomRates" as keyof FormData,
      flatRateKey: "incomeFlat" as keyof FormData,
      startRateKey: "incomeStart" as keyof FormData,
      endRateKey: "incomeEnd" as keyof FormData,
      inputTypeKey: "incomeInputType" as keyof FormData,
      manualModeKey: "incomeManualMode" as keyof FormData,
      followScenarioKey: "followEconomicScenarioIncome" as keyof FormData,
      presetKey: "incomePreset" as keyof FormData,
      maxValue: 50,
      yAxisLabel: "Income Yield (% annually)",
      unit: "%",
    };

    const presetScenarios: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      presetScenarios[key] = scenario.incomeYield;
    });

    const { rerender } = render(
      <RateAssumptionsSection
        formData={initialFormData}
        updateFormData={mockUpdateFormData}
        config={config}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
        dropdownPresets={presetScenarios}
      />,
    );

    // Switch to linear mode
    const linearFormData = {
      ...initialFormData,
      incomeInputType: "linear" as const,
      incomePreset: "custom" as const,
      incomeStart: 3,
      incomeEnd: 12,
    };

    rerender(
      <RateAssumptionsSection
        formData={linearFormData}
        updateFormData={mockUpdateFormData}
        config={config}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
        dropdownPresets={presetScenarios}
      />,
    );

    // Wait for the useEffect to trigger and update the chart with linear progression
    await waitFor(() => {
      expect(mockUpdateFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          incomeCustomRates: expect.any(Array),
        }),
      );
    });

    // Verify that the rates have been updated (any length is fine for this test)
    const lastCall =
      mockUpdateFormData.mock.calls[mockUpdateFormData.mock.calls.length - 1];
    const updatedRates = lastCall[0].incomeCustomRates;
    expect(updatedRates.length).toBeGreaterThan(0);
    expect(updatedRates[0]).toBe(3);
    expect(updatedRates[updatedRates.length - 1]).toBe(12);
  });

  it("should not auto-update when in manual mode", async () => {
    const manualFormData = createMockFormData({
      incomeInputType: "flat",
      incomeFlat: 5,
      incomeManualMode: true, // Manual mode enabled
      incomeCustomRates: [5, 5, 5, 5, 5],
    });

    const config = {
      title: "Income Yield Assumptions",
      emoji: "📈",
      colorClass: {
        background: "bg-gray-50",
        border: "border-gray-400",
        text: "text-gray-800",
      },
      dataKey: "incomeCustomRates" as keyof FormData,
      flatRateKey: "incomeFlat" as keyof FormData,
      startRateKey: "incomeStart" as keyof FormData,
      endRateKey: "incomeEnd" as keyof FormData,
      inputTypeKey: "incomeInputType" as keyof FormData,
      manualModeKey: "incomeManualMode" as keyof FormData,
      followScenarioKey: "followEconomicScenarioIncome" as keyof FormData,
      presetKey: "incomePreset" as keyof FormData,
      maxValue: 50,
      yAxisLabel: "Income Yield (% annually)",
      unit: "%",
    };

    const presetScenarios: Record<string, any> = {};
    Object.entries(economicScenarios).forEach(([key, scenario]) => {
      presetScenarios[key] = scenario.incomeYield;
    });

    const { rerender } = render(
      <RateAssumptionsSection
        formData={manualFormData}
        updateFormData={mockUpdateFormData}
        config={config}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
        dropdownPresets={presetScenarios}
      />,
    );

    // Clear any initial calls
    mockUpdateFormData.mockClear();

    // Change the flat rate - this should NOT trigger an auto-update since we're in manual mode
    const newFormData = { ...manualFormData, incomeFlat: 10 };
    rerender(
      <RateAssumptionsSection
        formData={newFormData}
        updateFormData={mockUpdateFormData}
        config={config}
        economicScenarios={economicScenarios}
        presetScenarios={presetScenarios}
        dropdownPresets={presetScenarios}
      />,
    );

    // Wait a bit to ensure no update happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not have called updateFormData for chart updates
    expect(mockUpdateFormData).not.toHaveBeenCalled();
  });
});
