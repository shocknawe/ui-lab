# gallery.mjs ⇄ web/* data contract

`scripts/gallery.mjs` is one Node server (built-in modules only) run as:

```
node gallery.mjs <mode> [--session <id>] [--id <protoId>] [--data <dir>] [--multi] [--port <n>]
```

- `<mode>` ∈ `peg-library` | `prototype` | `images` | `tweak` — selects which `web/<mode>/` folder is served at `/`.
- `--id <protoId>` (tweak mode) names which prototype in the session to open in the studio; falls back to the last recorded selection, then the session's first prototype.
- `--data` defaults to `~/.agents/.ui-lab` (resolved via `os.homedir()`).
- On boot the server picks a free port (start 4123, increment if busy) and prints exactly one line: `UI_LAB_URL=http://localhost:<port>` so the caller can capture it.
- No `alert`/`confirm`/`prompt` anywhere. Confirmation UI is in-page DOM.

## Routes (all modes)

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | serves `web/<mode>/index.html` |
| `/app.js`, `/styles.css`, other static | GET | served from `web/<mode>/` |
| `/data.json` | GET | mode-specific payload (below) |
| `/media/*` | GET | binary assets (peg images, generated images) from the data dir |
| `/proto/*` | GET | prototype HTML files (prototype mode only) |
| `/select` | POST | records a choice → writes `state/selected.json`, returns `{"ok":true}` |
| `/apply` | POST | images apply, **or** tweak apply (bakes CSS into a saved copy) → writes `state/selected.json`, returns `{"ok":true,"saved":…}` |

The page must show an in-page "Saved — return to your terminal" confirmation after a successful POST. The skill polls `state/selected.json` for the result; the server stays up until the caller kills it.

## `GET /data.json` payloads

### peg-library (read-only)
```json
{
  "mode": "peg-library",
  "pegs": [
    {
      "slug": "vast-quiet-alps",
      "image": "/media/library/vast-quiet-alps/image.jpg",
      "design_family": "vast-quiet",
      "keywords": ["minimalist", "cinematic", "negative-space"],
      "image_prompt": "aerial alpine ridge, muted fog, single subject...",
      "copy_brief": "calm, vertical, lots of whitespace, one accent..."
    }
  ]
}
```
Render each peg as a card: thumbnail + design_family badge + keyword chips, with image_prompt / copy_brief revealed on click and a copy-to-clipboard affordance. No POST in this mode.

### prototype
```json
{
  "mode": "prototype",
  "session": "kestrel-2026-07-24",
  "brief": "Landing page for Kestrel, an AI analytics platform for startups",
  "styles": ["print-tech", "vast-quiet", "dither-mono", "classical-remix", "terminal-native"],
  "prototypes": [
    { "id": "print-tech__impeccable", "style": "print-tech", "engine": "impeccable", "src": "/proto/print-tech__impeccable.html" },
    { "id": "print-tech__taste",      "style": "print-tech", "engine": "taste",      "src": "/proto/print-tech__taste.html" }
  ]
}
```
Layout: **one row per style (in `styles` order).** When both engines are present for a style, render **two columns — `engine:"impeccable"` LEFT, `engine:"taste"` RIGHT**. When only one engine is present (e.g. a refine session), render a **single column** and omit empty placeholder cells. Each cell is an `<iframe src=…>` with the engine + style labelled, and a **"Continue with this"** button.

Clicking "Continue with this" opens an **in-page popup** confirming the pick, with three next-step buttons:
- **"Refine this (3 variations)"** → `POST /select {"kind":"prototype","id":"<id>","action":"refine"}`
- **"Refine this"** (opens the live tweak studio) → `POST /select {"kind":"prototype","id":"<id>","action":"tweak"}`
- **"Populate images"** → `POST /select {"kind":"prototype","id":"<id>","action":"images"}`

### images
```json
{
  "mode": "images",
  "prototype": "vast-quiet__taste",
  "multiSelect": false,
  "images": [
    { "id": "img-1", "src": "/media/images/kestrel-2026-07-24/img-1.png", "label": "Aerial" },
    { "id": "img-2", "src": "/media/images/kestrel-2026-07-24/img-2.png", "label": "Crag" }
  ]
}
```
Layout: **sticky header** (stays pinned on scroll) over a responsive **thumbnail grid**. Header shows the prototype name + action buttons:
- **"Regenerate"** → `POST /apply {"action":"regenerate"}`
- **"Add color variations"** → `POST /apply {"action":"variations","targetId":"<selected thumb id>"}` (enabled only when one thumb is selected)
- **"Apply selected"** → `POST /apply {"action":"apply","ids":["img-1", ...]}`

Selection: single-select when `multiSelect:false`, multi-select (checkbox-style) when `true`. Selected thumbnails get a clear visual state.

### tweak
```json
{
  "mode": "tweak",
  "session": "kestrel-2026-07-24",
  "id": "vast-quiet__taste",
  "style": "vast-quiet",
  "engine": "taste",
  "brief": "Landing page for Kestrel…",
  "src": "/proto/vast-quiet__taste.html"
}
```
Layout: **full-bleed `<iframe src=…>`** of the prototype + a floating, collapsible **tweak dock**. Every control mutates the prototype **live** by (re)injecting a single `<style id="ui-lab-tweaks">` into the iframe document (whole-page scope; combines candidate CSS-variable names with element-level `!important` overrides). Controls span typography (body/heading font, scale, size, line-height, letter-spacing, weight, uppercase), color (accent/bg/text/surface/border, palette presets, invert), and shape/space (radius, content width, shadow), plus Reset / Randomize / Copy CSS.

**Apply & save** → `POST /apply {"kind":"tweak","id":"<id>","action":"apply","css":"<generated CSS>"}`. The server **bakes**: it reads the source prototype HTML, injects `<style id="ui-lab-tweaks">…</style>` before `</head>` (fallback: end of `<body>`), writes `<session>/<id>__tweaked.html`, and records `state/selected.json` = `{"kind":"tweak","id":"<id>","action":"apply","file":"<id>__tweaked.html","ts":…}`. The response includes `saved.file`. The page then shows an in-page "Saved — return to your terminal" confirmation.

## POST bodies → `state/selected.json`

The server writes the POSTed body plus a `ts` (epoch ms) to `state/selected.json` verbatim. Examples the skill will read back:
```json
{ "kind": "prototype", "id": "vast-quiet__taste", "action": "refine", "ts": 1753372800000 }
{ "kind": "prototype", "id": "vast-quiet__taste", "action": "tweak",  "ts": 1753372800000 }
{ "kind": "images", "action": "apply", "ids": ["img-1"], "ts": 1753372800000 }
{ "kind": "tweak", "id": "vast-quiet__taste", "action": "apply", "file": "vast-quiet__taste__tweaked.html", "ts": 1753372800000 }
```

> Tweak apply is the one `/apply` that does more than record: `gallery.mjs` bakes the CSS into `<id>__tweaked.html` before writing `selected.json` (see the tweak section above).

## Shared UI rules for all three viewers
- Self-contained: inline CSS/JS or same-folder `styles.css`/`app.js`. **No external CDNs, fonts, or network calls.**
- Theme-aware: support light + dark via `prefers-color-scheme`.
- Responsive: no horizontal body scroll; wide content scrolls in its own container.
- Fetch `/data.json` on load; render from it. Never hardcode sample data into the shipped page (a tiny inline fallback for empty state is fine).
- Accessible: buttons are real `<button>`s, keyboard-usable, visible focus.
