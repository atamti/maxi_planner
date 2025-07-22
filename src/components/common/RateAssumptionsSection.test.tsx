import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FormData } from "../../types";
import { RateAssumptionsSection } from "./RateAssumptionsSection";

// Mock the DraggableRateChart component
vi.mock("../charts/DraggableRateChart", () => ({
  DraggableRateChart: ({
    title,
    data,
    onChange,
    onStartDrag,
    readOnly,
  }: any) => (
    <div data-testid="draggable-rate-chart">
      <div data-testid="chart-title">{title}</div>
      <div data-testid="chart-readonly">{readOnly?.toString()}</div>
      <button data-testid="chart-change" onClick={() => onChange([10, 15, 20])}>
        Change Data
      </button>
      <button data-testid="chart-drag-start" onClick={() => onStartDrag()}>
        Start Drag
      </button>
    </div>
  ),
}));

const mockFormData: FormData = {
  btcStack: 5,
  savingsPct: 65,
  investmentsPct: 25,
  speculationPct: 10,
  collateralPct: 50,
  loanRate: 7,
  loanTermYears: 10,
  interestOnly: true,
  ltvRatio: 40,
  investmentsStartYield: 30,
  investmentsEndYield: 0,
  speculationStartYield: 40,
  speculationEndYield: 0,
  priceCrash: 0,
  exchangeRate: 100000,
  timeHorizon: 20,
  activationYear: 10,
  economicScenario: "debasement",
  followEconomicScenarioInflation: true,
  followEconomicScenarioBtc: true,
  inflationMode: "simple",
  inflationInputType: "preset",
  inflationFlat: 8,
  inflationStart: 5,
  inflationEnd: 15,
  inflationPreset: "debasement",
  inflationCustomRates: Array(30).fill(8),
  inflationManualMode: false,
  btcPriceMode: "simple",
  btcPriceInputType: "preset",
  btcPriceFlat: 50,
  btcPriceStart: 30,
  btcPriceEnd: 70,
  btcPricePreset: "debasement",
  btcPriceCustomRates: Array(30).fill(50),
  btcPriceManualMode: false,
  incomeYield: 8,
  incomeAllocationPct: 10,
  incomeReinvestmentPct: 30,
  startingExpenses: 50000,
  followEconomicScenarioIncome: true,
  incomeMode: "simple",
  incomeInputType: "preset",
  incomeFlat: 8,
  incomeStart: 8,
  incomeEnd: 8,
  incomePreset: "debasement",
  incomeCustomRates: Array(30).fill(8),
  incomeManualMode: false,
};

const mockInflationConfig = {
  title: "Inflation Rate",
  emoji: "📈",
  colorClass: {
    background: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
  },
  dataKey: "inflationCustomRates" as keyof FormData,
  flatRateKey: "inflationFlat" as keyof FormData,
  startRateKey: "inflationStart" as keyof FormData,
  endRateKey: "inflationEnd" as keyof FormData,
  inputTypeKey: "inflationInputType" as keyof FormData,
  manualModeKey: "inflationManualMode" as keyof FormData,
  followScenarioKey: "followEconomicScenarioInflation" as keyof FormData,
  presetKey: "inflationPreset" as keyof FormData,
  maxValue: 50,
  yAxisLabel: "Inflation Rate (%)",
  unit: "%",
};

const mockEconomicScenarios = {
  debasement: {
    name: "Currency Debasement",
    startRate: 5,
    endRate: 15,
  },
  hyperinflation: {
    name: "Hyperinflation",
    startRate: 15,
    endRate: 50,
  },
  custom: {
    inflation: { startRate: 3, endRate: 6 },
    btcPrice: { startRate: 20, endRate: 30 },
  },
};

const mockPresetScenarios = {
  conservative: {
    name: "Conservative",
    startRate: 20,
    endRate: 30,
  },
  aggressive: {
    name: "Aggressive",
    startRate: 40,
    endRate: 60,
  },
};

