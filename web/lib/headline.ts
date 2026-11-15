import { readFileSync } from "node:fs";
import { join } from "node:path";
import { unwrap } from "./data";
import type { Observation } from "./types";

export type Headline = { n: number; extinguished: number; o2: [number, number]; pressure: [number, number] };

/** FLEX tests within one step of the lunar habitat atmosphere, computed from the shipped data (never typed in by hand). */
export function lunarHeadline(): Headline | null {
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), "public", "data", "observations.json"), "utf8"));
    const near = unwrap<Observation>("observations", raw).filter(
      (o) => o.investigation_id === "PSI-69" && o.o2_pct != null && o.pressure_bar != null && (o.distance.lunar_habitat ?? 99) <= 1,
    );
    if (near.length === 0) return null;
    const o2 = near.map((o) => o.o2_pct as number);
    const p = near.map((o) => o.pressure_bar as number);
    return {
      n: near.length,
      extinguished: near.filter((o) => o.outcome === "extinguished").length,
      o2: [Math.min(...o2), Math.max(...o2)],
      pressure: [Math.min(...p), Math.max(...p)],
    };
  } catch {
    return null;
  }
}

export type FlexFacts = { tests: number; dropletMm: [number, number] };

/** Facts about the FLEX droplet tests for the scroll story, counted from the shipped data. */
export function flexFacts(): FlexFacts | null {
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), "public", "data", "observations.json"), "utf8"));
    const flex = unwrap<Observation>("observations", raw).filter((o) => o.investigation_id === "PSI-69");
    const d = flex.map((o) => o.measurements.droplet_d0_mm).filter((v): v is number => typeof v === "number");
    if (flex.length === 0 || d.length === 0) return null;
    return { tests: flex.length, dropletMm: [Math.min(...d), Math.max(...d)] };
  } catch {
    return null;
  }
}
