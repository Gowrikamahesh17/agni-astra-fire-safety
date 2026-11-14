import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ChatError, REFUSAL, answer, parseAnswer, retrieve, sanitize } from "./index";

type Q = { question: string; answerable: boolean; expect: string[] };
const questions: Q[] = JSON.parse(readFileSync(join(__dirname, "../../../ai/tests/chat_questions.json"), "utf8"));

function groq(content: string, status = 200): typeof fetch {
  return (async () =>
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status })) as unknown as typeof fetch;
}

describe("retrieval on the 15 test questions", () => {
  for (const q of questions.filter((x) => x.answerable)) {
    it(`finds sources for: ${q.question}`, () => {
      const r = retrieve(q.question);
      expect(r.relevant).toBe(true);
      const ids = new Set(r.docs.map((d) => d.investigation_id));
      expect(q.expect.some((id) => ids.has(id))).toBe(true);
    });
  }
  for (const q of questions.filter((x) => !x.answerable)) {
    it(`refuses: ${q.question}`, () => {
      expect(retrieve(q.question).relevant).toBe(false);
    });
  }
});

describe("answer", () => {
  const ask = (q: string) => [{ role: "user" as const, content: q }];

  it("keeps only citations of retrieved docs", async () => {
    const r = retrieve("FLEX tests near the lunar habitat atmosphere");
    const real = r.docs[0].id;
    const reply = await answer(ask("FLEX tests near the lunar habitat atmosphere"), undefined, {
      apiKey: "k",
      fetchFn: groq(`None went out [${real}] and one more [PSI-999-0001].`),
    });
    expect(reply.refused).toBe(false);
    expect(reply.sources.map((s) => s.id)).toEqual([real]);
    expect(reply.answer).toBe("None went out and one more.");
  });

  it("refuses without calling Groq when nothing is relevant", async () => {
    let called = false;
    const fetchFn = (async () => {
      called = true;
      return new Response("{}");
    }) as unknown as typeof fetch;
    const reply = await answer(ask("What is the capital of France?"), undefined, { apiKey: "k", fetchFn });
    expect(reply).toEqual({ answer: REFUSAL, sources: [], refused: true });
    expect(called).toBe(false);
  });

  it("passes the model's refusal through", async () => {
    const reply = await answer(ask("How many FLEX tests used heptane?"), undefined, { apiKey: "k", fetchFn: groq(REFUSAL) });
    expect(reply.refused).toBe(true);
  });

  it("maps a Groq rate limit to 429", async () => {
    await expect(answer(ask("FLEX extinction"), undefined, { apiKey: "k", fetchFn: groq("", 429) })).rejects.toMatchObject({
      status: 429,
    });
    await expect(answer(ask("FLEX extinction"), undefined, { apiKey: "k", fetchFn: groq("", 500) })).rejects.toBeInstanceOf(
      ChatError,
    );
  });

  it("reads full-width brackets, odd hyphens and bold", () => {
    const r = retrieve("FLEX fuels");
    const id = r.docs[0].id;
    const reply = parseAnswer(`It used **two** fuels【${id}】 in CFI‑G.`, r.docs);
    expect(reply.answer).toBe("It used two fuels in CFI-G.");
    expect(reply.sources.map((s) => s.id)).toEqual([id]);
  });

  it("gives observation sources their file, row and page", () => {
    const r = retrieve("FLEX methanol droplet extinguished");
    const row = r.docs.find((d) => d.type === "observation")!;
    const reply = parseAnswer(`It went out [${row.id}].`, r.docs);
    expect(reply.sources[0]).toMatchObject({ type: "observation", id: row.id, url: "/investigations/PSI-69" });
    expect(reply.sources[0].row).toBeGreaterThanOrEqual(2);
    expect(reply.sources[0].file).toMatch(/\.csv$/);
  });
});

describe("sanitize", () => {
  it("caps length and turns and drops bad entries", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `m${i}` }));
    expect(sanitize(many)).toHaveLength(6);
    expect(sanitize([{ role: "user", content: "x".repeat(5000) }])[0].content).toHaveLength(1000);
    expect(sanitize([{ role: "system", content: "hi" }, { role: "user", content: 3 }, null])).toEqual([]);
    expect(sanitize("nope")).toEqual([]);
  });
});
