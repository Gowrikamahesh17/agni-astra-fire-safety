import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
export const THEME_KEY = "ffd.theme";

/** A saved choice wins; otherwise follow the operating system. */
export function resolveTheme(saved: string | null, systemPrefersLight: boolean): Theme {
  if (saved === "light" || saved === "dark") return saved;
  return systemPrefersLight ? "light" : "dark";
}

const subscribe = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
};
const getSnapshot = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
const getServerSnapshot = (): Theme => "dark";

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    window.localStorage.setItem(THEME_KEY, t);
  } catch {
    // choice just won't be remembered
  }
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
