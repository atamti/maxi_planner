import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock Chart.js to avoid canvas issues in tests
vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  LogarithmicScale: {},
  PointElement: {},
  LineElement: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}));

// Mock the logger utilities
vi.mock("./utils/logger", () => ({
  logError: vi.fn(),
  logUserAction: vi.fn(),
}));

// Mock the complex components to isolate App testing
vi.mock("./components/forms/PortfolioForm", () => ({
  PortfolioForm: () => <div data-testid="portfolio-form">Portfolio Form</div>,
}));

vi.mock("./components/forms/SaveLoadSection", () => ({
  SaveLoadSection: () => (
    <div data-testid="save-load-section">Save Load Section</div>
  ),
}));

vi.mock("./components/sections/ResultsSection", () => ({
  ResultsSection: () => (
    <div data-testid="results-section">Results Section</div>
  ),
}));

// Mock the context and store
vi.mock("./context/PortfolioContext", () => ({
  PortfolioProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="portfolio-provider">{children}</div>
  ),
}));

vi.mock("./store", () => ({
  CentralizedStateProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="centralized-state-provider">{children}</div>
  ),
  usePortfolioCompat: () => ({
    formData: {
      timeHorizon: 10,
      btcStack: 100000,
      yearlyIncome: 50000,
      yearlyExpenses: 40000,
      savingsPct: 40,
      investmentsPct: 40,
      speculationPct: 20,
    },
    updateFormData: vi.fn(),
    resetForm: vi.fn(),
    calculationResults: null,
    allocationError: null,
  }),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(<App />);
    expect(
      screen.getByTestId("centralized-state-provider"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("portfolio-provider")).toBeInTheDocument();
  });

  it("should render main application components", () => {
    render(<App />);

    // Check that all main sections are rendered
    expect(screen.getByTestId("portfolio-form")).toBeInTheDocument();
    expect(screen.getByTestId("save-load-section")).toBeInTheDocument();
    expect(screen.getByTestId("results-section")).toBeInTheDocument();
  });

  it("should have proper provider hierarchy", () => {
    render(<App />);

    const centralizedProvider = screen.getByTestId(
      "centralized-state-provider",
    );
    const portfolioProvider = screen.getByTestId("portfolio-provider");

    expect(centralizedProvider).toBeInTheDocument();
    expect(portfolioProvider).toBeInTheDocument();

    // Portfolio provider should be inside centralized provider
    expect(centralizedProvider).toContainElement(portfolioProvider);
  });

  it("should have Chart.js available for chart components", async () => {
    const { Chart } = await import("chart.js");

    // Test that Chart.js is available in the environment
    // This verifies that our Chart.js imports and registration don't cause errors
    expect(Chart).toBeDefined();
    expect(Chart.register).toBeDefined();

    // This test mainly verifies that Chart.js setup doesn't break the app
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it("should log app mounted action on mount", async () => {
    const { logUserAction } = await import("./utils/logger");

    render(<App />);

    expect(logUserAction).toHaveBeenCalledWith("App", "appMounted", {
      timestamp: expect.any(String),
      userAgent: expect.any(String),
    });
  });

  it("should set up error handling", async () => {
    const { logError } = await import("./utils/logger");

    render(<App />);

    // Simulate an uncaught error
    const errorEvent = new ErrorEvent("error", {
      message: "Test error",
      filename: "test.js",
      lineno: 1,
      colno: 1,
    });

    window.dispatchEvent(errorEvent);

    expect(logError).toHaveBeenCalledWith(
      "App",
      "uncaughtError",
      expect.any(Error),
      {
        filename: "test.js",
        lineno: 1,
        colno: 1,
      },
    );
  });

  it("should handle component cleanup on unmount", async () => {
    const { logUserAction } = await import("./utils/logger");

    const { unmount } = render(<App />);

    unmount();

    expect(logUserAction).toHaveBeenCalledWith("App", "appUnmounted");
  });

  it("should render application title", () => {
    render(<App />);

    expect(screen.getByText("BTC maxi portfolio planner")).toBeInTheDocument();
  });

  it("should render application description", () => {
    render(<App />);

    expect(
      screen.getByText(
        /Balance your stack with income requirments and risk tolerance/,
      ),
    ).toBeInTheDocument();
  });
});
