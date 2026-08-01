// Small browser-facing helpers shared across the menu, each guarded for the
// no-window case so components can call them freely during render.

/** Viewport width, with the design width as a stand-in when there's no window. */
export function viewportWidth(fallback = 1440): number {
  return typeof window === "undefined" ? fallback : window.innerWidth;
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
