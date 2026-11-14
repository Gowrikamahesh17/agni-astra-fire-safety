"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadImplications, loadScenarios } from "@/lib/data";
import { PILLARS, byPillar, evidenceHref, visibleImplications } from "@/lib/implications";
import { useScenario } from "@/lib/scenarioStore";
import type { Implication, Scenario, ScenarioId } from "@/lib/types";

export default function ImplicationsView() {
  const [items, setItems] = useState<Implication[] | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const { scenarioId, setScenarioId } = useScenario();
  const [showAll, setShowAll] = useState(true);
  // The custom scenario has no written statements, so it shows everything.
  const scenario: ScenarioId | null = showAll || scenarioId === "custom" ? null : scenarioId;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadImplications(), loadScenarios()])
      .then(([i, s]) => {
        setItems(i);
        setScenarios(s.filter((x) => x.id !== "custom"));
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const grouped = useMemo(() => byPillar(visibleImplications(items ?? [], scenario)), [items, scenario]);
  const total = PILLARS.reduce((n, p) => n + grouped[p.id].length, 0);

  if (error) return <p role="alert">Could not load data: {error}</p>;
  if (!items) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="chips" role="group" aria-label="Filter by scenario">
        <button type="button" className="chip" aria-pressed={scenario === null} onClick={() => setShowAll(true)}>
          All scenarios
        </button>
        {scenarios.map((s) => (
          <button key={s.id} type="button" className="chip" aria-pressed={scenario === s.id} onClick={() => {
              setScenarioId(s.id);
              setShowAll(false);
            }}>
            {s.name}
          </button>
        ))}
      </div>
      <p className="small muted">AI-generated, checked against source rows. Only statements that passed the number check are shown.</p>

      {items.length === 0 && (
        <p className="banner">Implications are not available yet. They are generated and verified offline, then appear here.</p>
      )}
      {items.length > 0 && total === 0 && <p className="muted">No verified statements for this scenario.</p>}

      <div className="pillars">
        {PILLARS.map((p) => (
          <section key={p.id} aria-labelledby={`pillar-${p.id}`}>
            <h2 id={`pillar-${p.id}`}>{p.label}</h2>
            <p className="muted small">{p.blurb}</p>
            {grouped[p.id].map((i) => (
              <article key={i.id} className="card">
                <p>{i.statement}</p>
                <p className="chips">
                  {i.evidence.map((ref) => {
                    const href = evidenceHref(ref);
                    return href ? (
                      <Link key={ref} href={href} className="source-chip">
                        {ref}
                      </Link>
                    ) : (
                      <span key={ref} className="source-chip">
                        {ref}
                      </span>
                    );
                  })}
                </p>
              </article>
            ))}
            {grouped[p.id].length === 0 && items.length > 0 && <p className="muted small">Nothing verified here yet.</p>}
          </section>
        ))}
      </div>
    </div>
  );
}
