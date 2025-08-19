import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CentralizedStateProvider, usePortfolioCompat } from "../store";

// Test component that uses the context
const TestComponent = () => {
  const { formData, updateFormData, allocationError, resetForm } =
    usePortfolioCompat();

  return (
    <div>
      <div data-testid="btc-stack">{formData.btcStack}</div>
      <div data-testid="time-horizon">{formData.timeHorizon}</div>
      <div data-testid="allocation-error">{allocationError}</div>
      <button
        onClick={() => updateFormData({ btcStack: 10 })}
        data-testid="update-btc"
      >
        Update BTC
      </button>
      <button onClick={resetForm} data-testid="reset">
        Reset
      </button>
    </div>
  );
};

describe("CentralizedStateProvider", () => {
  it("should provide default form data", () => {
    render(
      <CentralizedStateProvider>
        <TestComponent />
      </CentralizedStateProvider>,
    );

    expect(screen.getByTestId("btc-stack")).toHaveTextContent("5");
    expect(screen.getByTestId("time-horizon")).toHaveTextContent("20");
  });

  it("should update form data when updateFormData is called", async () => {
    const user = userEvent.setup();

    render(
      <CentralizedStateProvider>
        <TestComponent />
      </CentralizedStateProvider>,
    );

    await user.click(screen.getByTestId("update-btc"));
    expect(screen.getByTestId("btc-stack")).toHaveTextContent("10");
  });

  it("should reset form data when resetForm is called", async () => {
    const user = userEvent.setup();

    render(
      <CentralizedStateProvider>
        <TestComponent />
      </CentralizedStateProvider>,
    );

    // First update the data
    await user.click(screen.getByTestId("update-btc"));
    expect(screen.getByTestId("btc-stack")).toHaveTextContent("10");

    // Then reset
    await user.click(screen.getByTestId("reset"));
    expect(screen.getByTestId("btc-stack")).toHaveTextContent("5");
  });

  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow(
      "useCentralizedStateContext must be used within a CentralizedStateProvider",
    );

    console.error = originalError;
  });
});
