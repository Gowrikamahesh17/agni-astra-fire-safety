"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MiniSearch from "minisearch";
import { useEffect, useMemo, useState } from "react";
import { downloadCsv, observationsToCsv } from "@/lib/csv";
import { formatFlow, formatGeometry } from "@/lib/format";
import { Term } from "@/components/InfoTip";
import HowTo from "@/components/HowTo";
import { OUTCOME_HELP, measureLabel } from "@/lib/glossary";
import { loadInvestigations, loadObservations, loadSummaries } from "@/lib/data";
import type { Investigation, Observation, Summary } from "@/lib/types";

type GroupBy = "none" | "fuel" | "outcome" | "o2_band";
const PAGE = 100;

const label = (s: string | null) => (s ? s.replace(/_/g, " ") : "–");
const fmt = (n: number | null, d = 2) => (n === null ? "–" : String(Math.round(n * 10 ** d) / 10 ** d));

function o2Band(o: Observation): string {
  const v = o.o2_pct;
  if (v === null) return "unknown O₂";
  if (v < 15) return "< 15 % O₂";
  if (v < 21) return "15–21 % O₂";
  if (v < 30) return "21–30 % O₂";
  return "≥ 30 % O₂";
}

function groupKey(o: Observation, by: GroupBy): string {
  if (by === "fuel") return label(o.fuel ?? o.material);
  if (by === "outcome") return label(o.outcome);
  if (by === "o2_band") return o2Band(o);
  return "All tests";
}

function measurementsText(o: Observation): string {
  return Object.entries(o.measurements)
    .filter(([, v]) => typeof v === "number")
    .slice(0, 4)
    .map(([k, v]) => `${measureLabel(k)}: ${typeof v === "number" ? Math.round(v * 1000) / 1000 : v}`)
    .join(" · ");
}

