"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { diveState, progressOf, type Layer } from "@/lib/dive";
import { flamePath } from "@/lib/flame";
import { useReducedMotion } from "@/lib/motion";

export type DiveStage = { scale: string; title: string; text: string; cta?: { href: string; label: string } };

const WING_ANGLES = [-48, -24, 0, 24, 48];
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);
// Twelve petals that cool from orange (fire) through gold and teal to blue.
const PETALS: [number, string][] = [
  [0, "#ff8a3d"], [30, "#ff9a3c"], [60, "#ffb040"], [90, "#f5b942"], [120, "#d8c26a"], [150, "#9bd0c0"],
  [180, "#8be8cf"], [210, "#6fcfe8"], [240, "#4db8ff"], [270, "#4d94ff"], [300, "#4d84ff"], [330, "#4d84ff"],
];

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
                <div className="dive-globe">
                  <div className="dive-land" ref={land} />
                  <div className="dive-cloud" ref={cloud} />
                </div>
                <div className="dive-orbit">
                  <div className="dive-orbit-spin">
                    <i />
                  </div>
                </div>
              </div>
            </div>
            <div className="dive-layer" aria-hidden="true">
              <div className="dive-obj" ref={station} style={{ opacity: 0, visibility: "hidden" }}>
                <svg viewBox="0 0 900 460">
                  <defs>
                    <linearGradient id="dive-lp" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#4a7bf0" />
                      <stop offset="1" stopColor="#1a2f78" />
                    </linearGradient>
                    <path id="dive-wing" d="M0 0 C 40 -34 150 -36 230 0 C 150 36 40 34 0 0 Z" />
                    <filter id="dive-soft">
                      <feGaussianBlur stdDeviation="5" />
                    </filter>
                  </defs>
                  <g transform="translate(300 230)" stroke="#f5b942" strokeWidth="2" fill="url(#dive-lp)">
                    <g transform="scale(-1 1)">
                      {WING_ANGLES.map((a) => (
                        <use key={a} href="#dive-wing" transform={`rotate(${a})`} />
                      ))}
                    </g>
                  </g>
                  <g transform="translate(600 230)" stroke="#f5b942" strokeWidth="2" fill="url(#dive-lp)">
                    {WING_ANGLES.map((a) => (
                      <use key={a} href="#dive-wing" transform={`rotate(${a})`} />
                    ))}
                  </g>
                  <rect x="290" y="222" width="320" height="16" fill="#9aa4c8" />
                  <rect x="330" y="190" width="240" height="80" rx="34" fill="#e7ecff" stroke="#f5b942" strokeWidth="2" />
                  <circle cx="450" cy="230" r="26" fill="#0b1432" stroke="#f5b942" strokeWidth="3" />
                  <circle cx="450" cy="230" r="11" fill="#4d84ff" />
                  <circle cx="450" cy="230" r="5" fill="#c7e1ff" />
                  <g>
                    <circle className="dive-pod" cx="372" cy="170" r="26" fill="#ff8a3d" opacity=".55" filter="url(#dive-soft)" />
                    <rect x="356" y="160" width="32" height="40" rx="14" fill="#ff8a3d" stroke="#fff" strokeWidth="2.5" />
                    <path d="M372 168c5 6 7 10 5 14-2 4-10 4-10 0-2-4 2-8 5-14z" fill="#fff6d0" />
                  </g>
                  <g>
                    <circle className="dive-pod b" cx="528" cy="170" r="26" fill="#4db8ff" opacity=".55" filter="url(#dive-soft)" />
                    <rect x="512" y="160" width="32" height="40" rx="14" fill="#4db8ff" stroke="#fff" strokeWidth="2.5" />
                    <path d="M528 168c6 8 8 11 6 15-2 4-10 4-12 0-2-4 2-7 6-15z" fill="#eaf7ff" />
                  </g>
                  <g>
                    <circle className="dive-pod c" cx="450" cy="300" r="26" fill="#8be8cf" opacity=".55" filter="url(#dive-soft)" />
                    <rect x="434" y="278" width="32" height="40" rx="14" fill="#8be8cf" stroke="#fff" strokeWidth="2.5" />
                    <path d="M441 295h13a4 4 0 1 0-3-6M441 301h17a4 4 0 1 1-3 6" fill="none" stroke="#0b3a30" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="dive-layer" aria-hidden="true">
              <div className="dive-obj" ref={chamber} style={{ opacity: 0, visibility: "hidden" }}>
                <svg viewBox="0 0 600 420">
                  <circle cx="300" cy="210" r="190" fill="#0a1230" stroke="#6a77a8" strokeWidth="14" />
                  <circle cx="300" cy="210" r="172" fill="none" stroke="#243059" strokeWidth="3" />
                  <g className="dive-turn" style={{ transformOrigin: "300px 210px" }}>
                    <g transform="translate(300 210)" stroke="#f5b942" strokeOpacity=".7" fill="none" strokeWidth="1.6">
                      {TICKS.map((a) => (
                        <path key={a} d="M0 -172V-156" transform={`rotate(${a})`} />
                      ))}
                    </g>
                    <g transform="translate(300 210)" stroke="#f5b942" strokeOpacity=".45" fill="none" strokeWidth="1.4">
                      {[0, 60, 120, 180, 240, 300].map((a) => (
                        <path key={a} d="M0 -128 C 14 -108 14 -92 0 -76 C -14 -92 -14 -108 0 -128Z" transform={`rotate(${a})`} />
                      ))}
                    </g>
                  </g>
                  <circle cx="300" cy="46" r="7" fill="#ff8a3d" />
                  <circle cx="465" cy="300" r="7" fill="#4db8ff" />
                  <circle cx="135" cy="300" r="7" fill="#8be8cf" />
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
                    <path id="dive-fp" d="M0 -118 C 13 -102 13 -86 0 -70 C -13 -86 -13 -102 0 -118Z" />
                  </defs>
                  <circle className="dive-ripple" cx="160" cy="160" r="100" fill="none" stroke="#4d84ff" strokeWidth="2" />
                  <circle className="dive-ripple b" cx="160" cy="160" r="100" fill="none" stroke="#f5b942" strokeWidth="1.6" />
                  <g className="dive-turn" style={{ transformOrigin: "160px 160px" }}>
                    <g transform="translate(160 160)" fill="none" strokeWidth="1.6">
                      {PETALS.map(([a, c]) => (
                        <use key={a} href="#dive-fp" transform={`rotate(${a})`} stroke={c} opacity=".8" />
                      ))}
                    </g>
                  </g>
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
