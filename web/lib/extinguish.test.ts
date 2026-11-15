import { describe, expect, it } from "vitest";
import { CYCLE_S, GRAVITY_LOOP_S, gravityForCycle, gravityLoop, noteFor, phaseAt } from "./extinguish";

describe("extinguisher cycle", () => {
  it("burns fully, sprays while it shrinks, is out, then lights again", () => {
    expect(phaseAt(0.5)).toMatchObject({ intensity: 1, spraying: false });
    const mid = phaseAt(CYCLE_S * 0.4);
    expect(mid.spraying).toBe(true);
    expect(mid.intensity).toBeGreaterThan(0);
    expect(mid.intensity).toBeLessThan(1);
    expect(phaseAt(CYCLE_S * 0.7)).toMatchObject({ intensity: 0, smoking: true });
    expect(phaseAt(CYCLE_S * 0.8)).toMatchObject({ intensity: 0, smoking: false });
    expect(phaseAt(CYCLE_S * 0.95).intensity).toBeGreaterThan(0.5);
  });
  it("never leaves the 0 to 1 range", () => {
    for (let t = 0; t < CYCLE_S * 3; t += 0.1) {
      const i = phaseAt(t).intensity;
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThanOrEqual(1);
    }
  });
  it("alternates Earth and orbit", () => {
    expect([0, 1, 2, 3].map(gravityForCycle)).toEqual([1, 0, 1, 0]);
  });
  it("describes the picture in words", () => {
    expect(noteFor(1, phaseAt(1))).toBe("On Earth: tall orange flame, burning");
    expect(noteFor(0, phaseAt(CYCLE_S + CYCLE_S * 0.4))).toBe("In orbit: round blue flame, being put out");
  });
});

describe("gravity loop", () => {
  it("holds on Earth, glides to orbit, holds, and returns", () => {
    expect(gravityLoop(0)).toBe(1);
    expect(gravityLoop(GRAVITY_LOOP_S * 0.375)).toBeCloseTo(0.5, 1);
    expect(gravityLoop(GRAVITY_LOOP_S * 0.6)).toBe(0);
    expect(gravityLoop(GRAVITY_LOOP_S * 0.875)).toBeCloseTo(0.5, 1);
    expect(gravityLoop(GRAVITY_LOOP_S)).toBe(1);
  });
});
