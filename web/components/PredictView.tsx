"use client";

import { useEffect, useMemo, useState } from "react";
import { MODEL_NAMES, loadModel, loadScenarios, type ModelName } from "@/lib/data";
import { predict, type ModelInput, type ModelSpec } from "@/lib/predict";
import { useScenario } from "@/lib/scenarioStore";
import type { Scenario } from "@/lib/types";

const MODELS: Record<ModelName, { title: string; question: string; unit?: string }> = {
  flex_extinction: {
    title: "FLEX droplet flames: will the flame go out?",
    question: "Chance the flame goes out (extinguishes), rather than being disrupted or burning to completion.",
  },
  cfig_self_extinction: {
    title: "CFI-G gas flames: will the flame go out by itself?",
    question: "Chance the flame goes out on its own, rather than burning until the test was stopped.",
  },
  flex_burning_rate: {
    title: "FLEX droplet flames: burning rate",
    question: "Predicted droplet burning-rate constant.",
    unit: "mm²/s",
  },
};

const FEATURE: Record<string, { label: string; unit: string }> = {
  o2_pct: { label: "Oxygen", unit: "%" },
  pressure_bar: { label: "Pressure", unit: "bar" },
  co2_pct: { label: "Carbon dioxide", unit: "%" },
  he_pct: { label: "Helium", unit: "%" },
  droplet_d0_mm: { label: "Initial droplet diameter", unit: "mm" },
  fuel_fraction_pct: { label: "Fuel fraction", unit: "%" },
  fuel: { label: "Fuel", unit: "" },
  flame_type: { label: "Flame type", unit: "" },
};
const feat = (f: string) => FEATURE[f] ?? { label: f.replace(/_/g, " "), unit: "" };

function defaults(m: ModelSpec): ModelInput {
  const out: ModelInput = {};
  for (const f of m.features) {
    out[f] = m.categories[f] ? m.categories[f][0] : Math.round(m.mean[f] * 100) / 100;
  }
  return out;
}

export default function PredictView() {
  const [name, setName] = useState<ModelName>("flex_extinction");
  const [model, setModel] = useState<ModelSpec | null>(null);
  const [input, setInput] = useState<ModelInput>({});
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const { scenarioId, customO2, customP } = useScenario();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    loadModel(name)
      .then((m) => {
        if (!live) return;
        setModel(m);
        setInput(defaults(m));
      })
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [name]);

  useEffect(() => {
    loadScenarios().then(setScenarios).catch(() => {}); // scenario presets are a convenience only
  }, []);

  // While a newly chosen model loads, the previous one is stale.
  const ready = model !== null && model.name === name ? model : null;
  const result = useMemo(() => (ready ? predict(ready, input) : null), [ready, input]);

  if (error) return <p role="alert">Could not load the model: {error}</p>;

  const shared = scenarios.find((x) => x.id === scenarioId);
  const sharedO2 = scenarioId === "custom" ? customO2 : (shared?.o2_pct ?? null);
  const sharedP = scenarioId === "custom" ? customP : (shared?.pressure_bar ?? null);
  const applyScenario = () => {
    if (!ready) return;
    setInput((cur) => ({
      ...cur,
      ...(ready.features.includes("o2_pct") && sharedO2 != null ? { o2_pct: sharedO2 } : {}),
      ...(ready.features.includes("pressure_bar") && sharedP != null ? { pressure_bar: sharedP } : {}),
    }));
  };

  const meta = MODELS[name];
  const isClass = ready?.task === "classification";
  const m = ready?.metrics;

  return (
    <div className="dash">
      <aside className="panel" aria-label="Model inputs">
        <h2>Model</h2>
        <label className="field">
          <span>Question</span>
          <select value={name} onChange={(e) => setName(e.target.value as ModelName)}>
            {MODEL_NAMES.map((n) => (
              <option key={n} value={n}>
                {MODELS[n].title}
              </option>
            ))}
          </select>
        </label>

        {ready && (
          <>
            <button type="button" className="chip" onClick={applyScenario} disabled={sharedO2 == null || sharedP == null}>
              Use selected scenario: {scenarioId === "custom" ? "Custom" : (shared?.name ?? "…")}
            </button>
            <p className="small muted">Sets oxygen and pressure. Change the scenario on the Dashboard or Evidence gaps page.</p>
            <h2>Inputs</h2>
            {ready.features.map((f) => {
              const { label, unit } = feat(f);
              const levels = ready.categories[f];
              if (levels) {
                return (
                  <label key={f} className="field">
                    <span>{label}</span>
                    <select value={String(input[f] ?? "")} onChange={(e) => setInput({ ...input, [f]: e.target.value })}>
                      {levels.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              const [lo, hi] = ready.valid_range[f];
              const v = input[f];
              const out = result?.out_of_range.includes(f);
              return (
                <div key={f} className="field">
                  <label htmlFor={`in-${f}`}>
                    <span>
                      {label} {unit && `(${unit})`}
                    </span>
                  </label>
                  <input
                    type="range"
                    aria-label={`${label} slider`}
                    min={lo}
                    max={hi}
                    step={(hi - lo) / 200}
                    value={typeof v === "number" ? Math.min(hi, Math.max(lo, v)) : lo}
                    onChange={(e) => setInput({ ...input, [f]: Number(e.target.value) })}
                  />
                  <input
                    id={`in-${f}`}
                    type="number"
                    className="num"
                    step="any"
                    value={typeof v === "number" ? v : ""}
                    onChange={(e) => setInput({ ...input, [f]: e.target.value === "" ? null : Number(e.target.value) })}
                    aria-invalid={out}
                  />
                  <span className={`small ${out ? "warn" : "muted"}`}>
                    Trained on {lo}–{hi}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </aside>

      <section aria-label="Prediction">
        {!ready || !result ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <div className="card" aria-live="polite">
              <p className="muted small">{meta.question}</p>
              <p className="big">
                {isClass ? `${Math.round(result.value * 100)} %` : `${result.value.toFixed(2)} ${meta.unit ?? ""}`}
              </p>
              {result.out_of_range.length > 0 && (
                <p className="banner" role="alert">
                  Outside the range this model was trained on: {result.out_of_range.map((f) => feat(f).label).join(", ")}. Treat this number
                  as unreliable.
                </p>
              )}
            </div>

            <div className="card">
              <h2>How much to trust it</h2>
              <p className="small">
                A simple baseline model (
                {isClass ? "logistic regression" : "linear regression"}) trained on {m?.n_rows} PSI test rows and checked with {m?.cv_folds}-fold
                cross-validation.
              </p>
              <ul className="shared small">
                {isClass ? (
                  <>
                    <li>Balanced accuracy: {m?.balanced_accuracy} (always guessing the majority gives {m?.baseline_balanced_accuracy})</li>
                    <li>ROC AUC: {m?.roc_auc}</li>
                  </>
                ) : (
                  <>
                    <li>R²: {m?.r2}</li>
                    <li>Mean absolute error: {m?.mae} (guessing the average gives {m?.baseline_mae})</li>
                  </>
                )}
              </ul>
              <p className="small muted">
                It describes patterns in these tests only. It is not a safety calculation and says nothing about partial gravity, which PSI
                does not cover. Read the{" "}
                <a href="https://github.com/Gowrikamahesh17/agni-astra-fire-safety/blob/main/docs/model-card.md" target="_blank" rel="noreferrer">
                  model card
                </a>{" "}
                for the training rules and known limits.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
