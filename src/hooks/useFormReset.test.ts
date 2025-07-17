import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { generateBtcRatesFromScenario, useFormReset } from "./useFormReset";

describe("useFormReset", () => {
  it("should provide resetForm function", () => {
    const setFormData = vi.fn();
    const { result } = renderHook(() => useFormReset(setFormData));

    expect(result.current.resetForm).toBeDefined();
    expect(typeof result.current.resetForm).toBe("function");
  });

  it("should reset form to default data when resetForm is called", () => {
    const setFormData = vi.fn();
    const { result } = renderHook(() => useFormReset(setFormData));

    act(() => {
      result.current.resetForm();
    });

    expect(setFormData).toHaveBeenCalledTimes(1);
    expect(setFormData).toHaveBeenCalledWith(expect.any(Function));

    // Test that the function passed to setFormData produces correct result
    const updateFunction = setFormData.mock.calls[0][0];
    const newData = updateFunction({});

    expect(newData).toMatchObject({
      btcStack: DEFAULT_FORM_DATA.btcStack,
      savingsPct: DEFAULT_FORM_DATA.savingsPct,
      investmentsPct: DEFAULT_FORM_DATA.investmentsPct,
      speculationPct: DEFAULT_FORM_DATA.speculationPct,
    });
  });

  it("should call setFormData with updated inflation rates when resetForm is called with scenario", () => {
    const setFormData = vi.fn();
    const { result } = renderHook(() => useFormReset(setFormData));

    act(() => {
      result.current.resetForm();
    });

    const updateFunction = setFormData.mock.calls[0][0];
    const newData = updateFunction({});

    expect(newData.inflationCustomRates).toBeDefined();
    expect(Array.isArray(newData.inflationCustomRates)).toBe(true);
  });

  it("should generate proper BTC rates when resetForm is called", () => {
    const setFormData = vi.fn();
    const { result } = renderHook(() => useFormReset(setFormData));

    act(() => {
      result.current.resetForm();
    });

    const updateFunction = setFormData.mock.calls[0][0];
    const newData = updateFunction({});

    expect(newData.btcPriceCustomRates).toBeDefined();
    expect(Array.isArray(newData.btcPriceCustomRates)).toBe(true);
    expect(newData.btcPriceCustomRates.length).toBeGreaterThan(0);
  });
});

describe("generateBtcRatesFromScenario", () => {
  it("should generate rates array with correct length", () => {
    const rates = generateBtcRatesFromScenario("debasement", 20);

    expect(Array.isArray(rates)).toBe(true);
    expect(rates.length).toBe(30); // Always fills to 30
  });

  it("should generate rates with progression from start to end", () => {
    const rates = generateBtcRatesFromScenario("debasement", 10);

    // Should have some variation in rates
    const uniqueRates = new Set(rates.slice(0, 10));
    expect(uniqueRates.size).toBeGreaterThan(1);
  });

  it("should handle unknown scenario by returning default rates", () => {
    const rates = generateBtcRatesFromScenario("unknown", 20);

    expect(rates).toEqual(Array(30).fill(50));
  });

  it("should generate rates with proper rounding (multiples of 2)", () => {
    const rates = generateBtcRatesFromScenario("debasement", 10);

    rates.forEach((rate) => {
      expect(rate % 2).toBe(0); // Should be even numbers
    });
  });

  it("should handle edge case of timeHorizon = 1", () => {
    const rates = generateBtcRatesFromScenario("debasement", 1);

    expect(rates.length).toBe(30);
    expect(typeof rates[0]).toBe("number");
  });

  it("should handle edge case of timeHorizon = 0", () => {
    const rates = generateBtcRatesFromScenario("debasement", 0);

    expect(rates.length).toBe(30);
    // Should still generate valid rates
    rates.forEach((rate) => {
      expect(typeof rate).toBe("number");
    });
  });
});
