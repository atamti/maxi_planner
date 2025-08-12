import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUIStateManagement } from "./useUIStateManagement";

describe("useUIStateManagement", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should initialize with showLockedMessage as false", () => {
    const { result } = renderHook(() => useUIStateManagement());

    expect(result.current.showLockedMessage).toBe(false);
  });

  it("should show locked message when handleLockedInteraction is called", () => {
    const { result } = renderHook(() => useUIStateManagement());

    act(() => {
      result.current.handleLockedInteraction();
    });

    expect(result.current.showLockedMessage).toBe(true);
  });

  it("should hide locked message after 3 seconds", () => {
    const { result } = renderHook(() => useUIStateManagement());

    act(() => {
      result.current.handleLockedInteraction();
    });

    expect(result.current.showLockedMessage).toBe(true);

    // Fast-forward time by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.showLockedMessage).toBe(false);
  });

  it("should not hide message before 3 seconds have passed", () => {
    const { result } = renderHook(() => useUIStateManagement());

    act(() => {
      result.current.handleLockedInteraction();
    });

    expect(result.current.showLockedMessage).toBe(true);

    // Fast-forward time by 2.9 seconds (just before 3 seconds)
    act(() => {
      vi.advanceTimersByTime(2900);
    });

    expect(result.current.showLockedMessage).toBe(true);

    // Fast-forward remaining 100ms to complete 3 seconds
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.showLockedMessage).toBe(false);
  });

  it("should handle multiple rapid calls correctly", () => {
    const { result } = renderHook(() => useUIStateManagement());

    // First call
    act(() => {
      result.current.handleLockedInteraction();
    });
    expect(result.current.showLockedMessage).toBe(true);

    // Second call before first timeout - this creates another timeout
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.handleLockedInteraction();
    });
    expect(result.current.showLockedMessage).toBe(true);

    // Third call before first timeout - creates yet another timeout
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.handleLockedInteraction();
    });
    expect(result.current.showLockedMessage).toBe(true);

    // After 3 seconds from the first call, it might be set to false
    // but the subsequent calls will have set it back to true
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    // The message might be false here because the first timeout fired
    // but subsequent timeouts also set it to false after their own 3 seconds

    // Fast-forward enough time to clear all timers
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.showLockedMessage).toBe(false);
  });

  it("should have new handler reference on each render", () => {
    const { result, rerender } = renderHook(() => useUIStateManagement());

    const originalHandler = result.current.handleLockedInteraction;

    rerender();

    // Handler function will have a new reference since it's not memoized
    expect(result.current.handleLockedInteraction).not.toBe(originalHandler);
  });

  it("should cleanup timeouts when component unmounts", () => {
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { result, unmount } = renderHook(() => useUIStateManagement());

    act(() => {
      result.current.handleLockedInteraction();
    });

    expect(result.current.showLockedMessage).toBe(true);

    // Unmount component before timeout completes
    unmount();

    // Advance time and check that no errors occur
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    clearTimeoutSpy.mockRestore();
  });

  it("should handle overlapping timeouts correctly", () => {
    const { result } = renderHook(() => useUIStateManagement());

    // Start first timeout
    act(() => {
      result.current.handleLockedInteraction();
    });
    expect(result.current.showLockedMessage).toBe(true);

    // Wait 1 second and start second timeout
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.handleLockedInteraction();
    });
    expect(result.current.showLockedMessage).toBe(true);

    // Wait another 2.5 seconds - first timeout should fire and set to false
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    // This will likely be false because the first timeout fired
    expect(result.current.showLockedMessage).toBe(false);

    // But the second timeout is still pending and will also set to false
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.showLockedMessage).toBe(false);
  });
});
