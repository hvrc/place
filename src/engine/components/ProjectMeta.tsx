import { createPortal } from "react-dom";
import { useMenu } from "@engine/state/MenuContext";
import { useSound } from "@engine/sound/useSound";
import { openTab } from "@engine/lib/browser";
import type { DrillItem } from "@engine/model/types";
import styles from "@engine/styles/menu.module.css";

/**
 * The selected project's title, blurb and links: beside the blown-up thumbnail
 * on a wide screen, pinned along the bottom of a phone where there's no room
 * next to it.
 *
 * The compact form is portalled to <body> on purpose. It would otherwise sit
 * inside the thumbnail row, which carries a Framer transform, and a
 * transformed ancestor becomes the containing block for position:fixed, so it
 * would anchor to the row instead of the viewport.
 */
export function ProjectMeta({
  item,
  compact,
  ruleWidth,
  style,
}: {
  item: DrillItem;
  compact: boolean;
  /** width of the title rule when set beside the thumbnail */
  ruleWidth: string;
  style?: React.CSSProperties;
}) {
  const actionIndex = useMenu((s) => s.drillActionIndex);
  const setDrillAction = useMenu((s) => s.setDrillAction);
  const { play } = useSound();

  // the hints are indexed in the order they're shown, matching
  // drillActionTargets(): that index is what ←/→ walk along
  const openIdx = item.link ? 0 : -1;
  const ghIdx = item.github ? (item.link ? 1 : 0) : -1;
  const hint = (idx: number, url: string, extra?: string) => (
    <button
      className={`${styles.pmHint} ${extra ?? ""} ${actionIndex === idx ? styles.pmHintOn : ""}`}
      onClick={() => {
        setDrillAction(idx);
        play("enter");
        openTab(url);
      }}
    >
      {idx === ghIdx ? "github" : "open"}
    </button>
  );

  const block = (
    <div
      className={`${styles.pmMeta} ${compact ? styles.pmMetaCompact : ""}`}
      style={compact ? undefined : style}
    >
      {/* the links ride on the title's line, set back from it */}
      <div className={styles.pmTitleRow}>
        <span className={styles.pmTitle}>{item.title}</span>
        <span className={styles.pmHints}>
          {item.link && hint(openIdx, item.link)}
          {item.github && hint(ghIdx, item.github, styles.pmHintGithub)}
        </span>
      </div>
      {/* full width along the bottom; measured out to the screen edge beside a thumbnail */}
      <div className={styles.pmRule} style={compact ? undefined : { width: ruleWidth }} />
      {item.blurb && <div className={styles.pmBlurb}>{item.blurb}</div>}
    </div>
  );

  return compact ? createPortal(block, document.body) : block;
}
