import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="hero hero-grid">
        <div>
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
      <section className="card">
        <h2>Headline insight</h2>
        <p>
          17 FLEX droplet-flame tests ran at 30–34 % O₂ and 0.71–0.72 bar, almost the planned lunar-habitat
          atmosphere. None ended in extinction.
        </p>
      </section>
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
