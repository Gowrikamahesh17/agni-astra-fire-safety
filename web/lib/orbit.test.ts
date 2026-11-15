import { describe, expect, it } from "vitest";
import { BASE_SPEED, boopBody, easePause, newBody, placeBody, stepBody, swatBody } from "./orbit";

const steady = () => 0.5; // a "random" source that never nudges

describe("orbit motion", () => {
  it("starts the crew evenly spaced round the planet", () => {
    const a = [0, 1, 2].map((i) => newBody(i, 3, steady).a);
    expect(a[1] - a[0]).toBeCloseTo((Math.PI * 2) / 3);
    expect(a[2] - a[1]).toBeCloseTo((Math.PI * 2) / 3);
  });
  it("circles at the base speed when running", () => {
    const b = newBody(0, 3, steady);
    const a0 = b.a;
    stepBody(b, 1, 1, steady);
    expect(b.a - a0).toBeCloseTo(BASE_SPEED, 2);
  });
  it("holds completely still when paused", () => {
    const b = newBody(0, 3, steady);
    b.dw = 0.3;
    const before = { a: b.a, r: b.r, wt: b.wt };
    for (let i = 0; i < 20; i++) stepBody(b, 0.05, 0, steady);
    expect(b.a).toBe(before.a);
    expect(b.r).toBe(before.r);
    expect(b.wt).toBe(before.wt);
  });
  it("eases to a stop and back rather than snapping", () => {
    let pf = 1;
    for (let i = 0; i < 5; i++) pf = easePause(pf, true, 0.016);
    expect(pf).toBeGreaterThan(0);
    expect(pf).toBeLessThan(1);
    for (let i = 0; i < 200; i++) pf = easePause(pf, true, 0.016);
    expect(pf).toBe(0); // fully stopped
    for (let i = 0; i < 200; i++) pf = easePause(pf, false, 0.016);
    expect(pf).toBeGreaterThan(0.99);
  });
  it("a swat or a tap speeds the body up, and the extra speed fades", () => {
    const b = newBody(0, 3, steady);
    b.a = Math.PI / 2; // at the front
    swatBody(b, 20, 30, 10);
    expect(Math.abs(b.dw)).toBeGreaterThan(0.05);
    const fast = Math.abs(b.dw);
    for (let i = 0; i < 100; i++) stepBody(b, 0.05, 1, steady);
    expect(Math.abs(b.dw)).toBeLessThan(fast);
    const c = newBody(1, 3, steady);
    boopBody(c, () => 0.9);
    expect(Math.abs(c.dw)).toBeGreaterThan(0.1);
  });
  it("never lets the extra speed run away", () => {
    const b = newBody(0, 3, steady);
    for (let i = 0; i < 50; i++) boopBody(b, () => 1);
    expect(Math.abs(b.dw)).toBeLessThanOrEqual(1.2);
  });
});

describe("placement", () => {
  it("makes the nearest body biggest and the farthest smallest", () => {
    const front = newBody(0, 3, steady);
    front.a = Math.PI / 2;
    const back = newBody(0, 3, steady);
    back.a = -Math.PI / 2;
    const f = placeBody(front, 0, 900, 400, false);
    const k = placeBody(back, 0, 900, 400, false);
    expect(f.scale).toBeGreaterThan(k.scale);
    expect(f.opacity).toBeGreaterThan(k.opacity);
    expect(f.y).toBeGreaterThan(k.y); // the front is lower on screen
  });
  it("keeps every body inside the box, even on a small screen", () => {
    for (const small of [false, true]) {
      for (let a = 0; a < 6.3; a += 0.3) {
        const b = newBody(0, 3, steady);
        b.a = a;
        const p = placeBody(b, 0, 360, 330, small);
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(360);
        expect(p.y).toBeGreaterThan(0);
        expect(p.y).toBeLessThan(330);
      }
    }
  });
});
