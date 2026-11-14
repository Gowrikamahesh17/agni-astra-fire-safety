import { describe, expect, it } from "vitest";
import { unwrap } from "./data";

describe("unwrap", () => {
  it("returns items for contract 2.0", () => {
    expect(unwrap("x", { contract_version: "2.0", items: [1, 2] })).toEqual([1, 2]);
  });
  it("rejects another contract version", () => {
    expect(() => unwrap("x", { contract_version: "1.0", items: [] })).toThrow(/contract_version/);
  });
});
