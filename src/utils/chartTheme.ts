/**
 * Chart theme utilities for getting resolved CSS variables
 * Chart.js doesn't support CSS variables, so we need to resolve them to actual color values
 */

export interface ChartThemeColors {
  textPrimary: string;
  textSecondary: string;
  border: string;
  surfaceAlt: string;
  accent: string;
}

export interface ChartDatasetColors {
  primary: string;
  primaryBg: string;
  secondary: string;
  secondaryBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
  purple: string;
  purpleBg: string;
}

export interface AllChartColors {
  theme: ChartThemeColors;
  datasets: ChartDatasetColors;
}

/**
 * Get computed color values based on theme for use in Chart.js
 */
export function getChartThemeColors(
  theme: "light" | "dark" = "light",
): ChartThemeColors {
  if (theme === "dark") {
    return {
      textPrimary: "#ffffff",
      textSecondary: "#a1a1aa",
      border: "#27272a",
      surfaceAlt: "#18181b",
      accent: "#F7931A", // Bitcoin Orange
    };
  } else {
    return {
      textPrimary: "#09090b",
      textSecondary: "#71717a",
      border: "#e4e4e7",
      surfaceAlt: "#f4f4f5",
      accent: "#F7931A", // Bitcoin Orange
    };
  }
}

/**
 * Get themed dataset colors that work well in both light and dark modes
 */
export function getChartDatasetColors(
  theme: "light" | "dark" = "light",
): ChartDatasetColors {
  // Use the passed theme instead of DOM detection
  const isDark = theme === "dark";

  // Debug logging
  console.log("🎨 Chart Theme Debug:", {
    themeParam: theme,
    isDark,
    timestamp: new Date().toISOString(),
  });

  console.log("🌙 Using theme mode:", isDark ? "DARK" : "LIGHT");

  if (isDark) {
    // Dark mode - use brighter, more vibrant colors
    const colors = {
      primary: "#F7931A", // Bitcoin Orange
      primaryBg: "rgba(247, 147, 26, 0.2)",
      secondary: "#22C55E", // Bright Green
      secondaryBg: "rgba(34, 197, 94, 0.2)",
      success: "#10B981", // Emerald
      successBg: "rgba(16, 185, 129, 0.2)",
      warning: "#F59E0B", // Amber
      warningBg: "rgba(245, 158, 11, 0.2)",
      error: "#EF4444", // Red
      errorBg: "rgba(239, 68, 68, 0.2)",
      info: "#3B82F6", // Blue
      infoBg: "rgba(59, 130, 246, 0.2)",
      purple: "#A855F7", // Purple
      purpleBg: "rgba(168, 85, 247, 0.2)",
    };
    console.log("🌙 Using DARK mode colors:", colors);
    return colors;
  } else {
    // Light mode - use standard colors
    const colors = {
      primary: "#F7931A", // Bitcoin Orange
      primaryBg: "rgba(247, 147, 26, 0.2)",
      secondary: "#10B981", // Green
      secondaryBg: "rgba(16, 185, 129, 0.2)",
      success: "#059669", // Darker Green
      successBg: "rgba(5, 150, 105, 0.2)",
      warning: "#D97706", // Darker Amber
      warningBg: "rgba(217, 119, 6, 0.2)",
      error: "#DC2626", // Darker Red
      errorBg: "rgba(220, 38, 38, 0.2)",
      info: "#1D4ED8", // Darker Blue
      infoBg: "rgba(29, 78, 216, 0.2)",
      purple: "#7C3AED", // Darker Purple
      purpleBg: "rgba(124, 58, 237, 0.2)",
    };
    console.log("☀️ Using LIGHT mode colors:", colors);
    return colors;
  }
}

/**
 * Get all chart colors - both theme and dataset colors
 */
export function getAllChartColors(
  theme: "light" | "dark" = "light",
): AllChartColors {
  return {
    theme: getChartThemeColors(theme),
    datasets: getChartDatasetColors(theme),
  };
}

/**
 * Get default chart options with proper theming
 */
export function getThemedChartOptions(colors: ChartThemeColors) {
  return {
    scales: {
      x: {
        ticks: {
          color: colors.textSecondary,
        },
        title: {
          color: colors.textSecondary,
        },
        grid: {
          color: colors.border,
        },
      },
      y: {
        ticks: {
          color: colors.textSecondary,
        },
        title: {
          color: colors.textSecondary,
        },
        grid: {
          color: colors.border,
        },
      },
    },
    plugins: {
      title: {
        color: colors.textPrimary,
      },
      legend: {
        labels: {
          color: colors.textSecondary,
        },
      },
      tooltip: {
        backgroundColor: colors.surfaceAlt,
        titleColor: colors.textPrimary,
        bodyColor: colors.textPrimary,
        borderColor: colors.accent,
        borderWidth: 1,
      },
    },
  };
}
