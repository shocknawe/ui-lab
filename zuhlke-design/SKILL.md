---
name: zuhlke-design
description: >-
  Taste-driven, anti-AI-slop web design workflow. Use this whenever the user
  wants to cultivate a design inspiration/taste library, save reference design
  images ("pegs"), generate multiple landing-page or website prototypes in
  several distinct styles to compare side by side, iterate or refine a chosen
  design, or populate a design with generated hero imagery. Trigger it for
  requests like "save this design screenshot", "show me my design pegs / taste
  library", "make me 5 different landing page directions", "prototype a few
  styles for X and let me pick", "refine this prototype into variations", or
  "generate a hero image for this page" — even when the user doesn't name the
  skill. Runs as /zuhlke-design [install | pegs | prototype | images].
user-invocable: true
argument-hint: "[install · pegs [<image>|library] · prototype <brief> · images]"
allowed-tools:
  - Bash(node *)
---

Operationalizes the anti-slop design method from `transcript.md`: **cultivate taste → cast a wide net of prototypes → iterate → generate assets.** You inject the user's taste (their *pegs*) into every step instead of settling for regression-to-the-mean output.

## How it's wired

- **Code lives in this skill** (`scripts/`, `web/`). **User data lives in `~/.agents/.zuhlke-design/`** — resolved from the home dir, so macOS `~/.agents/...` and Windows `%USERPROFILE%\.agents\...` both work.
- `scripts/gallery.mjs` is one localhost server with three modes (`peg-library` | `prototype` | `images`); it serves the matching `web/<mode>/` viewer, a `/data.json` feed, and records the user's click to `state/selected.json`. The contract is in `CONTRACT.md`.
- Two design engines power prototyping: **impeccable** and **design-taste-frontend** (the "taste skill"). The `install` command puts both in the project.

Data layout:
```
~/.agents/.zuhlke-design/
  library/<slug>/image.<ext> + <slug>.md   # pegs (taste library)
  prototypes/<session>/*.html + data.json  # generated prototypes
  images/<session>/*.png + data.json       # generated hero assets
  state/selected.json                      # last click from a viewer
```

## Commands

| Command | What it does | Reference |
|---|---|---|
| `install` | Install `impeccable` + `design-taste-frontend` into `.claude/skills/` if missing (prereq for `prototype`). | [reference/install.md](reference/install.md) |
| `pegs <image.jpg>` | Add a peg: copy the image into the library and vision-tag it. | [reference/pegs.md](reference/pegs.md) |
| `pegs library` | Open the localhost gallery of all pegs. | [reference/pegs.md](reference/pegs.md) |
| `prototype "<brief>"` | Generate 10 prototypes (5 styles × impeccable/taste), pick one in a gallery, refine in a loop. | [reference/prototype.md](reference/prototype.md) |
| `images` | Generate hero imagery (Higgsfield) for the selected prototype and pick in a thumbnail viewer. | [reference/images.md](reference/images.md) |

## Routing

1. Read the argument. The **first word** selects the command; the rest is its target/brief.
2. **Load the matching `reference/<command>.md` and follow it** — each reference owns that command's full flow. This is non-optional; the SKILL.md table is just the map.
3. `pegs` with a second word `library` → view mode; `pegs` with a path → add mode. See `reference/pegs.md`.
4. **No argument**: briefly list the commands above and ask what they want to do. If the library is empty, suggest starting with `pegs`. If `impeccable`/`design-taste-frontend` aren't installed, suggest `install` before `prototype`.

## Serving a viewer (shared mechanic)

Every viewer is launched the same way. Run the server in the background, capture the printed URL, open it, then poll `state/selected.json` for the user's choice:

```bash
node scripts/gallery.mjs <mode> [--session <id>] [--multi]   # prints ZUHLKE_URL=http://localhost:PORT
```

Open the URL for the user (they view/click in the browser), then read `~/.agents/.zuhlke-design/state/selected.json` to learn what they picked. Kill the server when the step is done. Never let the server trigger blocking dialogs.
