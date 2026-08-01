import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { PspIcon } from "./PspIcon";
import { MaterialIcon } from "./MaterialIcon";

/**
 * Picks the renderer from the icon string:
 *   "g:rocket_launch" -> Google Material Symbol
 *   "game"            -> authentic PSP icon PNG
 * Both render with the same body/focus (dim -> lit) behaviour.
 *
 * In crisp fidelity everything goes through the Material renderer: the PSP art
 * only exists at its original handheld resolution, so it can't be shown without
 * the upscale that mode is there to avoid. The stand-in for each PSP icon comes
 * from the model's `iconAlt`.
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
  const crisp = useMenu((s) => s.settings.fidelity) === "crisp";
  const { iconAlt } = useMenuModel();

  const resolved = crisp && !icon.startsWith("g:") ? iconAlt?.[icon] ?? "g:widgets" : icon;

  if (resolved.startsWith("g:")) {
    return (
      <MaterialIcon
        name={resolved.slice(2)}
        focused={focused}
        size={size}
        className={className}
        keepSize={keepSize}
        throb={throb}
        hovered={hovered}
        crisp={crisp}
      />
    );
  }
  return (
    <PspIcon
      name={resolved}
      focused={focused}
      size={size}
      className={className}
      keepSize={keepSize}
      throb={throb}
      hovered={hovered}
    />
  );
}
