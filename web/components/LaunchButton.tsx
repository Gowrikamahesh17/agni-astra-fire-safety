"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/lib/motion";

const COUNT_MS = 650; // each of 3, 2, 1
const FLY_MS = 1500;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Puff = { x: number; y: number; vx: number; vy: number; l: number; r: number };

/**
 * A link that opens its page with a short lift-off: countdown, a rocket with exhaust, then the page loads.
 * Press Escape or click to skip. Without JavaScript, with reduced motion, or with a modified click it is an ordinary link.
 */
export default function LaunchButton({ href, children, className = "button" }: { href: string; children: ReactNode; className?: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  const [count, setCount] = useState(3);
  const done = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const rocket = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    router.push(href);
    window.setTimeout(() => setOn(false), 2500); // only matters if the navigation never happens
  }, [href, router]);

  useEffect(() => {
    if (!on) return;
    done.current = false;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const t0 = performance.now();
    const countEnd = COUNT_MS * 3;
    let puffs: Puff[] = [];
    let raf = 0;

    const frame = (now: number) => {
      const e = now - t0;
      const c = e < countEnd ? 3 - Math.floor(e / COUNT_MS) : 0;
      setCount(c);
      const fly = clamp01((e - countEnd) / FLY_MS);
      const y = -(window.innerHeight * 1.15) * fly * fly * fly;
      if (rocket.current) {
        rocket.current.style.opacity = fly >= 1 ? "0" : "1";
        rocket.current.style.transform = `translateX(-50%) translateY(${y.toFixed(1)}px)`;
      }
      box.current?.classList.toggle("shake", e >= countEnd && e < countEnd + 350);

      ctx.clearRect(0, 0, cv.width, cv.height);
      if (e >= countEnd && fly < 1) {
        const nx = cv.width / 2;
        const ny = cv.height * 0.92 + y + 4;
        for (let i = 0; i < 6; i++) puffs.push({ x: nx + rand(-8, 8), y: ny, vx: rand(-2.2, 2.2), vy: rand(2, 5), l: 0, r: rand(6, 14) });
      }
      puffs = puffs.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.l++;
        p.r += 0.55;
        const a = 1 - p.l / 46;
        if (a <= 0) return false;
        const hot = p.l < 14;
        ctx.globalAlpha = a * (hot ? 0.9 : 0.5);
        ctx.fillStyle = hot ? (p.l < 7 ? "#fff2c4" : "#ff9a3c") : "#8f9bbf";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.3);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      if (e >= countEnd + FLY_MS + 150) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [on, finish]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduce || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // behave as a normal link
    e.preventDefault();
    setCount(3);
    setOn(true);
  };

  return (
    <>
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
      {on &&
        createPortal(
          <div className="launch" ref={box} onClick={finish} aria-hidden="true">
            <canvas ref={canvas} className="launch-plume" />
            <div className="launch-count">{count > 0 ? <span key={count}>{count}</span> : null}</div>
            <svg ref={rocket} className="launch-rocket" viewBox="0 0 64 150" style={{ opacity: 1 }}>
              <path d="M32 4c13 14 16 40 14 78H18C16 44 19 18 32 4z" fill="#eef2ff" />
              <circle cx="32" cy="46" r="8" fill="#0b1432" stroke="#f5b942" strokeWidth="3" />
              <path d="M18 66L2 100l16-8zM46 66l16 34-16-8z" fill="#e0474f" />
              <rect x="24" y="82" width="16" height="10" fill="#6b7390" />
            </svg>
            <p className="launch-skip">Press Esc or click to skip</p>
          </div>,
          document.body,
        )}
      {on &&
        createPortal(
          <p role="status" className="sr-only">
            Launching. Opening the page.
          </p>,
          document.body,
        )}
    </>
  );
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}
