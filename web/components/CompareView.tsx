"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { loadInvestigations, loadObservations } from "@/lib/data";
import { Term } from "@/components/InfoTip";
import { outcomeCounts, similarities } from "@/lib/compare";
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

  const rows: [string, (i: Investigation) => React.ReactNode, ("hardware" | "roles" | "outcome")?][] = [
    ["Objective", (i) => i.objective ?? NA],
    ["Hardware", (i) => i.hardware ?? NA, "hardware"],
    ["Fuel phase", (i) => i.fuel_phase ?? NA],
    ["Fire-safety role", (i) => i.fire_safety_role.map(label).join(", "), "roles"],
    ["Oxygen range", (i) => range(i.o2_pct_range, "%")],
    ["Pressure range", (i) => range(i.pressure_bar_range, "bar")],
    ["Sensors", (i) => i.sensors?.join(", ") ?? NA],
    ["Measured variables", (i) => i.measured_variables?.join(", ") ?? NA],
    ["Number of tests", (i) => (i.has_table ? i.n_observations : "none (text evidence only)")],
    [
      "Outcome types",
      (i) => {
        const c = outcomeCounts(obs, i.id);
        return c.length ? c.map(([k, n]) => `${label(k)} (${n})`).join(", ") : "no outcome recorded";
      },
      "outcome",
    ],
  ];

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
            <p className="small muted">Only items present in every chosen investigation are listed. Everything else differs, as the table below shows.</p>
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
                {rows.map(([name, get, tip]) => (
                  <tr key={name}>
                    <th scope="row">
                      {name}
                      {tip && <Term k={tip} />}
                    </th>
                    {chosen.map((i) => (
                      <td key={i.id} data-label={i.short_name ?? i.id}>
                        {get(i)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
