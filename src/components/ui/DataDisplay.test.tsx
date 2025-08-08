import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AllocationVisualization,
  MetricDisplay,
  ProgressBar,
} from "./DataDisplay";

describe("DataDisplay - ProgressBar", () => {
  it("should render progress bar with basic props", () => {
    render(<ProgressBar value={50} max={100} />);

    // Should render the progress bar (find by the background div)
    const progressBg = document.querySelector(".bg-gray-200.rounded-full.h-2");
    expect(progressBg).toBeInTheDocument();
  });

  it("should calculate percentage correctly", () => {
    render(
      <ProgressBar
        value={30}
        max={100}
        showPercentage={true}
        label="Progress"
      />,
    );

    expect(screen.getByText("30.0%")).toBeInTheDocument();
  });

  it("should handle different max values", () => {
    render(
      <ProgressBar
        value={15}
        max={50}
        showPercentage={true}
        label="Progress"
      />,
    );

    expect(screen.getByText("30.0%")).toBeInTheDocument(); // 15/50 = 30%
  });

  it("should display label when provided", () => {
    render(<ProgressBar value={75} max={100} label="Progress" />);

    expect(screen.getByText("Progress")).toBeInTheDocument();
  });

  it("should hide percentage when showPercentage is false", () => {
    render(<ProgressBar value={60} max={100} showPercentage={false} />);

    expect(screen.queryByText("60.0%")).not.toBeInTheDocument();
  });

  it("should apply correct color classes", () => {
    const { container, rerender } = render(
      <ProgressBar value={50} max={100} color="green" />,
    );

    expect(container.querySelector(".bg-green-500")).toBeInTheDocument();

    rerender(<ProgressBar value={50} max={100} color="red" />);
    expect(container.querySelector(".bg-red-500")).toBeInTheDocument();

    rerender(<ProgressBar value={50} max={100} color="blue" />);
    expect(container.querySelector(".bg-blue-500")).toBeInTheDocument();
  });

  it("should handle overflow values correctly", () => {
    render(
      <ProgressBar
        value={150}
        max={100}
        showPercentage={true}
        label="Progress"
      />,
    );

    // Should cap at 100%
    expect(screen.getByText("100.0%")).toBeInTheDocument();
  });

  it("should handle zero values", () => {
    render(
      <ProgressBar
        value={0}
        max={100}
        showPercentage={true}
        label="Progress"
      />,
    );

    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ProgressBar value={50} max={100} className="custom-class" />,
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("should use default color when not specified", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);

    expect(container.querySelector(".bg-blue-500")).toBeInTheDocument();
  });

  it("should handle decimal values", () => {
    render(
      <ProgressBar
        value={33.33}
        max={100}
        showPercentage={true}
        label="Progress"
      />,
    );

    expect(screen.getByText("33.3%")).toBeInTheDocument();
  });
});

describe("DataDisplay - MetricDisplay", () => {
  it("should render metric with label and value", () => {
    render(<MetricDisplay label="Total BTC" value={5.5} />);

    expect(screen.getByText("Total BTC")).toBeInTheDocument();
    expect(screen.getByText("5.5")).toBeInTheDocument();
  });

  it("should display unit when provided", () => {
    render(<MetricDisplay label="Price" value={50000} unit="USD" />);

    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("50000")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("should show trend indicators", () => {
    const { rerender } = render(
      <MetricDisplay label="Growth" value={25} trend="up" />,
    );
    expect(screen.getByText("↗️")).toBeInTheDocument();

    rerender(<MetricDisplay label="Growth" value={25} trend="down" />);
    expect(screen.getByText("↘️")).toBeInTheDocument();

    rerender(<MetricDisplay label="Growth" value={25} trend="neutral" />);
    expect(screen.getByText("➡️")).toBeInTheDocument();
  });

  it("should apply different variants", () => {
    const { container, rerender } = render(
      <MetricDisplay label="Test" value={100} variant="large" />,
    );

    expect(container.querySelector(".text-2xl")).toBeInTheDocument();
    expect(container.querySelector(".p-4")).toBeInTheDocument();

    rerender(<MetricDisplay label="Test" value={100} variant="compact" />);
    expect(container.querySelector(".text-base")).toBeInTheDocument();
    expect(container.querySelector(".p-2")).toBeInTheDocument();
  });

  it("should handle string values", () => {
    render(<MetricDisplay label="Status" value="Active" />);

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});

describe("DataDisplay - AllocationVisualization", () => {
  const mockAllocations = [
    { label: "Stocks", percentage: 60, color: "#3B82F6" },
    { label: "Bonds", percentage: 25, color: "#10B981" },
    { label: "Cash", percentage: 15, color: "#F59E0B" },
  ];

  it("should render allocation visualization", () => {
    render(<AllocationVisualization allocations={mockAllocations} />);

    expect(screen.getByText("Stocks: 60%")).toBeInTheDocument();
    expect(screen.getByText("Bonds: 25%")).toBeInTheDocument();
    expect(screen.getByText("Cash: 15%")).toBeInTheDocument();
  });

  it("should create visual bars with correct widths", () => {
    const { container } = render(
      <AllocationVisualization allocations={mockAllocations} />,
    );

    const bars = container.querySelectorAll('[title*="%"]');
    expect(bars).toHaveLength(3);

    expect(bars[0]).toHaveAttribute("title", "Stocks: 60%");
    expect(bars[1]).toHaveAttribute("title", "Bonds: 25%");
    expect(bars[2]).toHaveAttribute("title", "Cash: 15%");
  });

  it("should apply correct colors", () => {
    const { container } = render(
      <AllocationVisualization allocations={mockAllocations} />,
    );

    const bars = container.querySelectorAll(".h-full");
    expect(bars[0]).toHaveStyle("background-color: #3B82F6");
    expect(bars[1]).toHaveStyle("background-color: #10B981");
    expect(bars[2]).toHaveStyle("background-color: #F59E0B");
  });

  it("should handle empty allocations", () => {
    const { container } = render(<AllocationVisualization allocations={[]} />);

    // Should render without errors - check for the main container
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should handle single allocation", () => {
    const singleAllocation = [
      { label: "All BTC", percentage: 100, color: "#F7931A" },
    ];

    render(<AllocationVisualization allocations={singleAllocation} />);

    expect(screen.getByText("All BTC: 100%")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <AllocationVisualization
        allocations={mockAllocations}
        className="custom-viz"
      />,
    );

    expect(container.querySelector(".custom-viz")).toBeInTheDocument();
  });
});

describe("DataDisplay - Component Integration", () => {
  it("should handle component composition", () => {
    render(
      <div>
        <ProgressBar value={25} max={100} label="Step 1" color="blue" />
        <MetricDisplay
          label="Total Value"
          value={50000}
          unit="USD"
          trend="up"
        />
        <AllocationVisualization
          allocations={[
            { label: "BTC", percentage: 70, color: "#F7931A" },
            { label: "Cash", percentage: 30, color: "#10B981" },
          ]}
        />
      </div>,
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Total Value")).toBeInTheDocument();
    expect(screen.getByText("BTC: 70%")).toBeInTheDocument();
    expect(screen.getByText("Cash: 30%")).toBeInTheDocument();
  });
});
