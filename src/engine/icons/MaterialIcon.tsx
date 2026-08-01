import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useIconLight } from "./useIconLight";
import { softBlurPx, useMetrics } from "@engine/layout/metrics";

/** Google icons render pure white: sit them further back than the PSP PNGs
 *  when unfocused, so the two icon sets read as equally dim. */
const DIM = 0.6;

const FONT = '"Material Symbols Rounded"';
/** The glyph is drawn at this fraction of the icon's box. */
const GLYPH = 0.84;
/**
 * Rasterise at the PSP art's own resolution: the icon PNGs are 64x64. Drawing
 * the glyph into the same size buffer means both icon sets upscale by exactly
 * the same factor at any display size or DPR, which is what makes them read as
 * one set. (Sizing this off the display size instead left Google icons
 * noticeably softer than the PNGs beside them on a phone.)
 */
const NATIVE = 64;

/**
 * Renders a Google Material Symbol with the PSP body/focus behaviour (small +
 * dim -> full size + lit white).
 *
 * Rasterised small and blown up bilinearly, so it carries the same low-res
 * softness as the upscaled PSP PNGs beside it.
 */
export function MaterialIcon({
  name,
  focused,
  size,
  keepSize = false,
  throb = false,
  hovered = false,
}: {
  name: string;
  focused: boolean;
  size: number;
  keepSize?: boolean;
  /** pulse between the dim and lit looks while focused (column icons only) */
  throb?: boolean;
  /** the pointer is over this icon's row: show the lit look */
  hovered?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scale, compact } = useMetrics();
  const light = useIconLight({
    focused,
    hovered,
    throb,
    keepSize,
    dimOpacity: DIM,
    // no extra blur on a phone: the 64px raster already matches the PSP art's
    // own softness, and piling a filter blur on top is what over-softened it
    prefix: compact ? "" : `blur(${softBlurPx(scale).toFixed(2)}px) `,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const draw = () => {
      if (cancelled) return;
      // Fixed at the PSP art's resolution: see NATIVE. Deliberately NOT tied
      // to size/DPR: matching the PNGs matters more than matching the screen.
      const buf = NATIVE;
      canvas.width = buf;
      canvas.height = buf;
      ctx.clearRect(0, 0, buf, buf);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // NB: a 2D context has no font-variation-settings, so this draws the
      // font's default instance: no weight, grade or fill can be applied here.
      ctx.font = `${Math.round(buf * GLYPH)}px ${FONT}`;
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
  }, [name]);

  return (
    <motion.canvas
      ref={canvasRef}
      style={{ height: size, width: size, imageRendering: "auto" }}
      initial={false}
      animate={light.animate}
      transition={light.transition}
    />
  );
}
