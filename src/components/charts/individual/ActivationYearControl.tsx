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
    <div className="mb-6 p-4 card-themed border border-bitcoin-orange">
      <label className="block font-medium mb-2 text-lg font-heading tracking-wide text-bitcoin-orange">
        📅 ACTIVATION YEAR: {formData.activationYear}
      </label>
      <input
        type="range"
        value={formData.activationYear}
        onChange={(e) =>
          onUpdateFormData?.({ activationYear: Number(e.target.value) })
        }
        className="w-full h-2 bg-surface border border-themed appearance-none cursor-pointer slider-bitcoin focus-ring-themed"
        min="0"
        max={formData.timeHorizon}
      />
      <div className="flex justify-between text-sm text-secondary mt-2 font-mono">
        <span>Year 0</span>
        <span className="font-medium text-primary font-ui">
          Year {formData.activationYear} - When income starts
        </span>
        <span>Year {formData.timeHorizon}</span>
      </div>
    </div>
  );
};