export default function InvestigationView({ id }: { id: string }) {
  const [inv, setInv] = useState<Investigation | null | undefined>(undefined);
  const [rows, setRows] = useState<Observation[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? ""); // evidence links open the page filtered to one test
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    Promise.all([loadInvestigations(), loadObservations(), loadSummaries()])
      .then(([invs, obs, sums]) => {
        setInv(invs.find((i) => i.id === id) ?? null);
        setRows(obs.filter((o) => o.investigation_id === id));
        setSummary(sums.find((s) => s.investigation_id === id && s.verified) ?? null);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const index = useMemo(() => {
    const ms = new MiniSearch<Observation & { text: string }>({
      fields: ["text"],
      storeFields: [],
      searchOptions: { prefix: true, fuzzy: 0.2, combineWith: "AND" },
    });
    ms.addAll(
      rows.map((o) => ({
        ...o,
        text: [o.id, o.fuel_raw, o.fuel, o.material, o.flame_type, o.outcome, o.outcome_raw, o.geometry.raw, o.source.file]
          .filter(Boolean)
          .join(" "),
      })),
    );
    return ms;
  }, [rows]);

  // Hide a column when no row of this investigation has a value for it.
  const hasGeometry = useMemo(() => rows.some((o) => formatGeometry(o.geometry) !== null), [rows]);
  const hasFlow = useMemo(() => rows.some((o) => formatFlow(o.flow) !== null), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return rows;
    const hits = new Set(index.search(q).map((h) => h.id as string));
    return rows.filter((o) => hits.has(o.id));
  }, [rows, query, index]);

  const groups = useMemo(() => {
    const m = new Map<string, Observation[]>();
    for (const o of filtered) {
      const k = groupKey(o, groupBy);
      const list = m.get(k);
      if (list) list.push(o);
      else m.set(k, [o]);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, groupBy]);

  // Apply the "show more" limit across groups without mutating during render.
  const visible = useMemo(() => {
    let left = shown;
    const out: [string, Observation[], number][] = [];
    for (const [name, list] of groups) {
      if (left <= 0) break;
      out.push([name, list.slice(0, left), list.length]);
      left -= Math.min(left, list.length);
    }
    return out;
  }, [groups, shown]);

  if (error) return <p role="alert">Could not load data: {error}</p>;
  if (inv === undefined) return <p className="muted">Loading…</p>;
  if (inv === null)
    return (
      <p>
        No investigation with id “{id}”. <Link href="/dashboard">Back to dashboard</Link>
      </p>
    );

  return (
    <article>
      <p>
        <Link href="/dashboard">← Dashboard</Link>
      </p>
      <h1>
        {inv.short_name ?? inv.id} <span className="muted">· {inv.name}</span>
      </h1>
      {!inv.has_table && <p className="badge">Text evidence only: no test rows in the PSI tables</p>}

      <div className="card">
        <h2>Objective</h2>
        <p>{inv.objective ?? "Not available."}</p>
        <dl className="facts">
          <Fact k="Hardware" v={inv.hardware} />
          <Fact k="Fuel phase" v={inv.fuel_phase} />
          <Fact k="Fire-safety role" v={inv.fire_safety_role.map(label).join(", ")} />
          <Fact k="Oxygen range" v={inv.o2_pct_range ? `${inv.o2_pct_range[0]}–${inv.o2_pct_range[1]} %` : null} />
          <Fact k="Pressure range" v={inv.pressure_bar_range ? `${inv.pressure_bar_range[0]}–${inv.pressure_bar_range[1]} bar` : null} />
          <Fact k="Sensors" v={inv.sensors?.join(", ")} />
          <Fact k="Measured variables" v={inv.measured_variables?.join(", ")} />
          <Fact k="Tests" v={inv.has_table ? String(inv.n_observations) : null} />
        </dl>
        <p className="small muted">
          {inv.source_url && (
            <a href={inv.source_url} target="_blank" rel="noreferrer">
              {inv.psi_id ? "PSI page" : "NASA source page"}
            </a>
          )}
          {inv.doi && (
            <>
              {" · "}
              <a href={`https://doi.org/${inv.doi}`} target="_blank" rel="noreferrer">
                DOI {inv.doi}
              </a>
            </>
          )}
          {inv.license && ` · ${inv.license}`}
        </p>
      </div>

      {summary && (
        <div className="card">
          <h2>Summary</h2>
          <p>{summary.text}</p>
          <p className="small muted">AI-generated, checked against source rows. Cites: {summary.cites.join(", ")}</p>
        </div>
      )}

      {inv.has_table && (
        <section aria-label="Test rows">
          <h2>
            Test rows{" "}
            <span className="muted small">
              ({filtered.length} of {rows.length})
            </span>
          </h2>
          <HowTo title="How to read this table">
            <ul>
              <li>Each row is one test from NASA&apos;s published table. The <strong>source</strong> chip names the exact file and row, so any value can be checked.</li>
              <li>Search by fuel, outcome or test id. <strong>Group by</strong> sorts the rows into sections. <strong>Download CSV</strong> saves whatever is showing, for your own analysis.</li>
              <li>Dotted-underlined outcomes explain themselves when you hover or tap them. A dash means the table did not record that value.</li>
            </ul>
          </HowTo>
          <div className="toolbar">
            <label className="field grow">
              <span>Search</span>
              <input
                type="search"
                value={query}
                placeholder="fuel, outcome, id…"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShown(PAGE);
                }}
              />
            </label>
            <label className="field">
              <span>Group by</span>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>
                <option value="none">None</option>
                <option value="fuel">Fuel</option>
                <option value="outcome">Outcome</option>
                <option value="o2_band">O₂ band</option>
              </select>
            </label>
            <button
              type="button"
              className="chip"
              disabled={filtered.length === 0}
              onClick={() => downloadCsv(`${inv.id}-filtered-tests.csv`, observationsToCsv(filtered))}
            >
              Download CSV ({filtered.length})
            </button>
          </div>

          {visible.map(([name, slice, total]) => {
            return (
              <div key={name}>
                {groupBy !== "none" && (
                  <h3>
                    {name} <span className="muted small">({total})</span>
                  </h3>
                )}
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fuel</th>
                        <th>O₂ %</th>
                        <th>Pressure bar</th>
                        {hasGeometry && <th>Geometry</th>}
                        {hasFlow && <th>Flow</th>}
                        <th>
                          Outcome <Term k="outcome" />
                        </th>
                        <th>
                          Measurements <Term k="measurements" />
                        </th>
                        <th>
                          Source <Term k="source" align="right" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {slice.map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>
                            {label(o.fuel ?? o.material)}
                            {o.flame_type && <span className="muted"> ({o.flame_type})</span>}
                          </td>
                          <td>{fmt(o.o2_pct, 1)}</td>
                          <td>{fmt(o.pressure_bar, 3)}</td>
                          {hasGeometry && <td>{formatGeometry(o.geometry) ?? "–"}</td>}
                          {hasFlow && <td>{formatFlow(o.flow) ?? "–"}</td>}
                          <td>
                            {o.outcome ? (
                              <span className="def" title={OUTCOME_HELP[o.outcome]}>
                                {label(o.outcome)}
                              </span>
                            ) : (
                              "–"
                            )}
                            {o.censored && <span className="muted" title="Burn time is a lower bound"> (at least)</span>}
                          </td>
                          <td className="small">{measurementsText(o)}</td>
                          <td>
                            <a
                              className="source-chip"
                              href={inv.source_url ?? undefined}
                              target="_blank"
                              rel="noreferrer"
                              title={`${o.source.file}, row ${o.source.row}`}
                            >
                              {o.source.file.replace(/\.csv$/, "")} · row {o.source.row}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="muted">No rows match “{query}”.</p>}
          {filtered.length > shown && (
            <button type="button" className="button" onClick={() => setShown(shown + PAGE)}>
              Show more
            </button>
          )}
        </section>
      )}
    </article>
  );
}

function Fact({ k, v }: { k: string; v: string | null | undefined }) {
  if (!v) return null;
  return (
    <div>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
