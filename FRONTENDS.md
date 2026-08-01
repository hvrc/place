# Frontends

This project separates **content** (the portfolio data) from **frontends** (how
it's presented), so the same data can drive many different UIs.

```
src/
  content/        the data layer — portfolio content only, zero UI knowledge
                  (profile, projects, experience, socials). Import `portfolio`.
  engine/         a reusable cross-media-bar ("XMB") menu — zero portfolio
                  knowledge. A frontend feeds it a MenuModel and it renders the
                  category bar, item column, drill-in tree, backdrop, etc.
  frontends/
    classic/      the original white-background grid portfolio (this branch's
                  default route "/"). A plain-React frontend — no engine.
    psp/          the PSP cross-media-bar (route "/psp"). Built on the engine.
```

Path aliases: `@content/*`, `@engine/*`, `@psp/*`, `@/*`.

## Add a new frontend

1. **Create a folder** `src/frontends/<name>/`.
2. **Consume the data:** `import { portfolio } from "@content/index";` (or the
   individual `projects` / `experience` / `socials` / `profile`). Never import
   another frontend's files.
3. **Build the UI**, one of two ways:
   - **From scratch** (like `classic/`): render whatever you want from the data.
   - **On the engine** (like `psp/`): write a `build<Name>Model()` that maps the
     portfolio to a `MenuModel` (`@engine/model/types`), then
     `createMenuStore(model)` and render `<MenuShell>` inside `<MenuProvider>`.
     See `frontends/psp/` for the full pattern (model, theme, palette, wordmark).
4. **Mount it** by pointing a route at it in `src/App.tsx`.

The engine keeps all its layout numbers in `engine/layout/metrics.ts` and all
input in `engine/input/useMenuInput.ts` — the seams for restyling or adding
mobile/gesture support without touching menu logic.
