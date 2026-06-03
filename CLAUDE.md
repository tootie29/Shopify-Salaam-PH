# CLAUDE.md — Salaam Pizza

> **Read `AGENTS.md` first.** It is the canonical reference for Shopify Liquid syntax,
> filters, objects, tags, theme architecture, `{% schema %}` rules, and translation/locale
> standards — **all of those rules still apply.** This file documents only what is *specific
> to this project* and the few places where it **intentionally deviates** from the Skeleton
> defaults described in `AGENTS.md`. When they conflict, **this file wins for Salaam Pizza.**

## What this is

A **high-conversion Shopify storefront for Salaam Pizza** ("Salaam PH"), a halal pizza brand.
It is built on Shopify's **Skeleton** theme and customized into a food-ordering / restaurant
experience: menu-style product grids, quick-add product modal, hero banners, catering &
franchise landing pages, and an embedded AI chat assistant.

The merchant customizes pages via the theme editor — **our job is to ship clean, fast,
accessible sections, blocks, and snippets that convert.**

🚨 Call `learn_shopify_api` once before working on Liquid (per `AGENTS.md`).

## Brand & design tokens

- **Colors:** red `#D90000` (`--color-red`, primary CTA / accent), black `#000` (`--color-black`),
  white `#fff` (`--color-white`). Red-on-black-on-white is the brand system — keep CTAs red.
- **Type:** display/body font is **Akshar** (imported via `@import` at the top of
  `assets/custom.css`). The theme-setting `font_picker` (`settings.type_primary_font`) still
  feeds `css-variables.liquid`, but the live brand face is Akshar from `custom.css`.
- **Fluid type scale:** use the `clamp()` variables `--text--4 … --text-8` defined in
  `:root` in `custom.css`. **Do not hardcode `font-size` in px/rem** — pick a step on the scale.
- **Weights:** use the `--font-primary-weight-*` variables (light 300 → extra-bold 900).
- Theme-setting-driven vars (`--page-width`, `--page-margin`, `--color-background`,
  `--color-foreground`, `--style-border-radius-inputs`) come from `snippets/css-variables.liquid`,
  rendered inline in `layout/theme.liquid`.

## ⚠️ CSS & JS — this theme deviates from Skeleton/`AGENTS.md`

`AGENTS.md` says to scope CSS/JS with per-component `{% stylesheet %}` / `{% javascript %}`
tags. **This project does NOT follow that.** Match the existing pattern instead:

- **CSS lives in global asset files**, loaded in `layout/theme.liquid`:
  - `assets/critical.css` — above-the-fold essentials, preloaded.
  - `assets/normalize.css` — reset.
  - `assets/custom.css` — **the main stylesheet (~840 lines): brand tokens, type scale,
    components, section styles.** Most new styling goes here.
- **JS lives in standalone vanilla files** loaded near the section that needs them via
  `{{ 'file.js' | asset_url | script_tag }}` or `<script src="{{ 'file.js' | asset_url }}" defer>`:
  - `assets/header.js` — header modal, contact dropdown, AJAX contact form, search toggle.
  - `assets/product-modal.js` — quick-add / order modal (loaded by `best-seller-section`).
  - Pattern: **IIFE, no framework, no build step.** Hook into the DOM with `data-*` attributes
    (`[data-modal]`, `[data-modal-open]`, `[data-contact-dropdown]`), guard every lookup for null,
    and re-init safely on `DOMContentLoaded`.

When adding a small, truly self-contained component you *may* use `{% stylesheet %}`/`{% javascript %}`
(as in `blocks/`), but for anything touching shared layout, brand tokens, or existing components,
**edit `custom.css` / the relevant asset JS** so styles stay coherent.

## Naming conventions (follow exactly)

