# Phase 1 — Design Foundation

**Status: complete.** Tokens, button system, card system, badges, banners, empty-state primitives, input-base, animation tokens, large-text accessibility mode all shipped in `app/globals.css` and `tailwind.config.ts`.

## What Shipped

- `.btn-primary` (forest-600 / forest-700 hover, rounded-lg, 44px)
- `.btn-secondary` (transparent + forest border)
- `.btn-ghost` (transparent + forest text)
- `.btn-destructive` (terra-600)
- `.card` (rounded-xl, parchment-200 border, shadow-warm)
- `.card-elevated`, `.card-pressable`
- `.input-base` (44px, 16px font to prevent iOS zoom, focus ring)
- `.error-banner`, `.success-banner`, `.info-banner`
- `.empty-state` family (icon, title, text)
- `.section-title`, `.section-subtitle`, `.section-header`
- `.badge`, `.badge-free`, `.badge-now` (with pulse animation)
- Animation classes for slide-up, fade-in
- 18px mobile body base, 16px desktop
- `.text-large` accessibility mode (toggle in footer via `TextSizeToggle`)

## Audit Notes for Future Phases

If subsequent polish phases find additional tokens needed (e.g., new badge variants, alternate card layouts), add them here in this phase via a retro fix rather than scattering ad-hoc styles across components.

## Original Source

This phase file is preserved from the existing planning structure. The original `phase-01-design-foundation.md` content is largely intact — only the status note was added.
