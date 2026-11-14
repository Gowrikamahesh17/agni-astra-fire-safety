import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";
import HowTo from "@/components/HowTo";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <section>
      <h1>Dashboard</h1>
      <p className="muted">
        Investigations ranked for your mission atmosphere. Open one to see its tests and source rows.
      </p>
      <HowTo>
        <ol>
          <li>Choose a <strong>mission scenario</strong>: the oxygen and pressure of the place you care about (for example a lunar habitat).</li>
          <li>Read the ranking. A higher <strong>score</strong> means NASA tested closer to that atmosphere, on topics that matter for crew fire safety, with data you can analyse.</li>
          <li>Use <strong>Focus on</strong> to keep one kind of study, and the <strong>weights</strong> to change what counts most.</li>
          <li>Open an investigation to see its tests, or tick <strong>Compare</strong> on two or three cards to see them side by side.</li>
        </ol>
        <p className="small muted">Hover or tap the <strong>?</strong> next to any term for a plain-English explanation.</p>
      </HowTo>
      <Dashboard />
    </section>
  );
}
