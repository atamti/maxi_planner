import { useCallback } from "react";

/**
 * Shared number formatting and parsing utilities
 * Consolidates common number handling patterns used across form inputs
 */
export const useNumberFormatting = () => {
  /**
   * Format number with commas for display
   */
  const formatNumberForDisplay = useCallback((value: number): string => {
    return Math.round(value).toLocaleString();
  }, []);

  /**
   * Parse formatted number string back to number
   */
  const parseFormattedNumber = useCallback((value: string): number => {
    return Number(value.replace(/,/g, ""));
  }, []);

  /**
   * Format percentage for display
   */
  const formatPercentage = useCallback(
    (value: number, decimals: number = 1): string => {
      return `${value.toFixed(decimals)}%`;
    },
    [],
  );

  /**
   * Format currency for display
   */
  const formatCurrency = useCallback(
    (value: number, currency: string = "USD"): string => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
    [],
  );

  /**
   * Format BTC amount for display
   */
  const formatBtc = useCallback(
    (value: number, decimals: number = 2): string => {
      return `₿${value.toFixed(decimals)}`;
    },
    [],
  );

  /**
   * Clamp number between min and max values
   */
  const clampNumber = useCallback(
    (value: number, min: number, max: number): number => {
      return Math.min(Math.max(value, min), max);
    },
    [],
  );

  /**
   * Round to specific decimal places
   */
  const roundToDecimal = useCallback(
    (value: number, decimals: number = 2): number => {
      const factor = Math.pow(10, decimals);
      return Math.round(value * factor) / factor;
    },
    [],
  );

  /**
   * Validate if string represents a valid number
   */
  const isValidNumber = useCallback(
    (value: string): boolean => {
      if (value === "" || value.trim() === "") return false;
      const num = parseFormattedNumber(value);
      return !isNaN(num) && isFinite(num);
    },
    [parseFormattedNumber],
  );

  return {
    formatNumberForDisplay,
    parseFormattedNumber,
    formatPercentage,
    formatCurrency,
    formatBtc,
    clampNumber,
    roundToDecimal,
    isValidNumber,
  };
};
