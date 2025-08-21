import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AllocationBar } from "./AllocationBar";

// Mock the useAllocationColors hook
vi.mock("../../../hooks/useAllocationColors", () => ({
  useAllocationColors: () => ({
    getBarColor: vi.fn((category: string, isHighlighted: boolean) => {
      const baseColors = {
        savings: "bg-blue-500",
        investments: "bg-green-500",
        speculation: "bg-orange-500",
      };
      const highlightedColors = {
        savings: "bg-blue-700",
        investments: "bg-green-700",
        speculation: "bg-orange-700",
      };

      return isHighlighted
        ? highlightedColors[category as keyof typeof highlightedColors]
        : baseColors[category as keyof typeof baseColors];
    }),
  }),
}));

describe("AllocationBar", () => {
  const defaultProps = {
    savingsPct: 40,
    investmentsPct: 40,
    speculationPct: 20,
    isHighlighted: vi.fn(() => false),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render allocation bar with correct structure", () => {
    const { container } = render(<AllocationBar {...defaultProps} />);

    // Find the main container div
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass("flex");
    expect(mainContainer).toHaveClass("h-8");
    expect(mainContainer).toHaveClass("rounded-none");
  });

  it("should display percentages for segments > 15%", () => {
    render(<AllocationBar {...defaultProps} />);

    // Check that percentage texts exist for segments > 15%
    const percentageTexts = screen.getAllByText(/\d+%/);
    expect(percentageTexts.length).toBeGreaterThan(0);

    // Check specific percentages
    expect(screen.getAllByText("40%")).toHaveLength(2); // savings and investments
    expect(screen.getByText("20%")).toBeInTheDocument(); // speculation
  });

  it("should not display percentages for segments <= 15%", () => {
    render(
      <AllocationBar
        {...defaultProps}
        savingsPct={10}
        investmentsPct={5}
        speculationPct={85}
      />,
    );

    // Only speculation (85%) should show percentage
    expect(screen.getByText("85%")).toBeInTheDocument();
    // Should not show percentages for small segments
    expect(screen.queryByText("10%")).not.toBeInTheDocument();
    expect(screen.queryByText("5%")).not.toBeInTheDocument();
  });

  it("should apply correct widths to segments", () => {
    const { container } = render(<AllocationBar {...defaultProps} />);

    const segments = container.querySelectorAll('[style*="width"]');
    expect(segments).toHaveLength(3);

    expect(segments[0]).toHaveStyle("width: 40%"); // savings
    expect(segments[1]).toHaveStyle("width: 40%"); // investments
    expect(segments[2]).toHaveStyle("width: 20%"); // speculation
  });

  it("should apply correct colors to segments", () => {
    const { container } = render(<AllocationBar {...defaultProps} />);

    const segments = container.querySelectorAll('[class*="bg-"]');
    expect(segments[0]).toHaveClass("bg-blue-500"); // savings
    expect(segments[1]).toHaveClass("bg-green-500"); // investments
    expect(segments[2]).toHaveClass("bg-orange-500"); // speculation
  });

  it("should highlight segments when isHighlighted returns true", () => {
    const mockIsHighlighted = vi.fn((field: string) => field === "savings");

    const { container } = render(
      <AllocationBar {...defaultProps} isHighlighted={mockIsHighlighted} />,
    );

    const segments = container.querySelectorAll('[class*="bg-"]');
    expect(segments[0]).toHaveClass("bg-blue-700"); // highlighted savings
    expect(segments[1]).toHaveClass("bg-green-500"); // normal investments
    expect(segments[2]).toHaveClass("bg-orange-500"); // normal speculation
  });

  it("should handle zero percentages", () => {
    render(
      <AllocationBar
        {...defaultProps}
        savingsPct={0}
        investmentsPct={50}
        speculationPct={50}
      />,
    );

    // Should not show text for 0% segment
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getAllByText("50%")).toHaveLength(2);
  });

  it("should handle edge case of exactly 15%", () => {
    render(
      <AllocationBar
        {...defaultProps}
        savingsPct={15}
        investmentsPct={15}
        speculationPct={70}
      />,
    );

    // 15% should not show percentage (threshold is >15%)
    expect(screen.queryByText("15%")).not.toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("should handle case where all segments are small", () => {
    const { container } = render(
      <AllocationBar
        {...defaultProps}
        savingsPct={5}
        investmentsPct={5}
        speculationPct={5}
      />,
    );

    // No percentages should be displayed
    expect(screen.queryByText("5%")).not.toBeInTheDocument();

    // But the segments should still be rendered
    const segments = container.querySelectorAll('[style*="width"]');
    expect(segments).toHaveLength(3);
  });

  it("should call isHighlighted with correct field names", () => {
    const mockIsHighlighted = vi.fn(() => false);

    render(
      <AllocationBar {...defaultProps} isHighlighted={mockIsHighlighted} />,
    );

    expect(mockIsHighlighted).toHaveBeenCalledWith("savings");
    expect(mockIsHighlighted).toHaveBeenCalledWith("investments");
    // Note: speculation might not be called based on the component's implementation
    expect(mockIsHighlighted).toHaveBeenCalledTimes(2);
  });
});
