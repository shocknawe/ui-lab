---
name: Taste Workbench
description: A quiet, tactile studio interface that keeps the chrome neutral so the prototypes and references it holds remain the only saturation in the room.
colors:
  graphite-ink: "#1f2430"
  ink: "#1a1d24"
  slate: "#5b6270"
  page: "#fbfbfc"
  surface: "#ffffff"
  divider-light: "#12161f1a"
  graphite-ink-dark: "#e7e8ec"
  text-dark: "#f1f2f4"
  slate-dark: "#9aa0ac"
  page-dark: "#0b0c0e"
  surface-dark: "#141619"
  divider-dark: "#ffffff1a"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  sm: "10px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
  button-outlined:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.slate}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
---

# Design System: Taste Workbench

## 1. Overview

**Creative North Star: "The Taste Workbench"**

This is a working interface for people who make design decisions, not a gallery placard for finished work. The chrome behaves like a well-organized studio desk: quiet, tactile, and structurally subordinate to the references and prototypes laid out on top of it. It borrows discipline from the best documentation tools — generous whitespace, precise Inter typography, flat tonal layering, and an almost monochrome graphite palette — but it avoids the cold museum austerity of a "gallery wall."

The frame's only job is to make the work on it look intentional. Saturated color, strong personality, and stylistic voice belong to the references, the pegs, and the generated prototypes. The tool itself never competes.

**Key Characteristics:**
- Graphite-neutral chrome; client color is the only saturation on screen.
- Flat by default — 1px hairline borders instead of shadows at rest.
- One typeface (Inter) across every role, differentiated by weight and tight display tracking.
- Light and dark are first-class equals, not a default plus an afterthought.
- Curation over completeness: every element earns its place.

## 2. Colors

A monochrome graphite ramp for the chrome; all hue is imported from the client being shown.

