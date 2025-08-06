import { act, renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { CentralizedStateProvider } from "../store";
import { useAllocation } from "./useAllocation";

// Wrapper component for testing hooks that use context
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(CentralizedStateProvider, { children });

describe("useAllocation", () => {
  it("should return default allocation percentages", () => {
    const { result } = renderHook(() => useAllocation(), { wrapper });

    expect(result.current.savingsPct).toBe(65);
    expect(result.current.investmentsPct).toBe(25);
    expect(result.current.speculationPct).toBe(10);
    expect(result.current.totalAllocation).toBe(100);
    expect(result.current.isValid).toBe(true);
  });

  it("should update allocation and recalculate totals", () => {
    const { result } = renderHook(() => useAllocation(), { wrapper });

    // Update savings allocation
    act(() => {
      result.current.updateAllocation({ savingsPct: 70 });
    });

    expect(result.current.savingsPct).toBe(70);
    expect(result.current.totalAllocation).toBe(105); // 70 + 25 + 10
    expect(result.current.isValid).toBe(false);
  });

  it("should show allocation error when total is not 100%", () => {
    const { result } = renderHook(() => useAllocation(), { wrapper });

    // Update to create an invalid allocation
    act(() => {
      result.current.updateAllocation({ savingsPct: 70, investmentsPct: 30 });
    });

    expect(result.current.totalAllocation).toBe(110); // 70 + 30 + 10
    expect(result.current.isValid).toBe(false);
    expect(result.current.allocationError).toContain("110%");
  });
});
