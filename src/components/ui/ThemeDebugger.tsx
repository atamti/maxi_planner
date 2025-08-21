import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

export const ThemeDebugger: React.FC = () => {
  const { theme, isDark } = useTheme();

  React.useEffect(() => {
    console.log("🎨 Theme state:", { theme, isDark });
    console.log("🎨 HTML classes:", document.documentElement.className);
    console.log(
      "🎨 Data theme:",
      document.documentElement.getAttribute("data-theme"),
    );

    // Check CSS variables
    const styles = getComputedStyle(document.documentElement);
    const vars = {
      bg: styles.getPropertyValue("--color-bg"),
      surface: styles.getPropertyValue("--color-surface"),
      textPrimary: styles.getPropertyValue("--color-text-primary"),
      border: styles.getPropertyValue("--color-border"),
    };
    console.log("🎨 CSS Variables:", vars);

    // Test if variables are working by checking background
    console.log(
      "🎨 Body background:",
      getComputedStyle(document.body).backgroundColor,
    );
  }, [theme, isDark]);

  return (
    <div className="fixed top-4 left-4 z-50 p-2 bg-surface border border-[var(--color-border)] text-xs font-mono text-primary">
      <div>Theme: {theme}</div>
      <div>Dark: {isDark ? "Yes" : "No"}</div>
      <div className="mt-1">
        <div className="w-4 h-4 bg-[var(--color-bg)] border inline-block mr-1"></div>
        <div className="w-4 h-4 bg-[var(--color-surface)] border inline-block mr-1"></div>
        <div className="w-4 h-4 bg-[var(--color-accent)] border inline-block"></div>
      </div>
    </div>
  );
};
