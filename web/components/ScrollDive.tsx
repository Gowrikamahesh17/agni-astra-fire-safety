"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { diveState, progressOf, type Layer } from "@/lib/dive";
import { flamePath } from "@/lib/flame";
import { useReducedMotion } from "@/lib/motion";

export type DiveStage = { scale: string; title: string; text: string; cta?: { href: string; label: string } };

const SECTION_VH = 440; // how much scrolling the dive takes, as a share of the screen height

function applyLayer(el: HTMLElement | null, l: Layer, extra = "") {
  if (!el) return;
  el.style.transform = `scale(${l.scale.toFixed(3)})${extra}`;
  el.style.opacity = l.opacity.toFixed(3);
  el.style.visibility = l.opacity < 0.01 ? "hidden" : "visible";
}

/**
 * A scroll-driven zoom: Earth, the space station, a combustion rack, a fuel droplet, then one flame.
 * The page holds still while the camera moves. Visitors who prefer reduced motion get the same five steps as a plain list.
 */
export default function ScrollDive({ stages }: { stages: DiveStage[] }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const earth = useRef<HTMLDivElement>(null);
  const land = useRef<HTMLDivElement>(null);
  const cloud = useRef<HTMLDivElement>(null);
  const station = useRef<HTMLDivElement>(null);
  const chamber = useRef<HTMLDivElement>(null);
  const flame = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const last = useRef(-1);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduce) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = progressOf(el.getBoundingClientRect().top, el.offsetHeight, window.innerHeight);
      const s = diveState(p);
      applyLayer(earth.current, s.earth);
      applyLayer(station.current, s.station);
      applyLayer(chamber.current, s.chamber);
      applyLayer(flame.current, s.flame);
      if (land.current) land.current.style.transform = `rotate(${s.rotate.toFixed(1)}deg)`;
      if (cloud.current) cloud.current.style.transform = `rotate(${(s.rotate * 1.5).toFixed(1)}deg)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(3)})`;
      if (stageRef.current) stageRef.current.dataset.start = p < 0.04 ? "1" : "0";
      if (s.stage !== last.current) {
        last.current = s.stage;
        setStage(s.stage);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    raf = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (reduce) {
    return (
      <ol className="steps dive-static" aria-label="From orbit to one flame">
        {stages.map((s) => (
          <li key={s.title}>
            <p className="eyebrow">{s.scale}</p>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            {s.cta && (
              <p>
                <Link href={s.cta.href}>{s.cta.label}</Link>
              </p>
            )}
          </li>
        ))}
      </ol>
    );
  }

  const cur = stages[stage];
  return (
    <>
      <a className="skip-dive" href="#after-dive">
        Skip the scroll story
      </a>
      <section ref={sectionRef} className="dive" style={{ height: `${SECTION_VH}vh` }} aria-label="Scroll story: from orbit to one flame">
        <div className="dive-holder">
          <div className="dive-stage" ref={stageRef} data-start="1">
            <div className="dive-layer" aria-hidden="true">
              <div className="dive-earth" ref={earth} style={{ transform: "scale(0.5)" }}>
                <div className="dive-land" ref={land} />
                <div className="dive-cloud" ref={cloud} />
              </div>
            </div>
            <div className="dive-layer" aria-hidden="true">
              <div className="dive-obj" ref={station} style={{ opacity: 0, visibility: "hidden" }}>
                <svg viewBox="0 0 900 360">
                  <defs>
                    <linearGradient id="dive-panel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#3b6be0" />
                      <stop offset="1" stopColor="#1a2f78" />
                    </linearGradient>
                  </defs>
                  <rect x="60" y="165" width="780" height="8" fill="#9aa4c8" />
                  <g stroke="#a9bcff" strokeOpacity=".6" fill="url(#dive-panel)">
                    <rect x="90" y="40" width="160" height="90" />
                    <rect x="90" y="208" width="160" height="90" />
                    <rect x="650" y="40" width="160" height="90" />
                    <rect x="650" y="208" width="160" height="90" />
                  </g>
                  <g stroke="#a9bcff" strokeOpacity=".5" fill="none">
                    <path d="M130 40v90M170 40v90M210 40v90M90 85h160M130 208v90M170 208v90M210 208v90M90 253h160" />
                    <path d="M690 40v90M730 40v90M770 40v90M650 85h160M690 208v90M730 208v90M770 208v90M650 253h160" />
                  </g>
                  <rect x="320" y="132" width="260" height="76" rx="30" fill="#dfe5f7" />
                  <rect x="340" y="144" width="60" height="52" rx="8" fill="#9fb0e6" />
                  <rect x="500" y="144" width="60" height="52" rx="8" fill="#9fb0e6" />
                  <circle cx="450" cy="170" r="22" fill="#0b1432" stroke="#f5b942" strokeWidth="3" />
                  <circle cx="450" cy="170" r="9" fill="#f5b942" opacity=".85" />
                  <rect x="298" y="150" width="26" height="40" rx="6" fill="#aab3d4" />
                  <rect x="576" y="150" width="26" height="40" rx="6" fill="#aab3d4" />
                </svg>
              </div>
            </div>
            <div className="dive-layer" aria-hidden="true">
              <div className="dive-obj" ref={chamber} style={{ opacity: 0, visibility: "hidden" }}>
                <svg viewBox="0 0 600 420">
                  <circle cx="300" cy="210" r="190" fill="#0a1230" stroke="#6a77a8" strokeWidth="14" />
                  <circle cx="300" cy="210" r="172" fill="none" stroke="#243059" strokeWidth="3" />
                  <path d="M300 60v50M300 310v50M150 210h50M400 210h50" stroke="#3a4a86" strokeWidth="2" />
                  <path d="M300 186V90M300 234v110" stroke="#c5cdea" strokeWidth="1.5" strokeDasharray="3 4" />
                  <circle cx="300" cy="210" r="24" fill="#d9b25a" />
                  <circle cx="294" cy="203" r="8" fill="#fff6d0" opacity=".7" />
                </svg>
              </div>
            </div>
            <div className="dive-layer" aria-hidden="true">
              <div className="dive-obj" ref={flame} style={{ opacity: 0, visibility: "hidden" }}>
                <svg viewBox="0 0 320 320">
                  <defs>
                    <filter id="dive-blur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="14" />
                    </filter>
                  </defs>
                  <g transform="translate(160 160)">
                    <circle r="104" fill="#2f6bff" opacity=".35" filter="url(#dive-blur)" />
                    <path d={flamePath(0, 0, 64)} fill="#4d84ff" />
                    <path d={flamePath(0, 0, 34)} fill="#c7e1ff" />
                  </g>
                </svg>
              </div>
            </div>

            <ol className="dive-rail" aria-hidden="true">
              {stages.map((s, i) => (
                <li key={s.title} className={i === stage ? "on" : undefined}>
                  {s.scale}
                </li>
              ))}
            </ol>
            <div className="dive-cap" key={stage}>
              {/* The text is read from the ordered list below, so it is hidden here to avoid reading everything twice. */}
              <div className="dive-cap-text" aria-hidden="true">
                <strong>{cur.scale}</strong>
                <span className="dive-cap-title">{cur.title}</span>
                <span>{cur.text}</span>
              </div>
              {cur.cta && (
                <Link className="button" href={cur.cta.href}>
                  {cur.cta.label}
                </Link>
              )}
            </div>
            <div className="dive-hint" aria-hidden="true">
              Scroll ↓
            </div>
            <div className="dive-progress" aria-hidden="true">
              <div ref={bar} />
            </div>
          </div>
        </div>
        {/* The same five steps for screen readers, in order, whatever the scroll position. */}
        <ol className="sr-only">
          {stages.map((s) => (
            <li key={s.title}>
              {s.scale}: {s.title}. {s.text}
            </li>
          ))}
        </ol>
      </section>
      <div id="after-dive" tabIndex={-1} />
    </>
  );
}
