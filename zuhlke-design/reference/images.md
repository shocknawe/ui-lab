# /zuhlke-design images

Populate the selected prototype with generated **hero imagery / assets**, then let the user pick in a thumbnail viewer. This is the last step of the transcript: nail the hero image (and its color variations — the "Alpine Glow" moment) once the layout is chosen.

> **Higgsfield MCP is stubbed for now.** Build and run the full viewer flow with placeholder images; the actual generation calls are isolated behind one clearly-marked boundary (Step 2) so they're trivial to wire up once the MCP is confirmed.

## Step 1 — resolve the target prototype

Read `~/.agents/.zuhlke-design/state/selected.json` for the prototype the user chose (`kind:"prototype"`), or take an explicit target from the user. Load that prototype's style + its peg `image_prompt` from the library — that prompt anchors the hero generation.

## Step 2 — generate the images  *(Higgsfield boundary — currently stubbed)*

Generate 4 hero candidates for the prototype's hero, guided by the style's `image_prompt` and the 4-part prompt's guardrails.

- **When the Higgsfield MCP is available:** call it here (e.g. GPT-Image for stills), request high-quality ~2K images, save them into `~/.agents/.zuhlke-design/images/<session>/`.
- **Stub (now):** copy/generate placeholder images into that folder so the viewer is fully exercisable. Keep this the *only* place that knows about generation, so swapping in the MCP is a one-spot change.

Write a `data.json` next to the images:
```json
{
  "prototype": "vast-quiet__taste",
  "multiSelect": false,
  "images": [
    { "id": "img-1", "label": "Aerial",      "file": "img-1.png" },
    { "id": "img-2", "label": "Crag",         "file": "img-2.png" },
    { "id": "img-3", "label": "Watercolor",   "file": "img-3.png" },
    { "id": "img-4", "label": "Cloud Sea",    "file": "img-4.png" }
  ]
}
```
Set `multiSelect: true` only if the user is populating several assets at once; default single hero.

## Step 3 — show the viewer, let them pick

```bash
node scripts/gallery.mjs images --session <session>          # add --multi for multi-select
```

Open the printed URL. The viewer is a **sticky header** over a **thumbnail grid**; selecting thumbnails enables the header actions.

Record the current timestamp, then wait for a fresh selection:

```bash
SINCE=$(node -e 'console.log(Date.now())')
node scripts/poll-selection.mjs --since "$SINCE"
```

It returns the saved `~/.agents/.zuhlke-design/state/selected.json` once the user clicks an action:
```json
{ "kind": "images", "action": "apply", "ids": ["img-4"], "ts": 1753372800000 }
```

Act on `action`:
- **`apply`** → write the chosen image(s) into the prototype's hero (replace the hero background/`<img>` in the prototype HTML) and confirm.
- **`regenerate`** → generate a fresh batch (back to Step 2), reserve the viewer.
- **`variations`** → generate color/tone variations of the single selected thumbnail (`targetId`) — the transcript's "add a splash of color" → Dawn Touch / Golden Hour / Alpine Glow step — then show them in the viewer to pick again.

Loop until the user applies a hero they're happy with. Kill the server when done.
