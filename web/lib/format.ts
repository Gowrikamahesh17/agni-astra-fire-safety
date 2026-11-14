import type { Flow, Geometry } from "./types";

const num = (n: number) => String(Math.round(n * 1000) / 1000);

/** "film, 0.1 mm thick, 20 mm wide" / "sphere, Ø1.69 mm". Falls back to the raw text, or null if there is nothing. */
export function formatGeometry(g: Geometry): string | null {
  const parts: string[] = [];
  if (g.shape) parts.push(g.shape);
  if (g.diameter_mm != null) parts.push(`Ø${num(g.diameter_mm)} mm`);
  if (g.thickness_mm != null) parts.push(`${num(g.thickness_mm)} mm thick`);
  if (g.width_mm != null) parts.push(`${num(g.width_mm)} mm wide`);
  if (parts.length) return parts.join(", ");
  return g.raw ? g.raw : null;
}

/** Airflow as recorded. BASS-II gives device settings, not a velocity, so those are never shown as cm/s. */
export function formatFlow(f: Flow): string | null {
  if (!f || f.value == null) return null;
  if (f.kind === "device_setting") return `setting ${num(f.value)}`;
  const unit = f.unit ? ` ${f.unit}` : "";
  return `${num(f.value)}${unit}${f.kind === "mass_flow" ? " (mass flow)" : ""}`;
}
