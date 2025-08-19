import { useEffect, useRef } from "react";
import { FormData } from "../types";

export const useBtcAutoApplyEffects = (
  formData: FormData,
  applyToChart: (
    inputType?: "flat" | "linear" | "preset" | "saylor" | "manual",
  ) => void,
) => {
  // Store previous values to detect actual changes
  const prevValues = useRef({
    btcPriceFlat: formData.btcPriceFlat,
    btcPriceStart: formData.btcPriceStart,
    btcPriceEnd: formData.btcPriceEnd,
    btcPriceInputType: formData.btcPriceInputType,
    btcPricePreset: formData.btcPricePreset,
    btcPriceManualMode: formData.btcPriceManualMode,
  });

  // Auto-apply when flat rate values change (but not in manual mode)
  useEffect(() => {
    const flatChanged =
      prevValues.current.btcPriceFlat !== formData.btcPriceFlat;

    if (
      flatChanged &&
      formData.btcPriceInputType === "flat" &&
      !formData.btcPriceManualMode
    ) {
      console.log(`🔴 useBtcAutoApplyEffects: FLAT auto-apply triggered`);
      applyToChart();
    }

    prevValues.current.btcPriceFlat = formData.btcPriceFlat;
  }, [
    formData.btcPriceFlat,
    formData.btcPriceInputType,
    formData.btcPriceManualMode,
  ]);

  // Auto-apply when linear rate values change (but not in manual mode)
  useEffect(() => {
    const startChanged =
      prevValues.current.btcPriceStart !== formData.btcPriceStart;
    const endChanged = prevValues.current.btcPriceEnd !== formData.btcPriceEnd;

    if (
      (startChanged || endChanged) &&
      formData.btcPriceInputType === "linear" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }

    prevValues.current.btcPriceStart = formData.btcPriceStart;
    prevValues.current.btcPriceEnd = formData.btcPriceEnd;
  }, [
    formData.btcPriceStart,
    formData.btcPriceEnd,
    formData.btcPriceInputType,
    formData.btcPriceManualMode,
  ]);

  // Auto-apply when switching TO saylor (but not in manual mode)
  useEffect(() => {
    const inputTypeChanged =
      prevValues.current.btcPriceInputType !== formData.btcPriceInputType;

    if (
      inputTypeChanged &&
      formData.btcPriceInputType === "saylor" &&
      !formData.btcPriceManualMode
    ) {
      applyToChart();
    }

    prevValues.current.btcPriceInputType = formData.btcPriceInputType;
  }, [formData.btcPriceInputType, formData.btcPriceManualMode]);

  // Auto-apply when preset scenario changes (but not in manual mode)
  useEffect(() => {
    const presetChanged =
      prevValues.current.btcPricePreset !== formData.btcPricePreset;

    if (
      presetChanged &&
      formData.btcPriceInputType === "preset" &&
      !formData.btcPriceManualMode
    ) {
      console.log(`🔴 useBtcAutoApplyEffects: PRESET auto-apply triggered`);
      applyToChart();
    }

    prevValues.current.btcPricePreset = formData.btcPricePreset;
  }, [
    formData.btcPricePreset,
    formData.btcPriceInputType,
    formData.btcPriceManualMode,
  ]);

  // Reapply currently selected scenario when switching FROM manual mode TO auto mode
  useEffect(() => {
    const manualModeChanged =
      prevValues.current.btcPriceManualMode !== formData.btcPriceManualMode;

    if (
      manualModeChanged &&
      !formData.btcPriceManualMode // switched to auto mode
    ) {
      console.log(
        `🔴 useBtcAutoApplyEffects: MANUAL MODE auto-apply triggered`,
      );
      applyToChart(formData.btcPriceInputType);
    }

    prevValues.current.btcPriceManualMode = formData.btcPriceManualMode;
  }, [formData.btcPriceManualMode]);
};
