import { useEffect, useState } from "react";
import { useWii } from "@wii/state";
import styles from "@wii/wii.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The bar's clock: big thin numerals with a colon that blinks once a second,
 * and the abbreviated date beneath — `Tue 5/31`, exactly the real format.
 */
export function Clock() {
  const clock24 = useWii((s) => s.settings.clock24);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Tick on the half-second so the colon's off-beat lands mid-second, the
    // way the console's does, without a second timer.
    const id = window.setInterval(() => setNow(new Date()), 500);
    return () => window.clearInterval(id);
  }, []);

  const hours24 = now.getHours();
  const hours = clock24 ? hours24 : hours24 % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const colonOff = now.getSeconds() % 2 === 1 && now.getMilliseconds() < 500;

  return (
    <div>
      <div className={styles.clock}>
        <span className={styles.clockTime}>
          {clock24 ? String(hours).padStart(2, "0") : hours}
          <span className={[styles.colon, colonOff ? styles.off : ""].join(" ")}>:</span>
          {minutes}
        </span>
        {!clock24 && <span className={styles.clockMeridiem}>{hours24 < 12 ? "AM" : "PM"}</span>}
      </div>
      <div className={styles.clockDate}>
        {DAYS[now.getDay()]} {now.getMonth() + 1}/{now.getDate()}
      </div>
    </div>
  );
}
