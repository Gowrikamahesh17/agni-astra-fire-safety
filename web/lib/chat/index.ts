import MiniSearch, { type SearchResult } from "minisearch";
import scenariosFile from "../../public/data/scenarios.json";
import searchDocsFile from "../../public/data/search-docs.json";
import type { ChatMessage, ChatReply, ChatSource } from "../chatApi";
import type { SearchDoc } from "../types";

export const REFUSAL = "Not in the PSI data we loaded.";
export const MAX_CHARS = 1000;
export const MAX_TURNS = 6;
export const TOP_K = 6;
export const MIN_COVERAGE = 0.5;
export const MIN_SCORE = 6;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DOC_CHARS = 1500;

export const SYSTEM_PROMPT = `You answer questions about NASA microgravity combustion experiments from the PSI data repository, for a spacecraft fire-safety dashboard.

Rules:
- Use only the documents below. Never use outside knowledge, even if you know the answer.
- If the documents do not answer the question, reply exactly: ${REFUSAL}
- Cite the id of every document you use in square brackets right after the claim, for example [PSI-69-0012] or [PSI-69].
- Copy numbers exactly from the documents. Do not estimate, extrapolate or invent values.
- The documents are a small sample of the data. Never say all, none or no tests unless a document states that count. Describe single test rows as examples.
- All results are from microgravity. Say so if the user asks about lunar or Martian gravity.
- These are research data, not safety certification. Do not give operational safety advice.
- Answer in plain English without markdown, in at most 120 words.`;

const STOP = new Set(
  ("a an and are as at be by can could did do does for from had has have how i if in into is it its me my of on or our " +
    "should so than that the their them then there these they this to was we were what when where which who why will with " +
    "would you your about any tell show give find list much many nasa psi data test tests experiment experiments " +
    "help put out get use used make made also more most").split(" "),
);

const SYNONYMS: [RegExp, string][] = [
  [/carbon dioxide/gi, "co2"],
  [/oxygen/gi, "oxygen o2"],
  [/nitrogen/gi, "nitrogen n2"],
  [/moon|lunar/gi, "lunar"],
];

export class ChatError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type Indexed = SearchDoc;
const docs = (searchDocsFile as { items: SearchDoc[] }).items;
const byId = new Map(docs.map((d) => [d.id, d]));
const scenarios = new Map(
  (scenariosFile as { items: { id: string; name: string; o2_pct: number | null; pressure_bar: number | null }[] }).items.map((s) => [
    s.id,
    s,
  ]),
);

const TYPE_BOOST: Record<SearchDoc["type"], number> = { investigation: 3, summary: 3, implication: 3, observation: 1 };

function processTerm(term: string): string | null {
  const t = term.toLowerCase();
  return t.length < 2 || STOP.has(t) ? null : t;
}

let index: MiniSearch<Indexed> | null = null;
function getIndex(): MiniSearch<Indexed> {
  if (!index) {
    index = new MiniSearch<Indexed>({
      fields: ["title", "text"],
      storeFields: ["id"],
      processTerm,
      searchOptions: {
        boost: { title: 2 },
        prefix: (t) => t.length > 3,
        fuzzy: (t) => (t.length > 5 ? 0.2 : false),
        boostDocument: (id) => TYPE_BOOST[byId.get(String(id))?.type ?? "observation"],
      },
    });
    index.addAll(docs);
  }
  return index;
}

export function queryTerms(q: string): string[] {
  for (const [re, to] of SYNONYMS) q = q.replace(re, to);
  return [...new Set(q.split(/[^\p{L}\p{N}]+/u).map((t) => processTerm(t)).filter((t): t is string => Boolean(t)))];
}

export type Retrieval = { docs: SearchDoc[]; coverage: number; topScore: number; relevant: boolean };

