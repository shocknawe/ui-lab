# gallery.mjs ⇄ web/* data contract

`scripts/gallery.mjs` is one Node server (built-in modules only) run as:

```
node gallery.mjs <mode> [--session <id>] [--data <dir>] [--multi] [--port <n>]
```

- `<mode>` ∈ `peg-library` | `prototype` | `images` — selects which `web/<mode>/` folder is served at `/`.
- `--data` defaults to `~/.agents/.zuhlke-design` (resolved via `os.homedir()`).
- On boot the server picks a free port (start 4123, increment if busy) and prints exactly one line: `ZUHLKE_URL=http://localhost:<port>` so the caller can capture it.
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
| `/apply` | POST | images mode apply → writes `state/selected.json`, returns `{"ok":true}` |

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
Layout: **one row per style (in `styles` order), two columns — `engine:"impeccable"` LEFT, `engine:"taste"` RIGHT.** Each cell is an `<iframe src=…>` with the engine + style labelled, and a **"Continue with this"** button.

Clicking "Continue with this" opens an **in-page popup** confirming the pick, with two next-step buttons:
- **"Refine this (3 variations)"** → `POST /select {"kind":"prototype","id":"<id>","action":"refine"}`
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

## POST bodies → `state/selected.json`

The server writes the POSTed body plus a `ts` (epoch ms) to `state/selected.json` verbatim. Examples the skill will read back:
```json
{ "kind": "prototype", "id": "vast-quiet__taste", "action": "refine", "ts": 1753372800000 }
{ "kind": "images", "action": "apply", "ids": ["img-1"], "ts": 1753372800000 }
```

## Shared UI rules for all three viewers
- Self-contained: inline CSS/JS or same-folder `styles.css`/`app.js`. **No external CDNs, fonts, or network calls.**
- Theme-aware: support light + dark via `prefers-color-scheme`.
- Responsive: no horizontal body scroll; wide content scrolls in its own container.
- Fetch `/data.json` on load; render from it. Never hardcode sample data into the shipped page (a tiny inline fallback for empty state is fine).
- Accessible: buttons are real `<button>`s, keyboard-usable, visible focus.
