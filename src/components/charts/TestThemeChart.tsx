import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../contexts/ThemeContext";
import { FormData } from "../../types";
import { getAllChartColors } from "../../utils/chartTheme";

interface Props {
  formData: FormData;
}

// TEST COMPONENT - Isolated chart to diagnose theming issue
export const TestThemeChart: React.FC<Props> = ({ formData }) => {
  const { theme } = useTheme();
  const chartRef = useRef<any>(null);

  // Force chart destruction and recreation
  useEffect(() => {
    console.log("🔍 TestThemeChart - Theme changed to:", theme);
    if (chartRef.current) {
      console.log("🔍 Destroying existing chart instance");
      chartRef.current.destroy();
    }
  }, [theme]);

  const colors = getAllChartColors(theme);
  console.log("🔍 TestThemeChart - Generated colors:", colors);

  const testData = {
    labels: ["Point 1", "Point 2", "Point 3", "Point 4"],
    datasets: [
      {
        label: "Test Dataset",
        data: [10, 20, 30, 40],
        borderColor: colors.datasets.primary,
        backgroundColor: colors.datasets.primaryBg,
        borderWidth: 3,
        pointRadius: 6,
      },
    ],
  };

  const testOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.theme.textPrimary,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: colors.theme.textSecondary },
        grid: { color: colors.theme.border },
      },
      y: {
        ticks: { color: colors.theme.textSecondary },
        grid: { color: colors.theme.border },
      },
    },
  };

  return (
    <div className="p-4 bg-surface border border-bitcoin-orange rounded">
      <h4 className="text-bitcoin-orange mb-2">
        🔍 THEME TEST CHART - Current: {theme}
      </h4>
      <div style={{ height: "200px" }}>
        <Line
          ref={chartRef}
          key={`test-chart-${theme}-${Date.now()}`} // Force new instance
          data={testData}
          options={testOptions}
        />
      </div>
      <div className="mt-2 text-xs">
        <div>Border Color: {colors.datasets.primary}</div>
        <div>Background: {colors.datasets.primaryBg}</div>
      </div>
    </div>
  );
};