describe("RateAssumptionsSection", () => {
  const mockUpdateFormData = vi.fn();

  beforeEach(() => {
    mockUpdateFormData.mockClear();
  });

  describe("Basic Rendering", () => {
    it("should render with title and emoji", () => {
      render(
        <RateAssumptionsSection
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
          economicScenarios={mockEconomicScenarios}
          presetScenarios={mockEconomicScenarios}
        />,
      );

      expect(screen.getByText("📈 Inflation Rate")).toBeInTheDocument();
    });

    it("should render DraggableRateChart with correct props", () => {
      render(
        <RateAssumptionsSection
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      expect(screen.getByTestId("draggable-rate-chart")).toBeInTheDocument();
      expect(screen.getByTestId("chart-title")).toHaveTextContent(
        "📈 Inflation Rate Chart",
      );
      expect(screen.getByTestId("chart-readonly")).toHaveTextContent("true");
    });

    it("should render growth scenario dropdown when not following scenario and input type is preset", () => {
      render(
        <RateAssumptionsSection
          formData={{
            ...mockFormData,
            followEconomicScenarioInflation: false,
            inflationInputType: "preset",
          }}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
          presetScenarios={mockPresetScenarios}
        />,
      );

      expect(screen.getAllByRole("combobox")).toHaveLength(2); // Input type dropdown and scenario dropdown
    });

    it("should render custom configuration options when not following scenario", () => {
      render(
        <RateAssumptionsSection
          formData={{
            ...mockFormData,
            followEconomicScenarioInflation: false,
          }}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      expect(screen.getByText("Flat Rate")).toBeInTheDocument();
    });
  });

  describe("Follow Scenario Toggle", () => {
    it("should render follow scenario toggle when followScenarioKey is provided", () => {
      render(
        <RateAssumptionsSection
          formData={mockFormData}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      expect(screen.getByText("Follow scenario")).toBeInTheDocument();
    });

    it("should handle follow scenario toggle change", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <RateAssumptionsSection
          formData={{ ...mockFormData, followEconomicScenarioInflation: false }}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      // Click the label that corresponds to the scenario toggle
      const scenarioToggleLabel = document.querySelector(
        'label[for="inflationCustomRates-follow-scenario-toggle"]',
      );
      if (scenarioToggleLabel) {
        await user.click(scenarioToggleLabel);
      }

      expect(mockUpdateFormData).toHaveBeenCalled();
    });
  });

  describe("Scenario Selection", () => {
    it("should handle custom flat rate selection", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <RateAssumptionsSection
          formData={{
            ...mockFormData,
            followEconomicScenarioInflation: false,
            inflationManualMode: false,
          }}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
          economicScenarios={mockEconomicScenarios}
        />,
      );

      const dropdowns = screen.getAllByRole("combobox");
      const dropdown = dropdowns.length > 1 ? dropdowns[1] : dropdowns[0]; // Select the input type dropdown if available
      await user.selectOptions(dropdown, "flat");

      expect(mockUpdateFormData).toHaveBeenCalled();
    });
  });

  describe("Locked State Behavior", () => {
    it("should not show input controls when following scenario", () => {
      render(
        <RateAssumptionsSection
          formData={{
            ...mockFormData,
            followEconomicScenarioInflation: true,
          }}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      // When following scenario, input type dropdown should not be present
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      // Flat Rate option should not be present
      expect(screen.queryByText("Flat Rate")).not.toBeInTheDocument();
    });

    it("should show appropriate locked state description", () => {
      render(
        <RateAssumptionsSection
          formData={{
            ...mockFormData,
            followEconomicScenarioInflation: true,
          }}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      expect(
        screen.getByText(/Settings are controlled by the selected scenario/),
      ).toBeInTheDocument();
    });
  });

  describe("Chart Interaction", () => {
    it("should handle chart data change", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <RateAssumptionsSection
          formData={{
            ...mockFormData,
            followEconomicScenarioInflation: false,
            inflationManualMode: true,
          }}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      const changeButton = screen.getByTestId("chart-change");
      await user.click(changeButton);

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        inflationCustomRates: [10, 15, 20],
      });
    });

    it("should handle chart drag start", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <RateAssumptionsSection
          formData={{
            ...mockFormData,
            followEconomicScenarioInflation: true,
            inflationManualMode: false,
          }}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      const dragButton = screen.getByTestId("chart-drag-start");
      await user.click(dragButton);

      // Check that mockUpdateFormData was called multiple times with the right updates
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioInflation: false,
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        inflationInputType: "manual",
        inflationManualMode: true,
      });
    });
  });

  describe("Average Rate Calculation", () => {
    it("should calculate and display average rate correctly", () => {
      const customRatesData = {
        ...mockFormData,
        inflationCustomRates: [5, 10, 15, 20, 25], // Average = 15
        timeHorizon: 5,
        followEconomicScenarioInflation: true,
      };

      render(
        <RateAssumptionsSection
          formData={customRatesData}
          updateFormData={mockUpdateFormData}
          config={mockInflationConfig}
        />,
      );

      expect(screen.getByText(/15% average rate/)).toBeInTheDocument();
    });
  });
});
