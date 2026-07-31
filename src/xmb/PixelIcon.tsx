import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useXmb } from "@/xmb/xmbStore";
import { iconFilter } from "./iconFilter";

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
export function PixelIcon({
  name,
  focused,
  size,
  className,
  keepSize = false,
}: {
  name: string;
  focused: boolean;
  size: number;
  className?: string;
  keepSize?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useXmb((s) => s.settings.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const draw = () => {
      if (cancelled) return;
      canvas.width = NATIVE;
      canvas.height = NATIVE;
      ctx.clearRect(0, 0, NATIVE, NATIVE);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // filled variant to match the solid PSP icons (where supported)
      const c = ctx as CanvasRenderingContext2D & { fontVariationSettings?: string };
      if ("fontVariationSettings" in ctx) c.fontVariationSettings = '"FILL" 1, "wght" 500';
      ctx.font = `${Math.round(NATIVE * 0.84)}px ${FONT}`;
      ctx.fillText(name, NATIVE / 2, NATIVE / 2 + 1);
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
  }, [name]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      style={{ height: size, width: size, imageRendering: "auto" }}
      initial={false}
      animate={{
        scale: focused ? 1 : keepSize ? 1 : 0.78,
        opacity: focused ? 1 : 0.82,
        filter: `blur(0.4px) ${iconFilter(theme, focused)}`,
      }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    />
  );
}
