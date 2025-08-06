import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAllocationColors } from "./useAllocationColors";

describe("useAllocationColors", () => {
  it("should return bar color functions", () => {
    const { result } = renderHook(() => useAllocationColors());

    expect(result.current.getBarColor).toBeInstanceOf(Function);
    expect(result.current.getIndicatorColor).toBeInstanceOf(Function);
  });

  describe("getBarColor", () => {
    it("should return correct base colors when not highlighted", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getBarColor } = result.current;

      expect(getBarColor("savings", false)).toBe("bg-green-500");
      expect(getBarColor("investments", false)).toBe("bg-blue-500");
      expect(getBarColor("speculation", false)).toBe("bg-red-500");
    });

    it("should return correct highlight colors when highlighted", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getBarColor } = result.current;

      expect(getBarColor("savings", true)).toBe("bg-green-600");
      expect(getBarColor("investments", true)).toBe("bg-blue-600");
      expect(getBarColor("speculation", true)).toBe("bg-red-600");
    });

    it("should return different colors for highlighted vs non-highlighted states", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getBarColor } = result.current;

      // Each category should have different colors for highlighted vs non-highlighted
      expect(getBarColor("savings", false)).not.toBe(
        getBarColor("savings", true),
      );
      expect(getBarColor("investments", false)).not.toBe(
        getBarColor("investments", true),
      );
      expect(getBarColor("speculation", false)).not.toBe(
        getBarColor("speculation", true),
      );
    });

    it("should return consistent results for the same inputs", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getBarColor } = result.current;

      // Should return the same result for identical calls
      expect(getBarColor("savings", false)).toBe(getBarColor("savings", false));
      expect(getBarColor("investments", true)).toBe(
        getBarColor("investments", true),
      );
    });
  });

  describe("getIndicatorColor", () => {
    it("should return correct indicator colors for each category", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getIndicatorColor } = result.current;

      expect(getIndicatorColor("savings")).toBe("bg-green-500");
      expect(getIndicatorColor("investments")).toBe("bg-blue-500");
      expect(getIndicatorColor("speculation")).toBe("bg-red-500");
    });

    it("should return consistent results for the same category", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getIndicatorColor } = result.current;

      // Should return the same result for identical calls
      expect(getIndicatorColor("savings")).toBe(getIndicatorColor("savings"));
      expect(getIndicatorColor("investments")).toBe(
        getIndicatorColor("investments"),
      );
      expect(getIndicatorColor("speculation")).toBe(
        getIndicatorColor("speculation"),
      );
    });

    it("should return different colors for different categories", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getIndicatorColor } = result.current;

      const savingsColor = getIndicatorColor("savings");
      const investmentsColor = getIndicatorColor("investments");
      const speculationColor = getIndicatorColor("speculation");

      // All colors should be different
      expect(savingsColor).not.toBe(investmentsColor);
      expect(investmentsColor).not.toBe(speculationColor);
      expect(savingsColor).not.toBe(speculationColor);
    });

    it("should match base colors from getBarColor", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getBarColor, getIndicatorColor } = result.current;

      // Indicator colors should match non-highlighted bar colors
      expect(getIndicatorColor("savings")).toBe(getBarColor("savings", false));
      expect(getIndicatorColor("investments")).toBe(
        getBarColor("investments", false),
      );
      expect(getIndicatorColor("speculation")).toBe(
        getBarColor("speculation", false),
      );
    });
  });

  describe("function stability", () => {
    it("should return stable function references", () => {
      const { result, rerender } = renderHook(() => useAllocationColors());

      const firstGetBarColor = result.current.getBarColor;
      const firstGetIndicatorColor = result.current.getIndicatorColor;

      // Rerender the hook
      rerender();

      const secondGetBarColor = result.current.getBarColor;
      const secondGetIndicatorColor = result.current.getIndicatorColor;

      // Function references should be stable due to useCallback
      expect(firstGetBarColor).toBe(secondGetBarColor);
      expect(firstGetIndicatorColor).toBe(secondGetIndicatorColor);
    });
  });

  describe("color consistency", () => {
    it("should use consistent color palette", () => {
      const { result } = renderHook(() => useAllocationColors());
      const { getBarColor, getIndicatorColor } = result.current;

      // All colors should follow the same naming pattern
      expect(getIndicatorColor("savings")).toMatch(/^bg-green-\d+$/);
      expect(getIndicatorColor("investments")).toMatch(/^bg-blue-\d+$/);
      expect(getIndicatorColor("speculation")).toMatch(/^bg-red-\d+$/);

      // Highlighted colors should be darker (higher number)
      expect(getBarColor("savings", true)).toMatch(/^bg-green-[6-9]\d*$/);
      expect(getBarColor("investments", true)).toMatch(/^bg-blue-[6-9]\d*$/);
      expect(getBarColor("speculation", true)).toMatch(/^bg-red-[6-9]\d*$/);
    });
  });
});
