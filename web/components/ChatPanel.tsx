"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useScenario } from "@/lib/scenarioStore";
import { MAX_CHARS, askChat, sourceHref, type ChatMessage, type ChatSource } from "@/lib/chatApi";

type Entry = ChatMessage & { sources?: ChatSource[]; refused?: boolean; failed?: boolean };

const STARTERS = [
  "What happened in FLEX tests near the lunar atmosphere?",
  "Why does oxygen level matter for putting out a flame?",
  "Is there any data on partial gravity?",
];

function sourceLabel(s: ChatSource): string {
  if (s.file) return `${s.file}${s.row ? ` · row ${s.row}` : ""}`;
  if (s.type === "implication") return `Implication ${s.id}`;
  if (s.type === "summary") return `Summary ${s.id.replace(/^summary:/, "")}`;
  if (s.type === "investigation") return `Investigation ${s.id.replace(/^investigation:/, "")}`;
  return s.id;
}

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const { scenarioId } = useScenario();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [entries, busy, open]);

  async function ask(q: string) {
    q = q.trim();
    if (!q || busy) return;
    const next: Entry[] = [...entries, { role: "user", content: q }];
    setEntries(next);
    setText("");
    setBusy(true);
    // Failed turns and error notes are not sent back to the model.
    const history = next.filter((m) => !m.failed).map(({ role, content }) => ({ role, content }));
    const result = await askChat(history, scenarioId === "custom" ? undefined : scenarioId);
    setBusy(false);
    setEntries((cur) =>
      result.ok
        ? [...cur, { role: "assistant", content: result.reply.answer, sources: result.reply.sources, refused: result.reply.refused }]
        : [...cur, { role: "assistant", content: result.message, failed: true }],
    );
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    void ask(text);
  }

  return (
    <>
      {!open && (
        <button type="button" className="chat-trigger" onClick={() => setOpen(true)}>
          Ask the data
        </button>
      )}
      {open && (
        <section className="chat" aria-label="Ask the PSI data">
          <header className="chat-head">
            <strong>Ask the data</strong>
            <button type="button" className="link-button" onClick={() => setOpen(false)} aria-label="Close chat">
              Close
            </button>
          </header>
          <div className="chat-log" role="log" aria-live="polite">
            {entries.length === 0 && (
              <>
                <p className="muted small">
                  Ask a question about the NASA experiments in plain English. Answers use only the data on this site and cite their sources, or
                  say &ldquo;Not in the PSI data we loaded.&rdquo; AI-generated, so check the sources.
                </p>
                <div className="chat-starters" aria-label="Example questions">
                  {STARTERS.map((q) => (
                    <button key={q} type="button" className="chip" onClick={() => void ask(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}
            {entries.map((m, i) => (
              <div key={i} className={`msg ${m.role}${m.failed ? " failed" : ""}`}>
                <p>{m.content}</p>
                {m.refused && <p className="small muted">No matching PSI data was found for this question.</p>}
                {m.sources && m.sources.length > 0 && (
                  <p className="chips">
                    {m.sources.map((s) => {
                      const href = sourceHref(s);
                      const label = sourceLabel(s);
                      const external = href?.startsWith("http");
                      return href ? (
                        external ? (
                          <a key={`${s.type}-${s.id}-${label}`} className="source-chip" href={href} target="_blank" rel="noreferrer">{label}</a>
                        ) : (
                          <Link key={`${s.type}-${s.id}-${label}`} className="source-chip" href={href}>{label}</Link>
                        )
                      ) : (
                        <span key={`${s.type}-${s.id}-${label}`} className="source-chip">{label}</span>
                      );
                    })}
                  </p>
                )}
              </div>
            ))}
            {busy && <p className="muted small">Thinking…</p>}
            <div ref={endRef} />
          </div>
          <form className="chat-form" onSubmit={send}>
            <label className="sr-only" htmlFor="chat-input">Your question</label>
            <input
              id="chat-input"
              value={text}
              maxLength={MAX_CHARS}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask a question…"
              autoComplete="off"
            />
            <button type="submit" className="button" disabled={busy || !text.trim()}>
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
}
