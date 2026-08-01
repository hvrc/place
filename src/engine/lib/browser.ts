// Small browser-facing helpers shared across the menu, each guarded for the
// no-window case so components can call them freely during render.

/** Viewport width, falling back to a typical desktop when there's no window. */
export function viewportWidth(): number {
  return typeof window === "undefined" ? 1440 : window.innerWidth;
}

/** Clamp `v` into [lo, hi]. */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Whether the OS asks for reduced motion. A one-shot read for non-React
 * callers; components inside the tree should prefer Framer's useReducedMotion,
 * which also reacts to the preference changing.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Everything leaves in its own tab, so the menu is still here when you return. */
export function openTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Clipboard write, falling back for browsers/contexts without the async API. */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* fall through to the textarea trick */
    }
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  el.remove();
}
