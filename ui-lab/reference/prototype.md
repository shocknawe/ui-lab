# /ui-lab prototype "<brief>"

The heart of the skill. Cast a **wide net** — 10 prototypes across 5 distinct styles, two design engines — so the user can *see* their options side by side instead of one-shotting. Then narrow and refine. This mirrors the build phase in `transcript.md`.

**Prerequisite:** `impeccable` and `design-taste-frontend` must be installed (`/ui-lab install`). If they're missing, run install first.

## Step 1 — assemble the 4-part prompt

From the transcript, a good design prompt carries four things. Infer what you can from the brief and the pegs library; ask the user only for what's genuinely missing (don't interrogate):

1. **Aesthetic** — the design family/direction to aim for.
2. **Reference image** — pegs from `~/.agents/.ui-lab/library/` whose *feel* matches (match feeling, not content — never copy the peg's actual layout/copy).
3. **Intent** — what's being built and why: product type, target audience, the single action you want visitors to take.
4. **Guardrails** — always-dos / never-dos (e.g. "never purple gradients, never Inter, no 3D SaaS blobs, hero always carries a monumental image").

## Step 2 — pick 5 distinct styles from the pegs

Read the library sidecars and **cluster them into 5 distinct aesthetic families**, each anchored by real pegs (use their `design_family`, `keywords`, `copy_brief`). Aim for genuine spread, not five variations of one look.

- If the library has **fewer than 5 usable clusters** (or is empty), infer the remaining styles from the brief, and **tell the user which styles came from pegs vs were inferred**.

## Step 3 — generate 10 prototypes (5 styles × 2 engines)

For **each** of the 5 styles, build **two** single-page HTML prototypes:
- one applying **impeccable**'s guidance,
- one applying **design-taste-frontend**'s guidance,

using the 4-part prompt plus that style's peg tags. Keep each a self-contained single `.html` file (inline CSS/JS; no external assets yet — hero imagery comes later via `images`).

- When applying impeccable, pass the brief + tags **directly** and skip its `init`/PRODUCT.md diversion — wide-net prototyping must not block on missing project context.
- **Generating 10 full pages is heavy.** Prefer running the builds in parallel via subagents (one per prototype, or one per style producing both), each returning a finished HTML file. Keep them focused single-viewport-to-medium pages, not sprawling sites.

Write outputs to `~/.agents/.ui-lab/prototypes/<session>/`:
- the 10 files, named `<style>__impeccable.html` and `<style>__taste.html`,
- a `data.json`:
  ```json
  {
    "session": "kestrel-2026-07-24",
    "brief": "Landing page for Kestrel, an AI analytics platform for startups",
    "styles": ["print-tech", "vast-quiet", "dither-mono", "classical-remix", "terminal-native"],
    "prototypes": [
      { "id": "print-tech__impeccable", "style": "print-tech", "engine": "impeccable", "file": "print-tech__impeccable.html" },
      { "id": "print-tech__taste",      "style": "print-tech", "engine": "taste",      "file": "print-tech__taste.html" }
    ]
  }
  ```
  (`id` = `<style>__<engine>`, engine is `impeccable` or `taste`. List all 10.)

## Step 4 — show the gallery, let them pick

Start the viewer in the background and capture its URL:

```bash
node scripts/gallery.mjs prototype --session <session>   # prints UI_LAB_URL=http://localhost:PORT
```

Open the URL. The gallery lays the 10 out as **5 rows (styles) × 2 columns (impeccable left / taste right)**, each with a **"Continue with this"** button that opens a popup offering three next steps: **"Refine this (3 variations)"**, **"Refine this"** (open the live tweak studio), or **"Populate images"**.

> **Important:** clicking "Continue with this" only opens the choice popup. The selection is not saved until the user clicks one of the popup actions.

Before polling, record the current max timestamp so you only react to a *new* click:

```bash
SINCE=$(node -e 'console.log(Date.now())')
```

Then wait for a fresh selection:

```bash
node scripts/poll-selection.mjs --since "$SINCE"
```

This blocks until `~/.agents/.ui-lab/state/selected.json` contains a record with a newer `ts`, then prints it:

```json
{ "kind": "prototype", "id": "vast-quiet__taste", "action": "refine", "ts": 1753372800000 }
```

## Step 5 — act on the choice (loop)

- **`action: "refine"`** → generate **3 variations** of the chosen prototype, changing body/layout while keeping the aesthetic (vary format the way the transcript's Ledger / frames / index versions did). Write them into a fresh `prototypes/<session>-refine-N/` with a `data.json`.
  - **Keep the original on screen.** Copy the originally-selected prototype file into the refine dir and list it **first** in `data.json` as its own style row, so the user can compare against it and fall back to it. Give it a distinct style label and reuse the picked engine so every row renders as a single column (no empty placeholder cells):
    ```json
    {
      "session": "kestrel-2026-07-24-refine-1",
      "styles": ["original (kept)", "variation-1", "variation-2", "variation-3"],
      "prototypes": [
        { "id": "vast-quiet__taste__original", "style": "original (kept)", "engine": "taste", "file": "vast-quiet__taste.html" },
        { "id": "vast-quiet__v1", "style": "variation-1", "engine": "taste", "file": "vast-quiet__v1.html" },
        { "id": "vast-quiet__v2", "style": "variation-2", "engine": "taste", "file": "vast-quiet__v2.html" },
        { "id": "vast-quiet__v3", "style": "variation-3", "engine": "taste", "file": "vast-quiet__v3.html" }
      ]
    }
    ```
  - The viewer renders **4 single-column tabs** (original + v1/v2/v3). Serve the gallery again and let the user pick again. Repeat until they're happy.
- **`action: "tweak"`** → hand off to `/ui-lab refine` (the live tweak studio) for the selected prototype — see `reference/refine.md`. The selection in `state/selected.json` names the target id.
- **`action: "images"`** → hand off to `/ui-lab images` for the selected prototype (see `reference/images.md`). The selection in `state/selected.json` names the target prototype.

Kill each server when its step is done. If the poll script times out, the user probably closed the popup without choosing; ask them what they'd like to do next.
