import React, { useState } from "react";

interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "",
  disabled,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const roundToStep = (num: number, step: number): number => {
    const factor = 1 / step;
    return Math.round(num * factor) / factor;
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = roundToStep(value + step, step);
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
    // Keep input focused after clicking spinner
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = roundToStep(value - step, step);
    if (min === undefined || newValue >= min) {
      onChange(newValue);
    }
    // Keep input focused after clicking spinner
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const canIncrement = !disabled && (max === undefined || value < max);
  const canDecrement = !disabled && (min === undefined || value > min);

  return (
    <div className="relative">
      <input
        {...props}
        ref={inputRef}
        type="number"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`${className} pr-8`} // Add padding for buttons
        style={{
          WebkitAppearance: "textfield",
          MozAppearance: "textfield",
          appearance: "textfield",
        }}
      />

      {/* Custom increment/decrement buttons */}
      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={`
            w-6 h-4 flex items-center justify-center text-xs font-bold leading-none
            active:brightness-150
            disabled:text-gray-400 disabled:cursor-not-allowed
            transition-all duration-150 focus:outline-none
            ${canIncrement ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
          `}
          style={
            {
              color: isFocused ? "var(--color-accent)" : "var(--color-border)",
              "--hover-color": "var(--color-accent)",
            } as React.CSSProperties
          }
          onMouseEnter={(e) => {
            if (!disabled && canIncrement) {
              e.currentTarget.style.color = "var(--color-accent)";
              e.currentTarget.style.filter = "brightness(1.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && canIncrement) {
              e.currentTarget.style.color = isFocused
                ? "var(--color-accent)"
                : "var(--color-border)";
              e.currentTarget.style.filter = "";
            }
          }}
          tabIndex={-1} // Prevent tab focus on buttons
        >
          ▲
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={`
            w-6 h-4 flex items-center justify-center text-xs font-bold leading-none
            active:brightness-150
            disabled:text-gray-400 disabled:cursor-not-allowed
            transition-all duration-150 focus:outline-none
            ${canDecrement ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
          `}
          style={
            {
              color: isFocused ? "var(--color-accent)" : "var(--color-border)",
              "--hover-color": "var(--color-accent)",
            } as React.CSSProperties
          }
          onMouseEnter={(e) => {
            if (!disabled && canDecrement) {
              e.currentTarget.style.color = "var(--color-accent)";
              e.currentTarget.style.filter = "brightness(1.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && canDecrement) {
              e.currentTarget.style.color = isFocused
                ? "var(--color-accent)"
                : "var(--color-border)";
              e.currentTarget.style.filter = "";
            }
          }}
          tabIndex={-1} // Prevent tab focus on buttons
        >
          ▼
        </button>
      </div>
    </div>
  );
};
