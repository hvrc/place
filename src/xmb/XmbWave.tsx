import { useEffect, useRef } from "react";
import { useXmb } from "@/xmb/xmbStore";

/**
 * The signature XMB flowing-wave background: several translucent sine ribbons
 * drifting across a vertical gradient. Hue and light/dark come from settings.
 * Honors reduce-motion by drawing a single static frame.
 */
export function XmbWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, waveHue, reduceMotion } = useXmb((s) => s.settings);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const RIBBONS = 5;

    const draw = (t: number) => {
      const time = t / 1000;

      // vertical gradient backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      if (theme === "dark") {
        bg.addColorStop(0, `hsl(${waveHue}, 60%, 8%)`);
        bg.addColorStop(0.55, `hsl(${(waveHue + 15) % 360}, 55%, 14%)`);
        bg.addColorStop(1, `hsl(${(waveHue + 30) % 360}, 50%, 6%)`);
      } else {
        bg.addColorStop(0, `hsl(${waveHue}, 55%, 92%)`);
        bg.addColorStop(0.6, `hsl(${(waveHue + 15) % 360}, 60%, 85%)`);
        bg.addColorStop(1, `hsl(${(waveHue + 30) % 360}, 50%, 95%)`);
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < RIBBONS; i++) {
        const phase = i * 0.9;
        const speed = 0.15 + i * 0.05;
        const amp = height * (0.05 + i * 0.015);
        const baseY = height * (0.35 + i * 0.09);
        const light = theme === "dark" ? 60 + i * 4 : 55 + i * 3;
        const alpha = theme === "dark" ? 0.06 + i * 0.015 : 0.08 + i * 0.02;

        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 12) {
          const y =
            baseY +
            Math.sin(x * 0.006 + time * speed + phase) * amp +
            Math.sin(x * 0.013 - time * (speed * 0.6) + phase) * amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = `hsla(${(waveHue + i * 12) % 360}, 80%, ${light}%, ${alpha})`;
        ctx.fill();
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [theme, waveHue, reduceMotion]);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" aria-hidden="true" />;
}
