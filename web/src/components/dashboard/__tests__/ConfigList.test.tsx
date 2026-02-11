import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfigList from "../ConfigList";
import { Config, Filters } from "@/lib/types";

const mockConfig: Config = {
  id: "cfg_1",
  project_reference: "proj_alpha",
  key: "feature_flag_1",
  description: "A test flag",
  type: "BOOLEAN",
  is_active: true,
  default_value: false,
  validation_schema: {},
  rules: [],
};

const defaultFilters: Filters = { search: "", project: "ALL", type: "ALL" };

describe("ConfigList", () => {
  it("renders empty state when no configs", () => {
    render(
      <ConfigList configs={[]} filters={defaultFilters} onFilter={vi.fn()} onSelect={vi.fn()} onToggleStatus={vi.fn()} />
    );
    expect(screen.getByText(/no configurations found/i)).toBeInTheDocument();
  });

  it("renders config key in table", () => {
    render(
      <ConfigList configs={[mockConfig]} filters={defaultFilters} onFilter={vi.fn()} onSelect={vi.fn()} onToggleStatus={vi.fn()} />
    );
    expect(screen.getByText("feature_flag_1")).toBeInTheDocument();
  });

  it("renders config description", () => {
    render(
      <ConfigList configs={[mockConfig]} filters={defaultFilters} onFilter={vi.fn()} onSelect={vi.fn()} onToggleStatus={vi.fn()} />
    );
    expect(screen.getByText("A test flag")).toBeInTheDocument();
  });

  it("calls onSelect when Edit button is clicked", () => {
    const onSelect = vi.fn();
    render(
      <ConfigList configs={[mockConfig]} filters={defaultFilters} onFilter={vi.fn()} onSelect={onSelect} onToggleStatus={vi.fn()} />
    );
    fireEvent.click(screen.getByText("Edit"));
    expect(onSelect).toHaveBeenCalledWith(mockConfig);
  });

  it("calls onFilter when search input changes", () => {
    const onFilter = vi.fn();
    render(
      <ConfigList configs={[mockConfig]} filters={defaultFilters} onFilter={onFilter} onSelect={vi.fn()} onToggleStatus={vi.fn()} />
    );
    fireEvent.change(screen.getByPlaceholderText("Search keys..."), { target: { value: "test" } });
    expect(onFilter).toHaveBeenCalledWith({ ...defaultFilters, search: "test" });
  });

  it("renders table headers", () => {
    render(
      <ConfigList configs={[]} filters={defaultFilters} onFilter={vi.fn()} onSelect={vi.fn()} onToggleStatus={vi.fn()} />
    );
    expect(screen.getByText("Key / Description")).toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("shows deactivation dialog when toggling an active config", () => {
    render(
      <ConfigList configs={[mockConfig]} filters={defaultFilters} onFilter={vi.fn()} onSelect={vi.fn()} onToggleStatus={vi.fn()} />
    );
    // The toggle button is the first button-type element in the status column
    const toggleButtons = screen.getAllByRole("button");
    // Find the toggle (it's not "Edit")
    const toggleBtn = toggleButtons.find(btn => btn.textContent !== "Edit");
    if (toggleBtn) fireEvent.click(toggleBtn);
    expect(screen.getByText("Deactivate configuration?")).toBeInTheDocument();
  });
});
