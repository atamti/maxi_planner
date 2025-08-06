import { describe, expect, it } from "vitest";
import { createAllocationService } from "./allocationService";

describe("AllocationService", () => {
  const allocationService = createAllocationService();

  const validAllocation = {
    savingsPct: 65,
    investmentsPct: 25,
    speculationPct: 10,
  };

  describe("validateAllocation", () => {
    it("should validate correct allocation totaling 100%", () => {
      const result = allocationService.validateAllocation(validAllocation);

      expect(result.isValid).toBe(true);
      expect(result.error).toBe("");
      expect(result.total).toBe(100);
    });

    it("should reject allocation not totaling 100%", () => {
      const invalidAllocation = {
        savingsPct: 70,
        investmentsPct: 20,
        speculationPct: 5, // Total = 95%
      };

      const result = allocationService.validateAllocation(invalidAllocation);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Allocations must sum to 100% (current: 95%)");
      expect(result.total).toBe(95);
    });

    it("should reject allocation exceeding 100%", () => {
      const invalidAllocation = {
        savingsPct: 70,
        investmentsPct: 30,
        speculationPct: 15, // Total = 115%
      };

      const result = allocationService.validateAllocation(invalidAllocation);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Allocations must sum to 100% (current: 115%)");
      expect(result.total).toBe(115);
    });

    it("should handle zero allocations", () => {
      const zeroAllocation = {
        savingsPct: 100,
        investmentsPct: 0,
        speculationPct: 0,
      };

      const result = allocationService.validateAllocation(zeroAllocation);

      expect(result.isValid).toBe(true);
      expect(result.error).toBe("");
      expect(result.total).toBe(100);
    });

    it("should handle decimal allocations", () => {
      const decimalAllocation = {
        savingsPct: 33.33,
        investmentsPct: 33.33,
        speculationPct: 33.34,
      };

      const result = allocationService.validateAllocation(decimalAllocation);

      expect(result.isValid).toBe(true);
      expect(result.error).toBe("");
      expect(result.total).toBe(100);
    });
  });

  describe("adjustAllocation", () => {
    it("should apply simple updates correctly", () => {
      const updates = { savingsPct: 70 };
      const result = allocationService.adjustAllocation(
        validAllocation,
        updates,
      );

      expect(result.savingsPct).toBe(70);
      // Other fields should be adjusted to maintain 100% total
      expect(result.investmentsPct + result.speculationPct).toBe(30);
    });

    it("should respect minimum thresholds", () => {
      const updates = { savingsPct: 95 };
      const minThreshold = 5;
      const result = allocationService.adjustAllocation(
        validAllocation,
        updates,
        minThreshold,
      );

      expect(result.savingsPct).toBe(95);
      expect(result.investmentsPct).toBeGreaterThanOrEqual(minThreshold);
      expect(result.speculationPct).toBeGreaterThanOrEqual(minThreshold);
    });

    it("should handle updates below minimum threshold", () => {
      const updates = { investmentsPct: 2 };
      const minThreshold = 5;
      const result = allocationService.adjustAllocation(
        validAllocation,
        updates,
        minThreshold,
      );

      expect(result.investmentsPct).toBe(minThreshold);
    });

    it("should proportionally adjust other fields when updating one field", () => {
      const updates = { savingsPct: 80 };
      const result = allocationService.adjustAllocation(
        validAllocation,
        updates,
      );

      expect(result.savingsPct).toBe(80);

      // The remaining 20% should be split proportionally between investments and speculation
      // Original ratio was 25:10 (2.5:1), so the new ratio should maintain this proportion
      const totalOther = result.investmentsPct + result.speculationPct;
      expect(totalOther).toBe(20);
      expect(result.investmentsPct / result.speculationPct).toBeCloseTo(2.5, 1);
    });

    it("should handle multiple field updates", () => {
      const updates = {
        savingsPct: 50,
        investmentsPct: 40,
      };
      const result = allocationService.adjustAllocation(
        validAllocation,
        updates,
      );

      expect(result.savingsPct).toBe(50);
      expect(result.investmentsPct).toBe(40);
      // Speculation should remain unchanged since it wasn't in the update
      expect(result.speculationPct).toBe(validAllocation.speculationPct);
    });

    it("should handle extreme minimum thresholds", () => {
      const updates = { savingsPct: 99 };
      const minThreshold = 10;
      const result = allocationService.adjustAllocation(
        validAllocation,
        updates,
        minThreshold,
      );

      // With min threshold of 10 and three fields, minimum total would be 30
      // But we're trying to set savings to 99, which leaves only 1 for others
      // The function should enforce minimums
      expect(result.investmentsPct).toBe(minThreshold);
      expect(result.speculationPct).toBe(minThreshold);
    });

    it("should maintain original allocation when no updates provided", () => {
      const result = allocationService.adjustAllocation(validAllocation, {});

      expect(result).toEqual(validAllocation);
    });
  });

  describe("getHighlightStatus", () => {
    it("should return highlighted status when field matches active field", () => {
      const result = allocationService.getHighlightStatus("savings", "savings");

      expect(result.isHighlighted).toBe(true);
      expect(result.classes).toContain("border-blue-500");
      expect(result.classes).toContain("shadow-lg");
      expect(result.classes).toContain("scale-105");
    });

    it("should return non-highlighted status when field doesn't match active field", () => {
      const result = allocationService.getHighlightStatus(
        "savings",
        "investments",
      );

      expect(result.isHighlighted).toBe(false);
      expect(result.classes).toContain("border-gray-300");
      expect(result.classes).not.toContain("border-blue-500");
    });

    it("should return non-highlighted status when no active field", () => {
      const result = allocationService.getHighlightStatus("savings", null);

      expect(result.isHighlighted).toBe(false);
      expect(result.classes).toContain("border-gray-300");
      expect(result.classes).toContain("transition-all");
    });

    it("should handle empty field names", () => {
      const result = allocationService.getHighlightStatus("", "savings");

      expect(result.isHighlighted).toBe(false);
    });

    it("should include transition classes in both states", () => {
      const highlightedResult = allocationService.getHighlightStatus(
        "savings",
        "savings",
      );
      const normalResult = allocationService.getHighlightStatus(
        "savings",
        null,
      );

      expect(highlightedResult.classes).toContain("transition-all");
      expect(normalResult.classes).toContain("transition-all");
    });
  });
});
