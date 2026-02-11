import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "../LoginForm";

vi.mock("@/lib/auth", () => ({
  login: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/sdk", () => ({
  SDK_ENABLED: false,
}));

import { login } from "@/lib/auth";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (login as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
  });

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

  it("renders the login form", () => {
    renderLogin();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows email validation error for empty email", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
    });
  });

  it("shows email validation error for invalid email format", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "notanemail" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    });
  });

  it("shows password validation error for short password", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
    });
  });

  it("calls login with correct credentials on valid submit", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("test@test.com", "12345678");
    });
  });

  it("displays form-level error on failed login", async () => {
    (login as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, error: "Invalid credentials" });
    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows test credentials hint when SDK is disabled", () => {
    renderLogin();
    expect(screen.getByText(/test@test.com/)).toBeInTheDocument();
  });
});
