import { describe, expect, it } from "vitest";
import { DEFAULT_SCENARIO, parseScenario } from "./scenarioStore";

describe("parseScenario", () => {
  it("accepts a valid stored scenario", () => {
    const v = { scenarioId: "iss", customO2: 21, customP: 1.013 };
    expect(parseScenario(JSON.stringify(v))).toEqual(v);
  });
  it("falls back to the default for missing, broken or out-of-range values", () => {
    expect(parseScenario(null)).toEqual(DEFAULT_SCENARIO);
    expect(parseScenario("{not json")).toEqual(DEFAULT_SCENARIO);
    expect(parseScenario(JSON.stringify({ scenarioId: "nope", customO2: 21, customP: 1 }))).toEqual(DEFAULT_SCENARIO);
    expect(parseScenario(JSON.stringify({ scenarioId: "iss", customO2: 500, customP: 1 }))).toEqual(DEFAULT_SCENARIO);
    expect(parseScenario(JSON.stringify({ scenarioId: "iss", customO2: 21, customP: 0 }))).toEqual(DEFAULT_SCENARIO);
  });
});
