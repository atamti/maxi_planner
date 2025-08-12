import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAllocationHighlight } from "./useAllocationHighlight";

describe("useAllocationHighlight", () => {
  it("should initialize with no highlighted field", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    expect(result.current.highlightField).toBeNull();
  });

  it("should set highlight field correctly", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    act(() => {
      result.current.setHighlightField("savings");
    });

    expect(result.current.highlightField).toBe("savings");
  });

  it("should return correct highlight classes for highlighted field", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    act(() => {
      result.current.setHighlightField("savings");
    });

    const classes = result.current.getHighlightClasses("savings");
    expect(classes).toBe("ring-2 ring-yellow-400 rounded-lg p-2");
  });

  it("should return empty string for non-highlighted field", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    act(() => {
      result.current.setHighlightField("savings");
    });

    const classes = result.current.getHighlightClasses("investments");
    expect(classes).toBe("");
  });

  it("should return correct isHighlighted status for highlighted field", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    act(() => {
      result.current.setHighlightField("savings");
    });

    expect(result.current.isHighlighted("savings")).toBe(true);
    expect(result.current.isHighlighted("investments")).toBe(false);
  });

  it("should handle null highlight field correctly", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    expect(result.current.isHighlighted("savings")).toBe(false);
    expect(result.current.getHighlightClasses("savings")).toBe("");
  });

  it("should allow clearing the highlight field", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    act(() => {
      result.current.setHighlightField("savings");
    });

    expect(result.current.isHighlighted("savings")).toBe(true);

    act(() => {
      result.current.setHighlightField(null);
    });

    expect(result.current.isHighlighted("savings")).toBe(false);
    expect(result.current.highlightField).toBeNull();
  });

  it("should handle switching between fields", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    act(() => {
      result.current.setHighlightField("savings");
    });

    expect(result.current.isHighlighted("savings")).toBe(true);
    expect(result.current.isHighlighted("investments")).toBe(false);

    act(() => {
      result.current.setHighlightField("investments");
    });

    expect(result.current.isHighlighted("savings")).toBe(false);
    expect(result.current.isHighlighted("investments")).toBe(true);
  });

  it("should handle any string field name", () => {
    const { result } = renderHook(() => useAllocationHighlight());

    act(() => {
      result.current.setHighlightField("customField");
    });

    expect(result.current.isHighlighted("customField")).toBe(true);
    expect(result.current.getHighlightClasses("customField")).toBe(
      "ring-2 ring-yellow-400 rounded-lg p-2",
    );
  });

  it("should maintain referential stability of functions", () => {
    const { result, rerender } = renderHook(() => useAllocationHighlight());

    const firstRenderFunctions = {
      getHighlightClasses: result.current.getHighlightClasses,
      isHighlighted: result.current.isHighlighted,
    };

    rerender();

    expect(result.current.getHighlightClasses).toBe(
      firstRenderFunctions.getHighlightClasses,
    );
    expect(result.current.isHighlighted).toBe(
      firstRenderFunctions.isHighlighted,
    );
  });
});
