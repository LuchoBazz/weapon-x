import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { EnvironmentProvider, useEnvironment } from "../use-environment";
import * as envSdk from "@/lib/environment-sdk";

const TEST_ENVIRONMENTS = [
  { id: 'env-1', label: 'Env 1', region: 'us-east-1', api_base_url: '', api_key: '', created_at: '', updated_at: '' },
  { id: 'env-2', label: 'Env 2', region: 'us-west-1', api_base_url: '', api_key: '', created_at: '', updated_at: '' },
  { id: 'env-3', label: 'Env 3', region: 'eu-west-1', api_base_url: '', api_key: '', created_at: '', updated_at: '' },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EnvironmentProvider>{children}</EnvironmentProvider>
);

describe("useEnvironment", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(envSdk, 'fetchEnvironments').mockResolvedValue(TEST_ENVIRONMENTS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useEnvironment());
    }).toThrow("useEnvironment must be used within EnvironmentProvider");
  });

  it("returns null environment initially", () => {
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    expect(result.current.environment).toBe(null);
    expect(result.current.loading).toBe(true);
  });

  it("returns all available environments after loading", async () => {
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.environments).toHaveLength(TEST_ENVIRONMENTS.length);
  });

  it("switches environment", async () => {
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.setEnvironment(TEST_ENVIRONMENTS[1].id);
    });
    expect(result.current.environment?.id).toBe(TEST_ENVIRONMENTS[1].id);
  });

  it("persists environment selection to localStorage", async () => {
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.setEnvironment(TEST_ENVIRONMENTS[2].id);
    });
    expect(localStorage.getItem("wx_active_environment")).toBe(TEST_ENVIRONMENTS[2].id);
  });

  it("loads persisted environment on mount", async () => {
    localStorage.setItem("wx_active_environment", TEST_ENVIRONMENTS[1].id);
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    
    // Initially null because environments are not loaded yet
    expect(result.current.environment).toBe(null);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.environment?.id).toBe(TEST_ENVIRONMENTS[1].id);
  });
  
  it("falls back to first environment if persisted one is invalid", async () => {
    localStorage.setItem("wx_active_environment", "invalid_env_id");
    const { result } = renderHook(() => useEnvironment(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Auto-selects fallback
    expect(result.current.environment?.id).toBe(TEST_ENVIRONMENTS[0].id);
    expect(localStorage.getItem("wx_active_environment")).toBe(TEST_ENVIRONMENTS[0].id);
  });
});
