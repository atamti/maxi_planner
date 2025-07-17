import { describe, expect, it } from "vitest";
import { formatCurrency, formatNumber } from "../utils/formatNumber";

describe("formatNumber", () => {
  it("should format numbers with default 2 decimal places", () => {
    expect(formatNumber(1234.56)).toBe("1,234.56");
    expect(formatNumber(1000)).toBe("1,000.00");
    expect(formatNumber(0)).toBe("0.00");
  });

  it("should format numbers with custom decimal places", () => {
    expect(formatNumber(1234.56789, 0)).toBe("1,235");
    expect(formatNumber(1234.56789, 1)).toBe("1,234.6");
    expect(formatNumber(1234.56789, 3)).toBe("1,234.568");
    expect(formatNumber(1234.56789, 4)).toBe("1,234.5679");
  });

  it("should handle large numbers", () => {
    expect(formatNumber(1234567.89)).toBe("1,234,567.89");
    expect(formatNumber(1000000000)).toBe("1,000,000,000.00");
  });

  it("should handle small numbers", () => {
    expect(formatNumber(0.123456, 4)).toBe("0.1235");
    expect(formatNumber(0.001, 3)).toBe("0.001");
  });

  it("should handle negative numbers", () => {
    expect(formatNumber(-1234.56)).toBe("-1,234.56");
    expect(formatNumber(-0.5)).toBe("-0.50");
  });
});

describe("formatCurrency", () => {
  it("should format currency with default 2 decimal places", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
    expect(formatCurrency(1000)).toBe("$1,000.00");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should format currency with custom decimal places", () => {
    expect(formatCurrency(1234.56789, 0)).toBe("$1,235");
    expect(formatCurrency(1234.56789, 1)).toBe("$1,234.6");
    expect(formatCurrency(1234.56789, 3)).toBe("$1,234.568");
  });

  it("should handle negative currency values", () => {
    expect(formatCurrency(-1234.56)).toBe("$-1,234.56");
    expect(formatCurrency(-0.5)).toBe("$-0.50");
  });

  it("should handle large currency values", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });
});
