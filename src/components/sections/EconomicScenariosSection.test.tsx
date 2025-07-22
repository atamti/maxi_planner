import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_DATA } from "../../config/defaults";
import { EconomicScenariosSection } from "./EconomicScenariosSection";

const defaultProps = {
  formData: DEFAULT_FORM_DATA,
  updateFormData: vi.fn(),
};

// Helper function to expand the section
async function expandSection() {
  const user = userEvent.setup();
  const sectionButton = screen.getByRole("button", {
    name: /Economic Scenario/,
  });
  await user.click(sectionButton);
}

describe("EconomicScenariosSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render main components", async () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    // The section starts collapsed, check the title
    const sectionButton = screen.getByRole("button", {
      name: /Economic Scenario/,
    });
    expect(sectionButton).toBeInTheDocument();
    expect(screen.getByText(/Economic Scenario:/)).toBeInTheDocument();

    // Expand the section
    await expandSection();

    expect(screen.getByText("USD inflation")).toBeInTheDocument();
    expect(screen.getByText("BTC nominal appreciation")).toBeInTheDocument();
    expect(screen.getByText("Income portfolio yield")).toBeInTheDocument();
  });

  it("should render all economic scenario cards", async () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    // Expand the section
    await expandSection();

    // Check for known scenario names from economicScenarios
    expect(screen.getByText("Tight monetary policy")).toBeInTheDocument();
    expect(screen.getByText("Managed debasement")).toBeInTheDocument();
    expect(screen.getByText("Accelerated crisis")).toBeInTheDocument();
    expect(screen.getByText("Hyperinflationary spiral")).toBeInTheDocument();
    expect(screen.getByText("Manual configuration")).toBeInTheDocument();
  });

  it("should handle scenario selection", async () => {
    const user = userEvent.setup();
    render(<EconomicScenariosSection {...defaultProps} />);

    // Expand the section
    await expandSection();

    const crisisCard = screen.getByText("Accelerated crisis").closest("div");
    await user.click(crisisCard!);

    expect(defaultProps.updateFormData).toHaveBeenCalledWith({
      economicScenario: "crisis",
    });
  });

  it("should display correct metrics for default scenario", async () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    // Check the title contains the default scenario info
    expect(screen.getByText(/Managed debasement/)).toBeInTheDocument();
    expect(screen.getByText(/5% USD/)).toBeInTheDocument();
    expect(screen.getByText(/30% BTC/)).toBeInTheDocument();
  });

  it("should apply correct styling to scenario cards", async () => {
    render(<EconomicScenariosSection {...defaultProps} />);

    // Check that it uses CollapsibleSection styling
    const container = document.querySelector(
      ".mb-4.border.border-gray-200.rounded-lg",
    );
    expect(container).toBeInTheDocument();
  });
});
