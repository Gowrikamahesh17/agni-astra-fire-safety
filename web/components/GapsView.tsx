"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, type ChartDataset, type TooltipItem } from "chart.js/auto";
import { loadInvestigations, loadObservations, loadScenarios } from "@/lib/data";
import { distance } from "@/lib/scoring";
import { useScenario } from "@/lib/scenarioStore";
import type { Investigation, Observation, Scenario, ScenarioId } from "@/lib/types";

// Categorical slots 1 and 2, dark-mode steps (validated on the dark surface). Shape is the secondary encoding.
const SERIES = [
  { id: "PSI-69", color: "#3987e5", shape: "circle" },
  { id: "PSI-159", color: "#d95926", shape: "triangle" },
] as const;
const INK = "#e8ebf5";
const MUTED = "#8f9bbf";
const GRID = "#243059";
const GOLD = "#f5b942";

type Pt = { x: number; y: number; o: Observation; d: number | null };

export default function GapsView() {
  const [invs, setInvs] = useState<Investigation[]>([]);
  const [obs, setObs] = useState<Observation[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { scenarioId, customO2, customP, setScenarioId, setCustomO2, setCustomP } = useScenario();
  const [asTable, setAsTable] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    Promise.all([loadInvestigations(), loadObservations(), loadScenarios()])
      .then(([i, o, s]) => {
        setInvs(i);
        setObs(o);
        setScenarios(s);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const scenario = scenarios.find((s) => s.id === scenarioId);
  const isCustom = scenarioId === "custom";
  const target = isCustom
    ? { o2: customO2, p: customP }
    : scenario?.o2_pct != null && scenario.pressure_bar != null
      ? { o2: scenario.o2_pct, p: scenario.pressure_bar }
      : null;

  // Only rows with both O2 and pressure can be plotted.
  const points = useMemo(() => {
    const out: Pt[] = [];
    for (const o of obs) {
      if (o.o2_pct == null || o.pressure_bar == null) continue;
      const d = isCustom
        ? target
          ? distance(o.o2_pct, o.pressure_bar, target.o2, target.p)
          : null
        : (o.distance[scenarioId] ?? null);
      out.push({ x: o.o2_pct, y: o.pressure_bar, o, d });
    }
    return out;
  }, [obs, isCustom, scenarioId, target?.o2, target?.p]); // eslint-disable-line react-hooks/exhaustive-deps

  const near = useMemo(() => points.filter((p) => p.d !== null && p.d <= 1), [points]);
  const nearBy = (id: string) => near.filter((p) => p.o.investigation_id === id);
  const plottedBy = (id: string) => points.filter((p) => p.o.investigation_id === id).length;
  const unplotted = obs.length - points.length;

  useEffect(() => {
    const el = canvas.current;
    if (!el || asTable || !points.length) return;
    const datasets: ChartDataset<"scatter", Pt[]>[] = [];
    for (const s of SERIES) {
      if (hidden.includes(s.id)) continue;
      datasets.push({
        label: invs.find((i) => i.id === s.id)?.short_name ?? s.id,
        data: points.filter((p) => p.o.investigation_id === s.id),
        backgroundColor: s.color + "cc",
        borderColor: "#121c3d", // 2px-style surface ring so overlapping marks separate
        borderWidth: 1,
        pointStyle: s.shape,
        pointRadius: 4,
        pointHoverRadius: 7,
      });
    }
    datasets.push({
      label: "Within d ≤ 1 of scenario",
      data: near.filter((p) => !hidden.includes(p.o.investigation_id)),
      backgroundColor: "transparent",
      borderColor: INK,
      borderWidth: 2,
      pointRadius: 8,
      pointHoverRadius: 8,
    });
    if (target) {
      datasets.push({
        label: "Selected scenario",
        data: [{ x: target.o2, y: target.p } as Pt],
        backgroundColor: GOLD,
        borderColor: "#121c3d",
        borderWidth: 2,
        pointStyle: "rectRot",
        pointRadius: 10,
      });
    }
    const chart = new Chart(el, {
      type: "scatter",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: { min: 0, max: 100, title: { display: true, text: "Oxygen (%)", color: MUTED }, ticks: { color: MUTED }, grid: { color: GRID } },
          y: { min: 0, max: 3.5, title: { display: true, text: "Pressure (bar)", color: MUTED }, ticks: { color: MUTED }, grid: { color: GRID } },
        },
        plugins: {
          legend: { display: false }, // custom HTML legend below carries identity
          tooltip: {
            callbacks: {
              title: () => "",
              label: (ctx: TooltipItem<"scatter">) => {
                const raw = ctx.raw as Pt;
                if (!raw.o) return `Scenario: ${raw.x} % O₂, ${raw.y} bar`;
                const o = raw.o;
                return [
                  `${o.id} · ${o.fuel ?? o.material ?? ""}`,
                  `${o.o2_pct} % O₂, ${o.pressure_bar} bar`,
                  `Outcome: ${(o.outcome ?? "–").replace(/_/g, " ")}`,
                  `${o.source.file}, row ${o.source.row}`,
                ];
              },
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [points, near, hidden, asTable, invs, target?.o2, target?.p]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p role="alert">Could not load data: {error}</p>;
  if (!scenarios.length) return <p className="muted">Loading…</p>;

  const toggle = (id: string) =>
    setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  const gravityNote = isCustom
    ? "PSI has no partial-gravity combustion data. Results are microgravity only."
    : scenario?.gravity_note;

  return (
    <div>
      <div className="toolbar">
        <label className="field">
          <span>Scenario</span>
          <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value as ScenarioId)}>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        {isCustom && (
          <>
            <label className="field">
              <span>Oxygen (%): <strong>{customO2}</strong></span>
              <input type="range" min={0} max={100} step={1} value={customO2} onChange={(e) => setCustomO2(Number(e.target.value))} />
            </label>
            <label className="field">
              <span>Pressure (bar): <strong>{customP}</strong></span>
              <input type="range" min={0.1} max={3.5} step={0.01} value={customP} onChange={(e) => setCustomP(Number(e.target.value))} />
            </label>
          </>
        )}
        <button type="button" className="chip" aria-pressed={asTable} onClick={() => setAsTable(!asTable)}>
          View as table
        </button>
      </div>
      {gravityNote && <p className="banner">{gravityNote}</p>}
      {scenario?.assumption && !isCustom && (
        <p className="muted small">This scenario uses assumed values: {scenario.note}</p>
      )}

      {!asTable && (
        <>
          <div className="chart-box">
            <canvas ref={canvas} role="img" aria-label="Scatter chart of oxygen percent against pressure in bar for every PSI test" />
          </div>
          <ul className="legend" aria-label="Legend">
            {SERIES.map((s) => (
              <li key={s.id}>
                <button type="button" className="legend-btn" aria-pressed={!hidden.includes(s.id)} onClick={() => toggle(s.id)}>
                  <span className="swatch" style={{ background: s.color, borderRadius: s.shape === "circle" ? "50%" : 0, clipPath: s.shape === "triangle" ? "polygon(50% 0, 0 100%, 100% 100%)" : undefined }} />
                  {invs.find((i) => i.id === s.id)?.short_name ?? s.id} ({plottedBy(s.id)} tests)
                </button>
              </li>
            ))}
            <li><span className="swatch ring" /> Within d ≤ 1 of the scenario ({near.length})</li>
            <li><span className="swatch diamond" /> Selected scenario</li>
          </ul>
        </>
      )}

      <h2>Near this scenario</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Investigation</th>
              <th>Plotted tests</th>
              <th>Tests with d ≤ 1</th>
              <th>Closest test (d)</th>
            </tr>
          </thead>
          <tbody>
            {invs.filter((i) => i.has_table).map((i) => {
              const mine = points.filter((p) => p.o.investigation_id === i.id && p.d !== null);
              const best = mine.length ? Math.min(...mine.map((p) => p.d as number)) : null;
              return (
                <tr key={i.id}>
                  <td><Link href={`/investigations/${i.id}`}>{i.short_name ?? i.id}</Link></td>
                  <td>{plottedBy(i.id) || "none (no pressure data)"}</td>
                  <td>{plottedBy(i.id) ? nearBy(i.id).length : "–"}</td>
                  <td>{best === null ? "–" : best.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {asTable && (
        <>
          <h2>Tests within d ≤ 1</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>O₂ %</th><th>Pressure bar</th><th>Outcome</th><th>d</th><th>Source</th></tr>
              </thead>
              <tbody>
                {[...near].sort((a, b) => (a.d as number) - (b.d as number)).slice(0, 200).map((p) => (
                  <tr key={p.o.id}>
                    <td>{p.o.id}</td><td>{p.x}</td><td>{p.y}</td>
                    <td>{(p.o.outcome ?? "–").replace(/_/g, " ")}</td>
                    <td>{(p.d as number).toFixed(2)}</td>
                    <td>{p.o.source.file}, row {p.o.source.row}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="small muted">
        {unplotted} of {obs.length} tests are not plotted because they have no oxygen or pressure value (BASS and SAME-R tables
        have no pressure column). d is the distance to the scenario, where 5 points of O₂ or 0.1 bar count as one unit.
      </p>
      <p className="banner">PSI has no partial-gravity combustion data, so the Moon, Mars and rover scenarios cannot be matched on gravity.</p>
    </div>
  );
}
