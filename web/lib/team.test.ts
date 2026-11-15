import { describe, expect, it } from "vitest";
import { CREW } from "./team";

describe("crew", () => {
  it("has three people, each with their own callsign, element and colour", () => {
    expect(CREW).toHaveLength(3);
    expect(new Set(CREW.map((m) => m.callsign)).size).toBe(3);
    expect(new Set(CREW.map((m) => m.element)).size).toBe(3);
    expect(new Set(CREW.map((m) => m.color)).size).toBe(3);
  });
  it("uses Agni, Jala and Vayu for fire, water and air", () => {
    const by = Object.fromEntries(CREW.map((m) => [m.element, m.callsign]));
    expect(by).toEqual({ fire: "Agni", water: "Jala", air: "Vayu" });
  });
  it("matches the names in the site footer", () => {
    expect(CREW.map((m) => m.name)).toEqual(["Gowrika Mahesh", "Utkarsh Sawant", "Arun Kumar"]);
  });
});
