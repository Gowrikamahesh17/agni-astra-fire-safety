import Image from "next/image";
import Link from "next/link";
import { lunarHeadline } from "@/lib/headline";

const num = (n: number) => String(Math.round(n * 100) / 100);

export default function Home() {
  const h = lunarHeadline();
  return (
    <>
      <section className="hero hero-grid">
        <div>
          <p className="eyebrow">NASA Space Apps Challenge 2026 · BrahmAstra Analytics</p>
          <span className="flame" aria-hidden="true">🔥</span>
          <h1>
            Fire safety for crew habitats, <span>from NASA&apos;s microgravity data</span>
          </h1>
          <p className="muted">
            Search, rank and interpret NASA combustion experiments for your mission&apos;s atmosphere. Every
            finding links to its source row.
          </p>
          <p>
            <Link href="/dashboard" className="button">
              Open dashboard
            </Link>{" "}
            <Link href="/guide">New here? Read the guide</Link>
          </p>
          <p className="muted small">Made for aerospace researchers, engineers and students. No account needed. The flame animation is an illustration, not a simulation.</p>
        </div>
        <figure className="hero-art">
          <Image
            src="/images/astronaut.png"
            alt="Illustration of an astronaut in a white spacesuit floating in space and holding a red fire extinguisher"
            width={432}
            height={578}
            sizes="(max-width: 800px) 280px, 380px"
            priority
          />
          <figcaption className="ai-mark">AI-generated image</figcaption>
        </figure>
      </section>
      <section aria-labelledby="how-heading">
        <h2 id="how-heading">How it works</h2>
        <ol className="steps">
          <li>
            <h3>Pick an atmosphere</h3>
            <p>Choose a mission, such as the space station or a lunar habitat, or enter your own oxygen level and pressure.</p>
          </li>
          <li>
            <h3>See what NASA tested</h3>
            <p>Experiments are ranked by how close they came to that atmosphere. Open one to read its tests, each linked to its source row.</p>
          </li>
          <li>
            <h3>Find the gaps</h3>
            <p>See where there is no data, compare investigations, read what it means for fire safety, or ask the chat a question.</p>
          </li>
        </ol>
      </section>
      {h && (
        <section className="card">
          <h2>Headline insight</h2>
          <p>
            {h.n} FLEX droplet-flame tests ran at {num(h.o2[0])}–{num(h.o2[1])} % O₂ and {num(h.pressure[0])}–{num(h.pressure[1])} bar, almost the planned
            lunar-habitat atmosphere (30 % O₂ at 0.703 bar). {h.extinguished === 0 ? "None" : h.extinguished} ended in extinction.
          </p>
          <p className="small muted">
            Counted from the data on this site. <Link href="/gaps">See the evidence</Link> or <Link href="/investigations/PSI-69">open the FLEX tests</Link>.
          </p>
        </section>
      )}
      <section aria-labelledby="earth-heading">
        <h2 id="earth-heading">Why it matters on Earth</h2>
        <p className="muted">
          Studying flames without gravity strips away buoyancy, so the basics of how fires start, spread and go out show up clearly.
          That kind of research can inform fire safety here too.
        </p>
        <ul className="earth">
          <li>
            <h3>Extinguishers</h3>
            <p>Learning how fine water mist and gas diluents put flames out can guide cleaner, lower-waste extinguishing agents.</p>
          </li>
          <li>
            <h3>Smoke detection</h3>
            <p>Studying how smoke forms and moves without gravity can help detectors sense fires earlier and with fewer false alarms.</p>
          </li>
          <li>
            <h3>Firefighter gear</h3>
            <p>Better knowledge of how materials ignite and burn can feed into safer protective clothing and equipment.</p>
          </li>
        </ul>
        <p className="small muted">General context only. None of these applications are measured in the PSI tables used on this site.</p>
      </section>
    </>
  );
}
