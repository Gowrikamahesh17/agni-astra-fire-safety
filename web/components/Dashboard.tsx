"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadInvestigations, loadObservations, loadScenarios } from "@/lib/data";
import { DEFAULT_WEIGHTS, componentFor, siteScore, type Weights } from "@/lib/scoring";
import type { Investigation, Observation, Role, Scenario, ScenarioId } from "@/lib/types";

const ROLES: { id: Role; label: string }[] = [
  { id: "prevention", label: "Prevention" },
  { id: "detection", label: "Detection" },
  { id: "suppression", label: "Suppression" },
  { id: "flame_behavior", label: "Flame behaviour" },
];
const roleLabel = (r: Role) => ROLES.find((x) => x.id === r)?.label ?? r;

export default function Dashboard() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [observations, setObservations] = useState<Observation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [scenarioId, setScenarioId] = useState<ScenarioId>("lunar_habitat");
  const [customO2, setCustomO2] = useState(30);
  const [customP, setCustomP] = useState(0.7);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    Promise.all([loadInvestigations(), loadScenarios()])
      .then(([i, s]) => {
        setInvestigations(i);
        setScenarios(s);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  // Observations (about 1 MB) are only needed to score a custom scenario.
  useEffect(() => {
    if (scenarioId === "custom" && !observations) {
      loadObservations()
        .then(setObservations)
        .catch((e: Error) => setError(e.message));
    }
  }, [scenarioId, observations]);

  const scenario = scenarios.find((s) => s.id === scenarioId);
  const isCustom = scenarioId === "custom";

  const byInvestigation = useMemo(() => {
    const m = new Map<string, Observation[]>();
    for (const o of observations ?? []) {
      const list = m.get(o.investigation_id);
      if (list) list.push(o);
      else m.set(o.investigation_id, [o]);
    }
    return m;
  }, [observations]);

  const ranked = useMemo(() => {
    const rows = investigations
      .filter((i) => roles.length === 0 || i.fire_safety_role.some((r) => roles.includes(r)))
      .map((inv) => {
        const comp = isCustom
          ? inv.has_table
            ? componentFor(byInvestigation.get(inv.id) ?? [], customO2, customP)
            : { proximity: null, n_near: 0, d_min: null }
          : (inv.scenario_components[scenarioId] ?? { proximity: null, n_near: 0, d_min: null });
        const parts = {
          proximity: comp.proximity,
          relevance: inv.static_scores.fire_safety_relevance,
          usability: inv.static_scores.data_usability,
        };
        return { inv, comp, parts, score: siteScore(parts, weights) };
      });
    rows.sort((a, b) => b.score - a.score);
    return rows;
  }, [investigations, roles, isCustom, byInvestigation, customO2, customP, scenarioId, weights]);

  const toggleRole = (r: Role) =>
    setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  if (error) return <p role="alert">Could not load data: {error}</p>;
  if (!scenarios.length) return <p className="muted">Loading…</p>;

  const showGravityNote = !isCustom && scenario?.gravity_note;
  const waitingForRows = isCustom && !observations;

  return (
    <div className="dash">
      <aside className="panel" aria-label="Controls">
        <h2>Mission scenario</h2>
        <label className="field">
          <span>Preset</span>
          <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value as ScenarioId)}>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        {isCustom ? (
          <>
            <Slider label="Oxygen (%)" min={0} max={100} step={1} value={customO2} onChange={setCustomO2} />
            <Slider label="Pressure (bar)" min={0.1} max={3.5} step={0.01} value={customP} onChange={setCustomP} />
          </>
        ) : (
          scenario && (
            <p className="muted small">
              {scenario.o2_pct} % O₂ · {scenario.pressure_bar} bar · {scenario.gravity}
              {scenario.assumption && " · assumed values"}
              <br />
              {scenario.note}
            </p>
          )
        )}

        <h2>Focus</h2>
        <div className="chips" role="group" aria-label="Fire-safety role">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              className="chip"
              aria-pressed={roles.includes(r.id)}
              onClick={() => toggleRole(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <h2>Score weights</h2>
        <Slider label="Scenario proximity" min={0} max={1} step={0.05} value={weights.proximity} onChange={(v) => setWeights({ ...weights, proximity: v })} />
        <Slider label="Fire-safety relevance" min={0} max={1} step={0.05} value={weights.relevance} onChange={(v) => setWeights({ ...weights, relevance: v })} />
        <Slider label="Data usability" min={0} max={1} step={0.05} value={weights.usability} onChange={(v) => setWeights({ ...weights, usability: v })} />
        <button type="button" className="link-button" onClick={() => setWeights(DEFAULT_WEIGHTS)}>
          Reset weights
        </button>
      </aside>

      <section aria-label="Ranked investigations">
        {showGravityNote && <p className="banner">{scenario?.gravity_note}</p>}
        {isCustom && <p className="banner">PSI has no partial-gravity combustion data. Results are microgravity only.</p>}
        {waitingForRows && <p className="muted">Loading test rows for the custom scenario…</p>}
        <ol className="ranking">
          {ranked.map(({ inv, comp, parts, score }, idx) => (
            <li key={inv.id} className="card rank-card">
              <div className="rank-head">
                <span className="rank-num">{idx + 1}</span>
                <div className="rank-title">
                  <h3>
                    <Link href={`/investigations/${inv.id}`}>{inv.short_name ?? inv.name ?? inv.id}</Link>
                  </h3>
                  <p className="muted small">
                    {inv.name} · {inv.fire_safety_role.map(roleLabel).join(", ")}
                    {!inv.has_table && <span className="badge">Text evidence only</span>}
                  </p>
                </div>
                <div className="score" aria-label={`Score ${Math.round(score)} out of 100`}>
                  {Math.round(score)}
                </div>
              </div>
              {inv.objective && <p className="small">{inv.objective}</p>}
              <dl className="parts">
                <div>
                  <dt>Proximity</dt>
                  <dd>{parts.proximity === null ? "no rows" : parts.proximity}</dd>
                </div>
                <div>
                  <dt>Relevance</dt>
                  <dd>{parts.relevance}</dd>
                </div>
                <div>
                  <dt>Usability</dt>
                  <dd>{parts.usability}</dd>
                </div>
                <div>
                  <dt>Tests near scenario</dt>
                  <dd>{inv.has_table ? comp.n_near : "–"}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
        {ranked.length === 0 && <p className="muted">No investigations match this focus.</p>}
      </section>
    </div>
  );
}

function Slider(props: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="field">
      <span>
        {props.label}: <strong>{props.value}</strong>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}
