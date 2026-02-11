import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../Sidebar";
import { EnvironmentProvider } from "@/hooks/use-environment";

const renderSidebar = (view: "dashboard" | "simulate" = "dashboard", onViewChange = vi.fn()) => {
  return render(
    <MemoryRouter>
      <EnvironmentProvider>
        <Sidebar view={view} onViewChange={onViewChange} />
      </EnvironmentProvider>
    </MemoryRouter>
  );
};

describe("Sidebar", () => {
  it("renders the app brand name", () => {
    renderSidebar();
    expect(screen.getByText("Weapon-X")).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    renderSidebar();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Simulator")).toBeInTheDocument();
  });

  it("calls onViewChange when Overview is clicked", () => {
    const onViewChange = vi.fn();
    renderSidebar("simulate", onViewChange);
    fireEvent.click(screen.getByText("Overview"));
    expect(onViewChange).toHaveBeenCalledWith("dashboard");
  });

  it("calls onViewChange when Simulator is clicked", () => {
    const onViewChange = vi.fn();
    renderSidebar("dashboard", onViewChange);
    fireEvent.click(screen.getByText("Simulator"));
    expect(onViewChange).toHaveBeenCalledWith("simulate");
  });

  it("renders theme toggle button", () => {
    renderSidebar();
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("renders logout button", () => {
    renderSidebar();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders admin settings button", () => {
    renderSidebar();
    expect(screen.getByText("Admin Settings")).toBeInTheDocument();
  });
});
