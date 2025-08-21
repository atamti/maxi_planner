import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BtcGrowthChart } from "./BtcGrowthChart";

// Mock Chart.js components
vi.mock("react-chartjs-2", () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}));

const mockChartData = {
  labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
  datasets: [
    {
      label: "BTC Stack Growth",
      data: [5, 6.5, 8, 10, 12.5],
      borderColor: "rgb(255, 159, 64)",
      backgroundColor: "rgba(255, 159, 64, 0.2)",
      borderWidth: 2,
      fill: true,
    },
  ],
};

const mockChartConfig = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
    title: {
      display: true,
      text: "Bitcoin Stack Growth Over Time",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "BTC Amount",
      },
    },
    x: {
      title: {
        display: true,
        text: "Years",
      },
    },
  },
};

describe("BtcGrowthChart", () => {
  it("should render the chart with title", () => {
    render(<BtcGrowthChart data={mockChartData} config={mockChartConfig} />);

    expect(screen.getByText("📈 BTC STACK GROWTH")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should pass data to Line component", () => {
    render(<BtcGrowthChart data={mockChartData} config={mockChartConfig} />);

    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent("BTC Stack Growth");
    expect(chartData).toHaveTextContent("[5,6.5,8,10,12.5]");
  });

  it("should pass config to Line component", () => {
    render(<BtcGrowthChart data={mockChartData} config={mockChartConfig} />);

    const chartOptions = screen.getByTestId("chart-options");
    expect(chartOptions).toHaveTextContent("responsive");
    expect(chartOptions).toHaveTextContent("Bitcoin Stack Growth Over Time");
  });

  it("should handle empty data gracefully", () => {
    const emptyData = {
      labels: [],
      datasets: [],
    };

    render(<BtcGrowthChart data={emptyData} config={mockChartConfig} />);

    expect(screen.getByText("📈 BTC STACK GROWTH")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle minimal config", () => {
    const minimalConfig = {
      responsive: true,
    };

    render(<BtcGrowthChart data={mockChartData} config={minimalConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("chart-options")).toHaveTextContent("responsive");
  });

  it("should display correct chart structure", () => {
    render(<BtcGrowthChart data={mockChartData} config={mockChartConfig} />);

    // Check the container structure
    const container = screen.getByText("📈 BTC STACK GROWTH").parentElement;
    expect(container).toBeInTheDocument();

    // Chart should be present
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle different dataset structures", () => {
    const multiDatasetData = {
      labels: ["Year 1", "Year 2", "Year 3"],
      datasets: [
        {
          label: "With DCA",
          data: [5, 7, 9],
          borderColor: "rgb(255, 159, 64)",
        },
        {
          label: "Without DCA",
          data: [5, 5.5, 6],
          borderColor: "rgb(54, 162, 235)",
        },
      ],
    };

    render(<BtcGrowthChart data={multiDatasetData} config={mockChartConfig} />);

    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent("With DCA");
    expect(chartData).toHaveTextContent("Without DCA");
  });

  it("should handle null or undefined props gracefully", () => {
    render(<BtcGrowthChart data={null} config={null} />);

    expect(screen.getByText("📈 BTC STACK GROWTH")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });
});
