import { describe, expect, it } from "vitest";
import { askChat, sourceHref, MAX_CHARS, MAX_TURNS } from "./chatApi";

const resp = (status: number, body?: unknown) =>
  (async () => new Response(body === undefined ? null : JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("askChat", () => {
  it("returns the reply", async () => {
    const r = await askChat([{ role: "user", content: "hi" }], undefined, resp(200, { answer: "a", sources: [], refused: false }));
    expect(r).toEqual({ ok: true, reply: { answer: "a", sources: [], refused: false } });
  });
  it("keeps refused replies as replies", async () => {
    const r = await askChat([{ role: "user", content: "x" }], undefined, resp(200, { answer: "Not in the PSI data we loaded.", sources: [], refused: true }));
    expect(r.ok && r.reply.refused).toBe(true);
  });
  it("maps 429 to rate_limit and other failures to error", async () => {
    const a = await askChat([{ role: "user", content: "x" }], undefined, resp(429));
    expect(!a.ok && a.kind).toBe("rate_limit");
    const b = await askChat([{ role: "user", content: "x" }], undefined, resp(500));
    expect(!b.ok && b.kind).toBe("error");
  });
  it("survives a network failure", async () => {
    const r = await askChat([{ role: "user", content: "x" }], undefined, (async () => { throw new Error("down"); }) as unknown as typeof fetch);
    expect(r.ok).toBe(false);
  });
  it("caps history and message length", async () => {
    let body: { messages: { content: string }[] } = { messages: [] };
    const f = (async (_u: string, init: RequestInit) => {
      body = JSON.parse(init.body as string);
      return new Response(JSON.stringify({ answer: "a" }), { status: 200 });
    }) as unknown as typeof fetch;
    const history = Array.from({ length: 10 }, () => ({ role: "user" as const, content: "x".repeat(MAX_CHARS + 50) }));
    await askChat(history, "iss", f);
    expect(body.messages).toHaveLength(MAX_TURNS);
    expect(body.messages[0].content).toHaveLength(MAX_CHARS);
  });
});

describe("sourceHref", () => {
  it("links observations and investigations, prefers url", () => {
    expect(sourceHref({ type: "observation", id: "PSI-69-0024" })).toBe("/investigations/PSI-69?q=PSI-69-0024");
    expect(sourceHref({ type: "observation", id: "PSI-69-0024", url: "/investigations/PSI-69" })).toBe("/investigations/PSI-69?q=PSI-69-0024");
    expect(sourceHref({ type: "implication", id: "SUP-1", url: "/implications" })).toBe("/implications");
    expect(sourceHref({ type: "investigation", id: "PSI-25" })).toBe("/investigations/PSI-25");
    expect(sourceHref({ type: "doc", id: "x", url: "https://ntrs.nasa.gov/x" })).toBe("https://ntrs.nasa.gov/x");
    expect(sourceHref({ type: "doc", id: "NTRS 1" })).toBeNull();
  });
});
