import { clamp } from "./flame";

/** How many dots to draw for a cabin atmosphere: more pressure means more dots, and the oxygen share sets how many are oxygen. */
export function cabinCounts(o2Pct: number, pressureBar: number, perBar = 90) {
  const total = Math.max(0, Math.round(pressureBar * perBar));
  const oxygen = Math.round((total * clamp(o2Pct, 0, 100)) / 100);
  return { total, oxygen, other: total - oxygen };
}
