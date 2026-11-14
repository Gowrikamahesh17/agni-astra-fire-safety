import type { Implication, ScenarioId } from "./types";

export const PILLARS: { id: Implication["pillar"]; label: string; blurb: string }[] = [
  { id: "prevention", label: "Prevention", blurb: "Keeping materials from igniting or spreading flame." },
  { id: "detection", label: "Detection", blurb: "Sensing smoke and fire early." },
  { id: "suppression", label: "Suppression", blurb: "Putting a fire out." },
];

/** Only verified statements are shown. Optionally keep those that apply to one scenario. */
export function visibleImplications(items: Implication[], scenario: ScenarioId | null): Implication[] {
  return items.filter((i) => i.verified && (scenario === null || i.scenario_ids.includes(scenario)));
}

export function byPillar(items: Implication[]): Record<Implication["pillar"], Implication[]> {
  const out: Record<Implication["pillar"], Implication[]> = { prevention: [], detection: [], suppression: [] };
  for (const i of items) out[i.pillar].push(i);
  return out;
}

/** Evidence id -> investigation page, or null if it is a document reference. */
export function evidenceHref(ref: string): string | null {
  const row = /^([A-Za-z]+-\d+)-\d{4}$/.exec(ref); // observation id, e.g. PSI-69-0024
  if (row) return `/investigations/${row[1]}?q=${encodeURIComponent(ref)}`; // opens the table filtered to that test
  if (/^PSI-\d+$/.test(ref)) return `/investigations/${ref}`; // investigation id
  return null;
}
