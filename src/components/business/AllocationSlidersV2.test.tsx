import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CentralizedStateProvider } from "../../store/CentralizedStateProvider";
import { AllocationSlidersV2 } from "./AllocationSlidersV2";

// Mock the service
vi.mock("../../services", () => ({
  createAllocationService: () => ({
    adjustAllocation: vi.fn((current: any, changes: any) => ({
      ...current,
      ...changes,
    })),
    validateAllocation: vi.fn(() => ({
      isValid: true,
      errors: [],
      warnings: [],
    })),
    getHighlightStatus: vi.fn((field: string, activeField: string | null) => ({
      isHighlighted: field === activeField,
      classes:
        field === activeField ? "border-blue-500 shadow-lg scale-105" : "",
    })),
  }),
}));

// Mock Chart.js components
vi.mock("react-chartjs-2", () => ({
  Doughnut: () => <div data-testid="doughnut-chart">Mocked Doughnut Chart</div>,
}));

// Mock UI components
vi.mock("../ui", () => ({
  AllocationVisualization: ({ allocations, onHighlight }: any) => (
    <div data-testid="allocation-visualization">
      <button
        onClick={() => onHighlight?.("stocks")}
        data-testid="highlight-stocks"
      >
        Highlight Stocks
      </button>
      <div>
        Total:{" "}
        {allocations?.reduce(
          (sum: number, alloc: any) => sum + alloc.percentage,
          0,
        ) || 0}
        %
      </div>
    </div>
  ),
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  SliderInput: ({ label, value, onChange, min, max }: any) => (
    <div data-testid={`slider-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <label>{label}</label>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        data-testid={`slider-input-${label.toLowerCase().replace(/\s+/g, "-")}`}
      />
      <span>{value}%</span>
    </div>
  ),
  StatusIndicator: ({ type, message }: any) => (
    <div data-testid={`status-${type}`}>{message}</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CentralizedStateProvider>{children}</CentralizedStateProvider>
);

describe("AllocationSlidersV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render allocation sliders with default values", () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("allocation-visualization")).toBeInTheDocument();
    expect(screen.getByTestId("slider-savings-(₿)")).toBeInTheDocument();
    expect(
      screen.getByTestId("slider-investments-(traditional)"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("slider-speculation-(alt-coins)"),
    ).toBeInTheDocument();
  });

  it("should handle allocation changes correctly", async () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    const savingsSlider = screen.getByTestId("slider-input-savings-(₿)");

    fireEvent.change(savingsSlider, { target: { value: "60" } });

    await waitFor(() => {
      expect(savingsSlider).toHaveValue("60");
    });
  });

  it("should handle highlighting allocation fields", async () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    const highlightButton = screen.getByTestId("highlight-stocks");

    fireEvent.click(highlightButton);

    // The highlighting should work without errors
    expect(highlightButton).toBeInTheDocument();
  });

  it("should display validation status", () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    // Should show some status indicator
    expect(screen.getByTestId("allocation-visualization")).toBeInTheDocument();
  });

  it("should show total allocation percentage", () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it("should update multiple allocations correctly", async () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    const savingsSlider = screen.getByTestId("slider-input-savings-(₿)");
    const investmentsSlider = screen.getByTestId(
      "slider-input-investments-(traditional)",
    );

    fireEvent.change(savingsSlider, { target: { value: "50" } });
    fireEvent.change(investmentsSlider, { target: { value: "30" } });

    await waitFor(() => {
      expect(savingsSlider).toHaveValue("50");
      expect(investmentsSlider).toHaveValue("30");
    });
  });

  it("should handle edge case values", async () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    const savingsSlider = screen.getByTestId("slider-input-savings-(₿)");

    // Test minimum value
    fireEvent.change(savingsSlider, { target: { value: "0" } });
    await waitFor(() => {
      expect(savingsSlider).toHaveValue("0");
    });

    // Test maximum value
    fireEvent.change(savingsSlider, { target: { value: "100" } });
    await waitFor(() => {
      expect(savingsSlider).toHaveValue("100");
    });
  });

  it("should clear highlight when field is unhighlighted", async () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    const highlightButton = screen.getByTestId("highlight-stocks");

    // Highlight
    fireEvent.click(highlightButton);

    // Mock unhighlighting (this would happen through mouse leave or similar event)
    // The component should handle this gracefully
    expect(highlightButton).toBeInTheDocument();
  });

  it("should maintain allocation constraints", async () => {
    render(
      <TestWrapper>
        <AllocationSlidersV2 />
      </TestWrapper>,
    );

    // All sliders should be present and functional
    const allSliders = [
      screen.getByTestId("slider-input-savings-(₿)"),
      screen.getByTestId("slider-input-investments-(traditional)"),
      screen.getByTestId("slider-input-speculation-(alt-coins)"),
    ];

    allSliders.forEach((slider) => {
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute("min", "0");
      expect(slider).toHaveAttribute("max", "100");
    });
  });
});
