import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMenu, useMenuModel } from "@engine/state/MenuContext";
import { NOTE_SLOT } from "@engine/model/types";
import { useScramble } from "@engine/text/useScramble";
import { useMetrics } from "@engine/layout/metrics";
import styles from "@engine/styles/menu.module.css";

const CYCLE_MS = 3000;

/**
 * The focused item's note, set in the open area right of the item column (where
 * a dwell backdrop would otherwise play). The block is anchored to the pivot
 * row, so its first line reads across from the item you're resting on.
 *
 * The text is selectable, and clicking it activates the item (the Email note is
 * the address itself — clicking copies it). `flash` briefly replaces the note
 * with a confirmation.
 */
export function ItemNote({
  flash,
  introStagger,
  onActivate,
}: {
  flash?: { id: string; text: string } | null;
  introStagger?: { base: number; step: number } | null;
  onActivate?: (index: number) => void;
}) {
  const { categories } = useMenuModel();
  const openGroup = useMenu((s) => s.openGroup);
  const categoryIndex = useMenu((s) => s.categoryIndex);
  const itemIndex = useMenu((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const { compact } = useMetrics();

  const item = categories[categoryIndex]?.items[itemIndex];
  // drilled-in leaves have their own right-hand column (the thumbnail strip)
  const note = openGroup ? undefined : item?.note;
  const flashing = !!note && flash?.id === item?.id;
  const shown = flashing ? { lines: [flash!.text], cycle: undefined } : note;

  // Rotate the cycled words forever while this note is up.
  const cycle = shown?.cycle;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!cycle || cycle.length < 2) return;
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), note?.cycleMs ?? CYCLE_MS);
    return () => clearInterval(id);
  }, [cycle, note?.cycleMs]);
  const word = cycle?.length ? cycle[tick % cycle.length] : "";
  const scrambled = useScramble(word);
  const slotWidth = cycle?.length ? Math.max(...cycle.map((w) => w.length)) : 0;

  // On first load, ride in with the icon this note belongs to rather than
  // arriving ahead of a column that is still cascading in.
  const delay = introStagger ? introStagger.base + itemIndex * introStagger.step : 0;
  const interactive = !!(item?.action || item?.setting) && !!onActivate;

  // A click that ends a text selection is the user selecting, not activating.
  const click = () => {
    if (!interactive) return;
    if (window.getSelection()?.toString()) return;
    onActivate!(itemIndex);
  };

  const renderLine = (line: string) => {
    const at = line.indexOf(NOTE_SLOT);
    if (at === -1 || !word) return line;
    return (
      <>
        {line.slice(0, at)}
        {/* held at the width of the longest word so the line never reflows */}
        <span className={styles.noteWord} style={{ minWidth: `${slotWidth}ch` }}>
          {scrambled}
        </span>
        {line.slice(at + NOTE_SLOT.length)}
      </>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {shown && (
        <motion.div
          key={`${item?.id}:${flashing ? "flash" : "note"}`}
          className={`${styles.note} ${compact ? styles.noteCompact : ""} ${
            interactive ? styles.noteClickable : ""
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay }}
          onClick={click}
        >
          {shown.lead && <span>{shown.lead}</span>}
          <span className={styles.noteLines}>
            {shown.lines.map((line) => (
              <span key={line}>{renderLine(line)}</span>
            ))}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
