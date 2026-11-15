"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { describeGravity, flameColors, flamePath } from "@/lib/flame";
import { useReducedMotion } from "@/lib/motion";

const PRESETS = [
  { label: "Earth 1 g", g: 100 },
  { label: "Moon 0.16 g", g: 16 },
  { label: "Space station ≈ 0 g", g: 0 },
];
const ARROWS = [-110, -66, -22, 22, 66, 110];

/** A flame that reshapes with gravity: a flickering teardrop on Earth, a calm blue sphere in microgravity. */
export default function GravityFlame() {
  const [g, setG] = useState(100);
  const reduce = useReducedMotion();
  const gRef = useRef(1);
  const boxRef = useRef<HTMLDivElement>(null);
  const outer = useRef<SVGPathElement>(null);
  const inner = useRef<SVGPathElement>(null);
  const glow = useRef<SVGEllipseElement>(null);
  const arrows = useRef<(SVGGElement | null)[]>([]);

  // Redraws the flame from the current gravity. It only touches the picture, so it is safe to call from a loop.
  const draw = useCallback((t: number) => {
    const v = gRef.current;
    const c = flameColors(v);
    outer.current?.setAttribute("d", flamePath(v, t, 60));
    inner.current?.setAttribute("d", flamePath(v, t + 1.3, 34));
    outer.current?.setAttribute("fill", c.outer);
    inner.current?.setAttribute("fill", c.inner);
    glow.current?.setAttribute("fill", c.glow);
    glow.current?.setAttribute("opacity", c.glowOpacity.toFixed(2));
    // Rising-air arrows drift upward and fade as gravity weakens.
    arrows.current.forEach((el, i) => {
      if (!el) return;
      const phase = (t * 0.5 + i * 0.17) % 1;
      const y = 290 - phase * 230 * (0.6 + 0.4 * v);
      el.setAttribute("transform", `translate(${160 + ARROWS[i] * 0.7} ${y.toFixed(1)})`);
      el.setAttribute("opacity", (v * (0.9 - phase * 0.9)).toFixed(2));
    });
  }, []);

  useEffect(() => {
    gRef.current = g / 100;
    if (reduce) draw(0.5); // a still picture that still follows the slider
  }, [g, reduce, draw]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || reduce) return;
    let raf = 0;
    let visible = true;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      draw(now / 1000);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(box);
    raf = requestAnimationFrame(loop);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce, draw]);

  const v = g / 100;
  return (
    <div className="gf">
      <div>
        <label className="field gf-slider">
          <span>
            Gravity: <strong>{v.toFixed(2)} g</strong>
          </span>
          <input type="range" min={0} max={100} value={g} onChange={(e) => setG(Number(e.target.value))} aria-describedby="gf-desc" />
        </label>
        <div className="chips" role="group" aria-label="Gravity presets">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" className="chip" aria-pressed={g === p.g} onClick={() => setG(p.g)}>
              {p.label}
            </button>
          ))}
        </div>
        <p id="gf-desc" className="gf-desc" aria-live="polite">
          {describeGravity(v)}
        </p>
        <p className="small muted">
          Illustration, not a simulation. PSI has no partial-gravity combustion data, so the Moon setting only pictures the idea. Every test on this site was run
          in microgravity.
        </p>
      </div>
      <div className="gf-stage" ref={boxRef}>
        <svg viewBox="0 0 320 320" role="img" aria-label={describeGravity(v)}>
          <defs>
            <filter id="gf-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          <g stroke="#f5b942" strokeWidth="2" fill="none" strokeLinecap="round" aria-hidden="true">
            {ARROWS.map((_, i) => (
              <g
                key={i}
                ref={(el) => {
                  arrows.current[i] = el;
                }}
                opacity="0"
              >
                <path d="M0 0v-14M-4 -9L0 -14L4 -9" />
              </g>
            ))}
          </g>
          <g transform="translate(160 205)" aria-hidden="true">
            <ellipse ref={glow} rx="90" ry="90" fill="#ff7a1a" opacity=".3" filter="url(#gf-blur)" />
            <path ref={outer} d={flamePath(1, 0, 60)} fill="#ff7a1a" />
            <path ref={inner} d={flamePath(1, 1.3, 34)} fill="#fff0b0" />
          </g>
        </svg>
      </div>
    </div>
  );
}
