import { describe, expect, it } from "vitest";
import { byPillar, evidenceHref, visibleImplications } from "./implications";
import type { Implication } from "./types";

const mk = (id: string, pillar: Implication["pillar"], verified: boolean, scenarios: Implication["scenario_ids"]): Implication => ({
  id, pillar, statement: id, evidence: [], scenario_ids: scenarios, verified,
});

describe("implications", () => {
  const items = [
    mk("a", "suppression", true, ["lunar_habitat"]),
    mk("b", "suppression", false, ["lunar_habitat"]),
    mk("c", "prevention", true, ["iss"]),
  ];
  it("hides unverified statements", () => {
    expect(visibleImplications(items, null).map((i) => i.id)).toEqual(["a", "c"]);
  });
  it("filters by scenario", () => {
    expect(visibleImplications(items, "iss").map((i) => i.id)).toEqual(["c"]);
  });
  it("groups by pillar", () => {
    const g = byPillar(visibleImplications(items, null));
    expect(g.suppression).toHaveLength(1);
    expect(g.detection).toHaveLength(0);
  });
  it("maps evidence ids to investigation pages", () => {
    expect(evidenceHref("PSI-69-0024")).toBe("/investigations/PSI-69");
    expect(evidenceHref("PSI-25")).toBe("/investigations/PSI-25");
    expect(evidenceHref("NTRS 20200001234")).toBeNull();
  });
});
