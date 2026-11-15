"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gravityForCycle, noteFor, phaseAt, type Phase } from "@/lib/extinguish";
import { clamp, lerp, mixHex } from "@/lib/flame";
import { useReducedMotion } from "@/lib/motion";

// Drawing units: the picture is 380 wide, the nozzle is the origin, and the fire burns this far in front of it.
const F = { x: 105, y: -8 };
// The three elements behind the callsigns: Agni (fire), Jala (water), Vayu (air).
const EL: [string, number][] = [
  ["#ff8a3d", 0],
  ["#4db8ff", 2.094],
  ["#8be8cf", 4.189],
];
const ease = (k: number) => k * k * (3 - 2 * k);
const TAU = Math.PI * 2;
// Light glow adds up on a dark sky; on the light theme the same effects are drawn normally, with a warm core instead of a white one.
const MODE = { op: "lighter" as GlobalCompositeOperation, core: "255,255,255" };

type Shock = { t0: number };

/** One petal pointing along `ang`, from the origin of the current transform. Leaves the context saved: call ctx.restore() after drawing. */
function petalPath(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, L: number, W: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(W, -L * 0.3, W * 0.8, -L * 0.8, 0, -L);
  ctx.bezierCurveTo(-W * 0.8, -L * 0.8, -W, -L * 0.3, 0, 0);
  ctx.closePath();
}

