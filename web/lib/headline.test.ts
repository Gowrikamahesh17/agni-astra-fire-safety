import { describe, expect, it } from "vitest";
import { lunarHeadline } from "./headline";

describe("lunarHeadline", () => {
  it("matches the verified finding in the spec: 17 FLEX tests near the lunar atmosphere, none extinguished", () => {
    const h = lunarHeadline();
    expect(h).not.toBeNull();
    expect(h!.n).toBe(17);
    expect(h!.extinguished).toBe(0);
    expect(h!.o2[0]).toBeGreaterThanOrEqual(30);
  });
});
