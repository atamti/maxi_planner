import React from "react";
import { InputType } from "../../types";

interface RateInputsProps {
  rateType: string;
  inputType: InputType;
  flatRate: number;
  startRate: number;
  endRate: number;
  onFlatRateChange: (value: number) => void;
  onStartRateChange: (value: number) => void;
  onEndRateChange: (value: number) => void;
  isLocked: boolean;
  onLockedInteraction: () => void;
}

const RateInputs: React.FC<RateInputsProps> = ({
  rateType,
  inputType,
  flatRate,
  startRate,
  endRate,
  onFlatRateChange,
  onStartRateChange,
  onEndRateChange,
  isLocked,
  onLockedInteraction,
}) => {
  return (
    <div className="mb-4">
      {inputType === "flat" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {rateType} Rate (%)
          </label>
          <input
            type="number"
            value={flatRate}
            onChange={(e) => onFlatRateChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            step="0.1"
            disabled={isLocked}
            onClick={isLocked ? onLockedInteraction : undefined}
          />
        </div>
      )}

      {inputType === "linear" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Rate (%)
            </label>
            <input
              type="number"
              value={startRate}
              onChange={(e) =>
                onStartRateChange(parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="0.1"
              disabled={isLocked}
              onClick={isLocked ? onLockedInteraction : undefined}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Rate (%)
            </label>
            <input
              type="number"
              value={endRate}
              onChange={(e) => onEndRateChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              step="0.1"
              disabled={isLocked}
              onClick={isLocked ? onLockedInteraction : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RateInputs;