/** Top documents for a question. Observation rows fill at most half the slots when concept docs also match. */
export function retrieve(question: string, k = TOP_K): Retrieval {
  const terms = queryTerms(question);
  if (terms.length === 0) return { docs: [], coverage: 0, topScore: 0, relevant: false };
  const results: SearchResult[] = getIndex().search(terms.join(" "));
  const concept: SearchResult[] = [];
  const rows: SearchResult[] = [];
  for (const r of results) (byId.get(String(r.id))?.type === "observation" ? rows : concept).push(r);
  const nConcept = Math.min(concept.length, Math.max(k - rows.length, Math.ceil(k / 2)));
  const picked = [...concept.slice(0, nConcept), ...rows.slice(0, k - nConcept)];
  const matched = new Set(picked.flatMap((r) => r.queryTerms));
  const topScore = results[0]?.score ?? 0;
  const coverage = matched.size / terms.length;
  return {
    docs: picked.map((r) => byId.get(String(r.id))!),
    coverage,
    topScore,
    relevant: topScore >= MIN_SCORE && coverage >= MIN_COVERAGE,
  };
}

export function sanitize(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is ChatMessage =>
        !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim() !== "",
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
}

function source(d: SearchDoc): ChatSource {
  const page = d.investigation_id ? `/investigations/${d.investigation_id}` : undefined;
  if (d.type === "observation") {
    const m = /Source: (.+), row (\d+)\.$/.exec(d.text);
    return { type: d.type, id: d.id, ...(m ? { file: m[1], row: Number(m[2]) } : {}), ...(page ? { url: page } : {}) };
  }
  if (d.type === "implication") return { type: d.type, id: d.id, url: "/implications" };
  return { type: d.type, id: d.id, ...(page ? { url: page } : {}) };
}

function context(found: SearchDoc[]): string {
  return found.map((d) => `[${d.id}] ${d.title}\n${d.text.slice(0, DOC_CHARS)}`).join("\n\n");
}

function scenarioLine(scenarioId?: string): string {
  const s = scenarioId ? scenarios.get(scenarioId) : undefined;
  if (!s || s.o2_pct == null || s.pressure_bar == null) return "";
  return `\nThe user is looking at the ${s.name} scenario (${s.o2_pct} % O2, ${s.pressure_bar} bar).`;
}

/** Keep only citations of documents we actually gave the model, and strip the brackets from the text. */
export function parseAnswer(raw: string, found: SearchDoc[]): ChatReply {
  const text = raw
    .replace(/[【〔［]/g, "[")
    .replace(/[】〕］]/g, "]")
    .replace(/[‐-‒−]/g, "-")
    .replace(/[   ]/g, " ")
    .replace(/\*\*|__/g, "")
    .trim();
  if (text === "" || text.toLowerCase().startsWith(REFUSAL.slice(0, -1).toLowerCase())) {
    return { answer: REFUSAL, sources: [], refused: true };
  }
  const body = text.replace(REFUSAL, "").trim();
  const allowed = new Map(found.map((d) => [d.id, d]));
  const cited: SearchDoc[] = [];
  const answer = body
    .replace(/\[([^\]]+)\]/g, (_, group: string) => {
      for (const id of group.split(",").map((s) => s.trim())) {
        const d = allowed.get(id);
        if (d && !cited.includes(d)) cited.push(d);
      }
      return "";
    })
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
  const sources = (cited.length ? cited : found.slice(0, 3)).map(source);
  return { answer, sources, refused: false };
}

export type ChatOptions = { apiKey: string; model?: string; fetchFn?: typeof fetch };

export async function answer(messages: ChatMessage[], scenarioId: string | undefined, opts: ChatOptions): Promise<ChatReply> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) throw new ChatError("No question", 400);
  const previousUser = messages.filter((m) => m.role === "user").slice(-2, -1)[0];
  let found = retrieve(lastUser.content);
  if (!found.relevant && previousUser) found = retrieve(`${previousUser.content} ${lastUser.content}`);
  if (!found.relevant) return { answer: REFUSAL, sources: [], refused: true };

  const model = opts.model || DEFAULT_MODEL;
  const body = {
    model,
    temperature: 0.2,
    max_tokens: 1500,
    ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
    messages: [
      { role: "system", content: `${SYSTEM_PROMPT}${scenarioLine(scenarioId)}\n\nDocuments:\n\n${context(found.docs)}` },
      ...messages,
    ],
  };
  const res = await (opts.fetchFn ?? fetch)(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${opts.apiKey}` },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new ChatError("Rate limited", 429);
  if (!res.ok) throw new ChatError(`Groq error ${res.status}`, 502);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return parseAnswer(data.choices?.[0]?.message?.content ?? "", found.docs);
}
