import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsMobile } from "../use-mobile";

describe("useIsMobile", () => {
  it("returns a boolean value", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });

  it("returns false in jsdom (default window width is >= 768)", () => {
    const { result } = renderHook(() => useIsMobile());
    // jsdom defaults to 1024 width, so it should not be mobile
    expect(result.current).toBe(false);
  });
});
