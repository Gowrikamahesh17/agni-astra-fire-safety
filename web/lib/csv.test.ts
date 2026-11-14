import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { escapeCell, observationsToCsv } from "./csv";
import { unwrap } from "./data";
import type { Observation } from "./types";

describe("escapeCell", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(escapeCell('a,"b"')).toBe('"a,""b"""');
    expect(escapeCell("x\ny")).toBe('"x\ny"');
  });
  it("blanks nulls and keeps numbers", () => {
    expect(escapeCell(null)).toBe("");
    expect(escapeCell(0)).toBe("0");
    expect(escapeCell(-1.5)).toBe("-1.5");
  });
  it("defuses spreadsheet formulas in strings", () => {
    expect(escapeCell("=SUM(A1)")).toBe("'=SUM(A1)");
  });
});

describe("observationsToCsv", () => {
  const obs = unwrap<Observation>(
    "observations",
    JSON.parse(readFileSync("public/data/observations.json", "utf8")),
  );
  it("has one line per row plus header, with source columns last", () => {
    const rows = obs.slice(0, 5);
    const lines = observationsToCsv(rows).trimEnd().split("\r\n");
    expect(lines).toHaveLength(6);
    const head = lines[0].split(",");
    expect(head.slice(-2)).toEqual(["source_file", "source_row"]);
    expect(lines[1]).toContain(String(rows[0].source.row));
  });
});
