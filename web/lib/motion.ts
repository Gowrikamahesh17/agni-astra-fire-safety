import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True when the visitor's system asks for less motion. Animated scenes must offer a still version. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/** Starts fast and settles gently. k is progress from 0 to 1. */
export const easeOutCubic = (k: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

/** The number to show part-way through counting from one value to another. */
export const countUpValue = (from: number, to: number, k: number) => Math.round(from + (to - from) * easeOutCubic(k));
