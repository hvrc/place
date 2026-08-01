# Branch `wii` — the Wii Menu frontend

A third frontend alongside `classic` and `psp`, mounted at **`/wii`**. It reads the same
`src/content` data layer as the others — no portfolio facts live in the Wii code.

```bash
npm run dev
#   /       PSP XMB menu (unchanged)
#   /wii    the Wii Menu
#   /hom /prim /resume   the "apps", also framed inside Wii channels
```

## Layout of the code

```
src/frontends/wii/
  WiiMenu.tsx          screen state machine + the menu's own bottom bar
  channels.ts          portfolio → a flat, ordered list of channels, chunked into pages
  state.ts             persisted System Settings, read letters, channel history
  wii.module.css       the whole visual language
  ui/                  primitives every screen reuses
    glyphs.tsx           Wii wordmark, SD card, envelope, triangles, the hand cursor
    CurvedBar.tsx        the white band with the S-curve top edge (left/centre/right wells)
    Clock.tsx            blinking-colon clock + abbreviated date
    Orb.tsx  Pill.tsx    the round corner buttons and the capsule buttons
    Pointer.tsx          the Wii-remote hand: trails the cursor, banks into the turn
  menu/
    ChannelGrid.tsx      the sliding track of pages, arrows, page dots
    ChannelTile.tsx      one tile: pop, parallax tilt, name bubble
    ChannelArt.tsx       video / image / drawn-tile artwork, and the empty "Wii" slot
    ChannelZoom.tsx      the tile leaping off the grid when you open a channel
  screens/
    ChannelScreen.tsx    banner + reflection + Wii Menu / Start / Github
    AboutPanel.tsx       what the disc slot plays
    DataScreen.tsx       the SD card: downloads and save data
  board/                 the message board and its letters
  settings/              the black System Settings screens and their panels
  sound/                 synthesised menu music and interface blips
```

## The grid

Three pages of twelve slots, filled in this order:

| Page | Slots |
| --- | --- |
| 1 | Disc (About) · Carrom · Boteh · hom · RTS · Game of Life · Bunshi · Newsletter · Loan Reports · Shutdown Scheduler · Midi Controller · PNG → PLT |
| 2 | Prim's Organism · Iseehear · Getafix · Healthy Planet · Gromor · Mii / Forecast / Photo Channel (not built yet) |
| 3 | empty — room to grow |

Project order is the legacy site's display order, kept in `PROJECT_ORDER` in `channels.ts`.
Adding a project to `src/content/projects.ts` puts it on the menu automatically (last, unless
it's added to that list); adding a role adds a channel after the projects.

Portrait phones lay the same twelve slots out 2×6 instead of 4×3, so a channel never changes
page when the device turns.

## The channel screen

The banner **is** the project: anything that can be framed loads live and is interactive
right there. Frames are https-upgraded (a page on https can't embed an http App Engine
deploy). GitHub-only projects — which refuse to be framed — play their demo reel instead,
and projects with neither get their drawn tile. `Start` opens the real thing in a new tab,
`Github` goes to the source.

## What's wired to what

- **Wii button** → System Settings. Pages one and two are real settings (screen shape,
  burn-in dimming, music/SFX volume, the pointer, clock format, data, console info); page
  three keeps the console's own Language / Country / Update / Format page.
- **SD card** → Data Management: the resume, release builds, the repo, plus "save data"
  listing the channels this browser has opened.
- **Envelope** → the message board: contact letters (Instagram, YouTube, GitHub, LinkedIn,
  SoundCloud, email, resume), a hello letter, the controls card, and a Wii-style play record
  of the work history. Unread letters pulse and drive the badge on the orb.

## Still open

- Mii, Forecast and Photo Channels are authentic-looking placeholders that open a "Not
  Available" screen — the hooks are there when they're worth building.
- Music is a synthesised four-bar loop in the console's spirit, not the real theme.
