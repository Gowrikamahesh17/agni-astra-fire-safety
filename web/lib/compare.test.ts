import { describe, expect, it } from "vitest";
import { hardwareParts, outcomeCounts, sharedAcross, similarities } from "./compare";
import type { Investigation, Observation } from "./types";

const inv = (p: Partial<Investigation>) => p as Investigation;

describe("compare helpers", () => {
  it("finds shared items case-insensitively across all lists", () => {
    expect(sharedAcross([["Color camera", "radiometers"], ["color camera"], ["COLOR CAMERA", "x"]])).toEqual(["Color camera"]);
    expect(sharedAcross([["a"]])).toEqual([]);
  });
  it("splits hardware into facilities", () => {
    expect(hardwareParts("CIR / MDCA")).toEqual(["CIR", "MDCA"]);
    expect(hardwareParts(null)).toEqual([]);
  });
  it("detects shared hardware between FLEX-like and CFI-G-like entries", () => {
    const s = similarities([
      inv({ hardware: "CIR / MDCA", fuel_phase: "liquid", sensors: ["a"], measured_variables: [], fire_safety_role: ["suppression"] }),
      inv({ hardware: "CIR / ACME burner", fuel_phase: "gas", sensors: ["A"], measured_variables: [], fire_safety_role: ["flame_behavior"] }),
    ]);
    expect(s.hardware).toEqual(["CIR"]);
    expect(s.sensors).toEqual(["a"]);
    expect(s.sameFuelPhase).toBe(false);
    expect(s.roles).toEqual([]);
  });
  it("counts outcomes for one investigation", () => {
    const o = (id: string, outcome: Observation["outcome"]) => ({ investigation_id: id, outcome }) as Observation;
    expect(outcomeCounts([o("A", "extinguished"), o("A", "extinguished"), o("A", "disrupted"), o("B", "extinguished"), o("A", null)], "A")).toEqual([
      ["extinguished", 2],
      ["disrupted", 1],
    ]);
  });
});

import { listsDiffer, rowDiffers, uniqueItems } from "./compare";

describe("difference highlighting", () => {
  it("rowDiffers ignores case and spacing", () => {
    expect(rowDiffers(["Liquid", " liquid "])).toBe(false);
    expect(rowDiffers(["liquid", "gas"])).toBe(true);
    expect(rowDiffers(["only one"])).toBe(false);
  });
  it("uniqueItems marks items missing from at least one list", () => {
    const u = uniqueItems([["CIR", "MDCA"], ["cir", "ACME burner"]]);
    expect([...u[0]]).toEqual(["mdca"]);
    expect([...u[1]]).toEqual(["acme burner"]);
  });
  it("with three lists an item must be in all of them to count as shared", () => {
    const u = uniqueItems([["a", "b"], ["a"], ["a", "b"]]);
    expect([...u[0]]).toEqual(["b"]);
    expect([...u[1]]).toEqual([]);
    expect(listsDiffer([["a"], ["a"], ["a"]])).toBe(false);
    expect(listsDiffer([["a"], ["a", "b"]])).toBe(true);
  });
});
