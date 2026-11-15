import { describe, expect, it } from "vitest";
import { diveState, progressOf, stageAt, STAGE_COUNT } from "./dive";

describe("diveState", () => {
  it("starts on a small whole Earth and ends on the flame", () => {
    const a = diveState(0);
    expect(a.earth.opacity).toBe(1);
    expect(a.earth.scale).toBeCloseTo(0.5);
    expect(a.flame.opacity).toBe(0);
    const z = diveState(1);
    expect(z.earth.opacity).toBe(0);
    expect(z.flame.opacity).toBe(1);
  });
  it("shows one scene at a time at the stage midpoints", () => {
    const at = (p: number) => diveState(p);
    expect(at(0.15).earth.opacity).toBeGreaterThan(0.9);
    expect(at(0.44).station.opacity).toBeGreaterThan(0.9);
    expect(at(0.62).chamber.opacity).toBeGreaterThan(0.9);
    expect(at(0.95).flame.opacity).toBeGreaterThan(0.9);
    expect(at(0.44).earth.opacity).toBe(0);
    expect(at(0.62).station.opacity).toBe(0);
  });
  it("only ever zooms in as you scroll down", () => {
    const sc = (p: number) => diveState(p).earth.scale;
    expect(sc(0.1)).toBeLessThan(sc(0.2));
    expect(sc(0.2)).toBeLessThan(sc(0.3));
  });
  it("keeps every value in range, even for out-of-range progress", () => {
    for (const p of [-1, 0, 0.5, 1, 7]) {
      const s = diveState(p);
      for (const l of [s.earth, s.station, s.chamber, s.flame]) {
        expect(l.opacity).toBeGreaterThanOrEqual(0);
        expect(l.opacity).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("stages and progress", () => {
  it("moves through all five stages in order", () => {
    const seq = [0, 0.35, 0.6, 0.75, 0.95].map(stageAt);
    expect(seq).toEqual([0, 1, 2, 3, 4]);
    expect(STAGE_COUNT).toBe(5);
  });
  it("progressOf is 0 before the section, 1 after it", () => {
    expect(progressOf(100, 3000, 800)).toBe(0);
    expect(progressOf(-1100, 3000, 800)).toBeCloseTo(0.5);
    expect(progressOf(-5000, 3000, 800)).toBe(1);
    expect(progressOf(0, 500, 800)).toBe(0); // section shorter than the screen
  });
});