### Primary
- **Graphite Ink** (#1f2430 light / #e7e8ec dark): The near-black/near-white primary. Carries filled buttons, links, selected states, and the app mark. It reads as documentation-tool ink, never as a brand color.

### Neutral
- **Ink** (#1a1d24 light / #f1f2f4 dark): Primary text. High-contrast body and headings.
- **Slate** (#5b6270 light / #9aa0ac dark): Secondary text — metadata, captions, supporting copy. Verified to clear 4.5:1 on the page and surface tokens.
- **Page** (#fbfbfc light / #0b0c0e dark): The app background — a hair off pure white / pure black.
- **Surface** (#ffffff light / #141619 dark): Cards, panels, the app bar. Sits one step above Page.
- **Divider** (rgba(18,22,31,0.10) light / rgba(255,255,255,0.10) dark): Hairline borders and rules. The primary way surfaces are separated.

### Named Rules
**The Deference Rule.** The chrome uses zero saturated color of its own. Every hue on screen is imported from the client's palette and appears only inside the brand-specific preview zone (card header, hero mark, swatch strip). If the surrounding UI ever competes with the client color, the frame has failed its one job.

**The Hairline Rule.** Surfaces are separated by 1px dividers at ~10% ink, not by shadows or fills. Depth is a response to interaction, never a resting decoration.

## 3. Typography

**Display / Body / Label Font:** Inter (with -apple-system, BlinkMacSystemFont, Segoe UI fallback stack). Loaded weights 300–800.

**Character:** One humanist-geometric sans doing every job. Contrast comes from weight and tracking, not from a second face. Display sizes lean heavy (800) with tight negative tracking for a confident, engineered feel; body stays at 400 with a roomy 1.65 line-height for comfortable reading.

### Hierarchy
- **Display / h1** (800, ~2.5rem, 1.05, -0.03em): Page titles and the home hero. `text-wrap: balance`.
- **Headline / h2** (800, ~2rem, 1.1, -0.025em): Major section headers.
- **Title / h6** (700, ~1.25rem, 1.2): Card names, sub-section titles.
- **Body** (400, 1rem, 1.65): Descriptions and prose. Cap prose at 65–75ch.
- **Label / caption** (700, 0.75rem, +0.08em, UPPERCASE): Industry tags, eyebrow metadata on cards. The one place tracking goes positive.
- **Mono** (system monospace): Hex values and token names only — signals "this is a copyable code value."

### Named Rules
**The One-Face Rule.** Inter carries headings, buttons, labels, body, and data. Do not introduce a second family; if you need more contrast, change weight or size, never typeface.

## 4. Elevation

Flat by default. The system conveys depth through tonal layering (Page → Surface) and 1px hairline dividers, not resting shadows. Buttons ship with elevation disabled; cards render at elevation 0 with a 1px border; the app bar is elevation 0. Shadow is reserved as a **response to interaction** — it appears on card hover and nowhere at rest.

### Shadow Vocabulary
- **Hover lift** (`box-shadow: 0 16px 36px -20px rgba(0,0,0,0.4)`): The only shadow in the system. Applied to a client card on hover, paired with a −3px translateY and a border-color shift toward the ink end.

### Named Rules
**The Flat-At-Rest Rule.** No surface carries a shadow at rest. If a component needs a shadow to feel separated, use a Page/Surface tonal step or a hairline instead.

## 5. Components

### Buttons
- **Shape:** Gently rounded (10px radius), `text-transform: none`, weight 600, no elevation.
- **Primary:** Graphite Ink fill, Surface text. Padding 8px 18px. The confident default action.
- **Outlined / Ghost:** Surface (or transparent) background, Ink text, hairline border. Secondary actions like "View source".
- **Hover / Focus:** Subtle background/tint shift; keep a visible focus ring for keyboard users (WCAG 2.1 AA).

### Chips / Tags
- **Style:** Pill (16px radius), Surface background, Slate text, weight 500, hairline border. Used for personality tags and industry labels.
- **State:** Static/read-only in most contexts; never rely on color alone to convey meaning — always pair with text.

### Cards / Containers
- **Corner Style:** 12px radius, `overflow: hidden`.
- **Background:** Surface, with a 1px divider border.
- **Shadow Strategy:** Flat at rest; hover lift only (see Elevation).
- **Internal Padding:** 20px (2.5 spacing units).

### Navigation
- **Style:** A single top app bar (elevation 0, inherit color) with the app mark, a one-line tagline, and a color-mode toggle. On detail pages, a sticky in-page section nav.

### Client Card (signature component)
A strict two-layer split that encodes the Deference Rule structurally. **Top:** the only brand-specific zone — a solid, flat field of the client's brand color, edge to edge, carrying an app-icon-style white monogram tile (brand-colored initials) and a white chip holding the palette swatch strip. No gradients, no texture, no decoration. **Bottom:** pure neutral design system — identical industry label, name, description, personality tags, and "View design language →" affordance for every client; only the content changes. This is the home-page grid's atomic unit and the primary object of iteration.

### Brand Monogram (signature component)
A generated, dependency-free SVG tile standing in for trademarked client logos. Solid flat fill (no gradient); an `inverted` variant renders a white tile with brand-colored initials for placement on a solid brand field. Shape motifs (ring / dot / split / bars) use the client's secondary color to keep each mark distinct.

## 6. Do's and Don'ts

### Do:
- **Do** keep the chrome graphite-neutral; let client color be the only saturation on screen (The Deference Rule).
- **Do** separate surfaces with 1px hairline dividers at ~10% ink, and reserve the single hover shadow for interaction.
- **Do** carry all hierarchy with Inter weight and scale; use tight negative tracking (≥ -0.03em) on display sizes.
- **Do** treat light and dark as equals — verify every token pair, and keep Slate text ≥ 4.5:1 on both Page and Surface.
- **Do** pair any color-coded meaning (swatches, confidence, semantics) with a text label — never color alone (WCAG 2.1 AA).
- **Do** honor `prefers-reduced-motion` with an instant/crossfade alternative for the card hover and any transition.

### Don't:
- **Don't** let the tool look like a marketing or landing site — no hero-metric templates, no persuasion gradients, no campaign energy.
- **Don't** add clutter or ornament that competes with the client content the page exists to showcase.
- **Don't** use gradient text or `background-clip: text` — solid color only; emphasis via weight or size.
- **Don't** use `border-left`/`border-right` colored side-stripes as accents; use full hairline borders or nothing.
- **Don't** reach for glassmorphism or decorative blur.
- **Don't** introduce a second typeface or a saturated chrome accent; graphite is the only ink the frame owns.
