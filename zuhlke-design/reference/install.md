# /zuhlke-design install

Ensure both design engines used by `prototype` are available in the current project's `.claude/skills/`. Install via the `skills` CLI, which fetches the published skills from GitHub.

## Engines and install commands

| Engine (skill `name`) | Install command |
|---|---|
| `impeccable` | `npx skills add pbakaus/impeccable` |
| `design-taste-frontend` (the "taste skill") | `npx skills add Leonxlnx/taste-skill` |

Note the taste skill's repo is `Leonxlnx/taste-skill`, but its internal skill `name:` is **`design-taste-frontend`**; `skills` installs it as `.claude/skills/design-taste-frontend/`.

## Flow

1. Check whether `.claude/skills/impeccable/` and `.claude/skills/design-taste-frontend/` already exist.
2. For each engine:
   - If the target folder is **absent**, run the matching `npx skills add` command above.
   - If it's **present**, leave it (idempotent) and report it as already installed.
3. Report a short summary: which were installed now vs already present, and that `prototype` is ready to use.

Keep it quick and non-destructive. Never overwrite or reinstall an existing skill without asking.

## Fallback

If `npx skills add <repo>` fails (e.g. CLI not available, shorthand not resolved), try the explicit URL form:

```bash
npx skills add https://github.com/pbakaus/impeccable --skill impeccable
npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend
```
