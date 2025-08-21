import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getAllChartColors } from "../../utils/chartTheme";

// Deep inspection of color values
export const ColorInspector: React.FC = () => {
  const { theme } = useTheme();
  const colors = getAllChartColors(theme);

  console.log(
    "🔬 ColorInspector - Full color object:",
    JSON.stringify(colors, null, 2),
  );

  return (
    <div className="p-4 bg-surface border-2 border-purple-500 text-xs">
      <h4 className="text-purple-500 mb-2">🔬 COLOR INSPECTOR - {theme}</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <strong>Dataset Colors:</strong>
          <div>
            Primary:{" "}
            <span style={{ color: colors.datasets.primary }}>
              {colors.datasets.primary}
            </span>
          </div>
          <div>
            PrimaryBg:{" "}
            <span
              style={{
                backgroundColor: colors.datasets.primaryBg,
                padding: "2px",
              }}
            >
              {colors.datasets.primaryBg}
            </span>
          </div>
          <div>
            Success:{" "}
            <span style={{ color: colors.datasets.success }}>
              {colors.datasets.success}
            </span>
          </div>
          <div>
            Warning:{" "}
            <span style={{ color: colors.datasets.warning }}>
              {colors.datasets.warning}
            </span>
          </div>
          <div>
            Error:{" "}
            <span style={{ color: colors.datasets.error }}>
              {colors.datasets.error}
            </span>
          </div>
        </div>
        <div>
          <strong>Theme Colors:</strong>
          <div>
            TextPrimary:{" "}
            <span style={{ color: colors.theme.textPrimary }}>
              {colors.theme.textPrimary}
            </span>
          </div>
          <div>
            TextSecondary:{" "}
            <span style={{ color: colors.theme.textSecondary }}>
              {colors.theme.textSecondary}
            </span>
          </div>
          <div>
            Border:{" "}
            <span
              style={{
                borderBottom: `2px solid ${colors.theme.border}`,
                padding: "2px",
              }}
            >
              {colors.theme.border}
            </span>
          </div>
          <div>
            Accent:{" "}
            <span style={{ color: colors.theme.accent }}>
              {colors.theme.accent}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800">
        <strong>Raw JSON:</strong>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(colors, null, 2)}
        </pre>
      </div>
    </div>
  );
};
