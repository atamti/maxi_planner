import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge, Button, Card, CollapsibleSection, Grid } from "./Layout";

describe("Layout Components", () => {
  describe("Card", () => {
    it("should render card with title and children", () => {
      render(
        <Card title="Test Card">
          <p>Card content</p>
        </Card>,
      );

      expect(screen.getByText("TEST CARD")).toBeInTheDocument();
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should render card without title", () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>,
      );

      expect(screen.getByText("Card content")).toBeInTheDocument();
      expect(screen.queryByText("Test Card")).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <Card className="custom-class">
          <p>Card content</p>
        </Card>,
      );

      const cardElement = screen.getByText("Card content").closest("div");
      expect(cardElement).toHaveClass("custom-class");
    });

    it("should apply different background variants", () => {
      const backgrounds = [
        "white",
        "gray",
        "blue",
        "green",
        "yellow",
        "red",
      ] as const;

      backgrounds.forEach((bg) => {
        const { unmount, container } = render(
          <Card background={bg}>
            <p>Content</p>
          </Card>,
        );

        const cardElement = container.firstChild as HTMLElement;
        expect(cardElement).toHaveClass(
          `bg-${bg === "white" ? "white" : bg === "gray" ? "gray-50" : `${bg}-50`}`,
        );

        unmount();
      });
    });

    it("should render with default white background", () => {
      const { container } = render(
        <Card>
          <p>Content</p>
        </Card>,
      );

      expect(container.firstChild).toHaveClass("bg-white");
    });
  });

  describe("CollapsibleSection", () => {
    const defaultProps = {
      title: "Test Section",
      isExpanded: false,
      onToggle: vi.fn(),
      children: <p>Section content</p>,
    };

    it("should render section title", () => {
      render(<CollapsibleSection {...defaultProps} />);

      expect(screen.getByText("TEST SECTION")).toBeInTheDocument();
    });

    it("should show content when expanded", () => {
      render(<CollapsibleSection {...defaultProps} isExpanded={true} />);

      expect(screen.getByText("Section content")).toBeInTheDocument();
    });

    it("should hide content when collapsed", () => {
      render(<CollapsibleSection {...defaultProps} isExpanded={false} />);

      expect(screen.queryByText("Section content")).not.toBeInTheDocument();
    });

    it("should call onToggle when button is clicked", () => {
      const onToggle = vi.fn();
      render(<CollapsibleSection {...defaultProps} onToggle={onToggle} />);

      fireEvent.click(screen.getByRole("button"));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("should show correct expand/collapse icon", () => {
      const { rerender } = render(
        <CollapsibleSection {...defaultProps} isExpanded={false} />,
      );
      expect(screen.getByText("+")).toBeInTheDocument();

      rerender(<CollapsibleSection {...defaultProps} isExpanded={true} />);
      expect(screen.getByText("−")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      render(<CollapsibleSection {...defaultProps} icon="📊" />);

      expect(screen.getByText("📊")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <CollapsibleSection {...defaultProps} className="custom-section" />,
      );

      const sectionElement = screen.getByText("TEST SECTION").closest("div");
      expect(sectionElement).toHaveClass("custom-section");
    });
  });

  describe("Grid", () => {
    it("should render children in grid layout", () => {
      const { container } = render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>,
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("should apply correct column classes", () => {
      const { rerender, container } = render(
        <Grid columns={1}>
          <div>Item</div>
        </Grid>,
      );
      expect(container.firstChild).toHaveClass("grid-cols-1");

      rerender(
        <Grid columns={2}>
          <div>Item</div>
        </Grid>,
      );
      expect(container.firstChild).toHaveClass("grid-cols-1", "md:grid-cols-2");

      rerender(
        <Grid columns={3}>
          <div>Item</div>
        </Grid>,
      );
      expect(container.firstChild).toHaveClass(
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
      );

      rerender(
        <Grid columns={4}>
          <div>Item</div>
        </Grid>,
      );
      expect(container.firstChild).toHaveClass(
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-4",
      );
    });

    it("should apply correct gap classes", () => {
      const { rerender, container } = render(
        <Grid gap="sm">
          <div>Item</div>
        </Grid>,
      );
      expect(container.firstChild).toHaveClass("gap-2");

      rerender(
        <Grid gap="md">
          <div>Item</div>
        </Grid>,
      );
      expect(container.firstChild).toHaveClass("gap-4");

      rerender(
        <Grid gap="lg">
          <div>Item</div>
        </Grid>,
      );
      expect(container.firstChild).toHaveClass("gap-6");
    });

    it("should use default values", () => {
      const { container } = render(
        <Grid>
          <div>Item</div>
        </Grid>,
      );

      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass("grid-cols-1", "md:grid-cols-2", "gap-4");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Grid className="custom-grid">
          <div>Item</div>
        </Grid>,
      );

      expect(container.firstChild).toHaveClass("custom-grid");
    });
  });

  describe("Button", () => {
    it("should render button with children", () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);

      expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("should call onClick when clicked", () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);

      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should apply variant classes", () => {
      const variants = ["primary", "secondary", "danger", "success"] as const;

      variants.forEach((variant) => {
        const { unmount } = render(
          <Button onClick={vi.fn()} variant={variant}>
            Test
          </Button>,
        );

        const button = screen.getByRole("button");
        switch (variant) {
          case "primary":
            expect(button).toHaveClass("btn-gradient-orange");
            break;
          case "secondary":
            expect(button).toHaveClass("btn-secondary-navy");
            break;
          case "danger":
            expect(button).toHaveClass("bg-brand-red");
            break;
          case "success":
            expect(button).toHaveClass("bg-brand-green");
            break;
        }

        unmount();
      });
    });

    it("should apply size classes", () => {
      const sizes = ["sm", "md", "lg"] as const;

      sizes.forEach((size) => {
        const { unmount } = render(
          <Button onClick={vi.fn()} size={size}>
            Test
          </Button>,
        );

        const button = screen.getByRole("button");
        switch (size) {
          case "sm":
            expect(button).toHaveClass("px-3", "py-1", "text-sm");
            break;
          case "md":
            expect(button).toHaveClass("px-4", "py-2");
            break;
          case "lg":
            expect(button).toHaveClass("px-6", "py-3", "text-lg");
            break;
        }

        unmount();
      });
    });

    it("should handle disabled state", () => {
      const onClick = vi.fn();
      render(
        <Button onClick={onClick} disabled={true}>
          Disabled
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("opacity-50", "cursor-not-allowed");

      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("should render with icon", () => {
      render(
        <Button onClick={vi.fn()} icon="🚀">
          Launch
        </Button>,
      );

      expect(screen.getByText("🚀")).toBeInTheDocument();
      expect(screen.getByText("Launch")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <Button onClick={vi.fn()} className="custom-button">
          Custom
        </Button>,
      );

      expect(screen.getByRole("button")).toHaveClass("custom-button");
    });

    it("should use default props", () => {
      render(<Button onClick={vi.fn()}>Default Button</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn-gradient-orange", "px-4", "py-2");
      expect(button).not.toBeDisabled();
    });
  });

  describe("Badge", () => {
    it("should render badge with children", () => {
      render(<Badge>Test Badge</Badge>);

      expect(screen.getByText("Test Badge")).toBeInTheDocument();
    });

    it("should apply variant classes", () => {
      const variants = ["info", "success", "warning", "error"] as const;

      variants.forEach((variant) => {
        const { unmount, container } = render(
          <Badge variant={variant}>Test</Badge>,
        );

        const badge = container.firstChild as HTMLElement;
        switch (variant) {
          case "info":
            expect(badge).toHaveClass("bg-brand-navy/30", "text-brand-orange");
            break;
          case "success":
            expect(badge).toHaveClass("bg-brand-green/20", "text-brand-green");
            break;
          case "warning":
            expect(badge).toHaveClass(
              "bg-brand-orange/20",
              "text-brand-orange",
            );
            break;
          case "error":
            expect(badge).toHaveClass("bg-brand-red/20", "text-brand-red");
            break;
        }

        unmount();
      });
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Badge className="custom-badge">Custom</Badge>,
      );

      expect(container.firstChild).toHaveClass("custom-badge");
    });

    it("should use default variant", () => {
      const { container } = render(<Badge>Default Badge</Badge>);

      expect(container.firstChild).toHaveClass(
        "bg-brand-navy/30",
        "text-brand-orange",
      );
    });

    it("should have correct base styling", () => {
      const { container } = render(<Badge>Badge</Badge>);

      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass(
        "inline-flex",
        "items-center",
        "px-2.5",
        "py-0.5",
        "rounded-none",
        "text-[10px]",
        "font-heading",
      );
    });
  });
});
