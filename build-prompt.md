# Build Prompt: `ui-lab` skill

Create a user-invocable Claude Code skill named **`ui-lab`** that operationalizes the anti-AI-slop web design workflow from `transcript.md` (cultivate taste → cast a wide net of prototypes → iterate → generate assets). Invoked as `/ui-lab [command]`.

Use the `skill-creator` skill to scaffold, and follow the structure below exactly.

---

## Repo context (already present — read these first)

- `transcript.md` — the source video walkthrough. The skill implements its 3-step method.
- `references/impeccable/` — the impeccable frontend skill (SKILL.md + scripts + reference/). Router pattern to mirror.
- `references/taste-skill/SKILL.md` — the taste skill. Its internal skill `name:` is **`design-taste-frontend`**.
- The `install` command uses the `skills` CLI to fetch `impeccable` and `design-taste-frontend` from GitHub. The `references/` copies remain useful as local mirrors of the router discipline and skill structure.

---

## Skill metadata

- `name: ui-lab`
- `user-invocable: true`
- `argument-hint: "[install · pegs [<image>|library] · prototype <brief> · images]"`
- `description:` written to trigger on: cultivating a design taste/inspiration library, saving design reference images ("pegs"), generating multiple landing-page prototypes in distinct styles, comparing design variants side by side, iterating/refining a chosen design, and populating a design with generated hero imagery. Anti-slop, taste-driven web design.

---

## Directory structure to produce

```
ui-lab/
  SKILL.md                       # router: parses [command], loads matching reference
  reference/
    install.md
    pegs.md
    prototype.md
    images.md
  scripts/
    gallery.mjs                  # single localhost server; serves all three viewers + JSON data + selection endpoints
    library.mjs                  # copy a jpg into the library, write the tag sidecar
  web/
    peg-library/                 # static html+js: pegs gallery
    prototype/                   # static html+js: 10-prototype gallery + select popup
    images/                      # static html+js: image viewer (sticky header + thumbnail grid)
```

**Code lives in the skill; user data lives in `~/.agents`.** The `web/*` templates are static; `gallery.mjs` injects live data (pegs list / prototype list / image list) via a JSON endpoint or a generated data file, and exposes selection endpoints that write to `state/`.

---

## User-data storage (cross-platform)

Resolve the home directory at runtime (`os.homedir()`), so macOS `~/.agents/...` and Windows `%USERPROFILE%\.agents\...` both work with no branching.

```
~/.agents/.ui-lab/
  library/<slug>/image.jpg
  library/<slug>/<slug>.md        # frontmatter tags + prose
  prototypes/<session>/*.html      # 10 generated prototypes
  prototypes/<session>/data.json   # gallery metadata (style, engine, path)
  images/<session>/*.{png,jpg}     # Higgsfield-generated assets
  state/selected.json              # written when the user clicks a select button
```

---

## Commands

### `install`
Ensure `impeccable` and `design-taste-frontend` are available in the project's `.claude/skills/`. For each missing one, run `npx skills add <repo>` (impeccable: `pbakaus/impeccable`, taste skill: `Leonxlnx/taste-skill`). Report what was installed vs already present. This is a prerequisite for `prototype`.

### `pegs <image.jpg>`
1. Copy the jpg into `~/.agents/.ui-lab/library/<slug>/image.jpg` (slug from a short description).
2. Vision-analyze the image and write `<slug>.md` with frontmatter tags mirroring the video's inspiration app:
   - `design_family` (e.g. print-tech, vast-quiet, dither-mono, classical-remix)
   - `keywords` (design vocabulary)
   - `image_prompt` (to regenerate a hero in this style)
   - `copy_brief` (to build a full site in this style)
3. Confirm the peg was added.

### `pegs library`
Start `gallery.mjs` in **peg-library mode**: serves `web/peg-library/` on localhost showing every peg as a card (thumbnail + tags). Print the URL and open it. Read-only browsing of the taste library.

### `prototype "<brief>"`
The heart of the skill. Requires `install` to have run.

1. **Collect the 4-part prompt** (from the transcript) — infer from the brief + pegs where possible, ask only for what's genuinely missing:
   - **Aesthetic** — the design family to aim for
   - **Reference image** — pegs from the library (match the *feel*, not the content)
   - **Intent** — what's being built & why (product type, audience, desired action)
   - **Guardrails** — always-dos / never-dos (e.g. never purple gradients, never Inter)
