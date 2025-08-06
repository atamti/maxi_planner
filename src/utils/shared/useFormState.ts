import { useCallback, useMemo, useState } from "react";

/**
 * Shared utility hook for form state management with validation
 * Provides consistent validation and error handling patterns
 */
export const useFormState = <T>(
  initialValue: T,
  validator?: (value: T) => { isValid: boolean; error?: string },
  transformer?: (value: T) => T,
) => {
  // Apply transformer to initial value if provided
  const processedInitialValue = transformer
    ? transformer(initialValue)
    : initialValue;
  const [value, setValue] = useState(processedInitialValue);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => {
    if (!validator) return { isValid: true };
    const result = validator(value);
    // Ensure isValid is always a boolean for safety
    return {
      isValid: Boolean(result?.isValid),
      error: result?.error,
    };
  }, [value, validator]);

  const updateValue = useCallback(
    (newValue: T) => {
      const processedValue = transformer ? transformer(newValue) : newValue;

      if (validator) {
        const validationResult = validator(processedValue);
        if (validationResult.isValid) {
          setValue(processedValue);
          setError(null);
        } else {
          setValue(processedValue); // Still update value but show error
          setError(validationResult.error || "Invalid value");
        }
      } else {
        setValue(processedValue);
        setError(null);
      }
    },
    [validator, transformer],
  );

  return {
    value,
    setValue: updateValue,
    error,
    isValid: validation.isValid,
    hasError: !!error,
  };
};
