import { act, renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { CentralizedStateProvider } from "../store";
import { useAllocationSystem } from "./useAllocationSystem";

// Wrapper component for testing hooks that use context
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(CentralizedStateProvider, { children });

describe("useAllocationSystem", () => {
  it("should return default allocation percentages", () => {
    const { result } = renderHook(() => useAllocationSystem(), { wrapper });

    expect(result.current.savingsPct).toBe(65);
    expect(result.current.investmentsPct).toBe(25);
    expect(result.current.speculationPct).toBe(10);
    expect(result.current.totalAllocation).toBe(100);
    expect(result.current.isValid).toBe(true);
  });

  it("should update allocation and maintain constraints", () => {
    const { result } = renderHook(
      () => useAllocationSystem({ minThreshold: 5 }),
      { wrapper },
    );

    // Update savings allocation
    act(() => {
      result.current.handleAllocationChange("savings", 80);
    });

    // Check that allocations still sum to 100 and respect minimums
    const { savingsPct, investmentsPct, speculationPct, totalAllocation } =
      result.current;
    expect(totalAllocation).toBe(100);
    expect(savingsPct).toBe(80);
    expect(investmentsPct).toBeGreaterThanOrEqual(5);
    expect(speculationPct).toBeGreaterThanOrEqual(5);
  });

  it("should provide color utilities", () => {
    const { result } = renderHook(() => useAllocationSystem(), { wrapper });

    expect(result.current.getBarColor("savings", false)).toBe("bg-green-500");
    expect(result.current.getBarColor("savings", true)).toBe("bg-green-600");
    expect(result.current.getIndicatorColor("investments")).toBe("bg-blue-500");
  });

  it("should handle highlighting", () => {
    const { result } = renderHook(() => useAllocationSystem(), { wrapper });

    expect(result.current.isHighlighted("savings")).toBe(false);
    expect(result.current.getHighlightClasses("savings")).toContain(
      "transition-all",
    );

    act(() => {
      result.current.setHighlightField("savings");
    });

    expect(result.current.isHighlighted("savings")).toBe(true);
    expect(result.current.getHighlightClasses("savings")).toContain("ring-2");
  });

  it("should format percentages correctly", () => {
    const { result } = renderHook(() => useAllocationSystem(), { wrapper });

    expect(result.current.getFormattedPercentage(65)).toBe("65");
    expect(result.current.getFormattedTotal()).toBe("100%");
  });

  it("should validate form states", () => {
    const { result } = renderHook(
      () => useAllocationSystem({ minThreshold: 10 }),
      { wrapper },
    );

    expect(result.current.savingsState.isValid).toBe(true); // 65 >= 10
    expect(result.current.investmentsState.isValid).toBe(true); // 25 >= 10
  });

  it("should handle validation errors", () => {
    const { result } = renderHook(
      () => useAllocationSystem({ minThreshold: 50 }),
      { wrapper },
    );

    // Some allocations will be below the 50% threshold
    expect(result.current.hasValidationErrors).toBe(true);
  });
});
