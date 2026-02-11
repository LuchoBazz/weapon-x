import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders children text", () => {
    render(<StatusBadge>Active</StatusBadge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies default blue color classes", () => {
    render(<StatusBadge>Default</StatusBadge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-badge-blue-bg");
  });

  it("applies the specified color variant", () => {
    render(<StatusBadge color="green">Success</StatusBadge>);
    const badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-badge-green-bg");
  });

  it("renders as a span element", () => {
    render(<StatusBadge>Test</StatusBadge>);
    const badge = screen.getByText("Test");
    expect(badge.tagName).toBe("SPAN");
  });
});
