import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { ScenarioKey } from "../config/economicScenarios";
import { FormData } from "../types";
import { useBtcScenarioManagement } from "./useBtcScenarioManagement";

// Mock the economic scenarios
vi.mock("../config/economicScenarios", () => ({
  default: {
    conservative: {
      btcPrice: { startRate: 15, endRate: 25, maxAxis: 150 },
    },
    moderate: {
      btcPrice: { startRate: 20, endRate: 35, maxAxis: 180 },
    },
    aggressive: {
      btcPrice: { startRate: 25, endRate: 50, maxAxis: 200 },
    },
    custom: {
      btcPrice: { startRate: 30, endRate: 60, maxAxis: 200 },
    },
  },
}));

describe("useBtcScenarioManagement", () => {
  const mockUpdateFormData = vi.fn();
  const mockApplyToChart = vi.fn();

  const baseFormData: FormData = {
    ...DEFAULT_FORM_DATA,
    timeHorizon: 10,
    btcPriceInputType: "flat",
    btcPricePreset: "conservative" as ScenarioKey,
    btcPriceFlat: 30,
    btcPriceStart: 20,
    btcPriceEnd: 40,
    btcPriceManualMode: false,
    economicScenario: "conservative" as ScenarioKey,
    followEconomicScenarioBtc: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any pending timers
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Handle Input Type Change", () => {
    it("should update input type and apply to chart for flat type", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleInputTypeChange("flat");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceInputType: "flat",
      });
      expect(mockApplyToChart).toHaveBeenCalledWith("flat");
    });

    it("should update input type and apply to chart for linear type", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleInputTypeChange("linear");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceInputType: "linear",
      });
      expect(mockApplyToChart).toHaveBeenCalledWith("linear");
    });

    it("should update input type and apply to chart for preset type", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleInputTypeChange("preset");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceInputType: "preset",
      });
      expect(mockApplyToChart).toHaveBeenCalledWith("preset");
    });

    it("should update input type and apply to chart for saylor type", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleInputTypeChange("saylor");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceInputType: "saylor",
      });
      expect(mockApplyToChart).toHaveBeenCalledWith("saylor");
    });

    it("should enable manual mode without applying to chart for manual type", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleInputTypeChange("manual");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceInputType: "manual",
      });
      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceManualMode: true,
      });
      expect(mockApplyToChart).not.toHaveBeenCalled();
    });
  });

  describe("Handle Scenario Change", () => {
    it("should handle custom-flat scenario selection", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("custom-flat");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPricePreset: "custom",
        followEconomicScenarioBtc: false,
        btcPriceInputType: "flat",
        btcPriceFlat: 30, // From mocked custom scenario startRate
      });

      // Should apply flat rate after timeout
      vi.runAllTimers();
      expect(mockApplyToChart).toHaveBeenCalledWith("flat");
    });

    it("should handle custom-linear scenario selection", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("custom-linear");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPricePreset: "custom",
        followEconomicScenarioBtc: false,
        btcPriceInputType: "linear",
        btcPriceStart: 30, // From mocked custom scenario startRate
        btcPriceEnd: 60, // From mocked custom scenario endRate
      });

      // Should apply linear progression after timeout
      vi.runAllTimers();
      expect(mockApplyToChart).toHaveBeenCalledWith("linear");
    });

    it("should handle custom-saylor scenario selection", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("custom-saylor");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPricePreset: "custom",
        followEconomicScenarioBtc: false,
        btcPriceInputType: "saylor",
        btcPriceStart: 37, // Saylor specific start rate
        btcPriceEnd: 21, // Saylor specific end rate
      });

      // Should apply saylor projection after timeout
      vi.runAllTimers();
      expect(mockApplyToChart).toHaveBeenCalledWith("saylor");
    });

    it("should handle manual scenario selection", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("manual");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPricePreset: "custom",
        followEconomicScenarioBtc: false,
        btcPriceInputType: "manual",
        btcPriceFlat: 30, // From custom scenario startRate
        btcPriceStart: 30, // From custom scenario startRate
        btcPriceEnd: 60, // From custom scenario endRate
      });

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPriceManualMode: true,
      });
      expect(mockApplyToChart).not.toHaveBeenCalled();
    });

    it("should handle preset scenario selection", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("moderate");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPricePreset: "moderate",
        btcPriceInputType: "preset",
        btcPriceManualMode: false,
      });

      expect(mockApplyToChart).not.toHaveBeenCalled();
    });

    it("should handle aggressive preset scenario selection", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("aggressive");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPricePreset: "aggressive",
        btcPriceInputType: "preset",
        btcPriceManualMode: false,
      });

      expect(mockApplyToChart).not.toHaveBeenCalled();
    });
  });

  describe("Handle Scenario Toggle", () => {
    it("should enable following economic scenario without additional updates", () => {
      const formDataNotFollowing = {
        ...baseFormData,
        followEconomicScenarioBtc: false,
      };

      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          formDataNotFollowing,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioToggle(true);

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioBtc: true,
        btcPriceManualMode: false,
        btcPriceInputType: "preset",
        btcPricePreset: "conservative", // Matches economicScenario
      });
    });

    it("should disable following economic scenario", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioToggle(false);

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioBtc: false,
      });
    });

    it("should not update BTC settings when economic scenario is custom", () => {
      const customEconomicFormData = {
        ...baseFormData,
        economicScenario: "custom" as ScenarioKey,
        followEconomicScenarioBtc: false,
      };

      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          customEconomicFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioToggle(true);

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioBtc: true,
      });
    });

    it("should handle scenario toggle with different economic scenarios", () => {
      const moderateEconomicFormData = {
        ...baseFormData,
        economicScenario: "moderate" as ScenarioKey,
        followEconomicScenarioBtc: false,
      };

      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          moderateEconomicFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioToggle(true);

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioBtc: true,
        btcPriceManualMode: false,
        btcPriceInputType: "preset",
        btcPricePreset: "moderate", // Matches economicScenario
      });
    });
  });

  describe("Function Memoization", () => {
    it("should memoize handleInputTypeChange function", () => {
      const { result, rerender } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      const firstHandler = result.current.handleInputTypeChange;

      rerender();

      const secondHandler = result.current.handleInputTypeChange;
      expect(firstHandler).toBe(secondHandler);
    });

    it("should memoize handleScenarioChange function", () => {
      const { result, rerender } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      const firstHandler = result.current.handleScenarioChange;

      rerender();

      const secondHandler = result.current.handleScenarioChange;
      expect(firstHandler).toBe(secondHandler);
    });

    it("should memoize handleScenarioToggle function", () => {
      const { result, rerender } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      const firstHandler = result.current.handleScenarioToggle;

      rerender();

      const secondHandler = result.current.handleScenarioToggle;
      expect(firstHandler).toBe(secondHandler);
    });

    it("should update memoized functions when dependencies change", () => {
      const { result, rerender } = renderHook(
        ({ updateFormData }) =>
          useBtcScenarioManagement(
            baseFormData,
            updateFormData,
            mockApplyToChart,
          ),
        { initialProps: { updateFormData: mockUpdateFormData } },
      );

      const firstHandler = result.current.handleInputTypeChange;

      const newMockUpdateFormData = vi.fn();
      rerender({ updateFormData: newMockUpdateFormData });

      const secondHandler = result.current.handleInputTypeChange;
      expect(firstHandler).not.toBe(secondHandler);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty scenario selection gracefully", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPricePreset: "",
        btcPriceInputType: "preset",
        btcPriceManualMode: false,
      });
    });

    it("should handle unknown scenario selection gracefully", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("unknown-scenario");

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        btcPricePreset: "unknown-scenario",
        btcPriceInputType: "preset",
        btcPriceManualMode: false,
      });
    });

    it("should handle scenario toggle when already in desired state", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      // Already following economic scenario
      result.current.handleScenarioToggle(true);

      expect(mockUpdateFormData).toHaveBeenCalledWith({
        followEconomicScenarioBtc: true,
        btcPriceManualMode: false,
        btcPriceInputType: "preset",
        btcPricePreset: "conservative",
      });
    });
  });

  describe("Timeout Behavior", () => {
    it("should delay chart application for custom-flat scenario", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("custom-flat");

      // Should not apply immediately
      expect(mockApplyToChart).not.toHaveBeenCalled();

      // Should apply after timeout
      vi.runAllTimers();
      expect(mockApplyToChart).toHaveBeenCalledWith("flat");
    });

    it("should delay chart application for custom-linear scenario", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("custom-linear");

      // Should not apply immediately
      expect(mockApplyToChart).not.toHaveBeenCalled();

      // Should apply after timeout
      vi.runAllTimers();
      expect(mockApplyToChart).toHaveBeenCalledWith("linear");
    });

    it("should delay chart application for custom-saylor scenario", () => {
      const { result } = renderHook(() =>
        useBtcScenarioManagement(
          baseFormData,
          mockUpdateFormData,
          mockApplyToChart,
        ),
      );

      result.current.handleScenarioChange("custom-saylor");

      // Should not apply immediately
      expect(mockApplyToChart).not.toHaveBeenCalled();

      // Should apply after timeout
      vi.runAllTimers();
      expect(mockApplyToChart).toHaveBeenCalledWith("saylor");
    });
  });
});
