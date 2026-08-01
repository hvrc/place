import { useEffect, useState } from "react";
import { Battery } from "./Battery";
import styles from "@engine/styles/menu.module.css";

// Built once: constructing a formatter per tick is the expensive part of
// toLocaleTimeString, and this only ever renders hours and minutes.
const TIME = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" });

const stamp = (d: Date) => `${d.getMonth() + 1}/${d.getDate()} ${TIME.format(d)}`;

function useClock() {
  const [label, setLabel] = useState(() => stamp(new Date()));
  useEffect(() => {
    // ticks every second, but 59 in 60 produce the same string: only commit
    // the ones that actually change, so the chrome doesn't re-render for nothing
    const id = setInterval(() => {
      const next = stamp(new Date());
      setLabel((prev) => (prev === next ? prev : next));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}

/** Top-right clock + PSP battery, as on the XMB. */
export function Clock() {
  const clock = useClock();
  return (
    <div className={styles.clock}>
      <span>{clock}</span>
      <Battery className={styles.battery} />
    </div>
  );
}
