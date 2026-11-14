import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY, GUIDE_TERMS } from "@/lib/glossary";

export const metadata: Metadata = { title: "Guide" };

export default function Page() {
  return (
    <section className="guide">
      <h1>Guide</h1>
      <p className="muted">
        What this site does, how to read it, and what the words mean. Written for newcomers; experts can jump to the scoring and limits.
      </p>

      <h2>What this is</h2>
      <p>
        NASA has run combustion experiments on the International Space Station for years and published the results in its{" "}
        <abbr title={GLOSSARY.psi.short}>PSI</abbr> repository. This site reads those tables and helps you answer one question: for my mission&apos;s
        atmosphere, which NASA tests apply, what did they show, and where is there no data? Every value links back to the CSV row it came from.
      </p>

      <h2>Start here</h2>
      <ol>
        <li>
          Open the <Link href="/dashboard">Dashboard</Link> and pick a mission scenario.
        </li>
        <li>Read the ranking, then open an investigation to see its tests and sources.</li>
        <li>
          Check <Link href="/gaps">Evidence gaps</Link> to see where NASA did and did not test, and{" "}
          <Link href="/implications">Implications</Link> for what it suggests for prevention, detection and suppression.
        </li>
      </ol>

      <h2>The pages</h2>
      <dl>
        <dt>Dashboard</dt>
        <dd>Ranks every investigation for the scenario you choose. Change the weights to rank by what matters to you.</dd>
        <dt>Compare</dt>
        <dd>Puts two or three investigations side by side: hardware, sensors, what was measured and how tests ended.</dd>
        <dt>Evidence gaps</dt>
        <dd>A chart of every test by oxygen and pressure, with your scenario marked, so you can see what is covered and what is empty.</dd>
        <dt>Implications</dt>
        <dd>AI-written statements for prevention, detection and suppression. Each one is checked against the data and shows its evidence.</dd>
        <dt>Predict</dt>
        <dd>A small what-if tool using simple models fitted to the tables. It always shows its limits and warns when you leave its range.</dd>
        <dt>Ask the data</dt>
        <dd>A chat that answers only from this site&apos;s data, cites its sources, and says so when something is not in the data.</dd>
      </dl>

      <h2>How the ranking works</h2>
      <p>
        Each investigation gets a score from 0 to 100 that is a weighted average of three parts. The default weights are 50 % proximity, 30 % relevance
        and 20 % usability, and you can change them on the Dashboard.
      </p>
      <dl>
        {(["proximity", "relevance", "usability"] as const).map((k) => (
          <div key={k}>
            <dt>{GLOSSARY[k].term}</dt>
            <dd>{GLOSSARY[k].short}</dd>
          </div>
        ))}
        <dt>Distance and close matches</dt>
        <dd>
          Distance between a test and a scenario is the square root of (oxygen difference ÷ 5)² + (pressure difference ÷ 0.1)². A close match is a test
          with distance 1 or less. Proximity is 100 × (1 − closest distance ÷ 3), floored at 0.
        </dd>
      </dl>

      <h2>How tests end</h2>
      <dl>
        <dt>Droplet flames (FLEX)</dt>
        <dd>Extinguished: the flame went out. Disrupted: the droplet broke apart or was disturbed. Burned to completion: the flame lasted until the droplet was used up.</dd>
        <dt>Gas flames (CFI-G)</dt>
        <dd>Self-extinguished: the flame went out by itself. Sustained until stopped: it was still burning when the test was stopped, so burn time is a minimum. No ignition: the flame never lit.</dd>
      </dl>

      <h2>Limits to keep in mind</h2>
      <ul>
        <li>
          <strong>No partial-gravity data.</strong> PSI has no combustion tests at lunar or Martian gravity, so every result is for microgravity.
        </li>
        <li>Some tables record no pressure or outcome, so they cannot be matched or plotted. They are still listed and searchable.</li>
        <li>Several investigations (Saffire, DAFT and others) are listed from their descriptions only because their results are not in the tables we loaded.</li>
        <li>The Predict models are simple and trained on a few hundred tests. They describe patterns, not safety limits.</li>
        <li>AI text is labelled, number-checked against the data, and reviewed. Treat it as a reading aid and check the sources.</li>
      </ul>

      <h2>Glossary</h2>
      <dl>
        {GUIDE_TERMS.map((e) => (
          <div key={e.term}>
            <dt>{e.term}</dt>
            <dd>{e.short}</dd>
          </div>
        ))}
      </dl>

      <h2>Data and credits</h2>
      <p>
        Data: NASA Physical Sciences Informatics (PSI), CC0-1.0. Built by BrahmAstra Analytics for the NASA Space Apps Challenge 2026. The astronaut
        picture on the home page is an AI-generated illustration.
      </p>
    </section>
  );
}
