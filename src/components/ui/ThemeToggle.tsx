import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

/** Simple theme toggle – minimal markup so we don't disrupt layout */
export const ThemeToggle: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color mode"
      className={`btn-secondary-navy dark:btn-gradient-orange !px-3 !py-1 text-xs tracking-wide ${className}`}
    >
      {isDark ? "LIGHT MODE" : "DARK MODE"}
    </button>
  );
};
