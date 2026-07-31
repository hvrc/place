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

    // Two gentle bands, PSP-style: long wavelength, slow drift.
    const RIBBONS = 2;

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

      // Screen-blend the ribbons so overlapping regions compound into a distinctly
      // brighter/deeper shade (the "Venn" intersection), like the real XMB.
      ctx.globalCompositeOperation = theme === "dark" ? "screen" : "multiply";

      for (let i = 0; i < RIBBONS; i++) {
        const phase = i * 2.2;
        const speed = 0.04 + i * 0.015; // slow drift
        const amp = height * 0.075; // taller swells, same lazy wavelength
        const baseY = height * (0.42 + i * 0.15);
        const hue = (waveHue + i * 10) % 360;

        // sample the crest curve once, reuse it for the fill and the edge highlight
        const crest: number[] = [];
        for (let x = 0; x <= width; x += 6) {
          const y =
            baseY +
            Math.sin(x * 0.0022 + time * speed + phase) * amp +
            Math.sin(x * 0.0041 - time * (speed * 0.5) + phase) * amp * 0.35;
          crest.push(y);
        }
        const xAt = (k: number) => Math.min(k * 6, width);

        // filled region from the crest down to the bottom, with a bright sheen band
        // hugging the crest that falls off fast — this is the dramatic edge.
        const grad = ctx.createLinearGradient(0, baseY - amp, 0, baseY + height * 0.32);
        if (theme === "dark") {
          grad.addColorStop(0, `hsla(${hue}, 85%, 82%, 0.30)`); // crest sheen
          grad.addColorStop(0.05, `hsla(${hue}, 78%, 66%, 0.16)`);
          grad.addColorStop(0.4, `hsla(${hue}, 68%, 52%, 0.08)`);
          grad.addColorStop(1, `hsla(${hue}, 60%, 42%, 0.05)`); // plateau (stacks in overlaps)
        } else {
          grad.addColorStop(0, `hsla(${hue}, 45%, 74%, 0.32)`); // crest shade
          grad.addColorStop(0.05, `hsla(${hue}, 40%, 80%, 0.16)`);
          grad.addColorStop(0.4, `hsla(${hue}, 38%, 86%, 0.1)`);
          grad.addColorStop(1, `hsla(${hue}, 35%, 90%, 0.07)`); // plateau
        }

        ctx.beginPath();
        ctx.moveTo(0, crest[0]);
        for (let k = 1; k < crest.length; k++) ctx.lineTo(xAt(k), crest[k]);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // crisp highlight line riding the crest — the sharp edge between shades
        ctx.beginPath();
        ctx.moveTo(0, crest[0]);
        for (let k = 1; k < crest.length; k++) ctx.lineTo(xAt(k), crest[k]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle =
          theme === "dark"
            ? `hsla(${hue}, 90%, 90%, 0.45)`
            : `hsla(${hue}, 55%, 100%, 0.6)`;
        ctx.shadowBlur = 14;
        ctx.shadowColor =
          theme === "dark" ? `hsla(${hue}, 90%, 85%, 0.5)` : `hsla(${hue}, 50%, 100%, 0.5)`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.globalCompositeOperation = "source-over";

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
