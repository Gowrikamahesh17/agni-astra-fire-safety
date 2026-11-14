import {
  CONTRACT_VERSION,
  type Implication,
  type Investigation,
  type Observation,
  type Scenario,
  type SearchDoc,
  type Summary,
} from "./types";

type Envelope<T> = { contract_version: string; items: T[] };

/** Throws if the file's contract_version is not the one this site was built for. */
export function unwrap<T>(name: string, json: Envelope<T>): T[] {
  if (json?.contract_version !== CONTRACT_VERSION) {
    throw new Error(
      `${name}: expected contract_version ${CONTRACT_VERSION}, got ${json?.contract_version}`,
    );
  }
  return json.items;
}

const cache = new Map<string, Promise<unknown[]>>();

function load<T>(name: string, optional: boolean): Promise<T[]> {
  let p = cache.get(name) as Promise<T[]> | undefined;
  if (!p) {
    p = fetch(`/data/${name}.json`).then(async (res) => {
      if (!res.ok) {
        if (optional) return [];
        throw new Error(`Could not load ${name}.json (${res.status})`);
      }
      return unwrap<T>(name, await res.json());
    });
    // Do not cache failures, so a retry can succeed.
    p.catch(() => cache.delete(name));
    cache.set(name, p);
  }
  return p;
}

// Required files (Person B).
export const loadInvestigations = () => load<Investigation>("investigations", false);
export const loadObservations = () => load<Observation>("observations", false);
export const loadScenarios = () => load<Scenario>("scenarios", false);

// Optional files (Person C): the site must work without them.
export const loadSummaries = () => load<Summary>("summaries", true);
export const loadImplications = () => load<Implication>("implications", true);
export const loadSearchDocs = () => load<SearchDoc>("search-docs", true);
