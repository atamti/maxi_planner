import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNumberFormatting } from "./useNumberFormatting";

describe("useNumberFormatting", () => {
  const getHook = () => {
    const { result } = renderHook(() => useNumberFormatting());
    return result.current;
  };

  describe("formatNumberForDisplay", () => {
    it("should format positive integers with commas", () => {
      const { formatNumberForDisplay } = getHook();
      expect(formatNumberForDisplay(1234567)).toBe("1,234,567");
      expect(formatNumberForDisplay(1000)).toBe("1,000");
      expect(formatNumberForDisplay(999)).toBe("999");
    });

    it("should round decimal numbers", () => {
      const { formatNumberForDisplay } = getHook();
      expect(formatNumberForDisplay(1234.56)).toBe("1,235");
      expect(formatNumberForDisplay(1234.49)).toBe("1,234");
      expect(formatNumberForDisplay(1234.5)).toBe("1,235");
    });

    it("should handle negative numbers", () => {
      const { formatNumberForDisplay } = getHook();
      expect(formatNumberForDisplay(-1234567)).toBe("-1,234,567");
      expect(formatNumberForDisplay(-1000.6)).toBe("-1,001");
    });

    it("should handle zero and small numbers", () => {
      const { formatNumberForDisplay } = getHook();
      expect(formatNumberForDisplay(0)).toBe("0");
      expect(formatNumberForDisplay(0.9)).toBe("1");
      expect(formatNumberForDisplay(0.1)).toBe("0");
    });

    it("should handle edge cases", () => {
      const { formatNumberForDisplay } = getHook();
      expect(formatNumberForDisplay(Number.MAX_SAFE_INTEGER)).toBe("9,007,199,254,740,991");
      expect(formatNumberForDisplay(Number.MIN_SAFE_INTEGER)).toBe("-9,007,199,254,740,991");
    });
  });

  describe("parseFormattedNumber", () => {
    it("should parse formatted numbers correctly", () => {
      const { parseFormattedNumber } = getHook();
      expect(parseFormattedNumber("1,234,567")).toBe(1234567);
      expect(parseFormattedNumber("1,000")).toBe(1000);
      expect(parseFormattedNumber("999")).toBe(999);
    });

    it("should handle numbers without commas", () => {
      const { parseFormattedNumber } = getHook();
      expect(parseFormattedNumber("1234567")).toBe(1234567);
      expect(parseFormattedNumber("0")).toBe(0);
    });

    it("should handle decimal numbers", () => {
      const { parseFormattedNumber } = getHook();
      expect(parseFormattedNumber("1,234.56")).toBe(1234.56);
      expect(parseFormattedNumber("1,234.0")).toBe(1234);
    });

    it("should handle negative numbers", () => {
      const { parseFormattedNumber } = getHook();
      expect(parseFormattedNumber("-1,234,567")).toBe(-1234567);
      expect(parseFormattedNumber("-1,000.5")).toBe(-1000.5);
    });

    it("should handle edge cases and invalid inputs", () => {
      const { parseFormattedNumber } = getHook();
      expect(parseFormattedNumber("")).toBe(0);
      expect(parseFormattedNumber("abc")).toBeNaN();
      expect(parseFormattedNumber("1,2,3,4")).toBe(1234); // Invalid format but still parseable
    });
  });

  describe("formatPercentage", () => {
    it("should format percentages with default 1 decimal", () => {
      const { formatPercentage } = getHook();
      expect(formatPercentage(50)).toBe("50.0%");
      expect(formatPercentage(33.333)).toBe("33.3%");
      expect(formatPercentage(0)).toBe("0.0%");
    });

    it("should format percentages with custom decimals", () => {
      const { formatPercentage } = getHook();
      expect(formatPercentage(50, 0)).toBe("50%");
      expect(formatPercentage(33.333, 2)).toBe("33.33%");
      expect(formatPercentage(33.333, 3)).toBe("33.333%");
    });

    it("should handle negative percentages", () => {
      const { formatPercentage } = getHook();
      expect(formatPercentage(-25.5, 1)).toBe("-25.5%");
      expect(formatPercentage(-0.1, 2)).toBe("-0.10%");
    });

    it("should handle very large and small percentages", () => {
      const { formatPercentage } = getHook();
      expect(formatPercentage(1000000, 0)).toBe("1000000%");
      expect(formatPercentage(0.001, 3)).toBe("0.001%");
    });
  });

  describe("formatCurrency", () => {
    it("should format USD currency by default", () => {
      const { formatCurrency } = getHook();
      expect(formatCurrency(1234567)).toBe("$1,234,567");
      expect(formatCurrency(1000)).toBe("$1,000");
      expect(formatCurrency(0)).toBe("$0");
    });

    it("should handle negative amounts", () => {
      const { formatCurrency } = getHook();
      expect(formatCurrency(-1234.56)).toBe("-$1,235"); // Note: should round to 0 decimals
      expect(formatCurrency(-1000.4)).toBe("-$1,000");
    });

    it("should format different currencies", () => {
      const { formatCurrency } = getHook();
      expect(formatCurrency(1000, "EUR")).toBe("€1,000");
      expect(formatCurrency(1000, "GBP")).toBe("£1,000");
      expect(formatCurrency(1000, "JPY")).toBe("¥1,000");
    });

    it("should round to 0 decimal places", () => {
      const { formatCurrency } = getHook();
      expect(formatCurrency(1234.56)).toBe("$1,235");
      expect(formatCurrency(1234.49)).toBe("$1,234");
      expect(formatCurrency(1234.5)).toBe("$1,235");
    });
  });

  describe("formatBtc", () => {
    it("should format BTC with default 2 decimals", () => {
      const { formatBtc } = getHook();
      expect(formatBtc(1.5)).toBe("₿1.50");
      expect(formatBtc(0.12345678)).toBe("₿0.12");
      expect(formatBtc(0)).toBe("₿0.00");
    });

    it("should format BTC with custom decimals", () => {
      const { formatBtc } = getHook();
      expect(formatBtc(1.23456789, 0)).toBe("₿1");
      expect(formatBtc(1.23456789, 4)).toBe("₿1.2346");
      expect(formatBtc(1.23456789, 8)).toBe("₿1.23456789");
    });

    it("should handle whole numbers", () => {
      const { formatBtc } = getHook();
      expect(formatBtc(21, 2)).toBe("₿21.00");
      expect(formatBtc(1, 0)).toBe("₿1");
    });

    it("should handle very small amounts", () => {
      const { formatBtc } = getHook();
      expect(formatBtc(0.00000001, 8)).toBe("₿0.00000001");
      expect(formatBtc(0.00000001, 2)).toBe("₿0.00"); // Should round down
    });

    it("should handle negative amounts", () => {
      const { formatBtc } = getHook();
      expect(formatBtc(-1.5, 2)).toBe("₿-1.50");
    });
  });

  describe("clampNumber", () => {
    it("should clamp numbers within range", () => {
      const { clampNumber } = getHook();
      expect(clampNumber(5, 0, 10)).toBe(5);
      expect(clampNumber(15, 0, 10)).toBe(10);
      expect(clampNumber(-5, 0, 10)).toBe(0);
    });

    it("should handle edge cases", () => {
      const { clampNumber } = getHook();
      expect(clampNumber(10, 0, 10)).toBe(10);
      expect(clampNumber(0, 0, 10)).toBe(0);
      expect(clampNumber(10.5, 0, 10)).toBe(10);
    });

    it("should handle negative ranges", () => {
      const { clampNumber } = getHook();
      expect(clampNumber(-5, -10, -1)).toBe(-5);
      expect(clampNumber(-15, -10, -1)).toBe(-10);
      expect(clampNumber(5, -10, -1)).toBe(-1);
    });

    it("should handle decimal values", () => {
      const { clampNumber } = getHook();
      expect(clampNumber(1.5, 1.0, 2.0)).toBe(1.5);
      expect(clampNumber(0.5, 1.0, 2.0)).toBe(1.0);
      expect(clampNumber(2.5, 1.0, 2.0)).toBe(2.0);
    });
  });

  describe("roundToDecimal", () => {
    it("should round to default 2 decimal places", () => {
      const { roundToDecimal } = getHook();
      expect(roundToDecimal(1.23456)).toBe(1.23);
      expect(roundToDecimal(1.236)).toBe(1.24);
      expect(roundToDecimal(1.235)).toBe(1.24); // Banker's rounding may vary
    });

    it("should round to custom decimal places", () => {
      const { roundToDecimal } = getHook();
      expect(roundToDecimal(1.23456, 0)).toBe(1);
      expect(roundToDecimal(1.23456, 1)).toBe(1.2);
      expect(roundToDecimal(1.23456, 3)).toBe(1.235);
      expect(roundToDecimal(1.23456, 4)).toBe(1.2346);
    });

    it("should handle edge cases", () => {
      const { roundToDecimal } = getHook();
      expect(roundToDecimal(0, 2)).toBe(0);
      expect(roundToDecimal(1.999, 2)).toBe(2);
      expect(roundToDecimal(-1.235, 2)).toBe(-1.24);
    });

    it("should handle very small numbers", () => {
      const { roundToDecimal } = getHook();
      expect(roundToDecimal(0.000001, 6)).toBe(0.000001);
      expect(roundToDecimal(0.000001, 5)).toBe(0);
    });
  });

  describe("isValidNumber", () => {
    it("should validate valid number strings", () => {
      const { isValidNumber } = getHook();
      expect(isValidNumber("123")).toBe(true);
      expect(isValidNumber("123.45")).toBe(true);
      expect(isValidNumber("-123")).toBe(true);
      expect(isValidNumber("1,234,567")).toBe(true);
      expect(isValidNumber("0")).toBe(true);
    });

    it("should reject invalid inputs", () => {
      const { isValidNumber } = getHook();
      expect(isValidNumber("")).toBe(false);
      expect(isValidNumber("   ")).toBe(false);
      expect(isValidNumber("abc")).toBe(false);
      expect(isValidNumber("12.34.56")).toBe(false);
    });

    it("should reject infinite and NaN", () => {
      const { isValidNumber } = getHook();
      expect(isValidNumber("Infinity")).toBe(false);
      expect(isValidNumber("-Infinity")).toBe(false);
      expect(isValidNumber("NaN")).toBe(false);
    });

    it("should handle edge cases", () => {
      const { isValidNumber } = getHook();
      expect(isValidNumber("0.0")).toBe(true);
      expect(isValidNumber("-0")).toBe(true);
      expect(isValidNumber(".5")).toBe(true);
      expect(isValidNumber("5.")).toBe(true);
    });
  });

  describe("Integration tests", () => {
    it("should maintain consistency between format and parse operations", () => {
      const { formatNumberForDisplay, parseFormattedNumber } = getHook();
      const originalNumber = 1234567.89;
      const formatted = formatNumberForDisplay(originalNumber);
      const parsed = parseFormattedNumber(formatted);
      
      // Should be close due to rounding
      expect(parsed).toBe(1234568); // Rounded version
    });

    it("should handle the round-trip for currency formatting", () => {
      const { formatCurrency } = getHook();
      // Currency format doesn't have a corresponding parse function, 
      // but let's test the formatting is consistent
      expect(formatCurrency(1234.56)).toBe("$1,235");
      expect(formatCurrency(1234.4)).toBe("$1,234");
    });
  });
});
