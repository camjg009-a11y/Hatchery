# Hatchery

An egg-hatching gacha game with turn-based battles, published as a Claude artifact.

## Layout
- `src/page.html` – the page: UI, hatching, roster, saves. The battle engine is inserted at `/*@ENGINE@*/`.
- `src/battle.js` – fights, arenas, bonds, passives, Auto battle and 2× speed
- `src/rush.js` – Boss Rush
- `src/raid.js` – daily / weekly / monthly / yearly raids
- `src/power.js` – creature, team and Hatcher power, and the Power screen
- `src/vfx.js` – move effects (atlases in `fx/`, frame data in `fx/meta.json`)
- `n2/` – creature cutouts · `fx/` – effect sheets · `ui/` – UI frames and icon sheet
- `*_t2.webp` – egg art · `bg_*.webp` – arena backgrounds
- `newart/` – original generated images, before cutting out
- `tools/` – cutout and sheet tools (`cutc.py` cuts a creature out of an image)
- `tests/` – Playwright simulations used for balance (`raidtune.py`, `pok.py`, `t44.py`, ...)

## Build
    python3 build.py

This writes `hatchery.html` (the published page), `wrap.html` (for local testing) and copies the art it uses into `art/`.
Publish `hatchery.html` as `index.html`, with the files in `art/` beside it.
