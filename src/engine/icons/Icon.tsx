import { PspIcon } from "./PspIcon";
import { MaterialIcon } from "./MaterialIcon";

/**
 * Picks the renderer from the icon string:
 *   "g:rocket_launch" -> Google Material Symbol
 *   "game"            -> authentic PSP icon PNG
 * Both render with the same body/focus (dim -> lit) behaviour.
 */
export function Icon({
  icon,
  focused,
  size,
  keepSize = false,
  throb = false,
  hovered = false,
}: {
  icon: string;
  focused: boolean;
  size: number;
  keepSize?: boolean;
  /** pulse between the dim and lit looks while focused (column icons only) */
  throb?: boolean;
  /** the pointer is over this icon's row: show the lit look */
  hovered?: boolean;
}) {
  if (icon.startsWith("g:")) {
    return (
      <MaterialIcon
        name={icon.slice(2)}
        focused={focused}
        size={size}
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
      keepSize={keepSize}
      throb={throb}
      hovered={hovered}
    />
  );
}
