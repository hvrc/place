import { useEffect, useState } from "react";
import { Battery } from "./Battery";
import styles from "@engine/styles/menu.module.css";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const date = `${now.getMonth() + 1}/${now.getDate()}`;
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${date} ${time}`;
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
