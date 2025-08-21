import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../../../test/testUtils";
import { IncomeBtcChart } from "./IncomeBtcChart";

// Mock Chart.js and react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(({ data, options }) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )),
}));

describe("IncomeBtcChart", () => {
  const mockData = {
    labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
    datasets: [
      {
        label: "Income (BTC Terms)",
        data: [1.25, 1.1, 0.95, 0.82, 0.71], // Income purchasing power decreases as BTC appreciates
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.1,
      },
      {
        label: "Expenses (BTC Terms)",
        data: [1.0, 0.88, 0.76, 0.66, 0.57], // Expenses purchasing power also decreases
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.1,
      },
    ],
  };

  const mockConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return label + ": ₿ " + value.toFixed(4);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "₿ " + value.toFixed(4);
          },
        },
      },
    },
  };

  it("should render the chart title", () => {
    render(<IncomeBtcChart data={mockData} config={mockConfig} />);

    expect(
      screen.getByText("₿ USD INCOME IN BTC TERMS (PURCHASING POWER)"),
    ).toBeInTheDocument();
  });

  it("should render the explanatory text", () => {
    render(<IncomeBtcChart data={mockData} config={mockConfig} />);

    expect(
      screen.getByText(
        "📉 SHOWS HOW USD INCOME AND EXPENSES LOSE PURCHASING POWER AS BTC APPRECIATES",
      ),
    ).toBeInTheDocument();
  });

  it("should render the Line chart component", () => {
    render(<IncomeBtcChart data={mockData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should pass correct data to the chart", () => {
    render(<IncomeBtcChart data={mockData} config={mockConfig} />);

    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent(JSON.stringify(mockData));
  });

  it("should pass correct config to the chart", () => {
    render(<IncomeBtcChart data={mockData} config={mockConfig} />);

    const chartOptions = screen.getByTestId("chart-options");
    expect(chartOptions).toHaveTextContent(JSON.stringify(mockConfig));
  });

  it("should have proper component structure and styling", () => {
    const { container } = render(
      <IncomeBtcChart data={mockData} config={mockConfig} />,
    );

    // Check for main container div
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv.tagName).toBe("DIV");

    // Check for title with proper styling
    const title = screen.getByText(
      "₿ USD INCOME IN BTC TERMS (PURCHASING POWER)",
    );
    expect(title).toHaveClass("text-lg", "font-bold", "text-bitcoin-orange");

    // Check for explanatory text styling
    const explanatoryText = screen.getByText(
      "📉 SHOWS HOW USD INCOME AND EXPENSES LOSE PURCHASING POWER AS BTC APPRECIATES",
    );
    expect(explanatoryText).toHaveClass(
      "text-xs",
      "text-secondary",
      "mt-3",
      "font-mono",
      "uppercase",
      "tracking-wide",
    );
  });

  it("should handle empty data gracefully", () => {
    const emptyData = {
      labels: [],
      datasets: [],
    };

    render(<IncomeBtcChart data={emptyData} config={mockConfig} />);

    expect(
      screen.getByText("₿ USD INCOME IN BTC TERMS (PURCHASING POWER)"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle null/undefined data", () => {
    render(<IncomeBtcChart data={null} config={mockConfig} />);

    expect(
      screen.getByText("₿ USD INCOME IN BTC TERMS (PURCHASING POWER)"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should handle null/undefined config", () => {
    render(<IncomeBtcChart data={mockData} config={null} />);

    expect(
      screen.getByText("₿ USD INCOME IN BTC TERMS (PURCHASING POWER)"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render with decreasing purchasing power data", () => {
    const decreasingPowerData = {
      labels: ["Year 1", "Year 2", "Year 3"],
      datasets: [
        {
          label: "Income (BTC Terms)",
          data: [2.0, 1.0, 0.5], // Dramatic decrease in BTC purchasing power
        },
        {
          label: "Expenses (BTC Terms)",
          data: [1.5, 0.75, 0.375], // Also decreasing
        },
      ],
    };

    render(<IncomeBtcChart data={decreasingPowerData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent("Income (BTC Terms)");
    expect(chartData).toHaveTextContent("Expenses (BTC Terms)");
  });

  it("should handle very small BTC values", () => {
    const smallValuesData = {
      labels: ["Year 5", "Year 10", "Year 15", "Year 20"],
      datasets: [
        {
          label: "Income (BTC Terms)",
          data: [0.001, 0.0005, 0.00025, 0.000125], // Very small BTC amounts
        },
      ],
    };

    render(<IncomeBtcChart data={smallValuesData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render with single dataset", () => {
    const singleDatasetData = {
      labels: ["Year 1", "Year 2", "Year 3"],
      datasets: [
        {
          label: "Income (BTC Terms)",
          data: [1.5, 1.2, 0.9],
        },
      ],
    };

    render(<IncomeBtcChart data={singleDatasetData} config={mockConfig} />);

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    const chartData = screen.getByTestId("chart-data");
    expect(chartData).toHaveTextContent("Income (BTC Terms)");
  });

  it("should render all text content with emojis correctly", () => {
    render(<IncomeBtcChart data={mockData} config={mockConfig} />);

    // Verify emoji and text content
    expect(screen.getByText(/₿/)).toBeInTheDocument();
    expect(screen.getByText(/USD INCOME IN BTC TERMS/)).toBeInTheDocument();
    expect(screen.getByText(/\(PURCHASING POWER\)/)).toBeInTheDocument();
    expect(screen.getByText(/📉/)).toBeInTheDocument();
    expect(
      screen.getByText(/LOSE PURCHASING POWER AS BTC APPRECIATES/),
    ).toBeInTheDocument();
  });

  it("should handle extreme BTC appreciation scenarios", () => {
    const extremeAppreciationData = {
      labels: ["Year 1", "Year 5", "Year 10"],
      datasets: [
        {
          label: "Income (BTC Terms)",
          data: [10, 1, 0.01], // Extreme decrease due to BTC appreciation
        },
        {
          label: "Expenses (BTC Terms)",
          data: [8, 0.8, 0.008],
        },
      ],
    };

    render(
      <IncomeBtcChart data={extremeAppreciationData} config={mockConfig} />,
    );

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });
});
