import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";
const THEME_KEY = "theme";

export function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark"; // SSR safety
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    // Prefer system, but bias to dark for brand aesthetic
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return prefersDark ? "dark" : "dark"; // Always default dark for brand
  } catch {
    return "dark";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    console.log("🔧 useTheme effect running, setting theme to:", theme);
    const root = document.documentElement;

    // Clear existing classes first
    root.classList.remove("dark", "light");

    // Add the new theme class
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);

    // Force a reflow to ensure DOM is updated
    root.offsetHeight;

    console.log(
      "🔧 DOM after update - classes:",
      root.className,
      "data-theme:",
      root.getAttribute("data-theme"),
    );

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, isDark: theme === "dark", toggleTheme };
}
