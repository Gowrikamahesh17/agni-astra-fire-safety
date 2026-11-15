import { describe, expect, it } from "vitest";
import { describeGravity, flameColors, flamePath, mixHex } from "./flame";

const points = (d: string) =>
  d
    .slice(1, -1)
    .split("L")
    .map((p) => p.split(" ").map(Number) as [number, number]);

describe("flamePath", () => {
  it("is a circle of radius R in microgravity, whatever the time", () => {
    for (const t of [0, 1.7, 9]) {
      for (const [x, y] of points(flamePath(0, t, 60))) expect(Math.hypot(x, y)).toBeCloseTo(60, 0);
    }
  });
  it("stretches into a tall teardrop at Earth gravity", () => {
    const ys = points(flamePath(1, 0, 60)).map((p) => p[1]);
    expect(Math.min(...ys)).toBeLessThan(-120); // tip well above the base
    expect(Math.max(...ys)).toBeLessThanOrEqual(61); // bottom stays round
  });
  it("flickers with time at 1 g but not at 0 g", () => {
    expect(flamePath(1, 0, 60)).not.toBe(flamePath(1, 0.4, 60));
    expect(flamePath(0, 0, 60)).toBe(flamePath(0, 0.4, 60));
  });
});

describe("colour and description", () => {
  it("blends from blue to orange", () => {
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(flameColors(0).outer).toBe("#4d84ff");
    expect(flameColors(1).outer).toBe("#ff7a1a");
  });
  it("describes the picture in words for three ranges", () => {
    expect(describeGravity(1)).toMatch(/teardrop/);
    expect(describeGravity(0)).toMatch(/sphere/);
    expect(describeGravity(0.16)).toMatch(/0\.16 g/);
  });
});

import { meterOpacity, meterScale, meterWords } from "./flame";

describe("flame meter", () => {
  it("shrinks the flame as the chance of going out rises, but never to nothing", () => {
    expect(meterScale(0)).toBe(1);
    expect(meterScale(0.5)).toBeLessThan(meterScale(0.2));
    expect(meterScale(1)).toBeGreaterThan(0.1);
    expect(meterOpacity(1)).toBeGreaterThan(0.1);
    expect(meterOpacity(0)).toBe(1);
  });
  it("describes the odds in words", () => {
    expect(meterWords(0.1)).toMatch(/keep burning/);
    expect(meterWords(0.5)).toMatch(/either way/);
    expect(meterWords(0.95)).toMatch(/go out/);
  });
});
