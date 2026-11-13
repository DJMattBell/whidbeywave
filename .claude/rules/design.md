# Design Rules

Applies when editing: components/, app/**/page.tsx, app/globals.css, tailwind.config.ts

- Palette: forest (brand), sound (utility), warmth (events/highlights), terra (accent/urgent), parchment (backgrounds)
- No `red-*` Tailwind classes — use `terra-*`. ESLint enforces this. Only exception: `.badge-now` in globals.css
- Fonts: Playfair Display headings, Lora body
- Background: `bg-parchment-50`, body text: `text-stone-800`
- Mobile-first always. Touch targets >= 44px
- No sharp gradients, glowing effects, or SaaS/startup aesthetics
- Tone: warm, unhurried, small-town Pacific Northwest neighbor
- Use component classes from globals.css: `.btn-primary`, `.btn-secondary`, `.card`, `.section-title`, `.badge`
- Shadow scale: `shadow-warm-sm`, `shadow-warm`, `shadow-warm-md`, `shadow-warm-lg`
