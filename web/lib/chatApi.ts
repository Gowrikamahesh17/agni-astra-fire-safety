// Client for POST /api/chat (contract: spec 5.8). The route itself belongs to Person C.
export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatSource = { type: string; id: string; file?: string; row?: number; url?: string };
export type ChatReply = { answer: string; sources: ChatSource[]; refused: boolean };

export const MAX_CHARS = 1000;
export const MAX_TURNS = 6;

export type ChatResult =
  | { ok: true; reply: ChatReply }
  | { ok: false; kind: "rate_limit" | "error"; message: string };

export async function askChat(
  history: ChatMessage[],
  scenarioId?: string,
  fetchFn: typeof fetch = fetch,
): Promise<ChatResult> {
  const messages = history.slice(-MAX_TURNS).map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  try {
    const res = await fetchFn("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, ...(scenarioId ? { scenario_id: scenarioId } : {}) }),
    });
    if (res.status === 429) {
      return { ok: false, kind: "rate_limit", message: "The assistant is busy right now. Please try again in a minute." };
    }
    if (!res.ok) {
      return { ok: false, kind: "error", message: "The assistant is unavailable. The rest of the site still works." };
    }
    const data = (await res.json()) as Partial<ChatReply>;
    if (typeof data.answer !== "string") {
      return { ok: false, kind: "error", message: "The assistant sent an unexpected reply." };
    }
    return { ok: true, reply: { answer: data.answer, sources: data.sources ?? [], refused: Boolean(data.refused) } };
  } catch {
    return { ok: false, kind: "error", message: "Could not reach the assistant. Check your connection and try again." };
  }
}

/** Where a source chip should link, or null for plain text. */
export function sourceHref(s: ChatSource): string | null {
  if (s.url) {
    // an observation source opens the investigation filtered to that test
    return s.type === "observation" && s.url.startsWith("/investigations/") ? `${s.url}?q=${encodeURIComponent(s.id)}` : s.url;
  }
  const m = /^([A-Za-z]+-\d+)(-\d{4})?$/.exec(s.id);
  if (!m) return null;
  return m[2] ? `/investigations/${m[1]}?q=${encodeURIComponent(s.id)}` : `/investigations/${m[1]}`;
}
