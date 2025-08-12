import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResponsiveSize } from "./useResponsiveSize";

describe("useResponsiveSize", () => {
  let mockAddEventListener: any;
  let mockRemoveEventListener: any;
  let mockElement: any;

  beforeEach(() => {
    // Mock window event listeners
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();

    Object.defineProperty(window, "addEventListener", {
      writable: true,
      value: mockAddEventListener,
    });

    Object.defineProperty(window, "removeEventListener", {
      writable: true,
      value: mockRemoveEventListener,
    });

    // Mock element with mutable offsetWidth
    mockElement = {
      offsetWidth: 1000,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return default width when no initial width provided", () => {
    const { result } = renderHook(() => useResponsiveSize());

    expect(result.current.containerWidth).toBe(800);
    expect(result.current.containerRef).toBeDefined();
  });

  it("should return custom initial width when provided", () => {
    const { result } = renderHook(() => useResponsiveSize(1200));

    expect(result.current.containerWidth).toBe(1200);
  });

  it("should add resize event listener on mount", () => {
    renderHook(() => useResponsiveSize());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("should remove resize event listener on unmount", () => {
    const { unmount } = renderHook(() => useResponsiveSize());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("should update width when container ref is set", () => {
    const { result } = renderHook(() => useResponsiveSize(500));

    // Initially should be the default
    expect(result.current.containerWidth).toBe(500);

    // Simulate setting the ref
    act(() => {
      (result.current.containerRef as any).current = mockElement;
    });

    // Trigger the resize event to call updateWidth
    act(() => {
      const resizeCallback = mockAddEventListener.mock.calls.find(
        (call: any) => call[0] === "resize",
      )?.[1];
      if (resizeCallback) {
        resizeCallback();
      }
    });

    expect(result.current.containerWidth).toBe(1000);
  });

  it("should handle resize events and update width", () => {
    const { result } = renderHook(() => useResponsiveSize());

    // Set up the container ref
    act(() => {
      (result.current.containerRef as any).current = mockElement;
    });

    // Simulate a resize event
    act(() => {
      // Change the mock element width
      mockElement.offsetWidth = 1400;

      // Find and call the resize handler
      const resizeCallback = mockAddEventListener.mock.calls.find(
        (call: any) => call[0] === "resize",
      )?.[1];
      if (resizeCallback) {
        resizeCallback();
      }
    });

    expect(result.current.containerWidth).toBe(1400);
  });

  it("should not update width when container ref is null", () => {
    const { result } = renderHook(() => useResponsiveSize(600));

    // Ensure ref is null (default state)
    expect(result.current.containerWidth).toBe(600);

    // Trigger resize event
    act(() => {
      const resizeCallback = mockAddEventListener.mock.calls.find(
        (call: any) => call[0] === "resize",
      )?.[1];
      if (resizeCallback) {
        resizeCallback();
      }
    });

    // Width should remain unchanged since ref is null
    expect(result.current.containerWidth).toBe(600);
  });

  it("should handle multiple resize events correctly", () => {
    const { result } = renderHook(() => useResponsiveSize());

    // Set up the container ref
    act(() => {
      (result.current.containerRef as any).current = mockElement;
    });

    const resizeCallback = mockAddEventListener.mock.calls.find(
      (call: any) => call[0] === "resize",
    )?.[1];

    // First resize
    act(() => {
      mockElement.offsetWidth = 900;
      if (resizeCallback) resizeCallback();
    });
    expect(result.current.containerWidth).toBe(900);

    // Second resize
    act(() => {
      mockElement.offsetWidth = 1100;
      if (resizeCallback) resizeCallback();
    });
    expect(result.current.containerWidth).toBe(1100);

    // Third resize
    act(() => {
      mockElement.offsetWidth = 750;
      if (resizeCallback) resizeCallback();
    });
    expect(result.current.containerWidth).toBe(750);
  });

  it("should handle edge case widths", () => {
    const { result } = renderHook(() => useResponsiveSize());

    act(() => {
      (result.current.containerRef as any).current = mockElement;
    });

    const resizeCallback = mockAddEventListener.mock.calls.find(
      (call: any) => call[0] === "resize",
    )?.[1];

    // Very small width
    act(() => {
      mockElement.offsetWidth = 0;
      if (resizeCallback) resizeCallback();
    });
    expect(result.current.containerWidth).toBe(0);

    // Very large width
    act(() => {
      mockElement.offsetWidth = 5000;
      if (resizeCallback) resizeCallback();
    });
    expect(result.current.containerWidth).toBe(5000);
  });
});
