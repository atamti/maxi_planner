import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { ReactElement } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";

// Create a custom render function that wraps with ThemeProvider
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
