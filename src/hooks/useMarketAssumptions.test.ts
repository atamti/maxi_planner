import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { ScenarioKey } from "../config/economicScenarios";
import { Mode } from "../types";
import { useMarketAssumptions } from "./useMarketAssumptions";

// Mock the portfolio context
const mockUpdateFormData = vi.fn();
vi.mock("../store", () => ({
  usePortfolioCompat: () => ({
    formData: DEFAULT_FORM_DATA,
    updateFormData: mockUpdateFormData,
  }),
}));

describe("useMarketAssumptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return inflation data from form", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    expect(result.current.inflation).toEqual({
      mode: DEFAULT_FORM_DATA.inflationMode,
      inputType: DEFAULT_FORM_DATA.inflationInputType,
      flat: DEFAULT_FORM_DATA.inflationFlat,
      start: DEFAULT_FORM_DATA.inflationStart,
      end: DEFAULT_FORM_DATA.inflationEnd,
      preset: DEFAULT_FORM_DATA.inflationPreset,
      customRates: DEFAULT_FORM_DATA.inflationCustomRates,
      manualMode: DEFAULT_FORM_DATA.inflationManualMode,
    });
  });

  it("should return BTC price data from form", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    expect(result.current.btcPrice).toEqual({
      mode: DEFAULT_FORM_DATA.btcPriceMode,
      inputType: DEFAULT_FORM_DATA.btcPriceInputType,
      flat: DEFAULT_FORM_DATA.btcPriceFlat,
      start: DEFAULT_FORM_DATA.btcPriceStart,
      end: DEFAULT_FORM_DATA.btcPriceEnd,
      preset: DEFAULT_FORM_DATA.btcPricePreset,
      customRates: DEFAULT_FORM_DATA.btcPriceCustomRates,
      manualMode: DEFAULT_FORM_DATA.btcPriceManualMode,
    });
  });

  it("should return income data from form", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    expect(result.current.income).toEqual({
      mode: DEFAULT_FORM_DATA.incomeMode,
      inputType: DEFAULT_FORM_DATA.incomeInputType,
      flat: DEFAULT_FORM_DATA.incomeFlat,
      start: DEFAULT_FORM_DATA.incomeStart,
      end: DEFAULT_FORM_DATA.incomeEnd,
      preset: DEFAULT_FORM_DATA.incomePreset,
      customRates: DEFAULT_FORM_DATA.incomeCustomRates,
      manualMode: DEFAULT_FORM_DATA.incomeManualMode,
      startingExpenses: DEFAULT_FORM_DATA.startingExpenses,
      allocationPct: DEFAULT_FORM_DATA.incomeAllocationPct,
      reinvestmentPct: DEFAULT_FORM_DATA.incomeReinvestmentPct,
    });
  });

  it("should update inflation settings", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    const inflationUpdates = {
      inflationMode: "advanced" as Mode,
      inflationInputType: "linear" as const,
      inflationFlat: 3.5,
      inflationStart: 2.0,
      inflationEnd: 4.0,
      inflationPreset: "tight" as ScenarioKey,
      inflationCustomRates: [2, 3, 4],
      inflationManualMode: true,
    };

    act(() => {
      result.current.updateInflationSettings(inflationUpdates);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith(inflationUpdates);
  });

  it("should update BTC price settings", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    const btcUpdates = {
      btcPriceMode: "advanced" as Mode,
      btcPriceInputType: "preset" as const,
      btcPriceFlat: 75000,
      btcPriceStart: 50000,
      btcPriceEnd: 100000,
      btcPricePreset: "debasement" as ScenarioKey,
      btcPriceCustomRates: [50000, 75000, 100000],
      btcPriceManualMode: false,
    };

    act(() => {
      result.current.updateBtcPriceSettings(btcUpdates);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith(btcUpdates);
  });

  it("should update income settings", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    const incomeUpdates = {
      incomeMode: "advanced" as Mode,
      incomeInputType: "manual" as const,
      incomeFlat: 80000,
      incomeStart: 60000,
      incomeEnd: 120000,
      incomePreset: "crisis" as ScenarioKey,
      incomeCustomRates: [60000, 80000, 100000],
      incomeManualMode: true,
      startingExpenses: 40000,
      incomeAllocationPct: 75,
      incomeReinvestmentPct: 25,
    };

    act(() => {
      result.current.updateIncomeSettings(incomeUpdates);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith(incomeUpdates);
  });

  it("should update partial inflation settings", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    const partialUpdates = {
      inflationFlat: 2.5,
      inflationManualMode: true,
    };

    act(() => {
      result.current.updateInflationSettings(partialUpdates);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith(partialUpdates);
  });

  it("should update partial BTC price settings", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    const partialUpdates = {
      btcPriceFlat: 65000,
      btcPriceInputType: "flat" as const,
    };

    act(() => {
      result.current.updateBtcPriceSettings(partialUpdates);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith(partialUpdates);
  });

  it("should update partial income settings", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    const partialUpdates = {
      startingExpenses: 45000,
      incomeAllocationPct: 80,
    };

    act(() => {
      result.current.updateIncomeSettings(partialUpdates);
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith(partialUpdates);
  });

  it("should handle empty update objects", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    act(() => {
      result.current.updateInflationSettings({});
      result.current.updateBtcPriceSettings({});
      result.current.updateIncomeSettings({});
    });

    expect(mockUpdateFormData).toHaveBeenCalledTimes(3);
    expect(mockUpdateFormData).toHaveBeenNthCalledWith(1, {});
    expect(mockUpdateFormData).toHaveBeenNthCalledWith(2, {});
    expect(mockUpdateFormData).toHaveBeenNthCalledWith(3, {});
  });

  it("should provide update functions", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    expect(typeof result.current.updateInflationSettings).toBe("function");
    expect(typeof result.current.updateBtcPriceSettings).toBe("function");
    expect(typeof result.current.updateIncomeSettings).toBe("function");
  });

  it("should handle all inflation input types", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    // Test flat input type
    act(() => {
      result.current.updateInflationSettings({
        inflationInputType: "flat",
        inflationFlat: 3.0,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      inflationInputType: "flat",
      inflationFlat: 3.0,
    });

    // Test linear input type
    act(() => {
      result.current.updateInflationSettings({
        inflationInputType: "linear",
        inflationStart: 2.0,
        inflationEnd: 4.0,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      inflationInputType: "linear",
      inflationStart: 2.0,
      inflationEnd: 4.0,
    });

    // Test preset input type
    act(() => {
      result.current.updateInflationSettings({
        inflationInputType: "preset",
        inflationPreset: "tight",
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      inflationInputType: "preset",
      inflationPreset: "tight",
    });
  });

  it("should handle all BTC price input types", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    // Test flat input type
    act(() => {
      result.current.updateBtcPriceSettings({
        btcPriceInputType: "flat",
        btcPriceFlat: 60000,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      btcPriceInputType: "flat",
      btcPriceFlat: 60000,
    });

    // Test linear input type
    act(() => {
      result.current.updateBtcPriceSettings({
        btcPriceInputType: "linear",
        btcPriceStart: 50000,
        btcPriceEnd: 100000,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      btcPriceInputType: "linear",
      btcPriceStart: 50000,
      btcPriceEnd: 100000,
    });

    // Test preset input type
    act(() => {
      result.current.updateBtcPriceSettings({
        btcPriceInputType: "preset",
        btcPricePreset: "debasement",
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      btcPriceInputType: "preset",
      btcPricePreset: "debasement",
    });

    // Test manual input type
    act(() => {
      result.current.updateBtcPriceSettings({
        btcPriceInputType: "manual",
        btcPriceCustomRates: [50000, 60000, 70000],
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      btcPriceInputType: "manual",
      btcPriceCustomRates: [50000, 60000, 70000],
    });
  });

  it("should handle all income input types", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    // Test flat input type
    act(() => {
      result.current.updateIncomeSettings({
        incomeInputType: "flat",
        incomeFlat: 70000,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      incomeInputType: "flat",
      incomeFlat: 70000,
    });

    // Test linear input type
    act(() => {
      result.current.updateIncomeSettings({
        incomeInputType: "linear",
        incomeStart: 60000,
        incomeEnd: 100000,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      incomeInputType: "linear",
      incomeStart: 60000,
      incomeEnd: 100000,
    });

    // Test preset input type
    act(() => {
      result.current.updateIncomeSettings({
        incomeInputType: "preset",
        incomePreset: "crisis",
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      incomeInputType: "preset",
      incomePreset: "crisis",
    });

    // Test manual input type
    act(() => {
      result.current.updateIncomeSettings({
        incomeInputType: "manual",
        incomeCustomRates: [60000, 70000, 80000],
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      incomeInputType: "manual",
      incomeCustomRates: [60000, 70000, 80000],
    });
  });

  it("should handle edge case values", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    // Test zero values
    act(() => {
      result.current.updateInflationSettings({
        inflationFlat: 0,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      inflationFlat: 0,
    });

    // Test very large values
    act(() => {
      result.current.updateBtcPriceSettings({
        btcPriceFlat: 1000000,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      btcPriceFlat: 1000000,
    });

    // Test negative values
    act(() => {
      result.current.updateIncomeSettings({
        incomeFlat: -10000,
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      incomeFlat: -10000,
    });
  });

  it("should handle empty arrays", () => {
    const { result } = renderHook(() => useMarketAssumptions());

    act(() => {
      result.current.updateInflationSettings({
        inflationCustomRates: [],
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      inflationCustomRates: [],
    });

    act(() => {
      result.current.updateBtcPriceSettings({
        btcPriceCustomRates: [],
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      btcPriceCustomRates: [],
    });

    act(() => {
      result.current.updateIncomeSettings({
        incomeCustomRates: [],
      });
    });

    expect(mockUpdateFormData).toHaveBeenCalledWith({
      incomeCustomRates: [],
    });
  });
});
