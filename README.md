# zuhlke-design

A Claude Code skill for taste-driven, anti-AI-slop web design.

It operationalizes the workflow from [`transcript.md`](transcript.md): **cultivate taste → cast a wide net of prototypes → iterate → generate assets.** Instead of one-shotting a generic landing page, you build from a curated library of design references (*pegs*), generate 10 competing prototypes in distinct styles, pick one in a side-by-side gallery, refine it, and populate it with generated hero imagery.

---

## What it does

`/zuhlke-design` gives you four commands:

| Command | Purpose |
|---|---|
| `install` | Install `impeccable` and `design-taste-frontend` into the project's `.claude/skills/`. |
| `pegs <image.jpg>` | Add a design reference image to your taste library, tagged with design vocabulary. |
| `pegs library` | Browse all saved pegs in a localhost gallery. |
| `prototype "<brief>"` | Generate 10 prototypes (5 styles × 2 design engines) and pick one in a gallery. |
| `images` | Generate hero image candidates for the selected prototype and pick in a thumbnail viewer. |

The two design engines are:

- **[impeccable](https://www.skills.sh/pbakaus/impeccable/impeccable)** — production-grade frontend design guidance.
- **[design-taste-frontend](https://www.skills.sh/leonxlnx/taste-skill)** — anti-slop taste skill (repo: `Leonxlnx/taste-skill`, installed as `design-taste-frontend`).

---

## Install the skill

Use the [Vercel Labs `skills` CLI](https://skills.sh/):

```bash
npx skills add pbakaus/impeccable
npx skills add Leonxlnx/taste-skill
```

Or, from within Claude Code:

```
/zuhlke-design install
```

If the shorthand doesn't resolve, fall back to the explicit URL form:

```bash
npx skills add https://github.com/pbakaus/impeccable --skill impeccable
npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend
```

---

## Quick start

```
/zuhlke-design install

# Save a design reference image
/zuhlke-design pegs ~/Downloads/ref-landing.jpg

# See your taste library
/zuhlke-design pegs library

# Generate 10 prototypes for a brief
/zuhlke-design prototype "Landing page for Kestrel, an AI analytics platform for startups"

# Populate the chosen prototype with hero images
/zuhlke-design images
```

---

## How it works

### Code lives in the skill; your data lives in `~/.agents`

```
~/.agents/.zuhlke-design/
  library/<slug>/image.<ext>      # saved pegs
  library/<slug>/<slug>.md        # peg tags and vocabulary
  prototypes/<session>/*.html       # generated prototypes
  prototypes/<session>/data.json    # gallery metadata
  images/<session>/*.{png,jpg}      # generated hero assets
  images/<session>/data.json        # asset metadata
  state/selected.json               # last user choice from a viewer
```

### Skill structure

```
zuhlke-design/
  SKILL.md                        # router: parses command, loads reference
  reference/
    install.md                    # engine install instructions
    pegs.md                       # add / view pegs
    prototype.md                  # generate 10-prototype gallery + refine loop
    images.md                     # hero image viewer
  scripts/
    gallery.mjs                   # single localhost server for all 3 viewers
    library.mjs                   # copy image + write peg sidecar
  web/
    peg-library/                  # peg gallery UI
    prototype/                    # 5×2 iframe prototype grid + select popup
    images/                       # sticky-header image picker
```

### The prototype gallery

For each brief, the skill:

1. Assembles a 4-part prompt: **aesthetic**, **reference pegs**, **intent**, and **guardrails**.
2. Clusters your pegs into 5 distinct style families.
3. Generates 10 prototypes: one per style with `impeccable`, one per style with `design-taste-frontend`.
4. Serves them in a **5 rows × 2 columns** iframe gallery — `impeccable` left, `taste` right.
5. Lets you pick one and either **refine** (3 variations) or **populate images**.

---

## Local viewer server

`scripts/gallery.mjs` is a zero-dependency Node server. Run it as:

```bash
node zuhlke-design/scripts/gallery.mjs peg-library
node zuhlke-design/scripts/gallery.mjs prototype --session <id>
node zuhlke-design/scripts/gallery.mjs images --session <id>
```

It prints a URL like `ZUHLKE_URL=http://localhost:4123`, serves the matching viewer, exposes `/data.json`, and writes user selections to `~/.agents/.zuhlke-design/state/selected.json`.

See [`zuhlke-design/CONTRACT.md`](zuhlke-design/CONTRACT.md) for the full data contract.

---

## Repository layout

- `transcript.md` — source video transcript that inspired the workflow.
- `references/impeccable/` — local mirror of the `impeccable` skill structure (for reference only; installs now use `npx skills add`).
- `references/taste-skill/SKILL.md` — local mirror of the taste skill.
- `build-prompt.md` — original build specification.

---

## License

The `zuhlke-design` skill code is provided as-is for personal and commercial use. The bundled `references/impeccable/` and `references/taste-skill/` retain their original licenses (Apache 2.0 and MIT respectively).