/** A fire built from petals. g = 1 is Earth (a fan of tongues pointing up), g = 0 is orbit (an even, round, blue lotus). */
function lotusFire(ctx: CanvasRenderingContext2D, t: number, g: number, I: number) {
  if (I < 0.01) return;
  const n = 9;
  const R = 38 * (0.25 + 0.75 * I);
  const hot = mixHex("#4d84ff", "#ff6a14", g);
  const mid = mixHex("#8fb8ff", "#ffb23c", g);
  const tip = mixHex("#dcecff", "#fff2bf", g);
  const cy = lerp(F.y - R * 0.35, F.y, g);
  ctx.globalCompositeOperation = MODE.op;
  const gl = ctx.createRadialGradient(F.x, cy - R * 0.6 * g, 0, F.x, cy - R * 0.6 * g, R * 3.2);
  const glowHex = mixHex("#2f6bff", "#ff7a1a", g);
  gl.addColorStop(0, `${glowHex}${Math.round(0.5 * I * 255).toString(16).padStart(2, "0")}`);
  gl.addColorStop(1, `${glowHex}00`); // fade to the same colour, not to black, so it never greys the page
  ctx.fillStyle = gl;
  ctx.fillRect(F.x - R * 4, cy - R * 4.5, R * 8, R * 8);
  for (let ring = 0; ring < 2; ring++) {
    for (let j = 0; j < n; j++) {
      const f = j / (n - 1) - 0.5;
      const rad = (j / n) * TAU - Math.PI / 2;
      const fan = -Math.PI / 2 + f * 1.75;
      const ang = lerp(rad, fan, g);
      const flick = 1 + 0.14 * Math.sin(t * 9 + j * 1.7 + ring) + 0.08 * Math.sin(t * 4.3 + j);
      const L = R * lerp(1.05, 2.4, g) * (1 - 0.45 * Math.abs(f) * 2 * g) * flick * (ring ? 0.62 : 1);
      const W = R * (ring ? 0.34 : 0.5);
      petalPath(ctx, F.x, cy, ang, L, W);
      const gr = ctx.createLinearGradient(0, 0, 0, -L);
      gr.addColorStop(0, ring ? tip : hot);
      gr.addColorStop(0.6, ring ? tip : mid);
      gr.addColorStop(1, "rgba(255,200,80,0)");
      ctx.fillStyle = gr;
      ctx.globalAlpha = (ring ? 0.9 : 0.55) * I;
      ctx.fill();
      ctx.strokeStyle = "#f5b942";
      ctx.globalAlpha = 0.55 * I;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  const cc = cy - R * 0.6 * g;
  const core = ctx.createRadialGradient(F.x, cc, 0, F.x, cc, R * 0.7);
  core.addColorStop(0, `rgba(${MODE.core},${0.95 * I})`);
  core.addColorStop(1, `rgba(${MODE.core},0)`);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(F.x, cc, R * 0.7, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

/** Three braided streams, one per element, twist from the nozzle to the fire. Three coloured lights then circle it and gather it into a calm orb. */
function braid(ctx: CanvasRenderingContext2D, t: number, ph: Phase) {
  ctx.globalCompositeOperation = MODE.op;
  for (const [col, off] of EL) {
    for (let i = 0; i < 46; i++) {
      const s = i / 46;
      const x = lerp(0, F.x - 10, s);
      const y = lerp(-2, F.y, s) + Math.sin(s * 13 - t * 9 + off) * (3 + s * 18);
      ctx.fillStyle = col;
      ctx.globalAlpha = (ph.spraying ? 0.85 : 0) * (1 - Math.abs(s - 0.5) * 0.6) * clamp(s * 6);
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + s * 2.2, 0, TAU);
      ctx.fill();
      ctx.globalAlpha *= 0.2;
      ctx.beginPath();
      ctx.arc(x, y, 3 + s * 6, 0, TAU);
      ctx.fill();
    }
  }
  const u = ph.u;
  const vis = u >= 0.2 && u < 0.8 ? (u < 0.3 ? clamp((u - 0.2) / 0.1) : u > 0.7 ? clamp((0.8 - u) / 0.1) : 1) : 0;
  if (vis > 0) {
    const rr = lerp(40, 15, ease(clamp((u - 0.2) / 0.42)));
    for (const [col, off] of EL) {
      const a = t * 3.2 + off;
      const x = F.x + Math.cos(a) * rr;
      const y = F.y - 3 + Math.sin(a) * rr * 0.8;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, col);
      g.addColorStop(1, `${col}00`);
      ctx.globalAlpha = vis;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.25 * vis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(F.x, F.y - 3, rr, rr * 0.8, 0, 0, TAU);
      ctx.stroke();
    }
    const orb = ctx.createRadialGradient(F.x, F.y - 3, 0, F.x, F.y - 3, rr * 0.9);
    orb.addColorStop(0, `rgba(190,215,255,${0.6 * vis * clamp((u - 0.3) / 0.3)})`);
    orb.addColorStop(1, "rgba(90,140,255,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = orb;
    ctx.beginPath();
    ctx.arc(F.x, F.y - 3, rr * 0.9, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

/** The moment the fire is put out: gold, blue and teal rings, a burst of petals and a flash of light. */
function drawShocks(ctx: CanvasRenderingContext2D, t: number, shocks: Shock[]): Shock[] {
  ctx.globalCompositeOperation = MODE.op;
  const keep = shocks.filter((s) => {
    const d = t - s.t0;
    if (d > 1.4) return false;
    const a = 1 - d / 1.4;
    for (const [col, sp, w] of [["#f5b942", 230, 3], ["#4db8ff", 160, 2.2], ["#8be8cf", 110, 1.6]] as const) {
      ctx.strokeStyle = col;
      ctx.globalAlpha = a * 0.85;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.arc(F.x, F.y, d * sp, 0, TAU);
      ctx.stroke();
    }
    for (let j = 0; j < 12; j++) {
      const ang = (j / 12) * TAU + 0.2;
      const r = 14 + d * 150;
      petalPath(ctx, F.x + Math.cos(ang) * r, F.y + Math.sin(ang) * r, ang, 16 * (1 - d / 1.4) + 3, 5);
      ctx.fillStyle = j % 3 === 0 ? "#4db8ff" : j % 3 === 1 ? "#f5b942" : "#8be8cf";
      ctx.globalAlpha = a * 0.8;
      ctx.fill();
      ctx.restore();
    }
    const g = ctx.createRadialGradient(F.x, F.y, 0, F.x, F.y, 90);
    g.addColorStop(0, `rgba(255,245,210,${0.7 * Math.max(0, 1 - d / 0.35)})`);
    g.addColorStop(1, "rgba(255,245,210,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(F.x - 90, F.y - 90, 180, 180);
    return true;
  });
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  return keep;
}

/** The small calm blue lotus left behind while the fire is out. */
function calmBloom(ctx: CanvasRenderingContext2D, t: number, u: number) {
  if (u < 0.6 || u > 0.84) return;
  const a = clamp(u < 0.7 ? (u - 0.6) / 0.1 : 1 - (u - 0.7) / 0.14);
  ctx.globalCompositeOperation = MODE.op;
  for (let j = 0; j < 8; j++) {
    const ang = (j / 8) * TAU + t * 0.25;
    petalPath(ctx, F.x, F.y - 2, ang, 18 + 4 * Math.sin(t * 2 + j), 6);
    ctx.fillStyle = "#6fa2ff";
    ctx.globalAlpha = 0.55 * a;
    ctx.fill();
    ctx.strokeStyle = "#f5b942";
    ctx.globalAlpha = 0.7 * a;
    ctx.stroke();
    ctx.restore();
  }
  const c = ctx.createRadialGradient(F.x, F.y, 0, F.x, F.y, 16);
  c.addColorStop(0, `rgba(220,236,255,${0.9 * a})`);
  c.addColorStop(1, "rgba(100,150,255,0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(F.x, F.y, 16, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

/**
 * The home-page astronaut, floating in zero gravity. A petal fire burns in front of the extinguisher. Three streams (fire, water and air,
 * the callsigns Agni, Jala and Vayu) braid across to it, three lights gather it into a calm orb, and it goes out in a burst of light.
 * Then a new fire lights: a tall orange one on Earth, a round blue one in orbit. The effects are drawn on a full-screen overlay anchored to the nozzle.
 */
export default function HeroAstronaut() {
  const reduce = useReducedMotion();
  const anchor = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const fx = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const cv = fx.current;
    const ctx = cv?.getContext("2d");
    const an = anchor.current;
    const fg = figure.current;
    const fl = flash.current;
    const nt = note.current;
    if (!cv || !ctx || !an || !fg || !fl || !nt) return;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let shocks: Shock[] = [];
    let wasSpray = false;
    let lastNote = "";
    let raf = 0;
    let visible = true;
    let flashTimer = 0;

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };

    const draw = (t: number) => {
      const light = document.documentElement.dataset.theme === "light";
      MODE.op = light ? "source-over" : "lighter";
      MODE.core = light ? "255,214,120" : "255,255,255";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const a = an.getBoundingClientRect();
      const sc = fg.getBoundingClientRect().width / 380;
      const ph: Phase = reduce ? { cycle: 0, u: 0.05, intensity: 1, spraying: false, smoking: false } : phaseAt(t);
      const g = gravityForCycle(ph.cycle);
      ctx.save();
      ctx.translate(a.left, a.top);
      ctx.scale(sc, sc);
      // a warm (Earth) or cool (orbit) glow on the astronaut's glove while the fire burns
      const gv = ctx.createRadialGradient(-20, 0, 0, -20, 0, 70);
      const gvc = g ? "255,140,60" : "90,140,255";
      gv.addColorStop(0, `rgba(${gvc},${0.22 * ph.intensity})`);
      gv.addColorStop(1, `rgba(${gvc},0)`);
      ctx.globalCompositeOperation = MODE.op;
      ctx.fillStyle = gv;
      ctx.fillRect(-110, -80, 180, 160);
      ctx.globalCompositeOperation = "source-over";
      lotusFire(ctx, t, g, ph.intensity);
      if (!reduce) braid(ctx, t, ph);
      calmBloom(ctx, t, ph.u);
      shocks = drawShocks(ctx, t, shocks);
      ctx.restore();
      if (!reduce) {
        if (wasSpray && !ph.spraying && ph.u >= 0.6) {
          shocks.push({ t0: t });
          fl.style.transition = "none";
          fl.style.opacity = "0.9";
          window.clearTimeout(flashTimer);
          flashTimer = window.setTimeout(() => {
            fl.style.transition = "opacity .9s ease-out";
            fl.style.opacity = "0";
          }, 30);
        }
        wasSpray = ph.spraying;
      }
      const text = noteFor(g, ph);
      if (text !== lastNote) {
        lastNote = text;
        nt.textContent = text;
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      draw(now / 1000);
      raf = requestAnimationFrame(loop);
    };
    const redraw = () => {
      if (!raf) draw(0);
    };
    const onResize = () => {
      size();
      redraw();
    };
    size();
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible) ctx.clearRect(0, 0, W, H);
      else if (!reduce && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(fg);
    if (reduce) {
      draw(0);
      window.addEventListener("scroll", redraw, { passive: true }); // the overlay is fixed, so a still picture must follow the page
    } else raf = requestAnimationFrame(loop);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", redraw);
      window.clearTimeout(flashTimer);
      if (raf) cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    };
  }, [reduce]);

  return (
    <div className="hero-astro">
      <div className="hero-float" ref={figure}>
        <Image
          src="/images/astronaut.png"
          alt="Illustration of an astronaut in a white spacesuit floating in space and holding a red fire extinguisher"
          width={432}
          height={578}
          sizes="(max-width: 800px) 280px, 380px"
          priority
        />
        <div className="nz" ref={anchor} aria-hidden="true" />
      </div>
      <canvas ref={fx} className="hero-fx" aria-hidden="true" />
      <div ref={flash} className="hero-flash" aria-hidden="true" />
      <p className="hero-flame-note small muted" ref={note} aria-hidden="true" />
    </div>
  );
}
