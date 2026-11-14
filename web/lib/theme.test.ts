import { describe, expect, it } from "vitest";
import { resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("uses a saved choice over the system setting", () => {
    expect(resolveTheme("dark", true)).toBe("dark");
    expect(resolveTheme("light", false)).toBe("light");
  });
  it("follows the system when nothing valid is saved", () => {
    expect(resolveTheme(null, true)).toBe("light");
    expect(resolveTheme("purple", false)).toBe("dark");
  });
});
