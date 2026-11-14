// Plain-English definitions used by the help tips and the Guide page. Keep each one short and accurate to the data.
export type Entry = { term: string; short: string };

export const GLOSSARY = {
  psi: { term: "PSI", short: "NASA's Physical Sciences Informatics repository: the public archive of experiment data this site is built on." },
  microgravity: { term: "Microgravity", short: "Near-weightlessness, as on the space station. Without gravity there is no rising hot air, so flames are round and behave differently from flames on Earth." },
  o2: { term: "O₂ (oxygen)", short: "Oxygen as a percentage of the air. Normal air is about 21 %. More oxygen makes fires burn harder and harder to put out." },
  pressure: { term: "Pressure", short: "Air pressure in bar. 1 bar is roughly sea-level air. The planned lunar habitat uses about 0.7 bar." },
  scenario: { term: "Mission scenario", short: "An atmosphere (oxygen % and pressure) for a place such as the space station or a lunar habitat. Pick one and every page compares the experiments to it." },
  score: { term: "Score", short: "A 0–100 average of three parts: proximity, relevance and usability. By default proximity counts 50 %, relevance 30 % and usability 20 %. Move the weight sliders to match your priorities." },
  proximity: { term: "Proximity", short: "How close the investigation's closest test came to your chosen atmosphere, from 0 to 100. 100 means a test at almost exactly those conditions. 0 means nothing came near." },
  relevance: { term: "Relevance", short: "How directly this kind of study bears on crew fire safety. A fixed score set by the team: solid-material prevention 100, suppression 90, detection 90, gas-flame behaviour 70." },
  usability: { term: "Usability", short: "How easy the data is to analyse: it has a recorded outcome (+40), oxygen and pressure (+30), at least 100 tests (+20) and traceable source rows (+10). Text-only entries score 20." },
  near: { term: "Close match", short: "A test within one step of the scenario. One step is 5 percentage points of oxygen or 0.1 bar of pressure." },
  distance: { term: "Distance score (d)", short: "How far a test is from the scenario, in steps (5 % oxygen or 0.1 bar = 1 step). Smaller is closer. 0 is an exact match." },
  roles: { term: "Focus", short: "Prevention: stopping materials igniting or spreading flame. Detection: sensing smoke and fire early. Suppression: putting a fire out. Flame behaviour: how flames form and burn." },
  weights: { term: "Score weights", short: "How much each part counts in the score. Raise one to rank by what matters most to you. The three are rescaled, so only their proportions matter." },
  outcome: { term: "Outcome", short: "How the test ended. Hover or tap the outcome names in the table for what each means. Some investigations did not record an outcome." },
  hardware: { term: "Hardware", short: "The equipment the experiment ran in: CIR is the Combustion Integrated Rack, MDCA the Multi-user Droplet Combustion Apparatus, MSG the Microgravity Science Glovebox, and ACME a series of gas-flame experiments." },
  measurements: { term: "Measurements", short: "Raw values recorded for each test, such as droplet size and burn time. Units are in the names." },
  source: { term: "Source chip", short: "The exact CSV file and row in NASA's table that this value came from, so anything shown can be checked." },
  evidence: { term: "Evidence chips", short: "The tests and investigations a statement is based on. Click one to open that test in the table." },
  balanced_accuracy: { term: "Balanced accuracy", short: "How often the model is right, averaged over both outcomes. 0.5 is no better than guessing, 1 is perfect." },
  roc_auc: { term: "ROC AUC", short: "How well the model ranks cases that went one way above cases that went the other. 0.5 is a coin flip, 1 is perfect." },
  r2: { term: "R²", short: "How much of the variation in the answer the model explains. 0 is none, 1 is all of it." },
  mae: { term: "Mean absolute error", short: "The typical size of the model's miss, in the same units as the answer." },
  valid_range: { term: "Trained range", short: "The span of values the model saw in training. Outside it the model is extrapolating, so treat the answer as unreliable." },
  model_estimate: { term: "Model estimate", short: "A simple statistical model fitted to the PSI tables. It describes patterns in these tests only and is not a safety calculation." },
} satisfies Record<string, Entry>;
export type GlossaryKey = keyof typeof GLOSSARY;

/** Longer glossary shown on the Guide page. */
export const GUIDE_TERMS: Entry[] = [
  { term: "FLEX", short: "Flame Extinguishment Experiment. Burns single droplets of methanol and heptane to find what puts a flame out." },
  { term: "CFI-G", short: "Cool Flames Investigation with Gases. Burns round gas flames (ethane, propane, butane) across many oxygen levels and pressures." },
  { term: "BASS / BASS-II", short: "Burning and Suppression of Solids. Burns solid materials such as PMMA plastic, cotton-fiberglass cloth and Nomex." },
  { term: "SAME-R", short: "Smoke Aerosol Measurement Experiment – Reflight. Makes smoke from heated materials to help design spacecraft smoke detectors." },
  { term: "Saffire / DAFT / ACME", short: "Further NASA investigations. We list what each studied, but their results are not in the tables we loaded, so they show as text only." },
  ...Object.values(GLOSSARY).filter((e) => ["PSI", "Microgravity", "O₂ (oxygen)", "Pressure", "Mission scenario"].includes(e.term)),
];

export const OUTCOME_HELP: Record<string, string> = {
  extinguished: "The flame went out during the test.",
  disrupted: "The droplet broke apart or was disturbed, ending the burn without the flame going out by itself.",
  burned_to_completion: "The flame stayed lit until the droplet was used up.",
  self_extinguished: "The flame went out by itself.",
  sustained_until_stopped: "The flame was still burning when the test was stopped (flow cut, time limit or temperature limit). Burn time is therefore a minimum.",
  no_ignition: "The flame never lit.",
};

/** Raw field names from the PSI tables, in plain words with units. */
const MEASURE_LABELS: Record<string, string> = {
  pressure_mmhg: "pressure (mmHg)",
  droplet_d0_mm: "start droplet diameter (mm)",
  extinction_d_mm: "diameter when flame went out (mm)",
  burning_rate_mm2_s: "burning rate (mm²/s)",
  burn_time_s: "burn time (s)",
  peak_burner_t_c: "peak burner temperature (°C)",
  adiabatic_flame_t_k: "theoretical flame temperature (K)",
  heater_rt_r0: "heater resistance ratio (Rt/R0)",
  duration_s: "duration (s)",
  primary_aging_s: "primary aging time (s)",
  primary_mixing_s: "primary mixing time (s)",
  net_aging_s: "net aging time (s)",
  flow_restrictor_setting: "flow restrictor setting",
  total_frames: "video frames",
  o2_final_pct: "final O₂ (%)",
  co2_final_pct: "final CO₂ (%)",
  day: "day of test",
};
export function measureLabel(key: string): string {
  return MEASURE_LABELS[key] ?? key.replace(/_/g, " ");
}
