"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { loadInvestigations, loadObservations } from "@/lib/data";
import { Term } from "@/components/InfoTip";
import { hardwareParts, listsDiffer, outcomeCounts, rowDiffers, similarities, uniqueItems } from "@/lib/compare";
import type { Investigation, Observation } from "@/lib/types";

const MAX = 3;
const label = (s: string) => s.replace(/_/g, " ");
const NA = "not recorded";
const range = (r: [number, number] | null, unit: string) => (r ? `${r[0]}–${r[1]} ${unit}` : NA);

export default function CompareView() {
  const params = useSearchParams();
  const [invs, setInvs] = useState<Investigation[]>([]);
  const [obs, setObs] = useState<Observation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [picked, setPicked] = useState<string[]>(() => (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, MAX));

  useEffect(() => {
    Promise.all([loadInvestigations(), loadObservations()])
      .then(([i, o]) => {
        setInvs(i);
        setObs(o);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  // Keep the address bar shareable without a navigation.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (picked.length) url.searchParams.set("ids", picked.join(","));
    else url.searchParams.delete("ids");
    window.history.replaceState(null, "", url);
  }, [picked]);

  const chosen = useMemo(
    () => picked.map((id) => invs.find((i) => i.id === id)).filter((i): i is Investigation => Boolean(i)),
    [picked, invs],
  );
  const sim = useMemo(() => similarities(chosen), [chosen]);

  if (error) return <p role="alert">Could not load data: {error}</p>;
  if (!invs.length) return <p className="muted">Loading…</p>;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX ? p : [...p, id]));

  type Row = { name: string; tip?: "hardware" | "roles" | "outcome"; text?: (i: Investigation) => string; list?: (i: Investigation) => string[] };
  const rows: Row[] = [
    { name: "Objective", text: (i) => i.objective ?? NA },
    { name: "Hardware", tip: "hardware", list: (i) => hardwareParts(i.hardware) },
    { name: "Fuel phase", text: (i) => i.fuel_phase ?? NA },
    { name: "Fire-safety role", tip: "roles", list: (i) => i.fire_safety_role.map(label) },
    { name: "Oxygen range", text: (i) => range(i.o2_pct_range, "%") },
    { name: "Pressure range", text: (i) => range(i.pressure_bar_range, "bar") },
    { name: "Sensors", list: (i) => i.sensors ?? [] },
    { name: "Measured variables", list: (i) => i.measured_variables ?? [] },
    { name: "Number of tests", text: (i) => String(i.has_table ? i.n_observations : "none (text evidence only)") },
    {
      name: "Outcome types",
      tip: "outcome",
      list: (i) => outcomeCounts(obs, i.id).map(([k, n]) => `${label(k)} (${n})`),
    },
  ];
  // For every row: does it differ across the chosen investigations, and which list items are unique to each?
  const analysed = rows.map((r) => {
    if (r.list) {
      const lists = chosen.map((i) => r.list!(i));
      return { r, lists, uniq: uniqueItems(lists), differs: listsDiffer(lists) };
    }
    const texts = chosen.map((i) => r.text!(i));
    return { r, texts, differs: rowDiffers(texts) };
  });
  const differCount = analysed.filter((a) => a.differs).length;
  const shownRows = onlyDiff ? analysed.filter((a) => a.differs) : analysed;

  return (
    <div>
      <h2 className="sr-only">Choose investigations</h2>
      <p className="muted small">Choose 2 or 3 investigations ({picked.length}/{MAX}).</p>
      <div className="chips" role="group" aria-label="Investigations to compare">
        {invs.map((i) => {
          const on = picked.includes(i.id);
          return (
            <button
              key={i.id}
              type="button"
              className="chip"
              aria-pressed={on}
              disabled={!on && picked.length >= MAX}
              onClick={() => toggle(i.id)}
            >
              {i.short_name ?? i.id}
            </button>
          );
        })}
      </div>

      {chosen.length < 2 ? (
        <p className="banner">Pick at least two investigations to compare them side by side.</p>
      ) : (
        <>
          <div className="card">
            <h2>What they share</h2>
            <p className="small muted">Only items present in every chosen investigation are listed here. The table below marks everything that differs.</p>
            <ul className="shared">
              <li>
                <strong>Hardware:</strong> {sim.hardware.length ? sim.hardware.join(", ") : "none in common"}
              </li>
              <li>
                <strong>Sensors:</strong> {sim.sensors.length ? sim.sensors.join(", ") : "none in common"}
              </li>
              <li>
                <strong>Measured variables:</strong> {sim.measuredVariables.length ? sim.measuredVariables.join(", ") : "none in common"}
              </li>
              <li>
                <strong>Fire-safety role:</strong> {sim.roles.length ? sim.roles.map(label).join(", ") : "different roles"}
              </li>
              <li>
                <strong>Fuel phase:</strong> {sim.sameFuelPhase ? `all ${chosen[0].fuel_phase}` : "differs"}
              </li>
            </ul>
          </div>

          <div className="diff-legend">
            <p className="small">
              <strong>
                {differCount} of {rows.length} properties differ.
              </strong>{" "}
              <span className="diff-tag">differs</span> rows and <span className="diff-item">highlighted items</span> are not shared by all of the chosen investigations;{" "}
              <span className="same-tag">same</span> rows match.
            </p>
            <label className="compare-pick">
              <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} />
              Show only the differences
            </label>
          </div>

          <div className="table-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Property</span>
                  </th>
                  {chosen.map((i) => (
                    <th key={i.id} scope="col">
                      <Link href={`/investigations/${i.id}`}>{i.short_name ?? i.id}</Link>
                      <div className="muted small">{i.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shownRows.map((a) => (
                  <tr key={a.r.name} className={a.differs ? "row-diff" : undefined}>
                    <th scope="row">
                      {a.r.name}
                      {a.r.tip && <Term k={a.r.tip} />}
                      <span className={a.differs ? "diff-tag" : "same-tag"}>{a.differs ? "differs" : "same"}</span>
                    </th>
                    {chosen.map((i, idx) => (
                      <td key={i.id} data-label={i.short_name ?? i.id}>
                        {"lists" in a && a.lists && a.uniq ? (
                          a.lists[idx].length === 0 ? (
                            NA
                          ) : (
                            a.lists[idx].map((item, k) => (
                              <span key={item}>
                                {k > 0 && ", "}
                                <span className={a.uniq[idx].has(item.trim().toLowerCase()) ? "diff-item" : undefined}>{item}</span>
                              </span>
                            ))
                          )
                        ) : (
                          a.texts?.[idx]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shownRows.length === 0 && <p className="muted">These investigations match on every property compared.</p>}
        </>
      )}
    </div>
  );
}
