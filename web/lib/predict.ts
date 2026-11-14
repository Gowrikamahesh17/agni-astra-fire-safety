export type ModelTask = "classification" | "regression";

export type ModelInput = Record<string, number | string | null | undefined>;

export interface ModelFixture {
  input: Record<string, number | string>;
  expected: { value: number; out_of_range: string[] };
}

export interface ModelSpec {
  contract_version: string;
  name: string;
  task: ModelTask;
  target: string;
  positive_label: string | null;
  features: string[];
  categories: Record<string, string[]>;
  mean: Record<string, number>;
  std: Record<string, number>;
  weights: Record<string, number>;
  bias: number;
  valid_range: Record<string, [number, number]>;
  metrics: Record<string, number | null>;
  fixtures: ModelFixture[];
  trained_at: string;
}

export interface Prediction {
  value: number;
  out_of_range: string[];
}

export function predict(model: ModelSpec, input: ModelInput): Prediction {
  let z = model.bias;
  const outOfRange: string[] = [];

  for (const feature of model.features) {
    const value = input[feature];
    const levels = model.categories[feature];

    if (levels) {
      if (typeof value !== "string" || !levels.includes(value)) {
        outOfRange.push(feature);
        continue;
      }
      z += model.weights[`${feature}=${value}`];
      continue;
    }

    const [lo, hi] = model.valid_range[feature];
    const missing = typeof value !== "number" || Number.isNaN(value);
    if (missing || value < lo || value > hi) {
      outOfRange.push(feature);
    }
    if (missing) {
      continue;
    }
    z += (model.weights[feature] * (value - model.mean[feature])) / model.std[feature];
  }

  const result = model.task === "classification" ? 1 / (1 + Math.exp(-z)) : z;
  return { value: result, out_of_range: outOfRange };
}
