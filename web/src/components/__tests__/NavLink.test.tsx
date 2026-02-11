import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavLink } from "../NavLink";

describe("NavLink", () => {
  it("renders a link with children text", () => {
    render(
      <MemoryRouter>
        <NavLink to="/test">Test Link</NavLink>
      </MemoryRouter>
    );
    expect(screen.getByText("Test Link")).toBeInTheDocument();
  });

  it("renders as an anchor element", () => {
    render(
      <MemoryRouter>
        <NavLink to="/test">Link</NavLink>
      </MemoryRouter>
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/test");
  });

  it("applies base className", () => {
    render(
      <MemoryRouter>
        <NavLink to="/test" className="base-class">Link</NavLink>
      </MemoryRouter>
    );
    expect(screen.getByRole("link")).toHaveClass("base-class");
  });

  it("applies activeClassName when route is active", () => {
    render(
      <MemoryRouter initialEntries={["/active"]}>
        <NavLink to="/active" className="base" activeClassName="active-class">Active</NavLink>
      </MemoryRouter>
    );
    expect(screen.getByRole("link")).toHaveClass("active-class");
  });

  it("does not apply activeClassName when route is not active", () => {
    render(
      <MemoryRouter initialEntries={["/other"]}>
        <NavLink to="/test" className="base" activeClassName="active-class">Inactive</NavLink>
      </MemoryRouter>
    );
    expect(screen.getByRole("link")).not.toHaveClass("active-class");
  });
});
