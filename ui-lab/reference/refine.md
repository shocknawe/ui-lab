# /ui-lab refine

Open **one** chosen prototype in the **live tweak studio** — a localhost page that shows the
prototype full-bleed with a floating **tweak bar**. Every control (fonts, colors, sizing, shape)
mutates the design in **real time**. When the user hits **Apply & save**, the tweaks are baked
permanently into a saved copy of the prototype, which becomes the new refined prototype.

This is the hands-on counterpart to `prototype`'s "Refine this (3 variations)" (which asks the AI
for variations). `refine` puts the knobs in the user's hands.

## When this runs

- The user typed `/ui-lab refine`, **or**
- The prototype gallery recorded `action:"tweak"` (the modal's **"Refine this"** button) — the
  `prototype` flow hands off here.

## Step 1 — resolve the target prototype

The studio needs the **session** and the prototype **id**:

- Read `~/.agents/.ui-lab/state/selected.json`. A record like
  `{ "kind":"prototype", "id":"vast-quiet__taste", "action":"tweak", … }` names the id; the active
  session is the one you just served (its `prototypes/<session>/data.json` must list that id).
- If there's no usable selection (user invoked `refine` cold), ask which session and prototype, or
  list `~/.agents/.ui-lab/prototypes/*/data.json` and let them pick. Don't guess silently.

## Step 2 — serve the tweak studio

Launch the `tweak` viewer in the background and capture its URL (shared serve mechanic):

```bash
node scripts/gallery.mjs tweak --session <session> --id <id>   # prints UI_LAB_URL=http://localhost:PORT
```

`--id` selects which prototype opens; if omitted, the server falls back to the last selection then
the session's first prototype. Open the URL for the user.

## Step 3 — wait for Apply

Record the current max timestamp, then poll for a fresh save:

```bash
SINCE=$(node -e 'console.log(Date.now())')
node scripts/poll-selection.mjs --since "$SINCE"
```

On **Apply & save** the studio POSTs its generated CSS; the server **bakes** it into a new file and
records:

```json
{ "kind": "tweak", "id": "vast-quiet__taste", "action": "apply", "file": "vast-quiet__taste__tweaked.html", "ts": 1753372800000 }
```

The baked file already exists at `~/.agents/.ui-lab/prototypes/<session>/<file>` — the original is
left untouched. No AI regeneration is needed; the tweaks *are* the change.

## Step 4 — continue the loop

Kill the server. Report the baked file as the refined prototype and offer next steps:

- **Keep tweaking** → serve the studio again on the baked file (`--id <base>__tweaked` — add its
  record to the session `data.json` if you want it selectable elsewhere).
- **Ask the AI for variations** → `/ui-lab prototype`'s refine flow, using the tweaked design as the
  new starting point.
- **Populate images** → `/ui-lab images` for this prototype (see `reference/images.md`).

If the poll times out, the user probably closed the tab without applying; ask what they'd like next.
