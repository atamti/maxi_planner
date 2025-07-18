import React from "react";

interface AllocationSummaryProps {
  savingsPct: number;
  investmentsPct: number;
  speculationPct: number;
}

export const AllocationSummary: React.FC<AllocationSummaryProps> = ({
  savingsPct,
  investmentsPct,
  speculationPct,
}) => {
  const total = savingsPct + investmentsPct + speculationPct;

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Total Allocation:</span>
          <span className="font-medium">{total}%</span>
        </div>
      </div>
    </div>
  );
};
