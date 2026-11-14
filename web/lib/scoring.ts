export type Weights = { proximity: number; relevance: number; usability: number };

export const DEFAULT_WEIGHTS: Weights = { proximity: 0.5, relevance: 0.3, usability: 0.2 };

/** Weighted mean of the three 0-100 components. A null proximity (metadata-only entry) counts as 0. */
export function siteScore(
  c: { proximity: number | null; relevance: number; usability: number },
  w: Weights = DEFAULT_WEIGHTS,
): number {
  const total = w.proximity + w.relevance + w.usability;
  if (total === 0) return 0;
  return (
    ((c.proximity ?? 0) * w.proximity + c.relevance * w.relevance + c.usability * w.usability) / total
  );
}

// ---- Custom scenario: same formula B uses offline (spec 5.3), run in the browser. ----
export const O2_SCALE = 5; // percentage points that count as one unit
export const P_SCALE = 0.1; // bar that counts as one unit

export function distance(o2: number, p: number, o2s: number, ps: number): number {
  return Math.sqrt(((o2 - o2s) / O2_SCALE) ** 2 + ((p - ps) / P_SCALE) ** 2);
}

export type Point = { o2_pct: number | null; pressure_bar: number | null };

export function componentFor(points: Point[], o2s: number, ps: number) {
  let dMin: number | null = null;
  let nNear = 0;
  for (const pt of points) {
    if (pt.o2_pct == null || pt.pressure_bar == null) continue;
    const d = distance(pt.o2_pct, pt.pressure_bar, o2s, ps);
    if (dMin === null || d < dMin) dMin = d;
    if (d <= 1) nNear++;
  }
  return {
    proximity: dMin === null ? null : Math.round(100 * Math.max(0, 1 - dMin / 3)),
    n_near: nNear,
    d_min: dMin === null ? null : Math.round(dMin * 1000) / 1000,
  };
}