2. **Pick 5 distinct aesthetic families** from the pegs library (cluster the pegs). Fallback if the library has <5 usable clusters: infer the remaining styles from the brief and state which were inferred.
3. **Generate 10 prototypes = 5 styles × 2 engines.** For each style, build one variant applying **impeccable's** guidance and one applying **design-taste-frontend's** guidance, using the brief + that style's peg tags. Write HTML into `prototypes/<session>/` and a `data.json` describing each (style, engine, path). When invoking impeccable, pass the brief + tags directly and skip its `init`/PRODUCT.md diversion so wide-net prototyping isn't blocked.
4. **Serve the prototype gallery** (`gallery.mjs` in prototype mode → `web/prototype/`): a **5 rows × 2 columns** grid of iframes, **impeccable left / taste right** (the video's split). Each frame has a **"Continue with this"** button.
5. **Select → popup.** Clicking a button opens a popup with: a confirm of the pick, plus next-step buttons **"Refine this (3 variations)"** and **"Populate images"**. The choice writes `state/selected.json`.
6. **Refine loop.** On "Refine this", generate 3 body/layout variations of the selected prototype (vary body format/layout, per the video's Ledger/frames/index moment), serve them in the same gallery, select again. Repeat until the user is happy.

### `images`  *(Higgsfield calls stubbed until the MCP is confirmed; build the viewer fully)*
1. Take the currently selected prototype (`state/selected.json`).
2. Call the Higgsfield MCP to generate hero image(s)/assets for the prototype's hero, using the style's `image_prompt`. **Stub these MCP calls** behind a clear boundary (documented, easy to wire later) — generate/copy placeholder images so the viewer is fully testable now.
3. Start `gallery.mjs` in **images mode** → `web/images/`: a **sticky header** (pinned while scrolling) over a **thumbnail grid** of the generated images. Header actions: **"Regenerate"**, **"Add color variations"** (variations of the selected thumbnail — the Alpine Glow → variations moment), **"Apply selected"**. **Multi-select** supported (populate several assets); default single hero.
4. Applying writes the chosen image(s) into the prototype's hero and records the choice.

---

## `gallery.mjs` requirements

- One Node script, no external deps (use built-in `http`, `fs`, `os`, `path`).
- Modes: `peg-library` | `prototype` | `images` (arg or env). Each serves the matching `web/*` folder.
- Serves static assets, a `/data.json` endpoint (live library/prototype/image data), and `POST /select` (and `/apply`) endpoints that write to `~/.agents/.ui-lab/state/`.
- Picks a free port, prints the URL, exits cleanly. No JS-`alert`/`confirm` dialogs (they block automation) — use in-page popups/DOM.

---

## Subagent orchestration

**Phase 1 — build the three web viewers in parallel.** Spawn one subagent per `web/*` folder. Give each: this prompt's storage layout, the `gallery.mjs` data/endpoint contract (`/data.json` shape, `POST /select`/`/apply`), and its viewer's spec. Each produces self-contained static `index.html` + `app.js` (+ css) — no external CDNs, theme-aware, responsive, no blocking dialogs.
- `peg-library` subagent → card grid of pegs (thumbnail + tags), read-only.
- `prototype` subagent → 5×2 iframe grid, "Continue with this" buttons, select popup with the two next-step actions.
- `images` subagent → sticky-header + thumbnail grid, multi-select, header actions (Regenerate / Add color variations / Apply selected).

**Phase 2 — build the router + reference files + scripts** (`SKILL.md`, `reference/*.md`, `gallery.mjs`, `library.mjs`) once the data contract is fixed.

**Phase 3 — verify functionality with subagents.** Spawn verification subagent(s) to:
- Boot `gallery.mjs` in each mode against seeded sample data in a temp `~/.agents/.ui-lab/`; confirm it serves, returns `/data.json`, and that `POST /select`/`/apply` write `state/` correctly.
- Load each viewer headlessly (or via the chrome tools), confirm it renders the seeded data, that select/apply buttons hit the endpoints, and that no blocking dialogs fire.
- Confirm `install` adds both `impeccable` and `design-taste-frontend` to `.claude/skills/` via `npx skills add`.
- Confirm `pegs` writes `image.jpg` + a well-formed `<slug>.md`.
- Report pass/fail per check; fix or file precise repro steps for any failure.

Each verification subagent returns a concise pass/fail report (the final report isn't shown to the user, so relay what matters).

---

## Constraints & non-goals

- External network calls are limited to installing skills via `npx skills add` and the Higgsfield MCP (stubbed for now).
- Static web assets only — no build step, no bundler, no CDN.
- Mirror impeccable's router discipline: `SKILL.md` dispatches, per-command `reference/*.md` owns the flow.
- Don't make `prototype` block on impeccable's missing PRODUCT.md.
- Keep the skill self-contained; user data stays under `~/.agents/.ui-lab/`.

## Acceptance criteria

- `/ui-lab install` installs both engines idempotently.
- `/ui-lab pegs <jpg>` adds a tagged peg; `/ui-lab pegs library` opens a working localhost gallery of all pegs.
- `/ui-lab prototype "<brief>"` produces 10 prototypes (5 styles × impeccable/taste), a working 5×2 select gallery with popup, and a working 3-variation refine loop.
- `/ui-lab images` opens a working sticky-header thumbnail viewer with multi-select and apply (Higgsfield stubbed).
- All three viewers pass the Phase 3 verification checks.
