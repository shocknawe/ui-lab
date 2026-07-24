# Product

## Register

product

## Users

Design-minded developers, product designers, and creative technologists who are building web experiences for clients or their own products. They are comfortable in code, distrust generic one-shot AI output, and want a repeatable way to generate and compare distinctive design directions. They use this tool inside Claude Code, in short iterative bursts, often while switching between terminal and browser.

## Product Purpose

`ui-lab` is a Claude Code skill that turns a design brief and a curated taste library into competing, production-grade web-design prototypes. It operationalizes the anti-AI-slop workflow: cultivate taste (save reference images as "pegs"), cast a wide net (generate ten prototypes across five style families and two design engines), pick a direction in a side-by-side gallery, refine it, then populate it with generated hero assets.

Success means the user ends up with a real, editable prototype that looks like a deliberate design decision — not a template, not a "vibe", and not the default AI palette.

## Brand Personality

Curated. Opinionated. Tactile.

- **Curated**: every feature points the user toward better taste, not more options.
- **Opinionated**: the skill has a point of view about what good design is and is not; defaults and guardrails make that visible.
- **Tactile**: interfaces feel like a studio workbench — direct, responsive, and precise — not a dashboard or a slide deck.

## Anti-references

What the skill itself should not feel or look like:

- Generic AI landing-page generators (one safe output, SaaS-cream palette, hero-metric templates).
- Template marketplaces (cluttered grids, overpromising thumbnails, decision fatigue).
- Cold enterprise tooling (dense chrome, feature lists, no craft).
- Glassmorphism-as-identity, gradient text, decorative side-stripes, or any other currently saturated AI aesthetic tells.
- A passive gallery wall: this is a working interface, not a museum placard.

## Design Principles

1. **Taste before generation.** The skill surfaces curated references before it writes a single prototype. Good output starts with good input.
2. **Show ten real directions, not one safe default.** Wide-net comparison is the core mechanic; the tool makes choosing between distinct directions easier than prompt-tweaking.
3. **Chrome gets out of the work's way.** The skill's own interface is quiet, neutral, and structurally subordinate to the prototypes and references it displays.
4. **Every artifact is editable and ownable.** Generated files are plain HTML/CSS/JS. Nothing is locked inside a format or a walled garden.
5. **Motion is precise, not theatrical.** Transitions and feedback are fast, predictable, and reduced to instant/crossfade when the user prefers less motion.
6. **The tool itself should pass the AI-slop test.** If the interface that produces anti-slop design looks like slop, it has failed its own premise.

## Accessibility & Inclusion

- Target WCAG 2.1 AA for contrast, keyboard operation, and focus visibility.
- Honor `prefers-reduced-motion` on every animated transition.
- Never use color alone to signal meaning; pair swatches, selection states, and status with labels or icons.
- Keep the viewer interfaces responsive down to small viewports with no horizontal body scroll.
