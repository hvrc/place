import { PspIcon } from "./PspIcon";
import { MaterialIcon } from "./MaterialIcon";

/**
 * Picks the renderer from the icon string:
 *   "g:rocket_launch" -> Google Material Symbol (rasterised low-res)
 *   "game"            -> authentic PSP icon PNG
 * Both render with the same body/focus (small+dim -> full+lit) behaviour.
 */
export function Icon({
  icon,
  focused,
  size,
  className,
  keepSize = false,
  throb = false,
  hovered = false,
}: {
  icon: string;
  focused: boolean;
  size: number;
  className?: string;
  keepSize?: boolean;
  /** pulse between the dim and lit looks while focused (column icons only) */
  throb?: boolean;
  /** the pointer is over this icon's row — show the lit look */
  hovered?: boolean;
}) {
  if (icon.startsWith("g:")) {
    // "g:name", "g:name@700", or "g:name@700,200" (weight, grade) — for
    // detail-heavy glyphs that need heavier strokes at our low resolution
    const [name, spec] = icon.slice(2).split("@");
    const [w, g] = (spec ?? "").split(",");
    return (
      <MaterialIcon
        name={name}
        weight={w ? Number(w) : undefined}
        grade={g ? Number(g) : undefined}
        focused={focused}
        size={size}
        className={className}
        keepSize={keepSize}
        throb={throb}
        hovered={hovered}
      />
    );
  }
  return (
    <PspIcon
      name={icon}
      focused={focused}
      size={size}
      className={className}
      keepSize={keepSize}
      throb={throb}
      hovered={hovered}
    />
  );
}
