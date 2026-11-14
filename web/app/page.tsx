import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="hero">
        <span className="flame" aria-hidden="true">🔥</span>
        <h1>
          Fire safety for crew habitats, <span>from NASA&apos;s microgravity data</span>
        </h1>
        <p className="muted">
          Search, rank and interpret NASA combustion experiments for your mission&apos;s atmosphere. Every
          finding links to its source row.
        </p>
        <Link href="/dashboard" className="button">
          Open dashboard
        </Link>
        <p className="muted">Flame animation is an illustration, not a simulation.</p>
      </section>
      <section className="card">
        <h2>Headline insight</h2>
        <p>
          17 FLEX droplet-flame tests ran at 30–34 % O₂ and 0.71–0.72 bar, almost the planned lunar-habitat
          atmosphere. None ended in extinction.
        </p>
      </section>
    </>
  );
}
