// Flame shape and colour for the gravity illustration. Pure functions so they can be tested.
// g = 1 is Earth gravity (tall teardrop, orange, flickering); g = 0 is microgravity (round, blue, calm).

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function hexToRgb(h: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Blend two #rrggbb colours. t = 0 gives a, t = 1 gives b. */
export function mixHex(a: string, b: string, t: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], clamp(t))).toString(16).padStart(2, "0")).join("");
}

const POINTS = 90;

/**
 * Closed outline of a flame of base radius R. g stretches the top into a point and adds flicker (t is time in seconds).
 * With g = 0 the outline is a circle of radius R, and time has no effect.
 */
export function flamePath(g: number, t: number, R: number): string {
  g = clamp(g);
  const pts: string[] = [];
  for (let i = 0; i < POINTS; i++) {
    const a = (i / POINTS) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const up = Math.max(0, c);
    const wobble = (Math.sin(t * 7 + a * 4) * 5 + Math.sin(t * 3.1 + a * 2) * 3) * g * up * (R / 60);
    const x = R * s * (1 - 0.85 * g * Math.pow(up, 1.5));
    const y = -R * c * (c > 0 ? 1 + 1.3 * g : 1) - wobble;
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

const COOL = { outer: "#4d84ff", inner: "#c7e1ff", glow: "#2f6bff" };
const HOT = { outer: "#ff7a1a", inner: "#fff0b0", glow: "#ff7a1a" };

export function flameColors(g: number) {
  g = clamp(g);
  return {
    outer: mixHex(COOL.outer, HOT.outer, g),
    inner: mixHex(COOL.inner, HOT.inner, g),
    glow: mixHex(COOL.glow, HOT.glow, g),
    glowOpacity: 0.22 + 0.1 * g,
  };
}

/** Plain-English description of the picture for the current gravity, read out to screen readers. */
export function describeGravity(g: number): string {
  g = clamp(g);
  if (g >= 0.9) return "At Earth gravity, hot gas rises, so the flame stretches into a tall, flickering orange teardrop.";
  if (g <= 0.05) return "With almost no gravity, nothing makes the hot gas rise, so the flame is a calm, round, blue sphere.";
  return `At ${g.toFixed(2)} g the flame is part way between the two: shorter and rounder as gravity weakens. This is an illustration only.`;
}

/** Flame size for the Predict page: the likelier the flame is to go out, the smaller it burns. Always stays visible. */
export function meterScale(probabilityOfOut: number): number {
  const live = 1 - clamp(probabilityOfOut);
  return lerp(0.12, 1, Math.pow(live, 0.7));
}

export function meterOpacity(probabilityOfOut: number): number {
  return 0.15 + 0.85 * Math.sqrt(1 - clamp(probabilityOfOut));
}

/** A plain-words reading of the same number, so the picture is never the only signal. */
export function meterWords(probabilityOfOut: number): string {
  const p = clamp(probabilityOfOut);
  if (p < 0.33) return "Likely to keep burning";
  if (p < 0.66) return "Could go either way";
  return "Likely to go out";
}
