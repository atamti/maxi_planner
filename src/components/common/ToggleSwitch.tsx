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
  colorClass = { on: "bg-bitcoin-orange", off: "bg-gray-500 dark:bg-gray-600" },
}) => {
  return (
    <div className="p-4 rounded-none border border-themed bg-surface-alt relative group">
      <div className="flex items-center justify-start space-x-4">
        {label && (
          <div className="text-sm font-medium font-mono uppercase tracking-wide text-primary w-38">
            {label}
          </div>
        )}

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
            className={`flex items-center cursor-pointer w-12 h-6 rounded-none border border-gray-400 dark:border-gray-600 transition-colors duration-200 
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              backgroundColor: checked ? "var(--color-accent)" : "#6b7280",
            }}
          >
            <span
              className={`inline-block w-4 h-4 rounded-none border shadow transform transition-all duration-200 
              ${
                checked
                  ? "translate-x-7 bg-white border-white"
                  : "translate-x-1 bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600"
              }`}
            />
          </label>
        </div>
      </div>

      {/* Description with dynamic text based on state */}
      {description && (
        <div className="mt-3 text-xs min-h-[1.5rem] ml-1 text-secondary font-mono">
          {checked ? description.on : description.off}
        </div>
      )}
    </div>
  );
};
