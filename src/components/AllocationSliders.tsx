import React, { useState } from "react";

interface Props {
  savingsPct: number;
  investmentsPct: number;
  speculationPct: number;
  onUpdate: (updates: {
    savingsPct: number;
    investmentsPct: number;
    speculationPct: number;
  }) => void;
  minThreshold?: number;
}

export const AllocationSliders: React.FC<Props> = ({
  savingsPct,
  investmentsPct,
  speculationPct,
  onUpdate,
  minThreshold = 0,
}) => {
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

        if (newInvestments !== investmentsPct) {
          setHighlightField("investments");
          setTimeout(() => setHighlightField(null), 500);
        }
      } else {
        newSpeculation = remaining - investmentsPct;
      }
    } else if (field === "investments") {
      newInvestments = Math.max(minThreshold, Math.min(100, newValue));
      const remaining = 100 - newInvestments;

      // If speculation would go below threshold, reduce savings
      if (remaining - savingsPct < minThreshold) {
        newSavings = Math.max(minThreshold, remaining - minThreshold);
        newSpeculation = remaining - newSavings;

        if (newSavings !== savingsPct) {
          setHighlightField("savings");
          setTimeout(() => setHighlightField(null), 500);
        }
      } else {
        newSpeculation = remaining - savingsPct;
      }
    }

    onUpdate({
      savingsPct: Math.round(newSavings),
      investmentsPct: Math.round(newInvestments),
      speculationPct: Math.round(newSpeculation),
    });
  };

  const getBarColor = (type: string, isHighlighted: boolean) => {
    if (isHighlighted) return "bg-yellow-400 transition-colors duration-500";

    switch (type) {
      case "savings":
        return "bg-green-500";
      case "investments":
        return "bg-blue-500";
      case "speculation":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Progress Bar */}
      <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden flex">
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
            Medium risk/reward
          </span>
        </div>

        {/* Speculation (Calculated) */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <label className="block font-medium text-sm">
              Speculation (Remaining)
            </label>
          </div>
          <div className="text-xl font-bold text-center py-2">
            {speculationPct}%
          </div>
          <span className="text-xs text-gray-600 block text-center">
            High risk/reward - Auto calculated
          </span>
          {speculationPct <= minThreshold && speculationPct > 0 && (
            <div className="text-xs text-orange-600 text-center mt-1">
              ⚠️ At minimum threshold
            </div>
          )}
        </div>
      </div>

      {/* Constraint Information */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
        💡 Tip: Adjust Savings and Investments - Speculation adjusts
        automatically. Any allocation can be 0%.
      </div>
    </div>
  );
};
