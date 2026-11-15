"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

type Star = { x: number; y: number; r: number; ph: number; tw: number; c: string; spark: boolean };
type Comet = { x: number; y: number; l: number };
type Rocket = { x: number; y: number; a: number; v: number; len: number };
type Spark = { x: number; y: number; l: number; m: number; r: number; hue: number };

// The small rockets that cross every page. The picture points up and is about 1 : 3.9, so it is drawn rotated to its heading.
const ROCKET_SRC = "/images/rocket.png";
const ROCKET_RATIO = 180 / 696;

// Three depth layers: far stars are small and barely move, near stars are bigger and shift more with the mouse and scroll.
const LAYERS = [
  { k: 0.00008, z: 0.12, r: [0.4, 0.9] },
  { k: 0.000045, z: 0.4, r: [0.7, 1.4] },
  { k: 0.00002, z: 0.9, r: [1.2, 2.1] },
] as const;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * A quiet sky behind every page. In the dark theme it has stars that twinkle, drift and flash as sparkles, and on the home page an
 * occasional comet. Small rockets cross it on every page, in both themes. With reduced motion it is drawn once and nothing moves.
 */
export default function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reduce = useReducedMotion();
  const home = usePathname() === "/";

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const rv = rocketRef.current;
    const rc = rv?.getContext("2d");
    if (!ctx || !rv || !rc) return;
    let W = 0;
    let H = 0;
    let layers: { z: number; s: Star[] }[] = [];
    let comets: Comet[] = [];
    let cometIn = 4;
    let rockets: Rocket[] = [];
    let sparks: Spark[] = [];
    let rocketIn = 1.2;
    const dark = theme !== "light";
    const img = new Image();
    img.src = ROCKET_SRC;
    let mx = 0.5;
    let raf = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rv.width = cv.width;
      rv.height = cv.height;
      rc.setTransform(dpr, 0, 0, dpr, 0, 0);
      layers = LAYERS.map((L) => ({
        z: L.z,
        s: Array.from({ length: Math.round(W * H * L.k) }, () => ({
          x: Math.random() * W,
          y: Math.random() * H * 1.5,
          r: rand(L.r[0], L.r[1]),
          ph: rand(0, 6.3),
          tw: rand(0.6, 2),
          spark: L.z > 0.3 && Math.random() < 0.16, // a few of the nearer stars flash as four-point sparkles
          c: Math.random() < 0.14 ? "#ffd9a0" : Math.random() < 0.3 ? "#bcd4ff" : "#ffffff",
        })),
      }));
    };

    let lastT = 0;
    const drawRockets = (t: number) => {
      const dt = Math.min(0.05, lastT ? t - lastT : 0.016);
      lastT = t;
      rc.clearRect(0, 0, W, H);
      rocketIn -= dt;
      if (rocketIn < 0 && rockets.length < 4 && img.complete && img.naturalWidth > 0) {
        rocketIn = rand(2.2, 5);
        const fromLeft = Math.random() < 0.7;
        rockets.push({
          x: fromLeft ? rand(-40, W * 0.35) : rand(W * 0.65, W + 40),
          y: rand(H * 0.55, H + 30),
          a: fromLeft ? rand(-0.9, -0.35) : rand(-2.8, -2.25), // up and to the right, or up and to the left
          v: rand(38, 85),
          len: rand(34, 60), // drawn length of the rocket in pixels
        });
      }
      rockets = rockets.filter((r) => {
        r.x += Math.cos(r.a) * r.v * dt;
        r.y += Math.sin(r.a) * r.v * dt;
        for (let i = 0; i < 2; i++)
          sparks.push({
            x: r.x - Math.cos(r.a) * r.len * 0.5 + rand(-1, 1),
            y: r.y - Math.sin(r.a) * r.len * 0.5 + rand(-1, 1),
            l: 0,
            m: rand(0.5, 0.9),
            r: r.len * rand(0.03, 0.06),
            hue: Math.random(),
          });
        return r.x > -90 && r.x < W + 90 && r.y > -90 && r.y < H + 90;
      });
      // A short trail of embers behind each rocket, so it reads as moving even though the picture has its own flame.
      sparks = sparks.filter((p) => {
        p.l += dt;
        if (p.l >= p.m) return false;
        const k = p.l / p.m;
        rc.globalAlpha = 0.6 * (1 - k);
        rc.fillStyle = p.hue > 0.85 ? "#8be8cf" : p.hue < 0.5 ? "#ff9a3c" : "#f5b942";
        rc.beginPath();
        rc.arc(p.x, p.y, p.r * (1 + k * 1.4), 0, 6.3);
        rc.fill();
        return true;
      });
      for (const r of rockets) {
        const h = r.len;
        const w = h * ROCKET_RATIO;
        rc.save();
        rc.translate(r.x, r.y);
        rc.rotate(r.a + Math.PI / 2); // the picture points up
        rc.globalAlpha = 1;
        rc.shadowColor = "rgba(255, 190, 90, .55)"; // a soft glow so it stands out from the sky
        rc.shadowBlur = 10;
        rc.drawImage(img, -w / 2, -h / 2, w, h);
        rc.restore();
      }
      rc.globalAlpha = 1;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const sy = reduce ? 0 : window.scrollY;
      for (const L of dark ? layers : []) {
        const ox = reduce ? 0 : (mx - 0.5) * L.z * 40;
        const oy = -(sy * L.z * 0.22) % (H * 1.5);
        const drift = reduce ? 0 : t * L.z * 6; // the field keeps drifting sideways on its own, nearer layers faster
        for (const s of L.s) {
          let y = (s.y + oy) % (H * 1.5);
          if (y < 0) y += H * 1.5;
          if (y > H) continue;
          const wave = 0.5 + 0.5 * Math.sin(t * s.tw * 1.6 + s.ph);
          ctx.globalAlpha = reduce ? 0.6 : 0.25 + 0.55 * wave;
          ctx.fillStyle = s.c;
          const x = (((s.x + ox + drift) % W) + W) % W;
          ctx.beginPath();
          ctx.arc(x, y, s.r, 0, 6.3);
          ctx.fill();
          if (s.spark && !reduce && wave > 0.78) {
            const k = (wave - 0.78) / 0.22; // grows to a glint at the brightest moment
            const len = s.r * (3 + 7 * k);
            ctx.globalAlpha = 0.85 * k;
            ctx.strokeStyle = s.c;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - len, y);
            ctx.lineTo(x + len, y);
            ctx.moveTo(x, y - len);
            ctx.lineTo(x, y + len);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce) drawRockets(t);
      if (home && !reduce && dark) {
        cometIn -= 0.016;
        if (cometIn < 0) {
          cometIn = rand(6, 11);
          comets.push({ x: rand(W * 0.4, W), y: rand(0, H * 0.4), l: 0 });
        }
        comets = comets.filter((c) => {
          c.x -= 9;
          c.y += 3.4;
          c.l++;
          const a = 1 - c.l / 70;
          if (a <= 0) return false;
          const g = ctx.createLinearGradient(c.x, c.y, c.x + 110, c.y - 40);
          g.addColorStop(0, `rgba(255,225,160,${a})`);
          g.addColorStop(1, "rgba(255,225,160,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(c.x + 110, c.y - 40);
          ctx.stroke();
          return true;
        });
      }
    };

    const onResize = () => {
      build();
      if (reduce) draw(0);
    };
    const onPointer = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth;
    };
    build();
    window.addEventListener("resize", onResize);

    if (reduce) {
      draw(0);
      return () => window.removeEventListener("resize", onResize);
    }
    window.addEventListener("pointermove", onPointer, { passive: true });
    const loop = (now: number) => {
      draw(now / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [theme, reduce, home]);

  return (
    <>
      <canvas ref={ref} className="starfield" aria-hidden="true" />
      {/* The rockets fly in front of the page content (never blocking clicks), so they show on every tab, not only in the gaps. */}
      <canvas ref={rocketRef} className="rocket-sky" aria-hidden="true" />
    </>
  );
}
