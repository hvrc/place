import { channels } from "@wii/channels";
import { projects, profile } from "@content/index";
import { useWii } from "@wii/state";
import { Pill } from "@wii/ui/Pill";
import { FileMark } from "@wii/ui/glyphs";
import { openTab } from "@engine/lib/browser";
import styles from "@wii/wii.module.css";

/**
 * The SD card slot: Data Management. On the console this is where saves and
 * downloaded channels live; here it's the things you can actually take away —
 * the resume, the release builds — plus the save data this browser has made by
 * opening channels.
 */
export function DataScreen({ onExit }: { onExit: () => void }) {
  const visited = useWii((s) => s.visited);

  const downloads = projects
    .filter((p) => p.download)
    .map((p) => ({
      id: p.id,
      name: `${p.title}.zip`,
      hint: "Release build",
      size: "1 block",
      href: p.download!,
    }));

  const files = [
    {
      id: "resume",
      name: "resume.pdf",
      hint: `${profile.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} — one page`,
      size: "2 blocks",
      href: "/files/resume.pdf",
    },
    ...downloads,
    {
      id: "source",
      name: "place.git",
      hint: "The source of this console",
      size: "48 blocks",
      href: "https://github.com/hvrc/place",
    },
  ];

  return (
    <div className={`${styles.settings} ${styles.fade}`}>
      <div className={styles.settingsHead}>
        <span className={styles.settingsTab}>Data Management</span>
      </div>

      <div className={styles.settingsBody} style={{ alignContent: "center" }}>
        <div className={styles.files}>
          {files.map((f) => (
            <button key={f.id} type="button" className={styles.file} onClick={() => openTab(f.href)}>
              <FileMark className={styles.fileIcon} />
              <span className={styles.fileMeta}>
                {f.name}
                <small>{f.hint}</small>
              </span>
              <span className={styles.fileSize}>{f.size}</span>
            </button>
          ))}

          <div className={styles.row} style={{ marginTop: "0.6em" }}>
            <span className={styles.rowLabel}>
              Save Data
              <span className={styles.rowHint}>
                {visited.length
                  ? visited
                      .map((id) => channels.find((c) => c.id === id)?.title ?? id)
                      .slice(0, 6)
                      .join(" · ")
                  : "No channels opened yet on this console."}
              </span>
            </span>
            <span className={styles.fileSize}>{visited.length} blocks</span>
          </div>
        </div>
      </div>

      <div className={styles.settingsFoot}>
        <Pill onClick={onExit}>Back</Pill>
      </div>
    </div>
  );
}
