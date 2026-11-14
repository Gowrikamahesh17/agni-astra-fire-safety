import { describe, expect, it } from "vitest";
import { formatFlow, formatGeometry } from "./format";

const geo = (p: Partial<Parameters<typeof formatGeometry>[0]>) =>
  ({ shape: null, diameter_mm: null, thickness_mm: null, width_mm: null, raw: null, ...p });

describe("formatGeometry", () => {
  it("describes a film with thickness and width", () => {
    expect(formatGeometry(geo({ shape: "film", thickness_mm: 0.1, width_mm: 20 }))).toBe("film, 0.1 mm thick, 20 mm wide");
  });
  it("describes a droplet by diameter", () => {
    expect(formatGeometry(geo({ shape: "sphere", diameter_mm: 1.69, raw: "droplet" }))).toBe("sphere, Ø1.69 mm");
  });
  it("falls back to raw text, then to nothing", () => {
    expect(formatGeometry(geo({ raw: "1/4 clear rod" }))).toBe("1/4 clear rod");
    expect(formatGeometry(geo({}))).toBeNull();
  });
});

describe("formatFlow", () => {
  it("never shows device settings as a velocity", () => {
    expect(formatFlow({ value: 2, unit: "setting", kind: "device_setting" })).toBe("setting 2");
  });
  it("shows velocity with its unit", () => {
    expect(formatFlow({ value: 5, unit: "cm/s", kind: "velocity" })).toBe("5 cm/s");
  });
  it("returns null when absent", () => {
    expect(formatFlow(null)).toBeNull();
    expect(formatFlow({ value: null, unit: null, kind: "velocity" })).toBeNull();
  });
});
