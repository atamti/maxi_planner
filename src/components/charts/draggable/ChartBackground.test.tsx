import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartBackground } from "./ChartBackground";

describe("ChartBackground", () => {
  const defaultDimensions = {
    paddingLeft: 50,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 40,
    chartWidth: 500,
    chartHeight: 300,
  };

  it("should render chart background rectangle", () => {
    const { container } = render(
      <svg>
        <ChartBackground dimensions={defaultDimensions} />
      </svg>,
    );

    const rect = container.querySelector("rect");
    expect(rect).toBeInTheDocument();
  });

  it("should apply correct dimensions", () => {
    const { container } = render(
      <svg>
        <ChartBackground dimensions={defaultDimensions} />
      </svg>,
    );

    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("x", "50");
    expect(rect).toHaveAttribute("y", "20");
    expect(rect).toHaveAttribute("width", "500");
    expect(rect).toHaveAttribute("height", "300");
  });

  it("should have correct fill color", () => {
    const { container } = render(
      <svg>
        <ChartBackground dimensions={defaultDimensions} />
      </svg>,
    );

    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("fill", "rgba(220, 38, 38, 0.05)");
  });

  it("should handle different dimensions", () => {
    const customDimensions = {
      paddingLeft: 100,
      paddingRight: 30,
      paddingTop: 50,
      paddingBottom: 60,
      chartWidth: 800,
      chartHeight: 400,
    };

    const { container } = render(
      <svg>
        <ChartBackground dimensions={customDimensions} />
      </svg>,
    );

    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("x", "100");
    expect(rect).toHaveAttribute("y", "50");
    expect(rect).toHaveAttribute("width", "800");
    expect(rect).toHaveAttribute("height", "400");
  });

  it("should handle zero dimensions", () => {
    const zeroDimensions = {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      chartWidth: 0,
      chartHeight: 0,
    };

    const { container } = render(
      <svg>
        <ChartBackground dimensions={zeroDimensions} />
      </svg>,
    );

    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("x", "0");
    expect(rect).toHaveAttribute("y", "0");
    expect(rect).toHaveAttribute("width", "0");
    expect(rect).toHaveAttribute("height", "0");
  });
});
