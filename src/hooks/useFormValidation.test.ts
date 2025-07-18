import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { useFormValidation } from "./useFormValidation";

describe("useFormValidation", () => {
  describe("validateAllocation", () => {
    it("should validate correct allocation", () => {
      const { result } = renderHook(() => useFormValidation(DEFAULT_FORM_DATA));

      const validation = result.current.validateAllocation();

      expect(validation.isValid).toBe(true);
      expect(validation.field).toBe("allocation");
    });

    it("should invalidate incorrect allocation", () => {
      const invalidData = {
        ...DEFAULT_FORM_DATA,
        savingsPct: 50,
        investmentsPct: 30,
        speculationPct: 30, // Total = 110%
      };

      const { result } = renderHook(() => useFormValidation(invalidData));

      const validation = result.current.validateAllocation();

      expect(validation.isValid).toBe(false);
      expect(validation.message).toContain("110%");
    });
  });

  describe("validateBtcStack", () => {
    it("should validate positive BTC stack", () => {
      const { result } = renderHook(() => useFormValidation(DEFAULT_FORM_DATA));

      const validation = result.current.validateBtcStack();

      expect(validation.isValid).toBe(true);
    });

    it("should invalidate zero BTC stack", () => {
      const invalidData = { ...DEFAULT_FORM_DATA, btcStack: 0 };

      const { result } = renderHook(() => useFormValidation(invalidData));

      const validation = result.current.validateBtcStack();

      expect(validation.isValid).toBe(false);
      expect(validation.message).toContain("greater than 0");
    });

    it("should warn about small BTC stack", () => {
      const smallStackData = { ...DEFAULT_FORM_DATA, btcStack: 0.5 };

      const { result } = renderHook(() => useFormValidation(smallStackData));

      const validation = result.current.validateBtcStack();

      expect(validation.isValid).toBe(true);
      expect(validation.type).toBe("warning");
      expect(validation.message).toContain("at least 1 BTC");
    });
  });

  describe("validateTimeHorizon", () => {
    it("should validate reasonable time horizon", () => {
      const { result } = renderHook(() => useFormValidation(DEFAULT_FORM_DATA));

      const validation = result.current.validateTimeHorizon();

      expect(validation.isValid).toBe(true);
    });

    it("should invalidate negative time horizon", () => {
      const invalidData = { ...DEFAULT_FORM_DATA, timeHorizon: -1 };

      const { result } = renderHook(() => useFormValidation(invalidData));

      const validation = result.current.validateTimeHorizon();

      expect(validation.isValid).toBe(false);
      expect(validation.message).toContain("at least 1 year");
    });

    it("should warn about very long time horizon", () => {
      const longData = { ...DEFAULT_FORM_DATA, timeHorizon: 60 };

      const { result } = renderHook(() => useFormValidation(longData));

      const validation = result.current.validateTimeHorizon();

      expect(validation.isValid).toBe(true);
      expect(validation.type).toBe("warning");
      expect(validation.message).toContain("unrealistic assumptions");
    });
  });

  describe("validateActivationYear", () => {
    it("should validate activation year within time horizon", () => {
      const { result } = renderHook(() => useFormValidation(DEFAULT_FORM_DATA));

      const validation = result.current.validateActivationYear();

      expect(validation.isValid).toBe(true);
    });

    it("should invalidate activation year beyond time horizon", () => {
      const invalidData = {
        ...DEFAULT_FORM_DATA,
        activationYear: 25,
        timeHorizon: 20,
      };

      const { result } = renderHook(() => useFormValidation(invalidData));

      const validation = result.current.validateActivationYear();

      expect(validation.isValid).toBe(false);
      expect(validation.message).toContain("beyond time horizon");
    });
  });

  describe("validateLoanParameters", () => {
    it("should validate loan parameters when no collateral", () => {
      const noCollateralData = { ...DEFAULT_FORM_DATA, collateralPct: 0 };

      const { result } = renderHook(() => useFormValidation(noCollateralData));

      const validation = result.current.validateLoanParameters();

      expect(validation.isValid).toBe(true);
    });

    it("should invalidate extreme LTV ratio", () => {
      const invalidData = {
        ...DEFAULT_FORM_DATA,
        collateralPct: 50,
        ltvRatio: 110,
      };

      const { result } = renderHook(() => useFormValidation(invalidData));

      const validation = result.current.validateLoanParameters();

      expect(validation.isValid).toBe(false);
      expect(validation.message).toContain("between 0% and 100%");
    });

    it("should warn about high LTV ratio", () => {
      const highLtvData = {
        ...DEFAULT_FORM_DATA,
        collateralPct: 50,
        ltvRatio: 85,
      };

      const { result } = renderHook(() => useFormValidation(highLtvData));

      const validation = result.current.validateLoanParameters();

      expect(validation.isValid).toBe(true);
      expect(validation.type).toBe("warning");
      expect(validation.message).toContain("high liquidation risk");
    });
  });

  describe("validateAll", () => {
    it("should validate all fields for valid data", () => {
      const { result } = renderHook(() => useFormValidation(DEFAULT_FORM_DATA));

      const validation = result.current.validateAll();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should collect all errors for invalid data", () => {
      const invalidData = {
        ...DEFAULT_FORM_DATA,
        btcStack: 0,
        savingsPct: 110,
        investmentsPct: 20,
        speculationPct: 10,
        timeHorizon: 0,
      };

      const { result } = renderHook(() => useFormValidation(invalidData));

      const validation = result.current.validateAll();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
