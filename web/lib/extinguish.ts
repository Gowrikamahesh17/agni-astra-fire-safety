// The timing for the home-page astronaut: a flame burns, the extinguisher sprays it, it shrinks and goes out, a fresh one lights.
// Pure functions of time, so they can be tested. One flame is shown per cycle: a tall orange one on Earth, then a round blue one in orbit.
import { clamp, lerp } from "./flame";

export const CYCLE_S = 8;

export type Phase = {
  cycle: number; // 0, 1, 2 ... counted from the start
  u: number; // how far through this cycle, 0 to 1
  intensity: number; // 1 = burning fully, 0 = out
  spraying: boolean;
  smoking: boolean;
};

const ease = (k: number) => k * k * (3 - 2 * k);

export function phaseAt(t: number): Phase {
  const cycle = Math.floor(t / CYCLE_S);
  const u = (t - cycle * CYCLE_S) / CYCLE_S;
  if (u < 0.2) return { cycle, u, intensity: 1, spraying: false, smoking: false };
  if (u < 0.62) return { cycle, u, intensity: 1 - ease((u - 0.2) / 0.42), spraying: true, smoking: false };
  if (u < 0.82) return { cycle, u, intensity: 0, spraying: false, smoking: u < 0.74 };
  return { cycle, u, intensity: ease((u - 0.82) / 0.18), spraying: false, smoking: false };
}

/** Even cycles burn on Earth (1 g), odd cycles in orbit (0 g). */
export const gravityForCycle = (cycle: number) => (cycle % 2 === 0 ? 1 : 0);

/** What the little caption says for a given gravity and phase. */
export function noteFor(g: number, p: Phase): string {
  if (p.u >= 0.62 && p.u < 0.82) return "Agni Shant: the fire is calm";
  const where = g >= 0.5 ? "On Earth" : "In orbit";
  const form = g >= 0.5 ? "tall orange flame" : "round blue flame";
  const act = p.spraying ? "being put out" : p.intensity < 0.02 ? "out" : p.intensity < 0.98 ? "lighting again" : "burning";
  return `${where}: ${form}, ${act}`;
}

/**
 * The gravity slider on its own: hold on Earth, glide down to orbit, hold, glide back up. Returns 0 to 1.
 */
export const GRAVITY_LOOP_S = 12;
export function gravityLoop(t: number): number {
  const u = (t % GRAVITY_LOOP_S) / GRAVITY_LOOP_S;
  if (u < 0.25) return 1;
  if (u < 0.5) return lerp(1, 0, ease(clamp((u - 0.25) / 0.25)));
  if (u < 0.75) return 0;
  return lerp(0, 1, ease(clamp((u - 0.75) / 0.25)));
}
