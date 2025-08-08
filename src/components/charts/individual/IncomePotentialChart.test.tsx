import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IncomePotentialChart } from "./IncomePotentialChart";

// Mock Chart.js and react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(({ data, options }) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
}));

describe("IncomePotentialChart", () => {
  const mockData = {
    labels: ["Year 3", "Year 4", "Year 5", "Year 6", "Year 7"],
    datasets: [
      {
        label: "Income Potential",
        data: [45000, 52000, 60000, 68000, 77000],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.1,
      },
      {
        label: "Expenses",
        data: [50000, 52500, 55000, 57500, 60000],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.1,
      },
    ],
  };

  const mockConfig = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return label + ": $" + value.toLocaleString();
          },
        },
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
    onClick: vi.fn(),
  };

  it("should render the chart title", () => {
    render(<IncomePotentialChart data={mockData} config={mockConfig} />);

    expect(
      screen.getByText("📊 Income vs Expenses by Activation Year"),
    ).toBeInTheDocument();
  });

  it("should render the help text", () => {
    render(<IncomePotentialChart data={mockData} config={mockConfig} />);

    expect(
      screen.getByText(
        "💡 Click on any point to set that year as your activation year",
      ),
    ).toBeInTheDocument();
  });

  it("should render the Line chart component", () => {
    render(<IncomePotentialChart data={mockData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should pass correct data to the chart", () => {
    render(<IncomePotentialChart data={mockData} config={mockConfig} />);

    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent(JSON.stringify(mockData));
  });

  it("should pass correct config to the chart", () => {
    render(<IncomePotentialChart data={mockData} config={mockConfig} />);

    const chartOptions = screen.getByTestId("chart-options");
    expect(chartOptions).toHaveTextContent(JSON.stringify(mockConfig));
  });

  it("should have proper component structure and styling", () => {
    const { container } = render(
      <IncomePotentialChart data={mockData} config={mockConfig} />,
    );

    // Check for main container div
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.tagName).toBe("DIV");

    // Check for title with proper styling
    const title = screen.getByText("📊 Income vs Expenses by Activation Year");
    expect(title).toHaveClass("text-lg", "font-semibold", "mb-2");

    // Check for help text styling
    const helpText = screen.getByText(
      "💡 Click on any point to set that year as your activation year",
    );
    expect(helpText).toHaveClass("text-xs", "text-gray-600", "mt-2");
  });

  it("should handle empty data gracefully", () => {
    const emptyData = {
      labels: [],
      datasets: [],
    };

    render(<IncomePotentialChart data={emptyData} config={mockConfig} />);

    expect(
      screen.getByText("📊 Income vs Expenses by Activation Year"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle null/undefined data", () => {
    render(<IncomePotentialChart data={null} config={mockConfig} />);

    expect(
      screen.getByText("📊 Income vs Expenses by Activation Year"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle null/undefined config", () => {
    render(<IncomePotentialChart data={mockData} config={null} />);

    expect(
      screen.getByText("📊 Income vs Expenses by Activation Year"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render with crossover point data", () => {
    const crossoverData = {
      labels: ["Year 3", "Year 4", "Year 5", "Year 6"],
      datasets: [
        {
          label: "Income Potential",
          data: [45000, 50000, 55000, 60000], // Income crosses expenses at Year 4
        },
        {
          label: "Expenses",
          data: [52000, 50000, 48000, 46000], // Expenses decrease over time
        },
      ],
    };

    render(<IncomePotentialChart data={crossoverData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent("Income Potential");
    expect(chartData).toHaveTextContent("Expenses");
  });

  it("should handle chart with many activation years", () => {
    const manyYearsData = {
      labels: Array.from({ length: 20 }, (_, i) => `Year ${i + 1}`),
      datasets: [
        {
          label: "Income Potential",
          data: Array.from({ length: 20 }, (_, i) => 40000 + i * 5000),
        },
        {
          label: "Expenses",
          data: Array.from({ length: 20 }, (_, i) => 50000 + i * 2000),
        },
      ],
    };

    render(<IncomePotentialChart data={manyYearsData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render all text content correctly", () => {
    render(<IncomePotentialChart data={mockData} config={mockConfig} />);

    // Verify emoji and text content
    expect(screen.getByText(/📊/)).toBeInTheDocument();
    expect(
      screen.getByText(/Income vs Expenses by Activation Year/),
    ).toBeInTheDocument();
    expect(screen.getByText(/💡/)).toBeInTheDocument();
    expect(
      screen.getByText(/Click on any point to set that year/),
    ).toBeInTheDocument();
  });
});
