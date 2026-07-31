import { AnimatePresence, motion } from "framer-motion";
import { categories } from "@/xmb/xmbData";
import { useXmb } from "@/xmb/xmbStore";
import { profile } from "@/data/socials";
import { ProjectMedia } from "@/components/ProjectMedia";
import styles from "./Xmb.module.css";

export function XmbInfoPanel() {
  const categoryIndex = useXmb((s) => s.categoryIndex);
  const activeItem = useXmb((s) => s.itemIndexByCategory[s.categoryIndex] ?? 0);
  const settings = useXmb((s) => s.settings);

  const category = categories[categoryIndex];
  const item = category.items[activeItem];

  return (
    <div className={styles.panelWrap}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${category.id}:${item.id}`}
          className={styles.panel}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {category.id === "settings" ? (
            <SettingsDetail id={item.id} settings={settings} />
          ) : (
            <ItemDetail item={item} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ItemDetail({ item }: { item: (typeof categories)[number]["items"][number] }) {
  const d = item.detail;

  if (d.kind === "profile") {
    return (
      <div>
        <div className={styles.panelTitle}>{profile.name}</div>
        <p className={styles.panelBody}>{profile.bio}</p>
        <div style={{ marginTop: "1rem" }}>
          <span className={styles.pill}>{profile.email}</span>
        </div>
      </div>
    );
  }

  if (d.kind === "project") {
    const p = d.project;
    return (
      <div>
        {p.media && (
          <div className={styles.panelMedia}>
            <ProjectMedia media={p.media} />
          </div>
        )}
        <div className={styles.panelTitle}>{p.title}</div>
        <p className={styles.panelBody} dangerouslySetInnerHTML={{ __html: p.description }} />
        <div>
          {p.link && (
            <a className={styles.pill} href={p.link} target="_blank" rel="noopener noreferrer">
              {p.internal ? "Open ▸" : "Live ▸"}
            </a>
          )}
          {p.github && (
            <a className={styles.pill} href={p.github} target="_blank" rel="noopener noreferrer">
              Github ▸
            </a>
          )}
          {p.download && (
            <a className={styles.pill} href={p.download} target="_blank" rel="noopener noreferrer">
              Download ▸
            </a>
          )}
        </div>
      </div>
    );
  }

  if (d.kind === "role") {
    const r = d.role;
    return (
      <div>
        {r.logo && (
          <img
            src={r.logo}
            alt={r.company}
            style={{ height: 48, marginBottom: "0.8rem", objectFit: "contain" }}
          />
        )}
        <div className={styles.panelTitle}>{r.title}</div>
        <p className={styles.panelBody}>
          <strong>{r.company}</strong>
          <br />
          {r.period}
          <br />
          {r.location}
        </p>
      </div>
    );
  }

  // link or app
  return (
    <div>
      <div className={styles.panelTitle}>{item.label}</div>
      <p className={styles.panelBody}>{"blurb" in d ? d.blurb : ""}</p>
      <div>
        <span className={styles.pill}>Press Enter ▸</span>
      </div>
    </div>
  );
}

function SettingsDetail({
  id,
  settings,
}: {
  id: string;
  settings: ReturnType<typeof useXmb.getState>["settings"];
}) {
  const map: Record<string, { title: string; value: string; hint: string }> = {
    theme: {
      title: "Theme",
      value: settings.theme,
      hint: "Press Enter to toggle light / dark",
    },
    wave: {
      title: "Wave color",
      value: `hue ${settings.waveHue}°`,
      hint: "Press ← / → or Enter to shift the wave hue",
    },
    uiVolume: {
      title: "UI volume",
      value: `${settings.uiVolume}%`,
      hint: "Press Enter to cycle the UI sound volume",
    },
    musicVolume: {
      title: "Music volume",
      value: `${settings.musicVolume}%`,
      hint: "Press Enter to cycle the music volume",
    },
    motion: {
      title: "Reduce motion",
      value: settings.reduceMotion ? "on" : "off",
      hint: "Press Enter to freeze the wave & transitions",
    },
  };
  const s = map[id] ?? { title: id, value: "", hint: "" };
  return (
    <div>
      <div className={styles.panelTitle}>{s.title}</div>
      <p className={styles.panelBody}>
        Current: <span className={styles.toggleVal}>{s.value}</span>
      </p>
      <p className={styles.panelBody} style={{ marginTop: "0.8rem", opacity: 0.7 }}>
        {s.hint}
      </p>
    </div>
  );
}
