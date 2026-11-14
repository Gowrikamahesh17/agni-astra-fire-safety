import { useSyncExternalStore } from "react";
import type { ScenarioId } from "./types";

export type ScenarioState = { scenarioId: ScenarioId; customO2: number; customP: number };

const IDS: ScenarioId[] = ["iss", "lunar_habitat", "exploration_atm", "pressurized_rover", "mars_transit", "spacesuit", "custom"];
export const DEFAULT_SCENARIO: ScenarioState = { scenarioId: "lunar_habitat", customO2: 30, customP: 0.7 };
const KEY = "ffd.scenario";

/** Parse a stored value; anything unexpected falls back to the default. */
export function parseScenario(raw: string | null): ScenarioState {
  try {
    const p = raw ? JSON.parse(raw) : null;
    if (
      p &&
      IDS.includes(p.scenarioId) &&
      Number.isFinite(p.customO2) && p.customO2 >= 0 && p.customO2 <= 100 &&
      Number.isFinite(p.customP) && p.customP > 0 && p.customP <= 10
    ) {
      return { scenarioId: p.scenarioId, customO2: p.customO2, customP: p.customP };
    }
  } catch {
    // fall through
  }
  return DEFAULT_SCENARIO;
}

let state: ScenarioState = DEFAULT_SCENARIO;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  loaded = true;
  try {
    state = parseScenario(window.localStorage.getItem(KEY));
  } catch {
    state = DEFAULT_SCENARIO; // storage can be blocked
  }
}

function set(next: ScenarioState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // keep working in memory
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => {
  if (!loaded) load();
  return state;
};
const getServerSnapshot = () => DEFAULT_SCENARIO;

/** The mission scenario, shared by every page and remembered between visits. */
export function useScenario() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ...s,
    setScenarioId: (scenarioId: ScenarioId) => set({ ...getSnapshot(), scenarioId }),
    setCustomO2: (customO2: number) => set({ ...getSnapshot(), customO2 }),
    setCustomP: (customP: number) => set({ ...getSnapshot(), customP }),
  };
}
