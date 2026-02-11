import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { EnvironmentProvider, useEnvironment } from "../use-environment";
import { ENVIRONMENTS } from "@/lib/environments";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EnvironmentProvider>{children}</EnvironmentProvider>
);

describe("useEnvironment", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useEnvironment());
    }).toThrow("useEnvironment must be used within EnvironmentProvider");
  });

  it("returns the default environment", () => {
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    expect(result.current.environment.id).toBe(ENVIRONMENTS[0].id);
  });

  it("returns all available environments", () => {
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    expect(result.current.environments).toHaveLength(ENVIRONMENTS.length);
  });

  it("switches environment", () => {
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    act(() => {
      result.current.setEnvironment(ENVIRONMENTS[1].id);
    });
    expect(result.current.environment.id).toBe(ENVIRONMENTS[1].id);
  });

  it("persists environment selection to localStorage", () => {
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    act(() => {
      result.current.setEnvironment(ENVIRONMENTS[2].id);
    });
    expect(localStorage.getItem("wx_active_environment")).toBe(ENVIRONMENTS[2].id);
  });

  it("loads persisted environment on mount", () => {
    localStorage.setItem("wx_active_environment", ENVIRONMENTS[1].id);
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    expect(result.current.environment.id).toBe(ENVIRONMENTS[1].id);
  });
});
