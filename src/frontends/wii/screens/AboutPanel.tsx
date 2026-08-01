import { useEffect, useState } from "react";
import { profile, projects, experience } from "@content/index";
import styles from "@wii/wii.module.css";

/** How long each word in the About line holds before the next one takes over. */
const CYCLE_MS = 2200;

/**
 * What the disc slot plays: the owner. Sits inside the channel screen's banner
 * so the disc behaves like every other channel rather than being a special case.
 */
export function AboutPanel() {
  const years = new Date().getFullYear() - 2019;
  const name = profile.name
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // The content layer's rotating line, "Harsh Rajmachikar is making {}",
  // shared with the other frontends.
  const words = profile.about.cycle;
  const [word, setWord] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setWord((w) => (w + 1) % words.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100%", padding: "1.5em" }}>
      <div className={styles.about}>
        <h1>{name}</h1>
        <p className={styles.aboutLine}>
          {profile.about.lines[0].split("{}")[0]}
          <b key={word} className={styles.cycleWord}>
            {words[word]}
          </b>
        </p>
        <p>{profile.bio}</p>
        <div className={styles.aboutStats}>
          <Stat value={String(projects.length)} label="Projects" />
          <Stat value={String(experience.length)} label="Roles" />
          <Stat value={`${years}+`} label="Years" />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
