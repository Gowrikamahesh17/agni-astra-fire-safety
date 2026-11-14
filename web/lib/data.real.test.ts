import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { unwrap } from "./data";
import type { Investigation, Observation, Scenario } from "./types";

const read = (n: string) => JSON.parse(readFileSync(`public/data/${n}.json`, "utf8"));

describe("real data files", () => {
  const inv = unwrap<Investigation>("investigations", read("investigations"));
  const obs = unwrap<Observation>("observations", read("observations"));
  const sc = unwrap<Scenario>("scenarios", read("scenarios"));

  it("load with the expected contract version", () => {
    expect(inv.length).toBeGreaterThan(0);
    expect(obs.length).toBeGreaterThan(0);
    expect(sc.length).toBe(7);
  });
  it("every observation belongs to a known investigation and has a source row", () => {
    const ids = new Set(inv.map((i) => i.id));
    for (const o of obs) {
      expect(ids.has(o.investigation_id)).toBe(true);
      expect(o.source.row).toBeGreaterThanOrEqual(2);
    }
  });
});
