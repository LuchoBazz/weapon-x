import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "../ProgressBar";

describe("ProgressBar", () => {
  it("renders without crashing", () => {
    const { container } = render(<ProgressBar />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with default 0% width", () => {
    const { container } = render(<ProgressBar />);
    const fill = container.querySelector("[style]");
    expect(fill).toHaveStyle({ width: "0%" });
  });

  it("renders with the given percentage", () => {
    const { container } = render(<ProgressBar value={75} />);
    const fill = container.querySelector("[style]");
    expect(fill).toHaveStyle({ width: "75%" });
  });

  it("clamps value to 100 max", () => {
    const { container } = render(<ProgressBar value={150} />);
    const fill = container.querySelector("[style]");
    expect(fill).toHaveStyle({ width: "100%" });
  });

  it("clamps value to 0 min", () => {
    const { container } = render(<ProgressBar value={-10} />);
    const fill = container.querySelector("[style]");
    expect(fill).toHaveStyle({ width: "0%" });
  });

  it("applies custom color class", () => {
    const { container } = render(<ProgressBar value={50} colorClass="bg-badge-green-bg" />);
    const fill = container.querySelector(".bg-badge-green-bg");
    expect(fill).toBeInTheDocument();
  });

  it("applies cursor-pointer when interactive", () => {
    const { container } = render(<ProgressBar value={50} onChange={() => {}} />);
    expect(container.firstChild).toHaveClass("cursor-pointer");
  });

  it("does not apply cursor-pointer when non-interactive", () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.firstChild).not.toHaveClass("cursor-pointer");
  });
});
