import { describe, expect, it } from "vitest";
import { siteScore } from "./scoring";

describe("siteScore", () => {
  it("uses default weights 0.5/0.3/0.2", () => {
    expect(siteScore({ proximity: 100, relevance: 100, usability: 100 })).toBe(100);
    expect(siteScore({ proximity: 80, relevance: 90, usability: 50 })).toBeCloseTo(77);
  });
  it("treats null proximity as 0", () => {
    expect(siteScore({ proximity: null, relevance: 100, usability: 100 })).toBeCloseTo(50);
  });
});

import { componentFor, distance } from "./scoring";

describe("custom scenario", () => {
  it("distance is 1 at 5 points O2 or 0.1 bar", () => {
    expect(distance(26, 1, 21, 1)).toBeCloseTo(1);
    expect(distance(21, 1.1, 21, 1)).toBeCloseTo(1);
  });
  it("proximity is 100 at d=0 and 0 at d>=3; skips rows without values", () => {
    expect(componentFor([{ o2_pct: 21, pressure_bar: 1 }], 21, 1).proximity).toBe(100);
    expect(componentFor([{ o2_pct: 36, pressure_bar: 1 }], 21, 1).proximity).toBe(0);
    const c = componentFor([{ o2_pct: null, pressure_bar: 1 }], 21, 1);
    expect(c).toEqual({ proximity: null, n_near: 0, d_min: null });
  });
});
