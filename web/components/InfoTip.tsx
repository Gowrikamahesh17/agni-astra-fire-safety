"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";

/** A small "?" that explains a term. Works with hover, keyboard focus and tap, and Escape closes it. */
export function InfoTip({ label, children, align = "left" }: { label: string; children: ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <span ref={ref} className={`tip${open ? " open" : ""}${align === "right" ? " right" : ""}`}>
      <button type="button" className="tip-btn" aria-label={`What is ${label}?`} aria-describedby={id} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        ?
      </button>
      <span role="note" id={id} className="tip-pop">
        {children}
      </span>
    </span>
  );
}

/** Help tip for a glossary term. */
export function Term({ k, align }: { k: GlossaryKey; align?: "left" | "right" }) {
  const e = GLOSSARY[k];
  return (
    <InfoTip label={e.term} align={align}>
      <strong>{e.term}.</strong> {e.short}
    </InfoTip>
  );
}
