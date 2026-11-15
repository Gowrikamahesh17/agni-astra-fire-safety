"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { boopBody, easePause, newBody, placeBody, stepBody, swatBody, type OrbitBody } from "@/lib/orbit";
import { useReducedMotion } from "@/lib/motion";
import { CREW, type Member } from "@/lib/team";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const colorVar = (c: string) => ({ "--c": c }) as CSSProperties;

function Icon({ element }: { element: Member["element"] }) {
  if (element === "fire")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2c1 4 6 6 6 12a7 7 0 0 1-14 0c0-3 1.5-5 3-6.5.3 2 1.2 3 2.5 3C9 7 11 4 13 2z" />
      </svg>
    );
  if (element === "water")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C9 7 5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-4-8-7-13z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9h11a3 3 0 1 0-3-3M3 13h16a3 3 0 1 1-3 3M3 17h7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Photo({ m }: { m: Member }) {
  if (!m.photo) return <div className="tm-ini" role="img" aria-label={`${m.name}, initials ${m.initials}`}>{m.initials}</div>;
  // A plain <img>: the helmet crops it, and its size is set by the layout.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={m.photo} alt={`Photo of ${m.name}`} style={{ objectPosition: "50% 20%" }} />;
}

/** Embers that drift up and cool from orange to calm blue. They run once and stop, so nothing keeps animating. */
function runEmbers(cv: HTMLCanvasElement): () => void {
  const ctx = cv.getContext("2d");
  if (!ctx) return () => {};
  cv.width = cv.clientWidth * 2;
  cv.height = cv.clientHeight * 2;
  let bits = Array.from({ length: 46 }, () => {
    const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
    const s = rand(0.6, 2.4);
    return { x: cv.width / 2 + rand(-120, 120), y: cv.height / 2 + rand(-10, 30), vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 0, max: rand(170, 300), r: rand(2, 5) };
  });
  let raf = 0;
  const frame = () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    bits = bits.filter((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.99;
      b.vy *= 0.99;
      b.l++;
      const t = b.l / b.max;
      if (t >= 1) return false;
      ctx.globalAlpha = Math.min(1, (1 - t) * 1.4);
      ctx.fillStyle = `rgb(${Math.round(lerp(255, 143, t))},${Math.round(lerp(138, 211, t))},${Math.round(lerp(61, 255, t))})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * (1 - t * 0.5), 0, 6.3);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1;
    if (bits.length) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

const MANDALA = (() => {
  const out: React.ReactNode[] = [];
  [100, 84, 66, 48].forEach((r, i) =>
    out.push(<circle key={`c${r}`} r={r} fill="none" stroke="currentColor" strokeOpacity={0.35 - i * 0.05} strokeDasharray={i % 2 ? "1 5" : "3 5"} />),
  );
  for (let k = 0; k < 16; k++)
    out.push(<path key={`p${k}`} d="M0 -58 C 9 -72, 9 -88, 0 -104 C -9 -88, -9 -72, 0 -58Z" transform={`rotate(${k * 22.5})`} fill="none" stroke="currentColor" strokeOpacity=".4" />);
  for (let k = 0; k < 8; k++)
    out.push(<path key={`q${k}`} d="M0 -40 C 6 -50, 6 -58, 0 -66 C -6 -58, -6 -50, 0 -40Z" transform={`rotate(${k * 45 + 22.5})`} fill="currentColor" fillOpacity=".18" />);
  return out;
})();

/**
 * The last section of the home page: the "Agni Shant" banner, then the three Agni Rakshaks as helmet portraits circling a small Earth.
 * The cards below always show everyone's details; the orbit is decoration on top. With reduced motion everything is still.
 */
export default function TeamSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(-1);
  const hover = useRef(-1); // a hovered or focused card pauses the orbit
  // Fixed starting positions for the server render; the effect below gives each body its own random drift in the browser.
  const bodies = useRef<OrbitBody[]>(CREW.map((_, i) => newBody(i, CREW.length, () => 0.5)));
  const orbit = useRef<HTMLDivElement>(null);
  const helms = useRef<(HTMLDivElement | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);
  const ring = useRef<SVGEllipseElement>(null);
  const pointer = useRef({ x: -999, y: -999, vx: 0, speed: 0 });
  const bwrap = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  const embers = useRef<HTMLCanvasElement>(null);

  // The banner plays once, when it scrolls into view: the flame flares, then calms.
  useEffect(() => {
    const wrap = bwrap.current;
    const ban = banner.current;
    const cv = embers.current;
    if (!wrap || !ban || !cv || reduce) return;
    ban.classList.add("armed");
    let stop = () => {};
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      ban.classList.add("play");
      stop = runEmbers(cv);
      io.disconnect();
    }, { threshold: 0.6 });
    io.observe(wrap);
    return () => {
      io.disconnect();
      stop();
      ban.classList.remove("armed", "play");
    };
  }, [reduce]);

  // The orbit.
  useEffect(() => {
    const box = orbit.current;
    if (!box) return;
    if (!reduce) bodies.current = CREW.map((_, i) => newBody(i, CREW.length)); // random drift, browser only
    let W = box.clientWidth;
    let H = box.clientHeight;
    let pf = reduce ? 0 : 1;
    let raf = 0;
    let visible = true;
    let last = performance.now();

    const layout = () => {
      const small = W < 700;
      const hs = small ? 92 : 148;
      box.style.setProperty("--hs", `${hs}px`);
      bodies.current.forEach((b, i) => {
        const el = helms.current[i];
        if (!el) return;
        const p = placeBody(b, i, W, H, small);
        el.style.transform = `translate(${(p.x - hs / 2).toFixed(1)}px,${(p.y - hs / 2).toFixed(1)}px) scale(${p.scale.toFixed(3)}) rotate(${b.r.toFixed(1)}deg)`;
        el.style.zIndex = String(Math.round(p.depth * 10));
        el.style.opacity = p.opacity.toFixed(2);
        const l = lines.current[i];
        if (l) {
          l.setAttribute("x1", String(W / 2));
          l.setAttribute("y1", String(H / 2));
          l.setAttribute("x2", String(p.x));
          l.setAttribute("y2", String(p.y));
          l.setAttribute("stroke-opacity", (0.12 + 0.3 * p.depth).toFixed(2));
        }
        if (i === 0 && ring.current) {
          ring.current.setAttribute("cx", String(W / 2));
          ring.current.setAttribute("cy", String(H / 2));
          ring.current.setAttribute("rx", String(p.rx));
          ring.current.setAttribute("ry", String(p.ry));
        }
      });
    };

    const ro = new ResizeObserver(() => {
      W = box.clientWidth;
      H = box.clientHeight;
      layout();
    });
    ro.observe(box);
    layout();
    if (reduce) return () => ro.disconnect();

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      pf = easePause(pf, hover.current >= 0, dt);
      const ptr = pointer.current;
      bodies.current.forEach((b, i) => {
        stepBody(b, dt, pf);
        const el = helms.current[i];
        if (el && ptr.speed > 1.5) {
          const rc = el.getBoundingClientRect();
          const dx = rc.left + rc.width / 2 - ptr.x;
          const dy = rc.top + rc.height / 2 - ptr.y;
          if (Math.hypot(dx, dy) < rc.width * 0.65) swatBody(b, ptr.vx, ptr.speed, dx);
        }
      });
      ptr.speed *= 0.8;
      layout();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(box);
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const hold = (i: number) => {
    hover.current = i;
    setActive(i);
  };

  return (
    <section className="tm" aria-labelledby="team-title">
      <div className="tm-head">
        <p className="eyebrow">Mission debrief</p>
        <div className="tm-bwrap" ref={bwrap}>
          <canvas ref={embers} className="tm-embers" aria-hidden="true" />
          <div className="tm-banner" ref={banner}>
            <svg className="tm-flame" viewBox="0 0 24 30" aria-hidden="true">
              <path d="M12 1c1.2 5 7 8 7 14.5a7 7 0 0 1-14 0C5 12 6.5 9.5 8.2 8c.4 2.2 1.3 3.3 2.8 3.3C10 7.3 11 4 12 1z" fill="currentColor" />
              <path d="M12 17c.6 2 3 3 3 5.5a3 3 0 0 1-6 0c0-1.5.8-2.5 1.7-3.5.2.9.6 1.3 1.3 1.3-.3-1.2 0-2.5 0-3.3z" fill="#fff6d6" opacity=".9" />
            </svg>
            Agni Shant
            <i className="tm-ripple" aria-hidden="true" />
          </div>
        </div>
        <p className="tm-bsub">
          <span className="dev" lang="hi">अग्नि शांत</span> · The fire is calm
        </p>
        <h2 id="team-title">Meet the Agni Rakshaks</h2>
        <p className="tm-nsub">
          <span className="dev" lang="hi">अग्नि रक्षक</span> · guardians of fire
        </p>
        <div className="tm-orn" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /></svg>
        </div>
        <p className="muted tm-lead">Three people, one question: what did NASA learn about fire in space, and can we make it easy to explore?</p>
      </div>

      <div
        className="tm-orbit"
        ref={orbit}
        onPointerMove={(e) => {
          const p = pointer.current;
          p.x = e.clientX;
          p.y = e.clientY;
          p.vx = e.movementX;
          p.speed = Math.max(p.speed, Math.hypot(e.movementX, e.movementY));
        }}
        onPointerLeave={() => (pointer.current.speed = 0)}
      >
        <svg className="tm-tethers" aria-hidden="true">
          <ellipse ref={ring} fill="none" stroke="var(--muted)" strokeOpacity=".28" strokeDasharray="4 7" />
          {CREW.map((m, i) => (
            <line key={m.name} ref={(el) => { lines.current[i] = el; }} stroke={m.color} strokeDasharray="2 6" strokeWidth="2" strokeLinecap="round" />
          ))}
        </svg>
        <svg className="tm-mandala" viewBox="-110 -110 220 220" aria-hidden="true">{MANDALA}</svg>
        <div className="tm-earth" aria-hidden="true" />
        {CREW.map((m, i) => (
          <div
            key={m.name}
            ref={(el) => { helms.current[i] = el; }}
            className={`tm-helm${active === i ? " hl" : ""}`}
            style={colorVar(m.color)}
            onPointerDown={() => boopBody(bodies.current[i])}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(hover.current)}
          >
            <div className="tm-visor">
              <div className="tm-glass"><Photo m={m} /></div>
              <div className="tm-patch" aria-hidden="true"><Icon element={m.element} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="tm-cards">
        {CREW.map((m, i) => (
          <article
            key={m.name}
            className={`tm-card${active === i ? " hl" : ""}`}
            style={colorVar(m.color)}
            onPointerEnter={() => hold(i)}
            onPointerLeave={() => hold(-1)}
            onFocus={() => hold(i)}
            onBlur={() => hold(-1)}
          >
            <span className="tm-call">
              <Icon element={m.element} />
              Callsign · {m.callsign} <span className="tm-mean">· {m.element}</span>
            </span>
            <h3>{m.name}</h3>
            {m.role && <p className="tm-role">{m.role}</p>}
            {m.bio && <p className="muted">{m.bio}</p>}
            {m.links && m.links.length > 0 && (
              <div className="tm-links">
                {m.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <p className="small muted tm-hint">Swat a helmet with your cursor, or tap it. Hover a card to hold the orbit still.</p>
    </section>
  );
}
