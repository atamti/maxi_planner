import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FormData } from "../types";
import { useExchangeRateHandling } from "./useExchangeRateHandling";

describe("useExchangeRateHandling", () => {
  let mockFormData: FormData;
  let mockUpdateFormData: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockUpdateFormData = vi.fn();

    mockFormData = {
      exchangeRate: 50000,
      followEconomicScenarioBtc: false,
      btcPriceManualMode: false,
    } as FormData;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should format numbers with commas for display", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    expect(result.current.formatNumberForDisplay(50000)).toBe("50,000");
    expect(result.current.formatNumberForDisplay(1234567)).toBe("1,234,567");
    expect(result.current.formatNumberForDisplay(100)).toBe("100");
    expect(result.current.formatNumberForDisplay(0)).toBe("0");
  });

  it("should round numbers before formatting", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    expect(result.current.formatNumberForDisplay(50000.7)).toBe("50,001");
    expect(result.current.formatNumberForDisplay(50000.2)).toBe("50,000");
    expect(result.current.formatNumberForDisplay(999.9)).toBe("1,000");
  });

  it("should parse formatted numbers correctly", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    expect(result.current.parseFormattedNumber("50,000")).toBe(50000);
    expect(result.current.parseFormattedNumber("1,234,567")).toBe(1234567);
    expect(result.current.parseFormattedNumber("100")).toBe(100);
    expect(result.current.parseFormattedNumber("0")).toBe(0);
  });

  it("should handle exchange rate input changes", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    const mockEvent = {
      target: { value: "60,000" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleExchangeRateChange(mockEvent);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({ exchangeRate: 60000 });
  });

  it("should handle exchange rate input with no commas", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    const mockEvent = {
      target: { value: "75000" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleExchangeRateChange(mockEvent);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({ exchangeRate: 75000 });
  });

  it("should not update form data for invalid numbers", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    const mockEvent = {
      target: { value: "invalid" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleExchangeRateChange(mockEvent);
    });

    expect(mockUpdateFormData).not.toHaveBeenCalled();
  });

  it("should handle empty string input", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    const mockEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleExchangeRateChange(mockEvent);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({ exchangeRate: 0 });
  });

  it("should initialize with showLockedMessage as false", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    expect(result.current.showLockedMessage).toBe(false);
  });

  it("should show locked message when followEconomicScenarioBtc is true", () => {
    const lockedFormData = {
      ...mockFormData,
      followEconomicScenarioBtc: true,
    };

    const { result } = renderHook(() =>
      useExchangeRateHandling(lockedFormData, mockUpdateFormData),
    );

    act(() => {
      result.current.handleLockedInteraction();
    });

    expect(result.current.showLockedMessage).toBe(true);

    // Should hide after 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.showLockedMessage).toBe(false);
  });

  it("should show locked message when btcPriceManualMode is true", () => {
    const lockedFormData = {
      ...mockFormData,
      btcPriceManualMode: true,
    };

    const { result } = renderHook(() =>
      useExchangeRateHandling(lockedFormData, mockUpdateFormData),
    );

    act(() => {
      result.current.handleLockedInteraction();
    });

    expect(result.current.showLockedMessage).toBe(true);

    // Should hide after 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.showLockedMessage).toBe(false);
  });

  it("should not show locked message when neither lock condition is true", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    act(() => {
      result.current.handleLockedInteraction();
    });

    expect(result.current.showLockedMessage).toBe(false);

    // Should remain false after time passes
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.showLockedMessage).toBe(false);
  });

  it("should show locked message when both lock conditions are true", () => {
    const lockedFormData = {
      ...mockFormData,
      followEconomicScenarioBtc: true,
      btcPriceManualMode: true,
    };

    const { result } = renderHook(() =>
      useExchangeRateHandling(lockedFormData, mockUpdateFormData),
    );

    act(() => {
      result.current.handleLockedInteraction();
    });

    expect(result.current.showLockedMessage).toBe(true);
  });

  it("should handle very large numbers", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    expect(result.current.formatNumberForDisplay(1000000000)).toBe(
      "1,000,000,000",
    );
    expect(result.current.parseFormattedNumber("1,000,000,000")).toBe(
      1000000000,
    );
  });

  it("should update handlers when form data dependencies change", () => {
    const { result, rerender } = renderHook(
      ({ formData }) => useExchangeRateHandling(formData, mockUpdateFormData),
      { initialProps: { formData: mockFormData } },
    );

    const originalHandler = result.current.handleLockedInteraction;

    // Change lock condition
    const newFormData = {
      ...mockFormData,
      followEconomicScenarioBtc: true,
    };

    rerender({ formData: newFormData });

    // Handler should be different due to dependency change
    expect(result.current.handleLockedInteraction).not.toBe(originalHandler);
  });

  it("should handle decimal numbers in exchange rate input", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    const mockEvent = {
      target: { value: "50,000.50" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleExchangeRateChange(mockEvent);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({ exchangeRate: 50000.5 });
  });

  it("should handle negative numbers", () => {
    const { result } = renderHook(() =>
      useExchangeRateHandling(mockFormData, mockUpdateFormData),
    );

    expect(result.current.formatNumberForDisplay(-50000)).toBe("-50,000");
    expect(result.current.parseFormattedNumber("-50,000")).toBe(-50000);
  });
});
