import { useCallback, useState } from "react";

/**
 * Shared utility hook for managing UI interaction effects
 * Used for temporary state changes (highlights, messages, tooltips, etc.)
 */
export const useInteractionEffects = <T>(
  initialState: T,
  effectDuration: number = 3000,
) => {
  const [state, setState] = useState(initialState);
  const [isActive, setIsActive] = useState(false);

  const triggerEffect = useCallback(
    (newState: T) => {
      setState(newState);
      setIsActive(true);
      setTimeout(() => {
        setState(initialState);
        setIsActive(false);
      }, effectDuration);
    },
    [initialState, effectDuration],
  );

  const resetEffect = useCallback(() => {
    setState(initialState);
    setIsActive(false);
  }, [initialState]);

  return {
    state,
    isActive,
    triggerEffect,
    resetEffect,
  };
};
