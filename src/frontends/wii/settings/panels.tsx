import type { ReactNode } from "react";
import { useWii, type WiiSettings } from "@wii/state";
import { profile, socials } from "@content/index";
import { openTab } from "@engine/lib/browser";
import { Pill } from "@wii/ui/Pill";
import styles from "@wii/wii.module.css";

// Wii System Settings. Pages one and two are the settings that actually do
// something; page three keeps the console's own third page (Language, Country,
// Wii System Update, Format Wii System Memory) because that page is half the
// reason anyone remembers this screen.

export interface PanelProps {
  /** Leave the panel, back to the settings list. */
  close: () => void;
  /** Hand off to the SD card's data screen. */
  openData: () => void;
  /** Ask for the format confirmation. */
  format: () => void;
}

export interface SettingsItem {
  id: string;
  label: string;
  title: string;
  Body: (props: PanelProps) => ReactNode;
}

/* ── small controls ─────────────────────────────────────────────────────── */

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>
        {label}
        {hint && <span className={styles.rowHint}>{hint}</span>}
      </span>
      {children}
    </div>
  );
}

function Segment<T extends string | boolean>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <span className={styles.segment}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={o.value === value ? styles.on : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}

function Slider({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.8em" }}>
      <input
        className={styles.slider}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span style={{ width: "2.4em", textAlign: "right" }}>{value}</span>
    </span>
  );
}

/** Bind a settings field to a control without re-reading the whole store. */
function useField<K extends keyof WiiSettings>(key: K): [WiiSettings[K], (v: WiiSettings[K]) => void] {
  const value = useWii((s) => s.settings[key]);
  const set = useWii((s) => s.set);
  return [value, (v) => set(key, v)];
}

/* ── panels ─────────────────────────────────────────────────────────────── */

function ScreenPanel() {
  const [aspect, setAspect] = useField("aspect");
  const [burnIn, setBurnIn] = useField("burnIn");
  return (
    <div className={styles.panel}>
      <p>How the menu fills your television.</p>
      <Row label="Screen Position" hint="Widescreen (16:9) or pillarboxed (4:3)">
        <Segment
          value={aspect}
          onChange={setAspect}
          options={[
            { value: "wide" as const, label: "16:9" },
            { value: "standard" as const, label: "4:3" },
          ]}
        />
      </Row>
      <Row label="Screen Burn-in Reduction" hint="Dims the menu after a minute of stillness">
        <Segment
          value={burnIn}
          onChange={setBurnIn}
          options={[
            { value: true, label: "On" },
            { value: false, label: "Off" },
          ]}
        />
      </Row>
    </div>
  );
}

function SoundPanel() {
  const [music, setMusic] = useField("musicVolume");
  const [sfx, setSfx] = useField("sfxVolume");
  return (
    <div className={styles.panel}>
      <p>The menu theme is synthesised in the browser: nothing is downloaded.</p>
      <Row label="Menu Music">
        <Slider value={music} onChange={setMusic} label="Menu music volume" />
      </Row>
      <Row label="Menu Sounds">
        <Slider value={sfx} onChange={setSfx} label="Menu sound volume" />
      </Row>
    </div>
  );
}

function PointerPanel() {
  const [pointer, setPointer] = useField("pointer");
  const [tilt, setTilt] = useField("pointerTilt");
  return (
    <div className={styles.panel}>
      <p>The hand on screen is your Wii Remote. It banks the way your wrist does.</p>
      <Row label="Pointer" hint="Replaces the mouse cursor">
        <Segment
          value={pointer}
          onChange={setPointer}
          options={[
            { value: true, label: "Hand" },
            { value: false, label: "Cursor" },
          ]}
        />
      </Row>
      <Row label="Tilt" hint="How far the hand rolls as it moves">
        <Slider value={tilt} onChange={setTilt} label="Pointer tilt" />
      </Row>
    </div>
  );
}

