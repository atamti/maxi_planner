import { useEffect } from "react";
import { FormData } from "../types";

export const useBtcAutoApplyEffects = (
  formData: FormData,
  applyToChart: (
    inputType?: "flat" | "linear" | "preset" | "saylor" | "manual",
  ) => void,
) => {
  // Auto-apply when flat rate values change (but not in manual mode)
  useEffect(() => {
    if (formData.btcPriceInputType === "flat" && !formData.btcPriceManualMode) {
      applyToChart();
    }
  }, [
    formData.btcPriceFlat,
    formData.timeHorizon,
    formData.btcPriceInputType,
    formData.btcPriceManualMode,
    applyToChart,
  ]);

  // Auto-apply when linear rate values change (but not in manual mode)
  useEffect(() => {
    if (
      formData.btcPriceInputType === "linear" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }
  }, [
    formData.btcPriceStart,
    formData.btcPriceEnd,
    formData.timeHorizon,
    formData.btcPriceInputType,
    formData.btcPriceManualMode,
    applyToChart,
  ]);

  // Auto-apply when saylor projection changes (but not in manual mode)
  useEffect(() => {
    if (
      formData.btcPriceInputType === "saylor" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }
  }, [
    formData.timeHorizon,
    formData.btcPriceInputType,
    formData.btcPriceManualMode,
    applyToChart,
  ]);

  // Auto-apply when preset scenario changes (but not in manual mode)
  useEffect(() => {
    if (
      formData.btcPriceInputType === "preset" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }
  }, [
    formData.btcPricePreset,
    formData.timeHorizon,
    formData.btcPriceInputType,
    formData.btcPriceManualMode,
    applyToChart,
  ]);

  // Reapply currently selected scenario when switching to auto mode
  useEffect(() => {
    if (!formData.btcPriceManualMode) {
      // Reapply current config when switching back to auto mode
      applyToChart(formData.btcPriceInputType);
    }
  }, [formData.btcPriceManualMode, formData.btcPriceInputType, applyToChart]);
};
