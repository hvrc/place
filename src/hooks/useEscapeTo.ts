import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Navigate to `target` when Escape is pressed. Used by immersive app routes
 *  (hom, prim) so they return to the XMB menu, matching the PSP back button. */
export function useEscapeTo(target: string) {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate(target);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, target]);
}
