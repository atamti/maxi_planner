import { Chart, ChartConfiguration } from "chart.js";
import React, { useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { getAllChartColors } from "../../utils/chartTheme";

// Direct Chart.js API test - bypasses react-chartjs-2
export const DirectChartTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    console.log("🧪 DirectChartTest - Creating chart with theme:", theme);

    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      console.log("🧪 Destroying previous chart");
      chartRef.current.destroy();
    }

    const colors = getAllChartColors(theme);
    console.log("🧪 DirectChartTest colors:", colors);

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: ["A", "B", "C", "D"],
        datasets: [
          {
            label: "Direct API Test",
            data: [10, 30, 20, 40],
            borderColor: colors.datasets.primary,
            backgroundColor: colors.datasets.primaryBg,
            borderWidth: 4,
            pointRadius: 8,
            pointBackgroundColor: colors.datasets.primary,
            pointBorderColor: colors.datasets.primary,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: colors.theme.textPrimary,
              font: { size: 14 },
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
      },
    };

    console.log("🧪 Creating new Chart instance");
    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [theme]);

  return (
    <div className="p-4 bg-surface border-2 border-green-500">
      <h4 className="text-green-500 mb-2">
        🧪 DIRECT CHART.JS API TEST - {theme}
      </h4>
      <div style={{ height: "200px" }}>
        <canvas ref={canvasRef} />
      </div>
      <div className="text-xs mt-2 text-green-500">
        This bypasses react-chartjs-2 entirely
      </div>
    </div>
  );
};
