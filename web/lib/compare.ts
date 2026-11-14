import type { Investigation, Observation } from "./types";

const norm = (s: string) => s.trim().toLowerCase();

/** Items present in every list (case-insensitive), in the first list's spelling. */
export function sharedAcross(lists: string[][]): string[] {
  if (lists.length < 2) return [];
  const [first, ...rest] = lists;
  const sets = rest.map((l) => new Set(l.map(norm)));
  return [...new Set(first)].filter((x) => sets.every((s) => s.has(norm(x))));
}

/** "CIR / MDCA" -> ["CIR", "MDCA"], so investigations on the same facility can be matched. */
export function hardwareParts(h: string | null): string[] {
  return h ? h.split(/[/,;]+/).map((x) => x.trim()).filter(Boolean) : [];
}

export function outcomeCounts(obs: Observation[], investigationId: string): [string, number][] {
  const m = new Map<string, number>();
  for (const o of obs) {
    if (o.investigation_id !== investigationId || !o.outcome) continue;
    m.set(o.outcome, (m.get(o.outcome) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export type Similarities = {
  hardware: string[];
  sensors: string[];
  measuredVariables: string[];
  roles: string[];
  sameFuelPhase: boolean;
};

export function similarities(invs: Investigation[]): Similarities {
  return {
    hardware: sharedAcross(invs.map((i) => hardwareParts(i.hardware))),
    sensors: sharedAcross(invs.map((i) => i.sensors ?? [])),
    measuredVariables: sharedAcross(invs.map((i) => i.measured_variables ?? [])),
    roles: sharedAcross(invs.map((i) => i.fire_safety_role)),
    sameFuelPhase: invs.length > 1 && invs.every((i) => i.fuel_phase !== null && i.fuel_phase === invs[0].fuel_phase),
  };
}
