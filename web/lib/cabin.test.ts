import { describe, expect, it } from "vitest";
import { cabinCounts } from "./cabin";

describe("cabinCounts", () => {
  it("scales the dots with pressure and splits them by oxygen share", () => {
    const iss = cabinCounts(21, 1.013);
    expect(iss.total).toBe(91);
    expect(iss.oxygen + iss.other).toBe(iss.total);
    expect(iss.oxygen).toBe(19);
  });
  it("makes every dot oxygen at 100 %, and none at 0 %", () => {
    expect(cabinCounts(100, 0.296).other).toBe(0);
    expect(cabinCounts(0, 1).oxygen).toBe(0);
  });
  it("has fewer dots at lower pressure", () => {
    expect(cabinCounts(30, 0.703).total).toBeLessThan(cabinCounts(21, 1.013).total);
  });
  it("copes with out-of-range input", () => {
    expect(cabinCounts(-5, -1)).toEqual({ total: 0, oxygen: 0, other: 0 });
    expect(cabinCounts(500, 1).other).toBe(0);
  });
});
