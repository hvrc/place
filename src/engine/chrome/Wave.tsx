import { memo, useEffect, useRef } from "react";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { hexToHsl } from "@engine/settings/palette";
import { prefersReducedMotion } from "@engine/lib/browser";

/**
 * The signature XMB flowing-wave background: several translucent sine ribbons
 * drifting across a vertical gradient. Hue and light/dark come from settings.
 * Honors reduce-motion by drawing a single static frame.
 */
function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { palette } = useMenuModel();
  const theme = useMenu((s) => s.settings.theme);
  const colorIndex = useMenu((s) => s.settings.colorIndex);
  const { h: waveHue, s: sat } = hexToHsl(palette[colorIndex] ?? palette[0]);
  // still honour the OS "reduce motion" preference (no user-facing setting)
  const reduceMotion = prefersReducedMotion();

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
    // A ResizeObserver, not a window listener: iOS grows and shrinks the
    // viewport as its toolbars collapse without always firing `resize`, and a
    // stale canvas leaves an unpainted strip at the screen edge.
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    // Two gentle bands, PSP-style: long wavelength, slow drift.
    const RIBBONS = 2;

    const draw = (t: number) => {
      const time = t / 1000;

      // vertical gradient backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      if (theme === "dark") {
        bg.addColorStop(0, `hsl(${waveHue}, ${sat + 6}%, 8%)`);
        bg.addColorStop(0.55, `hsl(${(waveHue + 15) % 360}, ${sat}%, 14%)`);
        bg.addColorStop(1, `hsl(${(waveHue + 30) % 360}, ${sat - 5}%, 6%)`);
      } else {
        bg.addColorStop(0, `hsl(${waveHue}, ${sat}%, 78%)`);
        bg.addColorStop(0.6, `hsl(${(waveHue + 15) % 360}, ${sat + 3}%, 66%)`);
        bg.addColorStop(1, `hsl(${(waveHue + 30) % 360}, ${sat - 3}%, 80%)`);
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Screen-blend the ribbons so overlapping regions compound into a distinctly
      // brighter/deeper shade (the "Venn" intersection), like the real XMB.
      ctx.globalCompositeOperation = theme === "dark" ? "screen" : "multiply";

      for (let i = 0; i < RIBBONS; i++) {
        const phase = i * 2.2;
        const speed = 0.04 + i * 0.02; // slow drift
        const amp = height * 0.085; // taller swells, same lazy wavelength
        // centerlines close together (small offset) so the two bands overlap...
        const baseY = height * (0.47 + i * 0.05);
        // ...and different frequencies so one rides above/below the other -> they
        // always cross each other across the width
        const f1 = 0.0022 + i * 0.0009;
        const f2 = 0.0041 + i * 0.0012;
        const hue = (waveHue + i * 10) % 360;
        const sc = (add: number, hi: number) => Math.max(8, Math.min(sat + add, hi));

        // sample the crest curve once, reuse it for the fill and the edge highlight
        const crest: number[] = [];
        for (let x = 0; x <= width; x += 6) {
          const y =
            baseY +
            Math.sin(x * f1 + time * speed + phase) * amp +
            Math.sin(x * f2 - time * (speed * 0.5) + phase) * amp * 0.35;
          crest.push(y);
        }
        const xAt = (k: number) => Math.min(k * 6, width);

        // filled region from the crest down to the bottom, with a bright sheen band
        // hugging the crest that falls off fast: this is the dramatic edge.
        const grad = ctx.createLinearGradient(0, baseY - amp, 0, baseY + height * 0.32);
        if (theme === "dark") {
          grad.addColorStop(0, `hsla(${hue}, ${sc(32, 82)}%, 82%, 0.30)`); // crest sheen
          grad.addColorStop(0.05, `hsla(${hue}, ${sc(24, 76)}%, 66%, 0.16)`);
          grad.addColorStop(0.4, `hsla(${hue}, ${sc(14, 66)}%, 52%, 0.08)`);
          grad.addColorStop(1, `hsla(${hue}, ${sc(6, 58)}%, 42%, 0.05)`); // plateau (stacks in overlaps)
        } else {
          grad.addColorStop(0, `hsla(${hue}, ${sc(-6, 52)}%, 74%, 0.32)`); // crest shade
          grad.addColorStop(0.05, `hsla(${hue}, ${sc(-10, 48)}%, 80%, 0.16)`);
          grad.addColorStop(0.4, `hsla(${hue}, ${sc(-12, 46)}%, 86%, 0.1)`);
          grad.addColorStop(1, `hsla(${hue}, ${sc(-14, 42)}%, 90%, 0.07)`); // plateau
        }

        ctx.beginPath();
        ctx.moveTo(0, crest[0]);
        for (let k = 1; k < crest.length; k++) ctx.lineTo(xAt(k), crest[k]);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // crisp highlight line riding the crest: the sharp edge between shades
        ctx.beginPath();
        ctx.moveTo(0, crest[0]);
        for (let k = 1; k < crest.length; k++) ctx.lineTo(xAt(k), crest[k]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle =
          theme === "dark"
            ? `hsla(${hue}, ${sc(38, 85)}%, 90%, 0.45)`
            : `hsla(${hue}, ${sc(4, 58)}%, 100%, 0.6)`;
        ctx.shadowBlur = 14;
        ctx.shadowColor =
          theme === "dark"
            ? `hsla(${hue}, ${sc(38, 85)}%, 85%, 0.5)`
            : `hsla(${hue}, ${sc(0, 55)}%, 100%, 0.5)`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.globalCompositeOperation = "source-over";

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [theme, waveHue, sat, reduceMotion]);

  // Absolute, not fixed: that's the whole fix. h-full is 100% of the
  // containing block: for a fixed element that's the initial containing block,
  // which on iOS does not follow the collapsing toolbar, and the strip it left
  // unpainted was the white gap at the top and bottom. Absolute makes .root the
  // containing block instead, and .root already tracks the live viewport via
  // 100dvh. The explicit size is required: a canvas is a replaced element, so
  // inset alone leaves it at its intrinsic 300x150 rather than stretching it.
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/**
 * Memoised: it takes no props and reads its own store slices, so it has no
 * reason to re-render with the rest of the menu on every navigation, and each
 * render re-parses the palette colour.
 */
export const Wave = memo(WaveCanvas);
