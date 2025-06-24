import React from "react";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  label?: string;
  description?: { on: string; off: string };
  disabled?: boolean;
  colorClass?: { on: string; off: string };
}

export const ToggleSwitch: React.FC<Props> = ({
  checked,
  onChange,
  id,
  label,
  description,
  disabled = false,
  colorClass = { on: "bg-blue-500", off: "bg-gray-300" },
}) => {
  return (
    <div className="p-3 rounded-lg border relative group">
      <div className="flex items-center justify-start space-x-4">
        {label && <div className="text-sm font-medium w-38">{label}</div>}

        <div className="relative mx-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
            id={id}
            disabled={disabled}
          />
          <label
            htmlFor={id}
            className={`flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 
            ${checked ? colorClass.on : colorClass.off}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 
              ${checked ? "translate-x-7" : "translate-x-1"}`}
            />
          </label>
        </div>
      </div>

      {/* Description with dynamic text based on state */}
      {description && (
        <div className="mt-3 text-xs min-h-[1.5rem] ml-1">
          {checked ? description.on : description.off}
        </div>
      )}
    </div>
  );
};
