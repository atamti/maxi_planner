import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UsdIncomeChart } from "./UsdIncomeChart";

// Mock Chart.js and react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(({ data, options }) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
}));

describe("UsdIncomeChart", () => {
  const mockData = {
    labels: ["Year 1", "Year 2", "Year 3"],
    datasets: [
      {
        label: "Income",
        data: [50000, 55000, 60000],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
      },
      {
        label: "Expenses",
        data: [40000, 42000, 44000],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
      },
    ],
  };

  const mockConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "$" + value.toLocaleString();
          },
        },
      },
    },
  };

  it("should render the chart title", () => {
    render(<UsdIncomeChart data={mockData} config={mockConfig} />);

    expect(screen.getByText("💵 USD Income Stream")).toBeInTheDocument();
  });

  it("should render the Line chart component", () => {
    render(<UsdIncomeChart data={mockData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should pass correct data to the chart", () => {
    render(<UsdIncomeChart data={mockData} config={mockConfig} />);

    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent(JSON.stringify(mockData));
  });

  it("should pass correct config to the chart", () => {
    render(<UsdIncomeChart data={mockData} config={mockConfig} />);

    const chartOptions = screen.getByTestId("chart-options");
    expect(chartOptions).toHaveTextContent(JSON.stringify(mockConfig));
  });

  it("should handle empty data gracefully", () => {
    const emptyData = {
      labels: [],
      datasets: [],
    };

    render(<UsdIncomeChart data={emptyData} config={mockConfig} />);

    expect(screen.getByText("💵 USD Income Stream")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle null/undefined data", () => {
    render(<UsdIncomeChart data={null} config={mockConfig} />);

    expect(screen.getByText("💵 USD Income Stream")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle null/undefined config", () => {
    render(<UsdIncomeChart data={mockData} config={null} />);

    expect(screen.getByText("💵 USD Income Stream")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should have proper component structure", () => {
    const { container } = render(
      <UsdIncomeChart data={mockData} config={mockConfig} />,
    );

    // Check for main container div
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.tagName).toBe("DIV");

    // Check for title with proper styling
    const title = screen.getByText("💵 USD Income Stream");
    expect(title).toHaveClass("text-lg", "font-semibold", "mb-2");
  });

  it("should render with multiple datasets", () => {
    const multiDatasetData = {
      labels: ["Year 1", "Year 2", "Year 3"],
      datasets: [
        {
          label: "Income",
          data: [50000, 55000, 60000],
        },
        {
          label: "Expenses",
          data: [40000, 42000, 44000],
        },
        {
          label: "Savings",
          data: [10000, 13000, 16000],
        },
      ],
    };

    render(<UsdIncomeChart data={multiDatasetData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent("Savings");
  });
});
