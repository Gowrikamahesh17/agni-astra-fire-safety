// The camera zoom for the scroll story, as pure maths: progress (0 to 1) in, layer styles out.
import { clamp, lerp } from "./flame";

const smooth = (v: number, a: number, b: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export type Layer = { scale: number; opacity: number };
export type DiveState = { stage: number; earth: Layer; station: Layer; chamber: Layer; flame: Layer; rotate: number };

export const STAGE_COUNT = 5;

/** Which of the five stages is active at this progress. */
export function stageAt(p: number): number {
  return p < 0.3 ? 0 : p < 0.52 ? 1 : p < 0.7 ? 2 : p < 0.82 ? 3 : 4;
}

export function diveState(p: number): DiveState {
  p = clamp(p);
  return {
    stage: stageAt(p),
    earth: { scale: lerp(0.5, 9, Math.pow(clamp(p / 0.34), 3.4)), opacity: 1 - smooth(p, 0.3, 0.4) },
    station: { scale: lerp(0.6, 2.4, smooth(p, 0.3, 0.58)), opacity: smooth(p, 0.28, 0.38) * (1 - smooth(p, 0.5, 0.58)) },
    chamber: { scale: lerp(0.7, 1.7, smooth(p, 0.52, 0.78)), opacity: smooth(p, 0.5, 0.6) * (1 - smooth(p, 0.72, 0.8)) },
    flame: { scale: lerp(0.5, 1.1, smooth(p, 0.74, 1)), opacity: smooth(p, 0.74, 0.86) },
    rotate: p * 420,
  };
}

/** Scroll progress through a tall section: 0 when its top reaches the top of the screen, 1 when its bottom reaches the bottom. */
export function progressOf(rectTop: number, sectionHeight: number, viewportHeight: number): number {
  const total = sectionHeight - viewportHeight;
  return total <= 0 ? 0 : clamp(-rectTop / total);
}