- **BEM-ish:** block `site-header`, element `site-header__inner`, modifier `best-seller-item--image-wrapper`.
- Section wrappers use the `section` + `section--container` / `section--header` / `section--body` pattern.
- Buttons: `btn btn--black`, brand red CTAs — reuse existing button classes, don't invent new ones.
- Every custom `<section>` carries `id="{{ section.id }}"`, `data-section-id`, and
  `data-section-type="<kebab-name>"` so JS can scope to it.
- Product cards expose data hooks for the modal flow, e.g.
  `data-product-title`, `data-product-image`, `data-variant-id`,
  `data-product-variants='{{ product.variants | json | escape }}'`, `data-product-url`.
  Preserve these when editing product grids — the quick-add modal depends on them.

## Project layout (where the custom work is)

- **Custom sections** (`sections/`): `hero-banner-section`, `hero-banner-background`,
  `best-seller-section` (menu grid + quick-add modal), `grid-section`, `cta-section`,
  `info-boxes`, `custom-section`. The rest are Skeleton defaults
  (`product`, `collection`, `cart`, `search`, `header`, `footer`, …).
- **Blocks** (`blocks/`): `group`, `text` (Skeleton primitives) and `ai_gen_block_*.liquid`
  (theme-editor-generated — treat as merchant-owned; don't refactor unless asked).
- **Custom page templates** (`templates/`): `page.catering.json`, `page.franchise.json`,
  `page.resources.json` (alternate `page` templates the merchant assigns in admin).
- **Snippets** (`snippets/`): `css-variables`, `meta-tags`, `image`.
- **Layout:** `layout/theme.liquid` (main) also embeds the **Fastbots AI chat widget**
  (`app.fastbots.ai/embed.js`) — leave it unless asked to change it.
- **Locales:** `locales/en.default.json` is **auto-generated** (admin language editor may
  overwrite it). Add new English keys, keep them hierarchical/snake_case (e.g.
  `sections.best_seller.see_more`), and use `{{ 'key' | t }}` for all user-facing text
  per `AGENTS.md`.

## Conversion priorities (this is a sales theme)

When building or editing, optimize for these — they are the point of the project:

1. **Speed / Core Web Vitals.** Lazy-load below-the-fold images (`loading: 'lazy'`), keep
   `critical.css` lean, set responsive `image_url` widths + `sizes`, avoid layout shift.
2. **Clear CTAs.** Prominent red "order / add to cart / see more" buttons; minimize clicks to
   checkout. The quick-add modal exists to shorten the path — keep it working.
3. **Mobile-first.** Most pizza orders are on phones. Test narrow viewports; use the fluid
   type scale and the `columns_mobile` select pattern (`AGENTS.md`) for grids.
4. **Trust & accessibility.** Semantic markup, `aria-*` on interactive controls, visible focus,
   `alt` text on product imagery, labelled forms (`visually-hidden` labels are already used).
5. **Merchant-editable.** Expose copy, images, links, and toggles via `{% schema %}` settings
   so marketing can iterate without code changes.

## Tooling & workflow

- **Shopify CLI:** `shopify theme dev` (local preview), `shopify theme push` / `pull`.
- **Linting:** `theme-check` is configured (`theme-check:recommended` in `.theme-check.yml`) —
  keep changes lint-clean. The VS Code Shopify Liquid extension provides inline linting.
- **`.shopifyignore`** controls what CLI pushes/pulls. **`config/settings_data.json`** holds
  live merchant data — don't overwrite it casually.
- Validate `{% schema %}` JSON against the schemas referenced in `AGENTS.md`
  (`schemas/section.json`, `schemas/theme_block.json`, `schemas/theme_settings.json`,
  `schemas/translations.json`).

## House rules

- Match the **comment density, indentation, and idioms of the file you're editing.**
- Reuse existing classes, CSS variables, and `data-*` hooks before adding new ones.
- Don't migrate this theme to the per-component `{% stylesheet %}`/`{% javascript %}` pattern
  unless explicitly asked — it would fragment the global stylesheet.
- All user-facing strings go through translation keys; only add English.
