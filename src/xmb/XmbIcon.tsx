import { PspIcon } from "./PspIcon";
import { PixelIcon } from "./PixelIcon";

/**
 * Picks the renderer from the icon string:
 *   "g:rocket_launch" -> Google Material Symbol (rasterised low-res)
 *   "game"            -> authentic PSP icon PNG
 * Both render with the same body/focus (small+dim -> full+lit) behaviour.
 */
export function XmbIcon({
  icon,
  focused,
  size,
  className,
  keepSize = false,
}: {
  icon: string;
  focused: boolean;
  size: number;
  className?: string;
  keepSize?: boolean;
}) {
  if (icon.startsWith("g:")) {
    return (
      <PixelIcon
        name={icon.slice(2)}
        focused={focused}
        size={size}
        className={className}
        keepSize={keepSize}
      />
    );
  }
  return (
    <PspIcon name={icon} focused={focused} size={size} className={className} keepSize={keepSize} />
  );
}
