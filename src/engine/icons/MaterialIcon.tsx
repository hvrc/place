import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useIconLight } from "./useIconLight";

/** Google icons render pure white — sit them further back than the PSP PNGs
 *  when unfocused, so the two icon sets read as equally dim. */
const DIM = 0.6;

const FONT = '"Material Symbols Rounded"';
/** Low native resolution — the canvas is drawn small then upscaled *smoothly*
 * (bilinear), giving Google icons the same soft, low-res feel as the upscaled
 * PSP PNGs (rather than a hard pixel grid). */
const NATIVE = 48;

/**
 * Renders a Google Material Symbol like a PSP icon: rasterised at a small size
 * and blown up softly, with the body/focus behaviour (small + dim -> full size
 * + lit white) matching PspIcon.
 */
export function MaterialIcon({
  name,
  focused,
  size,
  className,
  keepSize = false,
  weight = 500,
  grade = 0,
  throb = false,
  hovered = false,
}: {
  name: string;
  focused: boolean;
  size: number;
  className?: string;
  keepSize?: boolean;
  weight?: number;
  grade?: number;
  /** pulse between the dim and lit looks while focused (column icons only) */
  throb?: boolean;
  /** the pointer is over this icon's row — show the lit look */
  hovered?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const light = useIconLight({ focused, hovered, throb, dimOpacity: DIM, prefix: "blur(0.45px) " });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const draw = () => {
      if (cancelled) return;
      // Render a bit below device resolution so there's a gentle upscale (a
      // little low-res "texture") — but nowhere near the ~3x griddiness of a
      // fixed tiny buffer. A small blur softens it toward the PSP look.
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const buf = Math.max(NATIVE, Math.round(size * dpr * 0.5));
      canvas.width = buf;
      canvas.height = buf;
      ctx.clearRect(0, 0, buf, buf);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // filled variant to match the solid PSP icons (where supported)
      const c = ctx as CanvasRenderingContext2D & { fontVariationSettings?: string };
      if ("fontVariationSettings" in ctx)
        c.fontVariationSettings = `"FILL" 1, "wght" ${weight}, "GRAD" ${grade}`;
      ctx.font = `${Math.round(buf * 0.84)}px ${FONT}`;
      ctx.fillText(name, buf / 2, buf / 2 + buf * 0.01);
    };

    // draw once loaded (and again on the global ready, in case of a cold cache)
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.load) {
      fonts.load(`40px ${FONT}`, name).then(draw).catch(draw);
      fonts.ready.then(draw).catch(() => {});
    } else {
      draw();
    }
    return () => {
      cancelled = true;
    };
  }, [name, size, weight, grade]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      style={{ height: size, width: size, imageRendering: "auto" }}
      initial={false}
      animate={{ scale: focused ? 1 : keepSize ? 1 : 0.78, ...light.animate }}
      transition={{ duration: 0.16, ease: "easeOut", ...light.transition }}
    />
  );
}
