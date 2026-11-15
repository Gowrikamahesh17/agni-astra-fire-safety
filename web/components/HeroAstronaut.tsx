"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gravityForCycle, noteFor, phaseAt } from "@/lib/extinguish";
import { flameColors, flamePath, lerp } from "@/lib/flame";
import { useReducedMotion } from "@/lib/motion";

const NS = "http://www.w3.org/2000/svg";
const FX = 70; // how far in front of the nozzle the fire burns (drawing units; the picture is 380 wide)
const R0 = 32;

function dot(parent: SVGElement, cls: string) {
  const c = document.createElementNS(NS, "circle");
  c.setAttribute("class", cls);
  parent.appendChild(c);
  return c;
}

type Puff = { x: number; y: number; vx: number; vy: number; l: number; max: number; r: number; el: SVGCircleElement };

/**
 * The home-page astronaut, floating in zero gravity. A flame burns in front of the extinguisher, the extinguisher sprays it, it shrinks and
 * goes out, and a new one lights: a tall orange flame on Earth, then a round blue one in orbit. With reduced motion, nothing moves.
 */
export default function HeroAstronaut() {
  const reduce = useReducedMotion();
  const outer = useRef<SVGPathElement>(null);
  const inner = useRef<SVGPathElement>(null);
  const glow = useRef<SVGEllipseElement>(null);
  const spray = useRef<SVGGElement>(null);
  const smoke = useRef<SVGGElement>(null);
  const embers = useRef<SVGGElement>(null);
  const note = useRef<HTMLParagraphElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    const gl = glow.current;
    const sp = spray.current;
    const sm = smoke.current;
    const em = embers.current;
    const nt = note.current;
    const root = box.current;
    if (!o || !i || !gl || !sp || !sm || !em || !nt || !root) return;
    const ember = Array.from({ length: 8 }, (_, k) => ({ el: dot(em, "nz-ember"), ph: k / 8, dx: (k % 3) * 9 - 9 }));
    let puffs: Puff[] = [];
    let wisps: Puff[] = [];
    let accSpray = 0;
    let accSmoke = 0;
    let last = 0;
    let lastNote = "";
    let raf = 0;
    let visible = true;

    const draw = (t: number, dt: number) => {
      const ph = reduce ? { cycle: 0, intensity: 1, spraying: false, smoking: false } : phaseAt(t);
      const g = gravityForCycle(ph.cycle);
      const I = ph.intensity;
      const R = R0 * (0.25 + 0.75 * I);
      const col = flameColors(g);
      const cy = lerp(-4, -R, g);
      o.style.display = i.style.display = I > 0.01 ? "" : "none";
      o.setAttribute("transform", `translate(${FX} ${cy})`);
      i.setAttribute("transform", `translate(${FX} ${cy + lerp(0, R * 0.2, g)})`);
      o.setAttribute("d", flamePath(g, t, R));
      i.setAttribute("d", flamePath(g, t + 1.3, R * 0.55));
      o.setAttribute("fill", col.outer);
      i.setAttribute("fill", col.inner);
      gl.setAttribute("fill", col.glow);
      gl.setAttribute("opacity", (col.glowOpacity * I).toFixed(2));
      gl.setAttribute("cx", String(FX));
      gl.setAttribute("cy", cy.toFixed(1));
      gl.setAttribute("rx", (lerp(30, 46, g) * (0.4 + 0.6 * I)).toFixed(1));
      gl.setAttribute("ry", (lerp(30, 56, g) * (0.4 + 0.6 * I)).toFixed(1));
      ember.forEach((e, k) => {
        const p = (t * 0.45 + e.ph) % 1;
        e.el.setAttribute("r", "1.6");
        e.el.setAttribute("cx", (FX + e.dx * p + Math.sin(t * 3 + k) * 3).toFixed(1));
        e.el.setAttribute("cy", (cy - R * 1.6 - p * 70).toFixed(1));
        e.el.setAttribute("opacity", (g * g * (1 - p) * 0.9 * I).toFixed(2));
      });

      if (!reduce) {
        // Spray: a pale cloud leaves the nozzle, spreads as it travels, and fades on the flame.
        if (ph.spraying) {
          accSpray += dt * 70;
          while (accSpray >= 1) {
            accSpray--;
            puffs.push({ x: 2, y: -2 + (Math.random() - 0.5) * 4, vx: 90 + Math.random() * 60, vy: (Math.random() - 0.5) * 26 - 4, l: 0, max: 0.55 + Math.random() * 0.25, r: 2 + Math.random() * 2, el: dot(sp, "nz-spray") });
          }
        }
        // Smoke: a thin wisp after the flame is out. It rises on Earth and drifts apart in orbit.
        if (ph.smoking) {
          accSmoke += dt * 14;
          while (accSmoke >= 1) {
            accSmoke--;
            wisps.push({
              x: FX + (Math.random() - 0.5) * 10,
              y: -6,
              vy: g > 0.5 ? -22 - Math.random() * 14 : -3 - Math.random() * 4,
              vx: g > 0.5 ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 14,
              l: 0,
              max: 1.3 + Math.random() * 0.6,
              r: 4,
              el: dot(sm, "nz-smoke"),
            });
          }
        }
      }
      const step = (list: Puff[], grow: number, peak: number, fadeIn: boolean) =>
        list.filter((p) => {
          p.l += dt;
          if (p.l >= p.max) {
            p.el.remove();
            return false;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (fadeIn) p.vx *= 0.992;
          const k = p.l / p.max;
          p.el.setAttribute("cx", p.x.toFixed(1));
          p.el.setAttribute("cy", p.y.toFixed(1));
          p.el.setAttribute("r", (p.r + k * grow).toFixed(1));
          p.el.setAttribute("opacity", (peak * (1 - k) * (fadeIn && k < 0.1 ? k / 0.1 : 1)).toFixed(2));
          return true;
        });
      puffs = step(puffs, 13, 0.7, true);
      wisps = step(wisps, 9, 0.32, false);

      const text = noteFor(g, ph);
      if (text !== lastNote) {
        lastNote = text;
        nt.textContent = text;
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      const t = now / 1000;
      const dt = Math.min(0.05, last ? t - last : 0.016);
      last = t;
      draw(t, dt);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !reduce) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(root);
    if (reduce) draw(0, 0);
    else raf = requestAnimationFrame(loop);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      [...puffs, ...wisps].forEach((p) => p.el.remove());
      ember.forEach((e) => e.el.remove());
    };
  }, [reduce]);

  return (
    <div className="hero-astro" ref={box}>
      <div className="hero-float">
        <Image
          src="/images/astronaut.png"
          alt="Illustration of an astronaut in a white spacesuit floating in space and holding a red fire extinguisher"
          width={432}
          height={578}
          sizes="(max-width: 800px) 280px, 380px"
          priority
        />
        <div className="nz" aria-hidden="true">
          <svg viewBox="-100 -170 240 240">
            <defs>
              <filter id="nz-blur" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>
            <g ref={smoke} />
            <ellipse ref={glow} cx="0" cy="-30" rx="46" ry="50" filter="url(#nz-blur)" />
            <g ref={embers} />
            <path ref={outer} />
            <path ref={inner} />
            <g ref={spray} />
          </svg>
        </div>
      </div>
      <p className="hero-flame-note small muted" ref={note} aria-hidden="true" />
    </div>
  );
}
