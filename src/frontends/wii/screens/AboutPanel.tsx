import { profile, projects, experience } from "@content/index";
import styles from "@wii/wii.module.css";

/**
 * What the disc slot plays: the owner. Sits inside the channel screen's banner
 * so the disc behaves like every other channel rather than being a special case.
 */
export function AboutPanel() {
  const years = new Date().getFullYear() - 2019;
  const name = profile.name
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100%", padding: "1.5em" }}>
      <div className={styles.about}>
        <h1>{name}</h1>
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
