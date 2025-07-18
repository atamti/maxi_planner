import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_DATA } from "../config/defaults";
import { useLoanCalculations } from "./useLoanCalculations";

describe("useLoanCalculations", () => {
  const mockGetBtcPriceAtYear = (year: number) => 100000 * Math.pow(1.5, year);

  const mockFormData = {
    ...DEFAULT_FORM_DATA,
    btcStack: 10,
    savingsPct: 70,
    investmentsPct: 20,
    speculationPct: 10,
    collateralPct: 50,
    ltvRatio: 40,
    loanRate: 7,
    loanTermYears: 10,
    interestOnly: true,
    activationYear: 5,
    timeHorizon: 20,
    investmentsStartYield: 30,
    investmentsEndYield: 10,
    speculationStartYield: 40,
    speculationEndYield: 5,
  };

  describe("calculateBtcStackAtActivation", () => {
    it("should correctly calculate BTC stack growth", () => {
      const { result } = renderHook(() =>
        useLoanCalculations(mockFormData, mockGetBtcPriceAtYear),
      );

      const stackAtActivation = result.current.calculateBtcStackAtActivation(
        5,
        10,
      );

      expect(stackAtActivation).toBeGreaterThan(10);
      expect(typeof stackAtActivation).toBe("number");
    });

    it("should return initial stack when activation year is 0", () => {
      const { result } = renderHook(() =>
        useLoanCalculations(mockFormData, mockGetBtcPriceAtYear),
      );

      const stackAtActivation = result.current.calculateBtcStackAtActivation(
        0,
        10,
      );

      expect(stackAtActivation).toBe(10);
    });
  });

  describe("calculateLoanDetails", () => {
    it("should return null when collateral percentage is 0", () => {
      const noCollateralFormData = { ...mockFormData, collateralPct: 0 };
      const { result } = renderHook(() =>
        useLoanCalculations(noCollateralFormData, mockGetBtcPriceAtYear),
      );

      const loanDetails = result.current.calculateLoanDetails(5);

      expect(loanDetails).toBeNull();
    });

    it("should calculate loan details correctly", () => {
      const { result } = renderHook(() =>
        useLoanCalculations(mockFormData, mockGetBtcPriceAtYear),
      );

      const loanDetails = result.current.calculateLoanDetails(5);

      expect(loanDetails).not.toBeNull();
      expect(loanDetails!.loanPrincipal).toBeGreaterThan(0);
      expect(loanDetails!.liquidationPrice).toBeGreaterThan(0);
      expect(loanDetails!.annualPayments).toBeGreaterThan(0);
      expect(loanDetails!.collateralBtc).toBeGreaterThan(0);
      expect(loanDetails!.btcStackAtActivation).toBeGreaterThan(0);
    });

    it("should calculate different payments for interest-only vs amortizing", () => {
      const interestOnlyFormData = { ...mockFormData, interestOnly: true };
      const amortizingFormData = { ...mockFormData, interestOnly: false };

      const { result: interestOnlyResult } = renderHook(() =>
        useLoanCalculations(interestOnlyFormData, mockGetBtcPriceAtYear),
      );
      const { result: amortizingResult } = renderHook(() =>
        useLoanCalculations(amortizingFormData, mockGetBtcPriceAtYear),
      );

      const interestOnlyDetails =
        interestOnlyResult.current.calculateLoanDetails(5);
      const amortizingDetails =
        amortizingResult.current.calculateLoanDetails(5);

      expect(interestOnlyDetails).not.toBeNull();
      expect(amortizingDetails).not.toBeNull();
      expect(interestOnlyDetails!.annualPayments).not.toBe(
        amortizingDetails!.annualPayments,
      );
    });
  });

  describe("calculateLiquidationBuffer", () => {
    it("should return null when no collateral", () => {
      const noCollateralFormData = { ...mockFormData, collateralPct: 0 };
      const { result } = renderHook(() =>
        useLoanCalculations(noCollateralFormData, mockGetBtcPriceAtYear),
      );

      const buffer = result.current.calculateLiquidationBuffer(5, 20);

      expect(buffer).toBeNull();
    });

    it("should calculate liquidation buffer correctly", () => {
      const { result } = renderHook(() =>
        useLoanCalculations(mockFormData, mockGetBtcPriceAtYear),
      );

      const buffer = result.current.calculateLiquidationBuffer(5, 20);

      expect(buffer).not.toBeNull();
      expect(typeof buffer).toBe("number");
    });
  });

  describe("calculateAdditionalCollateralPotential", () => {
    it("should return null when no collateral", () => {
      const noCollateralFormData = { ...mockFormData, collateralPct: 0 };
      const { result } = renderHook(() =>
        useLoanCalculations(noCollateralFormData, mockGetBtcPriceAtYear),
      );

      const potential =
        result.current.calculateAdditionalCollateralPotential(5);

      expect(potential).toBeNull();
    });

    it("should return null when already using 100% collateral", () => {
      const fullCollateralFormData = { ...mockFormData, collateralPct: 100 };
      const { result } = renderHook(() =>
        useLoanCalculations(fullCollateralFormData, mockGetBtcPriceAtYear),
      );

      const potential =
        result.current.calculateAdditionalCollateralPotential(5);

      expect(potential).toBeNull();
    });

    it("should calculate additional collateral potential correctly", () => {
      const { result } = renderHook(() =>
        useLoanCalculations(mockFormData, mockGetBtcPriceAtYear),
      );

      const potential =
        result.current.calculateAdditionalCollateralPotential(5);

      expect(potential).not.toBeNull();
      expect(potential!.additionalBtc).toBeGreaterThan(0);
      expect(potential!.improvedLiquidationPrice).toBeGreaterThan(0);
    });
  });
});
