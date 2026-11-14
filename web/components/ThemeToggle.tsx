"use client";

import { setTheme, useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button type="button" className="theme-toggle" onClick={() => setTheme(next)} aria-label={`Switch to ${next} mode`}>
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span> {next === "light" ? "Light" : "Dark"}
    </button>
  );
}
