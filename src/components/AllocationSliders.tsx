import React, { useState } from "react";
import { useAllocation } from "../hooks/useAllocation";

interface Props {
  minThreshold?: number;
}

export const AllocationSliders: React.FC<Props> = ({ minThreshold = 0 }) => {
  const {
    savingsPct,
    investmentsPct,
    speculationPct,
    updateAllocation,
    allocationError,
  } = useAllocation();

  const [highlightField, setHighlightField] = useState<string | null>(null);

  const handleAllocationChange = (
    field: "savings" | "investments",
    newValue: number,
  ) => {
    let newSavings = savingsPct;
    let newInvestments = investmentsPct;
    let newSpeculation = speculationPct;

    if (field === "savings") {
      newSavings = Math.max(minThreshold, Math.min(100, newValue));
      const remaining = 100 - newSavings;

      // If speculation would go below threshold, reduce investments
      if (remaining - investmentsPct < minThreshold) {
        newInvestments = Math.max(minThreshold, remaining - minThreshold);
        newSpeculation = remaining - newInvestments;
      } else {
        newSpeculation = Math.max(minThreshold, remaining - investmentsPct);
        newInvestments = remaining - newSpeculation;
      }
    } else if (field === "investments") {
      newInvestments = Math.max(minThreshold, Math.min(100, newValue));
      const remaining = 100 - newInvestments;

      // If speculation would go below threshold, reduce savings
      if (remaining - savingsPct < minThreshold) {
        newSavings = Math.max(minThreshold, remaining - minThreshold);
        newSpeculation = remaining - newSavings;
      } else {
        newSpeculation = Math.max(minThreshold, remaining - savingsPct);
        newSavings = remaining - newSpeculation;
      }
    }

    updateAllocation({
      savingsPct: newSavings,
      investmentsPct: newInvestments,
      speculationPct: newSpeculation,
    });
  };

  const getBarColor = (
    category: "savings" | "investments" | "speculation",
    isHighlighted: boolean,
  ): string => {
    const baseColors = {
      savings: "bg-green-500",
      investments: "bg-blue-500",
      speculation: "bg-red-500",
    };

    const highlightColors = {
      savings: "bg-green-600",
      investments: "bg-blue-600",
      speculation: "bg-red-600",
    };

    return isHighlighted ? highlightColors[category] : baseColors[category];
  };

  return (
    <div className="space-y-4">
      {/* Allocation Error Display */}
      {allocationError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {allocationError}
        </div>
      )}

      {/* Visual allocation bar */}
      <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300">
        <div
          className={`${getBarColor(
            "savings",
            highlightField === "savings",
          )} flex items-center justify-center text-white text-xs font-medium`}
          style={{ width: `${savingsPct}%` }}
        >
          {savingsPct > 15 ? `${savingsPct}%` : ""}
        </div>
        <div
          className={`${getBarColor(
            "investments",
            highlightField === "investments",
          )} flex items-center justify-center text-white text-xs font-medium`}
          style={{ width: `${investmentsPct}%` }}
        >
          {investmentsPct > 15 ? `${investmentsPct}%` : ""}
        </div>
        <div
          className={`${getBarColor("speculation", false)} flex items-center justify-center text-white text-xs font-medium`}
          style={{ width: `${speculationPct}%` }}
        >
          {speculationPct > 15 ? `${speculationPct}%` : ""}
        </div>
      </div>

      {/* Three Buckets in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Savings */}
        <div
          className={`transition-all duration-300 ${
            highlightField === "savings"
              ? "ring-2 ring-yellow-400 rounded-lg p-2"
              : ""
          }`}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <label className="block font-medium text-sm">
              Savings ({savingsPct}%)
            </label>
          </div>
          <input
            type="range"
            value={savingsPct}
            onChange={(e) =>
              handleAllocationChange("savings", Number(e.target.value))
            }
            className="w-full mb-2"
            min={minThreshold}
            max={100}
          />
          <input
            type="number"
            value={savingsPct}
            onChange={(e) =>
              handleAllocationChange("savings", Number(e.target.value))
            }
            className="w-full p-1 border rounded text-center text-sm"
            min={minThreshold}
            max={100}
          />
          <span className="text-xs text-gray-600 block mt-1 text-center">
            Conservative storage
          </span>
        </div>

        {/* Investments */}
        <div
          className={`transition-all duration-300 ${
            highlightField === "investments"
              ? "ring-2 ring-yellow-400 rounded-lg p-2"
              : ""
          }`}
        >
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <label className="block font-medium text-sm">
              Investments ({investmentsPct}%)
            </label>
          </div>
          <input
            type="range"
            value={investmentsPct}
            onChange={(e) =>
              handleAllocationChange("investments", Number(e.target.value))
            }
            className="w-full mb-2"
            min={minThreshold}
            max={100}
          />
          <input
            type="number"
            value={investmentsPct}
            onChange={(e) =>
              handleAllocationChange("investments", Number(e.target.value))
            }
            className="w-full p-1 border rounded text-center text-sm"
            min={minThreshold}
            max={100}
          />
          <span className="text-xs text-gray-600 block mt-1 text-center">
            Medium risk/yield
          </span>
        </div>

        {/* Speculation */}
        <div>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <label className="block font-medium text-sm">
              Speculation ({speculationPct}%)
            </label>
          </div>
          <div className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
            Auto-adjusted to {speculationPct}%
          </div>
          <span className="text-xs text-gray-600 block mt-1 text-center">
            High risk/yield
          </span>
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Total Allocation:</span>
            <span className="font-medium">
              {savingsPct + investmentsPct + speculationPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
