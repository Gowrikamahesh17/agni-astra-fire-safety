import type { ReactNode } from "react";

/** A short, collapsible "how to use this page" for newcomers. Open by default on first read, easy to skip for experts. */
export default function HowTo({ title = "How to use this page", children }: { title?: string; children: ReactNode }) {
  return (
    <details className="howto">
      <summary>{title}</summary>
      <div className="howto-body">{children}</div>
    </details>
  );
}
