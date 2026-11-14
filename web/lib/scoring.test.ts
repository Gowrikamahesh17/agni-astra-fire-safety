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
