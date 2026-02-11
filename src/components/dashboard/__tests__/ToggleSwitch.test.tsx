import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ToggleSwitch from "../ToggleSwitch";

describe("ToggleSwitch", () => {
  it("renders a button element", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies active color class when checked", () => {
    render(<ToggleSwitch checked={true} onChange={() => {}} />);
    expect(screen.getByRole("button")).toHaveClass("bg-toggle-active");
  });

  it("applies inactive color class when unchecked", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("button")).toHaveClass("bg-toggle-inactive");
  });

  it("calls onChange when clicked", () => {
    const onChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("renders with sm size variant", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} size="sm" />);
    expect(screen.getByRole("button")).toHaveClass("h-5", "w-9");
  });

  it("renders with md size variant by default", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("button")).toHaveClass("h-6", "w-11");
  });
});
