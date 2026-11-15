"use client";

import { useLayoutEffect, useRef } from "react";
import { countUpValue, useReducedMotion } from "@/lib/motion";

const MS = 650;

/** A number that counts from its previous value to the new one. The final value is always what assistive technology reads. */
export default function CountUp({ value }: { value: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    if (reduce) {
      shown.current = value;
      node.textContent = String(value);
      return;
    }
    const from = shown.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / MS);
      shown.current = countUpValue(from, value, k);
      node.textContent = String(shown.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return <span ref={el}>{value}</span>;
}
