import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { predict, type ModelSpec } from "./predict";

const modelsDir = join(__dirname, "..", "public", "data", "models");

const models: ModelSpec[] = readdirSync(modelsDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(join(modelsDir, file), "utf-8")));

describe("predict", () => {
  it("finds the exported models", () => {
    const names = models.map((m) => m.name);
    expect(names).toContain("flex_extinction");
    expect(names).toContain("cfig_self_extinction");
  });

  for (const model of models) {
    describe(model.name, () => {
      model.fixtures.forEach((fixture, i) => {
        it(`matches fixture ${i}`, () => {
          const result = predict(model, fixture.input);
          expect(result.value).toBeCloseTo(fixture.expected.value, 8);
          expect(result.out_of_range).toEqual(fixture.expected.out_of_range);
        });
      });
    });
  }

  it("flags missing and out-of-range inputs", () => {
    const model = models.find((m) => m.name === "flex_extinction")!;
    const input = { ...model.fixtures[0].input, o2_pct: 60, he_pct: null };
    const result = predict(model, input);
    expect(result.out_of_range).toEqual(expect.arrayContaining(["o2_pct", "he_pct"]));
  });

  it("returns a probability for classifiers", () => {
    const model = models.find((m) => m.task === "classification")!;
    const { value } = predict(model, model.fixtures[0].input);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(1);
  });
});
