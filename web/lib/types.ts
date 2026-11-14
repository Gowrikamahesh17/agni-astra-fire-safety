// Types mirror contract v2.0 (contract/*.schema.json, spec section 5).
export const CONTRACT_VERSION = "2.0";

export type Role = "prevention" | "detection" | "suppression" | "flame_behavior";
export type ScenarioId =
  | "iss"
  | "lunar_habitat"
  | "exploration_atm"
  | "pressurized_rover"
  | "mars_transit"
  | "spacesuit"
  | "custom";
export type Range = [number, number] | null;

export type ScenarioComponent = {
  proximity: number | null;
  n_near: number;
  d_min: number | null;
};

export type Investigation = {
  id: string;
  name: string | null;
  short_name: string | null;
  program: string | null;
  fire_safety_role: Role[];
  fuel_phase: "solid" | "liquid" | "gas" | null;
  objective: string | null;
  hardware: string | null;
  sensors: string[] | null;
  measured_variables: string[] | null;
  doi: string | null;
  license: string | null;
  source_url: string | null;
  psi_id: string | null;
  has_table: boolean;
  evidence_type: "measured_rows" | "text";
  table_files: string[];
  n_observations: number;
  o2_pct_range: Range;
  pressure_bar_range: Range;
  scenario_components: Partial<Record<ScenarioId, ScenarioComponent>>;
  static_scores: { fire_safety_relevance: number; data_usability: number };
  score_formula_version: "2.0";
};

export type Outcome =
  | "extinguished"
  | "disrupted"
  | "burned_to_completion"
  | "self_extinguished"
  | "sustained_until_stopped"
  | "no_ignition";

export type Geometry = {
  shape: "rod" | "film" | "sheet" | "sphere" | "slab" | "fabric" | null;
  diameter_mm: number | null;
  thickness_mm: number | null;
  width_mm: number | null;
  raw: string | null;
};

export type Flow = {
  value: number | null;
  unit: string | null;
  kind: "velocity" | "mass_flow" | "device_setting";
} | null;

export type Observation = {
  id: string;
  investigation_id: string;
  flame_type: "normal" | "inverse" | null;
  fuel: string | null;
  fuel_raw: string | null;
  fuel_fraction_pct: number | null;
  material: string | null;
  geometry: Geometry;
  o2_pct: number | null;
  pressure_bar: number | null;
  co2_pct: number | null;
  he_pct: number | null;
  n2_pct: number | null;
  flow: Flow;
  gravity: "micro";
  ignited: boolean | null;
  outcome: Outcome | null;
  outcome_raw: string | null;
  censored: boolean;
  measurements: Record<string, number | string | boolean | null>;
  distance: Partial<Record<ScenarioId, number | null>>;
  source: { file: string; row: number };
};

export type Scenario = {
  id: ScenarioId;
  name: string;
  o2_pct: number | null;
  pressure_bar: number | null;
  gravity: string | null;
  note: string | null;
  assumption: boolean;
  gravity_note: string | null;
};

// Written by Person C. May be missing until their files land.
export type Summary = {
  investigation_id: string;
  text: string;
  cites: string[];
  model: string;
  generated_at: string;
  prompt_version: string;
  verified: boolean;
};

export type Implication = {
  id: string;
  pillar: "prevention" | "detection" | "suppression";
  statement: string;
  evidence: string[];
  scenario_ids: ScenarioId[];
  verified: boolean;
};

export type SearchDoc = {
  id: string;
  type: "observation" | "summary" | "investigation" | "implication";
  title: string;
  text: string;
  investigation_id: string;
};
