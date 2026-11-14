import type { Observation } from "./types";

type Cell = string | number | boolean | null | undefined;

/** Quote a cell. Strings that a spreadsheet could read as a formula get a leading apostrophe. */
export function escapeCell(v: Cell): string {
  if (v === null || v === undefined) return "";
  let s = String(v);
  if (typeof v === "string" && /^[=+@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const BASE_COLUMNS: [string, (o: Observation) => Cell][] = [
  ["id", (o) => o.id],
  ["investigation_id", (o) => o.investigation_id],
  ["flame_type", (o) => o.flame_type],
  ["fuel", (o) => o.fuel],
  ["fuel_fraction_pct", (o) => o.fuel_fraction_pct],
  ["material", (o) => o.material],
  ["geometry_shape", (o) => o.geometry.shape],
  ["geometry_diameter_mm", (o) => o.geometry.diameter_mm],
  ["geometry_thickness_mm", (o) => o.geometry.thickness_mm],
  ["geometry_width_mm", (o) => o.geometry.width_mm],
  ["o2_pct", (o) => o.o2_pct],
  ["pressure_bar", (o) => o.pressure_bar],
  ["co2_pct", (o) => o.co2_pct],
  ["he_pct", (o) => o.he_pct],
  ["n2_pct", (o) => o.n2_pct],
  ["flow_value", (o) => o.flow?.value],
  ["flow_unit", (o) => o.flow?.unit],
  ["flow_kind", (o) => o.flow?.kind],
  ["gravity", (o) => o.gravity],
  ["ignited", (o) => o.ignited],
  ["outcome", (o) => o.outcome],
  ["censored", (o) => o.censored],
];

/** One row per observation, with its source file and row so every value can be traced. */
export function observationsToCsv(rows: Observation[]): string {
  const measureKeys = [...new Set(rows.flatMap((o) => Object.keys(o.measurements)))].sort();
  const header = [...BASE_COLUMNS.map(([n]) => n), ...measureKeys.map((k) => `m_${k}`), "source_file", "source_row"];
  const lines = rows.map((o) =>
    [
      ...BASE_COLUMNS.map(([, f]) => f(o)),
      ...measureKeys.map((k) => o.measurements[k]),
      o.source.file,
      o.source.row,
    ]
      .map(escapeCell)
      .join(","),
  );
  return [header.join(","), ...lines].join("\r\n") + "\r\n";
}

/** Browser download. The BOM makes Excel read the file as UTF-8. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
