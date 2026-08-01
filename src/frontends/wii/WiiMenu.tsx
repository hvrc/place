import { useCallback, useEffect, useState } from "react";
import { type Channel } from "./channels";
import { ChannelGrid } from "./menu/ChannelGrid";
import { ChannelScreen } from "./screens/ChannelScreen";
import { DataScreen } from "./screens/DataScreen";
import { MessageBoard } from "./board/MessageBoard";
import { SettingsScreen } from "./settings/SettingsScreen";
import { CurvedBar } from "./ui/CurvedBar";
import { Clock } from "./ui/Clock";
import { Orb } from "./ui/Orb";
import { Pointer, useHandCursor } from "./ui/Pointer";
import { MailMark, SdMark, WiiMark } from "./ui/glyphs";
import { useWiiSound } from "./sound/useWiiSound";
import { letters } from "./board/letters";
import { useWii } from "./state";
import styles from "./wii.module.css";

type Screen = "menu" | "channel" | "board" | "settings" | "data";

/** No pointer or key for this long and the menu dims itself, as the console does. */
const BURN_IN_MS = 60_000;

/**
 * The Wii frontend.
 *
 * One screen at a time, swapped in place — the console has no history stack, so
 * neither does this. The grid, the channel screen, the message board, System
 * Settings and the SD card are all siblings here; each is self-contained and
 * takes only the callbacks it needs to hand control back.
 */
export default function WiiMenu() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [page, setPage] = useState(0);
  const [flash, setFlash] = useState(0);

  const aspect = useWii((s) => s.settings.aspect);
  const burnInOn = useWii((s) => s.settings.burnIn);
  const read = useWii((s) => s.read);
  const visit = useWii((s) => s.visit);
  const { play, wake } = useWiiSound();
  const handCursor = useHandCursor();

  const unread = letters.filter((l) => !read.includes(l.id)).length;

  /* Every screen change gets the console's white blink. */
  const go = useCallback((next: Screen) => {
    setScreen(next);
    setFlash((n) => n + 1);
  }, []);

  const openChannel = useCallback(
    (c: Channel) => {
      play("select");
      visit(c.id);
      setChannel(c);
      go("channel");
    },
    [go, play, visit]
  );

  const backToMenu = useCallback(() => {
    play("back");
    go("menu");
  }, [go, play]);

  const changePage = useCallback(
    (p: number) => {
      if (p === page) return;
      play("page");
      setPage(p);
    },
    [page, play]
  );

  /* Paint the document — and Safari's chrome — the menu's own grey while it's
     mounted, so the safe areas and the collapsing toolbar don't show white. */
  useEffect(() => {
    const base = "#e7eaec";
    const root = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const before = { html: root.style.background, body: document.body.style.background, meta: meta?.content };
    root.style.background = base;
    document.body.style.background = base;
    if (meta) meta.content = base;
    return () => {
      root.style.background = before.html;
      document.body.style.background = before.body;
      if (meta && before.meta !== undefined) meta.content = before.meta;
    };
  }, []);

  /* Screen burn-in reduction. */
  const [dim, setDim] = useState(false);
  useEffect(() => {
    if (!burnInOn) {
      setDim(false);
      return;
    }
    let id = window.setTimeout(() => setDim(true), BURN_IN_MS);
    const stir = () => {
      setDim(false);
      window.clearTimeout(id);
      id = window.setTimeout(() => setDim(true), BURN_IN_MS);
    };
    window.addEventListener("pointermove", stir, { passive: true });
    window.addEventListener("keydown", stir);
    window.addEventListener("pointerdown", stir);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("pointermove", stir);
      window.removeEventListener("keydown", stir);
      window.removeEventListener("pointerdown", stir);
    };
  }, [burnInOn]);

  return (
    <div
      className={[
        styles.root,
        handCursor ? styles.pointerHidden : "",
        aspect === "standard" ? styles.pillarbox : "",
        dim ? styles.dim : "",
      ].join(" ")}
      onPointerDown={wake}
    >
      <div className={styles.screen}>
        {screen === "menu" && (
          <>
            <ChannelGrid
              page={page}
              setPage={changePage}
              onOpen={openChannel}
              onHover={(c) => c && play("hover")}
            />
            <CurvedBar
              left={
                <>
                  <Orb aria-label="Wii System Settings" onClick={() => { play("select"); go("settings"); }}>
                    <WiiMark style={{ width: "52%" }} />
                  </Orb>
                  <Orb small aria-label="SD Card" onClick={() => { play("select"); go("data"); }}>
                    <SdMark style={{ width: "58%" }} />
                  </Orb>
                </>
              }
              centre={<Clock />}
              right={
                <Orb
                  aria-label="Wii Message Board"
                  badge={unread}
                  badgeUnread={unread > 0}
                  onClick={() => { play("select"); go("board"); }}
                >
                  <MailMark style={{ width: "46%" }} />
                </Orb>
              }
            />
          </>
        )}

        {screen === "channel" && channel && (
          <ChannelScreen
            channel={channel}
            onBack={backToMenu}
            onGo={(c) => {
              play("page");
              visit(c.id);
              setChannel(c);
            }}
          />
        )}

        {screen === "board" && <MessageBoard onExit={backToMenu} />}

        {screen === "settings" && (
          <SettingsScreen onExit={backToMenu} openData={() => go("data")} />
        )}

        {screen === "data" && <DataScreen onExit={backToMenu} />}
      </div>

      {flash > 0 && <div key={flash} className={styles.flash} />}
      <Pointer />
    </div>
  );
}