function CalendarPanel() {
  const [clock24, setClock24] = useField("clock24");
  return (
    <div className={styles.panel}>
      <p>The clock on the bar reads your device's time.</p>
      <Row label="Time Format">
        <Segment
          value={clock24}
          onChange={setClock24}
          options={[
            { value: false, label: "12-hour" },
            { value: true, label: "24-hour" },
          ]}
        />
      </Row>
    </div>
  );
}

function InternetPanel() {
  return (
    <div className={styles.panel}>
      <p>
        This console is online. Every channel on page one loads its project live over the
        connection you're already using.
      </p>
      <div className={styles.sheetActions} style={{ justifyContent: "flex-start" }}>
        {socials
          .filter((s) => !s.internal)
          .map((s) => (
            <Pill key={s.id} onClick={() => openTab(s.href)}>
              {s.label}
            </Pill>
          ))}
      </div>
    </div>
  );
}

function DataPanel({ openData }: PanelProps) {
  return (
    <div className={styles.panel}>
      <p>Save data, downloads and the files this console carries around.</p>
      <div className={styles.sheetActions} style={{ justifyContent: "flex-start" }}>
        <Pill onClick={openData}>Open SD Card</Pill>
      </div>
    </div>
  );
}

function ConsolePanel() {
  return (
    <div className={styles.panel}>
      <h3>Console Information</h3>
      <Row label="Owner">{profile.name}</Row>
      <Row label="Menu Version">4.3H: Wii frontend</Row>
      <Row label="Region">NTSC-U / Toronto</Row>
      <Row label="Built with">React · Vite · a lot of reference screenshots</Row>
    </div>
  );
}

function LanguagePanel() {
  return (
    <div className={styles.panel}>
      <p>Only one is installed.</p>
      <Row label="Language">English</Row>
      <Row label="Also spoken" hint="Not selectable from this menu">
        Hindi · Marathi · Python
      </Row>
    </div>
  );
}

function CountryPanel() {
  return (
    <div className={styles.panel}>
      <p>Where this console lives.</p>
      <Row label="Country">Canada</Row>
      <Row label="City">Toronto</Row>
      <Row label="Previously">Mumbai, India</Row>
    </div>
  );
}

function UpdatePanel() {
  return (
    <div className={styles.panel}>
      <h3>Wii System Update</h3>
      <p>
        Your Wii console is up to date. New channels arrive whenever the next project ships. The
        Mii, Forecast and Photo Channels on page two are still downloading.
      </p>
    </div>
  );
}

function FormatPanel({ format }: PanelProps) {
  return (
    <div className={styles.panel}>
      <h3>Format Wii System Memory</h3>
      <p>
        This erases the settings, the read marks on the message board and the channel history
        saved in this browser. The projects themselves are, thankfully, not stored here.
      </p>
      <div className={styles.sheetActions} style={{ justifyContent: "flex-start" }}>
        <Pill onClick={format}>Format</Pill>
      </div>
    </div>
  );
}

/* ── the three pages ────────────────────────────────────────────────────── */

export const SETTINGS_PAGES: SettingsItem[][] = [
  [
    { id: "screen", label: "Screen", title: "Screen", Body: ScreenPanel },
    { id: "sound", label: "Sound", title: "Sound", Body: SoundPanel },
    { id: "pointer", label: "Wii Remote", title: "Wii Remote", Body: PointerPanel },
    { id: "internet", label: "Internet", title: "Internet", Body: InternetPanel },
  ],
  [
    { id: "calendar", label: "Calendar", title: "Calendar", Body: CalendarPanel },
    { id: "data", label: "Data Management", title: "Data Management", Body: DataPanel },
    { id: "console", label: "Console Information", title: "Console Information", Body: ConsolePanel },
  ],
  [
    { id: "language", label: "Language", title: "Language", Body: LanguagePanel },
    { id: "country", label: "Country", title: "Country", Body: CountryPanel },
    { id: "update", label: "Wii System Update", title: "Wii System Update", Body: UpdatePanel },
    {
      id: "format",
      label: "Format Wii System Memory",
      title: "Format Wii System Memory",
      Body: FormatPanel,
    },
  ],
];
