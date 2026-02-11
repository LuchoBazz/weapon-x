import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthGuard from "../AuthGuard";

vi.mock("@/lib/auth", () => ({
  isAuthenticated: vi.fn(),
}));

import { isAuthenticated } from "@/lib/auth";

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when authenticated", () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true);
    render(
      <MemoryRouter>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </MemoryRouter>
    );
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
