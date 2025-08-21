// Pure display components separated from business logic
import React from "react";

// Pure input components that only handle display and user interaction

export interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: string;
  warning?: string;
  unit?: string;
  className?: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  error,
  warning,
  unit,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block font-medium mb-1">
        {label}
        {unit && <span className="text-gray-500 ml-1">({unit})</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`w-full p-2 border rounded ${
          error
            ? "border-red-500 bg-red-50"
            : warning
              ? "border-yellow-500 bg-yellow-50"
              : "border-gray-300"
        } ${disabled ? "bg-gray-100" : ""}`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {warning && !error && (
        <p className="text-yellow-600 text-sm mt-1">{warning}</p>
      )}
    </div>
  );
};

export interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  error?: string;
  warning?: string;
  displayValue?: string;
  className?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  error,
  warning,
  displayValue,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block font-heading text-xs tracking-wide text-brand-gray mb-1">
        {label.toUpperCase()}
      </label>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`w-full h-2 rounded-none bg-brand-black/40 [accent-color:#F7931A] cursor-pointer transition-opacity ${
          error
            ? "[accent-color:#EF4444]"
            : warning
              ? "[accent-color:#F59E0B]"
              : "[accent-color:#F7931A]"
        } ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90"}`}
      />
      <div className="flex justify-between text-[10px] font-mono text-brand-gray mt-1">
        <span className="text-brand-orange font-semibold">
          {displayValue || value}
        </span>
        <span className="opacity-70">
          {min}-{max}
        </span>
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {warning && !error && (
        <p className="text-yellow-600 text-sm mt-1">{warning}</p>
      )}
    </div>
  );
};

export interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  disabled?: boolean;
  error?: string;
  warning?: string;
  className?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  warning,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-2 border rounded ${
          error
            ? "border-red-500 bg-red-50"
            : warning
              ? "border-yellow-500 bg-yellow-50"
              : "border-gray-300"
        } ${disabled ? "bg-gray-100" : ""}`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {warning && !error && (
        <p className="text-yellow-600 text-sm mt-1">{warning}</p>
      )}
    </div>
  );
};

export interface CheckboxInputProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  warning?: string;
  description?: string;
  className?: string;
}

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  warning,
  description,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-start">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={`mt-1 mr-2 ${
            error ? "accent-red-500" : "accent-blue-500"
          } ${disabled ? "opacity-50" : ""}`}
        />
        <div className="flex-1">
          <label className={`font-medium ${disabled ? "text-gray-500" : ""}`}>
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {warning && !error && (
        <p className="text-yellow-600 text-sm mt-1">{warning}</p>
      )}
    </div>
  );
};
