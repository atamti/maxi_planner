import React from "react";
import { FormData } from "../../../types";

interface ActivationYearControlProps {
  formData: FormData;
  onUpdateFormData?: (updates: Partial<FormData>) => void;
}

export const ActivationYearControl: React.FC<ActivationYearControlProps> = ({
  formData,
  onUpdateFormData,
}) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
      <label className="block font-medium mb-2 text-lg">
        📅 Activation Year: {formData.activationYear}
      </label>
      <input
        type="range"
        value={formData.activationYear}
        onChange={(e) =>
          onUpdateFormData?.({ activationYear: Number(e.target.value) })
        }
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        min="0"
        max={formData.timeHorizon}
      />
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>Year 0</span>
        <span className="font-medium">
          Year {formData.activationYear} - When income starts
        </span>
        <span>Year {formData.timeHorizon}</span>
      </div>
    </div>
  );
};
