// Motion for the team orbit, kept separate from the picture so it can be tested.
// Each crew member is a "body" with an angle around the planet plus a little zero-gravity drift.

export const BASE_SPEED = 0.16; // radians per second: one lap in about 40 s
const TWO_PI = Math.PI * 2;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type OrbitBody = {
  a: number; // angle around the planet
  dw: number; // extra angular speed from a swat or a nudge; fades slowly
  r: number; // tilt in degrees
  vr: number; // how fast the tilt is changing
  t: number; // seconds until the next gentle random nudge
  wt: number; // clock for the slow in-and-out wobble
};

export function newBody(i: number, n: number, rnd: () => number = Math.random): OrbitBody {
  return { a: Math.PI / 2 + (i * TWO_PI) / n, dw: 0, r: (rnd() - 0.5) * 12, vr: (rnd() - 0.5) * 10, t: 2 + rnd() * 3, wt: rnd() * 6 };
}

/** Ease the "orbit speed" factor toward 0 while paused (a card is hovered, or motion is off) and back to 1 when released. */
export function easePause(pf: number, paused: boolean, dt: number): number {
  const next = pf + ((paused ? 0 : 1) - pf) * Math.min(1, 4 * dt);
  return paused && next < 0.01 ? 0 : next; // settle to a true stop, not an endless crawl
}

/** Advance one body by dt seconds. pf is the pause factor from easePause: at 0 everything holds still. */
export function stepBody(b: OrbitBody, dt: number, pf: number, rnd: () => number = Math.random): void {
  b.t -= dt;
  if (b.t < 0) {
    b.t = 3 + rnd() * 3;
    b.dw += (rnd() - 0.5) * 0.1; // a slow random nudge now and then
  }
  b.dw *= 1 - 0.3 * dt; // momentum fades gently
  b.a += (BASE_SPEED + b.dw) * pf * dt;
  const adv = dt * pf;
  b.wt += adv;
  b.vr += -b.r * 0.3 * adv; // a lazy tumble that stays tilted rather than spinning
  b.vr *= 1 - 0.2 * adv;
  b.r += b.vr * adv;
  b.dw = clamp(b.dw, -1.2, 1.2);
}

/** A cursor sweep across a body: speed is how fast the pointer moved; dx is the body's offset from the pointer. */
export function swatBody(b: OrbitBody, pointerVx: number, pointerSpeed: number, dx: number): void {
  const k = Math.min(1, pointerSpeed / 30);
  b.dw += -Math.sign(pointerVx || 1) * Math.sign(Math.sin(b.a)) * k * 0.12;
  b.vr += (dx > 0 ? 1 : -1) * k * 10;
  b.dw = clamp(b.dw, -1.2, 1.2);
}

/** A tap: a random shove and spin. */
export function boopBody(b: OrbitBody, rnd: () => number = Math.random): void {
  b.dw += (rnd() - 0.5) * 1.4 || 0.5;
  b.vr += (rnd() - 0.5) * 90;
  b.dw = clamp(b.dw, -1.2, 1.2);
}

/** Where a body sits in a box of W by H. Nearer (front) bodies are bigger and brighter; farther ones smaller and dimmer. */
export function placeBody(b: OrbitBody, i: number, W: number, H: number, small: boolean) {
  const rx = W * (small ? 0.33 : 0.37);
  const ry = H * 0.3;
  const wob = 1 + 0.05 * Math.sin(b.wt * 0.6 + i * 2);
  const depth = (Math.sin(b.a) + 1) / 2;
  return {
    x: W / 2 + Math.cos(b.a) * rx * wob,
    y: H / 2 + Math.sin(b.a) * ry * wob,
    depth,
    scale: 0.6 + 0.5 * depth,
    opacity: 0.72 + 0.28 * depth,
    rx,
    ry,
  };
}
