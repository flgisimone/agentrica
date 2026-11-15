"use client";

import { useEffect, useRef } from "react";

const LINK = 150; // distanza massima fra due nodi collegati, in px
const SPEED = 0.45; // velocità massima per fotogramma, in px (scelta dell'utente: la prima, 0,18, era troppo lenta)

/**
 * Sfondo decorativo: una rete di nodi che si sposta piano, nei colori di --net e --net-alpha.
 * Fermo con «riduci movimento», in pausa a scheda nascosta.
 */
export function NetworkBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const rgb = css.getPropertyValue("--net").trim();
    const alpha = Number(css.getPropertyValue("--net-alpha")) || 0.16;
    let width = 0;
    let height = 0;
    let raf = 0;
    let nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      width = innerWidth;
      height = innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: Math.round((width * height) / 22000) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of nodes) {
        p.x = (p.x + p.vx + width) % width;
        p.y = (p.y + p.vy + height) % height;
      }
      ctx.lineWidth = 1;
      for (const [i, p] of nodes.entries()) {
        for (const q of nodes.slice(i + 1)) {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d >= LINK) continue;
          ctx.strokeStyle = `rgba(${rgb},${alpha * (1 - d / LINK)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${rgb},${alpha * 2.2})`;
      for (const p of nodes) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      frame();
    };
    const onResize = () => {
      resize();
      restart();
    };

    resize();
    frame();
    addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 size-full" />;
}
