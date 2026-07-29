# Overnight progress — refactor + PSP/XMB menu

Two branches were created off `master`. Nothing on `master` was touched.

```
master ─▶ refactor  (framework migration + clean architecture)
              └─▶ psp  (PSP-style XMB main menu, built on refactor)
```

## How to run locally

```bash
cd ~/place
npm install          # once (installs Vite/React Router/Zustand/Framer Motion)

git checkout refactor && npm run dev    # classic portfolio, now on Vite
#   → http://localhost:5173  (routes: /, /hom, /prim, /resume)

git checkout psp && npm run dev         # PSP XMB menu as the home screen
#   → http://localhost:5173
#     /         XMB cross-media-bar menu
#     /classic  the refactored portfolio (fallback)
#     /hom /prim /resume  the "apps"
```

Build for production: `npm run build` → static `dist/` (preview with `npm run preview`).

## Branch `refactor` — Next.js 16 → Vite 6 SPA

Rebuilt as a Vite + React Router SPA with a componentized architecture (ryos-inspired),
for faster dev/build and as a clean base for the XMB menu.

- **Framework**: Next.js App Router → **Vite 6** + `@vitejs/plugin-react-swc`, **React Router v7**.
- **Data**: the inline `projects[]` / experience / socials from the old 16 KB `page.tsx`
  are now typed modules in `src/data/`. Project media is a typed union rendered by a single
  `<ProjectCard>` / `<ProjectMedia>`, replacing the duplicated two-column markup and the
  mobile/desktop `slice()` hack (now a responsive grid).
- **hom gallery**: request-time `fs.readdir` → build-time `scripts/generate-hom-manifest.mjs`
  producing `src/data/homManifest.ts` (runs on `predev`/`prebuild`).
- **prim**: `organism.js` moved to `src/lib/prim/`, wrapped by `src/routes/Prim.tsx`.
- **Removed dead deps** `p5`, `react-p5`, `@types/p5` (organism uses raw canvas 2D — they were
  imported nowhere).
- Extracted the name letter-scramble into `useLetterScramble`; cleaned `globals.css` (dropped the
  dead `.video-container` hover-swap rules); added `prefers-reduced-motion` support.
- **Dockerfile** now builds static `dist/` and serves via `serve -s` (SPA history fallback).
- ESLint flat config (typescript-eslint + react-hooks). `build` and `lint` pass.

Verified in-browser: `/`, `/hom`, `/prim`, `/resume` all render.

## Branch `psp` — XMB cross-media-bar menu

A PlayStation XMB-style menu is the new home screen (`src/xmb/`). Structure inspired by the
real XMB (psdevwiki) and web recreations (menonparik/xmb-on-web, fchavonet wave).

- **Layout**: horizontal category bar (←/→) crossing a vertical item column (↑/↓) at a fixed
  pivot; selecting an item shows its detail in a frosted **info panel** beside the column —
  exactly the "scroll tabs across, scroll items down, info appears next to it" model.
- **Categories**: Profile · Projects · Experience · Play · Links · Settings — all derived from the
  same `src/data/*` (`src/xmb/xmbData.ts`), so the portfolio content stays single-sourced.
- **Info panel** renders per item kind: bio, project (video/image + description + Live/Github/
  Download), role (logo + company/dates), link/app blurbs, and live Settings controls.
- **Animated wave background** (`XmbWave.tsx`, canvas 2D, hue + light/dark configurable, pauses on
  reduce-motion).
- **Navigation**: keyboard (←/→/↑/↓, Enter to activate), mouse (click + wheel), and touch swipe.
  Framer Motion springs for the blade slide/scale transitions. Item column is masked so scrolled
  items fade cleanly instead of colliding with the category label.
- **Settings** (persisted to localStorage via Zustand): light/dark theme, wave hue, navigation
  sound (Web Audio blips, off by default), reduce motion.
- **Apps**: Play → hॐ and Prim's Organism launch the routes; Esc returns to the menu
  (`useEscapeTo`). Resume + external links open appropriately.
- `/classic` keeps the refactored portfolio as a fallback.

Verified in-browser: category switching, item scrolling, per-item info panel (video + image),
light/dark toggle, wave animation. A navigation GIF was exported to your Downloads
(`xmb_navigation.gif`).

## Follow-ups (not done — flagging for you)

- **Repo is ~310 MB** but live assets are only ~48 MB; the rest is **old media blobs in git
  history**. Not auto-fixed because it's destructive (history rewrite + force-push). When you're
  ready, `git lfs migrate` or BFG Repo-Cleaner can shrink it. Consider moving large demo media to a
  CDN and tracking new media with git-lfs.
- **Prod deploy**: the app was Next-standalone on GCP App Engine/Docker. The Dockerfile now serves
  static `dist/`; the App Engine config (`app.yaml`/`.gcloudignore`) should be reviewed before the
  next deploy. Local run is fully working.
- Optional: switch package manager to **Bun** (ryos uses it) — the structure is compatible; kept
  npm here to guarantee it runs on your machine as-is.
- Optional XMB polish: gamepad API support, boot chime, per-category accent hues, and turning the
  Play "apps" into in-menu overlays instead of route navigations.
