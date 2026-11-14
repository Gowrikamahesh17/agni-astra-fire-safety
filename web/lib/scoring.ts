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
