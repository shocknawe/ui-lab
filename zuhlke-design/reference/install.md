# /zuhlke-design install

Ensure both design engines used by `prototype` are available in the current project's `.claude/skills/`. Copy from this skill's bundled `references/` (offline, reliable — do **not** fetch from GitHub).

## Engines and their sources

| Engine (skill `name`) | Source in this repo | Install target |
|---|---|---|
| `impeccable` | `references/impeccable/` | `.claude/skills/impeccable/` |
| `design-taste-frontend` | `references/taste-skill/` | `.claude/skills/design-taste-frontend/` |

Note the taste skill's folder is `references/taste-skill/` but its internal `name:` (and therefore its install target) is **`design-taste-frontend`**.

## Flow

1. Resolve the repo root that holds `references/` (this skill's dev repo). If the bundled `references/impeccable/` and `references/taste-skill/` aren't found relative to the invocation, ask the user for the path to the repo containing them.
2. Ensure `.claude/skills/` exists in the user's project.
3. For each engine, if the target folder is **absent**, copy the whole source folder in. If it's **present**, leave it (idempotent) and report it as already installed.
   ```bash
   mkdir -p .claude/skills
   [ -d .claude/skills/impeccable ] || cp -R references/impeccable .claude/skills/impeccable
   [ -d .claude/skills/design-taste-frontend ] || cp -R references/taste-skill .claude/skills/design-taste-frontend
   ```
4. Report a short summary: which were installed now vs already present, and that `prototype` is ready to use.

Keep it quick and non-destructive. Never overwrite an existing install without asking.
