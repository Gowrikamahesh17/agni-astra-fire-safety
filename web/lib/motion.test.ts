import { describe, expect, it } from "vitest";
import { countUpValue, easeOutCubic } from "./motion";

describe("count-up", () => {
  it("starts at the old value and ends on the new one", () => {
    expect(countUpValue(10, 90, 0)).toBe(10);
    expect(countUpValue(10, 90, 1)).toBe(90);
  });
  it("counts down as well as up", () => {
    expect(countUpValue(100, 40, 1)).toBe(40);
    expect(countUpValue(100, 40, 0.5)).toBeLessThan(100);
  });
  it("eases out: most of the change comes early, and it never overshoots", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    expect(easeOutCubic(7)).toBe(1);
    expect(easeOutCubic(-3)).toBe(0);
  });
});
