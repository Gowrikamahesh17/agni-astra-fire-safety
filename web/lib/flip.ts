import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * FLIP animation for a re-ordered list: when the order changes, each item starts at its old position and slides to its new one.
 * Pass a string that changes whenever the order changes. The list's container must be positioned (position: relative).
 */
export function useFlip(orderKey: string, enabled: boolean) {
  const els = useRef(new Map<string, HTMLElement>());
  const tops = useRef(new Map<string, number>());

  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) els.current.set(id, el);
      else els.current.delete(id);
    },
    [],
  );

  useLayoutEffect(() => {
    const next = new Map<string, number>();
    els.current.forEach((el, id) => next.set(id, el.offsetTop));
    if (enabled) {
      els.current.forEach((el, id) => {
        const before = tops.current.get(id);
        const after = next.get(id);
        if (before === undefined || after === undefined || before === after) return;
        el.style.transition = "none";
        el.style.transform = `translateY(${before - after}px)`;
        void el.offsetHeight; // commit the starting position before animating back
        el.style.transition = "";
        el.style.transform = "";
      });
    }
    tops.current = next;
  }, [orderKey, enabled]);

  return register;
}
