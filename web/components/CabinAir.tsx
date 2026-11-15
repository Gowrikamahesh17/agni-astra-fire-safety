"use client";

import { useEffect, useRef } from "react";
import { cabinCounts } from "@/lib/cabin";
import { useReducedMotion } from "@/lib/motion";

type Dot = { x: number; y: number; vx: number; vy: number; o: boolean };
const OXYGEN = "#6fd3ff";
const OTHER = "#7c88b4";
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** A small picture of a cabin's air: more pressure means more dots, and the oxygen share sets how many are blue. */
export default function CabinAir({ o2, pressure }: { o2: number; pressure: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const target = useRef(cabinCounts(o2, pressure));
  const reduce = useReducedMotion();
  const c = cabinCounts(o2, pressure);

  useEffect(() => {
    target.current = cabinCounts(o2, pressure);
  }, [o2, pressure]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    let W = 0;
    let H = 0;
    const dots: Dot[] = [];
    let raf = 0;
    let visible = true;
    const make = (o: boolean): Dot => ({ x: rand(8, W - 8), y: rand(8, H - 8), vx: rand(-1, 1) * 0.9, vy: rand(-1, 1) * 0.9, o });

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const step = (move: boolean, instant: boolean) => {
      const t = target.current;
      let nO = dots.filter((d) => d.o).length;
      let nX = dots.length - nO;
      // Fill or drain gradually, so changing the scenario visibly re-fills the room.
      for (let guard = 0; guard < (instant ? 400 : 2); guard++) {
        if (nO < t.oxygen) { dots.push(make(true)); nO++; }
        else if (nO > t.oxygen) { dots.splice(dots.findIndex((d) => d.o), 1); nO--; }
        if (nX < t.other) { dots.push(make(false)); nX++; }
        else if (nX > t.other) { dots.splice(dots.findIndex((d) => !d.o), 1); nX--; }
      }
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        if (move) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 5 || d.x > W - 5) d.vx *= -1;
          if (d.y < 5 || d.y > H - 5) d.vy *= -1;
        }
        ctx.fillStyle = d.o ? OXYGEN : OTHER;
        ctx.globalAlpha = d.o ? 0.95 : 0.6;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.o ? 3 : 2.3, 0, 6.3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    size();
    const ro = new ResizeObserver(() => {
      size();
      if (reduce) step(false, true);
    });
    ro.observe(cv);

    if (reduce) {
      step(false, true); // a still picture that matches the scenario
      return () => ro.disconnect();
    }
    const loop = () => {
      raf = 0;
      if (!visible) return;
      step(true, false);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(cv);
    raf = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  // Reduced motion draws once, so redraw whenever the scenario changes.
  useEffect(() => {
    if (!reduce) return;
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const t = cabinCounts(o2, pressure);
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < t.total; i++) {
      const isO = i < t.oxygen;
      ctx.fillStyle = isO ? OXYGEN : OTHER;
      ctx.globalAlpha = isO ? 0.95 : 0.6;
      ctx.beginPath();
      ctx.arc(rand(8, W - 8), rand(8, H - 8), isO ? 3 : 2.3, 0, 6.3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [o2, pressure, reduce]);

  return (
    <figure className="cabin">
      <canvas ref={ref} className="cabin-canvas" aria-hidden="true" />
      <figcaption className="small muted">
        <span className="cabin-key"><i style={{ background: OXYGEN }} />oxygen</span> <span className="cabin-key"><i style={{ background: OTHER }} />other gas</span>
        <br />
        {c.oxygen} of {c.total} dots are oxygen. An illustration of the mix, not to scale.
      </figcaption>
    </figure>
  );
}
