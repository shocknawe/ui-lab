# /zuhlke-design pegs

Two modes, dispatched by the argument after `pegs`:
- a **path to an image** → *add* a peg
- the word **`library`** → *view* all pegs

A "peg" is a design reference image the user liked (a screenshot from Dribbble, Pinterest, Twitter, a real site…). The pegs collectively are the user's **taste library** — the foundation every prototype is built from, so the tagging matters.

---

## `pegs <image.jpg>` — add a peg

The point is to capture not just the image but the *vocabulary* of its design, mirroring the inspiration app in the transcript.

1. **Look at the image.** Analyze it visually and produce:
   - `design_family` — a short, reusable style name (e.g. `print-tech`, `vast-quiet`, `dither-mono`, `classical-remix`, `terminal-native`, `editorial-serif`). Reuse an existing family name from the library when the peg clearly belongs to one (check `~/.agents/.zuhlke-design/library/*/` sidecars) so pegs cluster.
   - `keywords` — 4–8 concrete design-vocabulary terms (layout, type, color, texture, motion cues).
   - `image_prompt` — a prompt that could regenerate a *hero image* in this style (composition, subject, palette, mood).
   - `copy_brief` — a short brief describing how to build a *whole site* in this style (structure, type treatment, spacing, accent strategy, what to avoid).
2. **Write it via the script** (it copies the image and writes the sidecar `~/.agents/.zuhlke-design/library/<slug>/`):
   ```bash
   node scripts/library.mjs add --image "<path-to.jpg>" --meta /tmp/peg-meta.json
   ```
   where `/tmp/peg-meta.json` is:
   ```json
   {
     "slug": "vast-quiet-alps",
     "design_family": "vast-quiet",
     "keywords": ["minimalist", "cinematic", "negative-space", "monochrome", "vertical-rhythm"],
     "image_prompt": "aerial alpine ridge above fog, muted greys, single subject, vast negative space",
     "copy_brief": "calm and vertical; oversized quiet headline; generous whitespace; one restrained accent; no gradients, no cards"
   }
   ```
   You can pass `--meta -` and pipe the JSON via stdin instead of writing a temp file.
3. Confirm to the user: the family it was tagged as, the keywords, and that it's now in their library. Offer `pegs library` to browse.

**Slug**: derive from a short description of the peg (the script slugifies it). Keep families consistent so `prototype` can cluster them.

---

## `pegs library` — view the taste library

Open the localhost gallery of every peg with its tags:

```bash
node scripts/gallery.mjs peg-library      # prints ZUHLKE_URL=http://localhost:PORT
```

Capture the printed URL, open it for the user, and let them browse (cards show thumbnail + family + keywords; clicking reveals the image prompt and copy brief with copy buttons). It's read-only. Kill the server when they're done.

If the library is empty, tell them and point them at `pegs <image.jpg>` to add their first one.
