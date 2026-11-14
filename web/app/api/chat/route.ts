import { ChatError, answer, sanitize } from "@/lib/chat";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "Too many questions, wait a minute." }, { status: 429 });

  let body: { messages?: unknown; scenario_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const messages = sanitize(body.messages);
  if (messages.at(-1)?.role !== "user") {
    return Response.json({ error: "The last message must be a user question" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return Response.json({ error: "Chat is not configured" }, { status: 503 });

  try {
    const scenarioId = typeof body.scenario_id === "string" ? body.scenario_id : undefined;
    return Response.json(await answer(messages, scenarioId, { apiKey, model: process.env.GROQ_MODEL }));
  } catch (e) {
    const status = e instanceof ChatError ? e.status : 502;
    return Response.json({ error: "The assistant is unavailable" }, { status });
  }
}
