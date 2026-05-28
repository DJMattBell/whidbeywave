# WhidbeyWave Design System

This is the source of truth for visual and interaction language. Every phase prompt references it. Every PR introducing new visual surface must comply.

---

## Voice

Warm. Unhurried. Plain. Small-town neighbor — not corporate, not whimsical. Sentences earn their length. No exclamation marks except in user-submitted content. No "we're excited to" or "join us on this journey." We say what something is and trust the reader.

---

## Color, Encoded by Meaning

Each color has a job. Don't mix.

| Token | Hex | Meaning | Usage |
|-------|-----|---------|-------|
| `forest-700` | #2d5016 | Affirmative, primary | Primary actions, brand identity, navigation accents |
| `forest-600` | #3d6b1f | (hover state) | Hover/active on primary |
| `forest-50` | #f0fdf4 | (light surface) | Success backgrounds, subtle tints |
| `sound-700` | #1e3a5f | Informational, calm | Secondary actions, utility data (ferry/tides/weather), live indicators |
| `sound-500` | #3b82f6 | (link state) | Links in body text |
| `sound-50` | #eff6ff | (light surface) | Info backgrounds, "cached" status backgrounds |
| `amber-600` | #d97706 | Attention, warmth | Events badges, "cached" status dot, gathering surfaces |
| `amber-50` | #fffbeb | (light surface) | Warning backgrounds |
| `terra-600` | #c2410c | Urgent, grounding | Destructive actions, marketplace accents, "On Island Time" dot, our-own-error |
| `terra-50` | #fff7ed | (light surface) | Error backgrounds |
| `parchment-50` | #fefdfb | Paper surface | Page background |
| `parchment-100` | #fdf8f0 | Card surface | Card backgrounds, elevated surfaces |
| `parchment-200` | #f5ead6 | Border | Borders, dividers |
| `stone-*` | Tailwind defaults | Neutral text | Body text, neutral metadata |

**Rule of meaning:** if a status indicator uses terra, the user reads it as "something needs attention." If an action button uses terra, the user reads it as "this is destructive." Don't dilute the meaning by reusing colors decoratively.

---

## Typography

Two families:

- **Playfair Display** — headings only
- **Lora** — body

### Type Scale

| Name | Size | Weight | Font | Usage |
|------|------|--------|------|-------|
| `display` | 2.5rem / 3rem | 700 | Playfair | Hero headlines |
| `h1` | 2rem / 2.5rem | 700 | Playfair | Page titles |
| `h2` | 1.5rem / 2rem | 600 | Playfair | Section titles |
| `h3` | 1.25rem / 1.5rem | 600 | Playfair | Card titles |
| `body-lg` | 1.125rem | 400 | Lora | Lead paragraphs |
| `body` | 1rem | 400 | Lora | Body text |
| `body-sm` | 0.875rem | 400 | Lora | Captions, metadata |
| `caption` | 0.75rem | 500 | Lora | Labels, fine print |

**Mobile body base is 18px** (defined in `globals.css` html selector), bumped down to 16px at `md:` breakpoint and up. This is for older-user readability on phones.

A `.text-large` class on `<html>` enables larger-text accessibility mode site-wide. Toggle is in the footer via `TextSizeToggle`.

### Heading Rules

- Only one `h1` per page.
- Never skip heading levels.
- Playfair Display for all headings.
- Lora for all body text.

---

## Spacing

Based on a 4px grid.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps (icon + label) |
| `space-2` | 8px | Inline spacing |
| `space-3` | 12px | Card internal padding (compact) |
| `space-4` | 16px | Standard card padding, form gaps |
| `space-6` | 24px | Section internal spacing |
| `space-8` | 32px | Between cards in a grid |
| `space-12` | 48px | Between page sections (mobile) |
| `space-16` | 64px | Major section breaks (desktop) |

Section rhythm on the home and other long pages: section, breath, section, breath. Minimum 48px between major sections on mobile, 64px on desktop.

---

## Touch Targets

- **Minimum touch target:** 44px × 44px
- **Buttons:** min-height 44px, min-width 44px
- **Links in lists:** full row tappable
- **Icon buttons:** 44px hit area even if icon is 24px
- **Spacing between targets:** minimum 8px

No exceptions. The styled button classes in `globals.css` (`.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-destructive`) all set min-height 44px.

---

## Card Pattern

### Anatomy
```
┌─────────────────────────────┐
│  [Optional image/badge]     │  ← top accent
│                             │
│  Title (h3, Playfair)       │  ← always present
│  Metadata (caption, muted)  │  ← date, category, author
│                             │
│  Description (body-sm)      │  ← 2–3 lines max, clamp
│                             │
│  [Action area]              │  ← buttons, links
└─────────────────────────────┘
```

### Card Rules

- Background: `parchment-50`
- Border: `parchment-200` (1px)
- Border-radius: `rounded-xl` (12px)
- Shadow: `shadow-warm` (rest), `shadow-warm-md` (hover)
- Padding: 16px (mobile), 20px (desktop)
- Transition: shadow 300ms ease, transform 150ms ease
- Hover: subtle lift (translateY -1px) + shadow increase
- Full-card clickable where appropriate (wrap in `<Link>`)

The `.card` class encapsulates this. Use `.card-pressable` for cards that need active-state scale feedback (mobile listings).

### Card Variations

- **Listing card** — adds aspect-4:3 image above title
- **Forum card** — adds unread-dot indicator before title when new activity
- **Flash give card** (Phase 16) — thin gift-icon strip across the top instead of plain title row (acts of generosity earn a small visual distinction)
- **Recommendation card** (Phase 17) — terra accent (since recommendations are exchange-of-trust)

No other card variations without an explicit roadmap entry.

---

## Buttons

### Primary
- Background: `forest-700`, Hover: `forest-600`
- Text: white
- Radius: `rounded-lg` (8px)
- Padding: 12px 24px
- Font: Lora 600
- Min height: 44px

### Secondary
- Background: transparent, border 1px `forest-700`
- Text: `forest-700`
- Hover: `forest-50` background

### Ghost
- Background: transparent
- Text: `forest-700`
- Hover: `parchment-100`
- For less prominent actions

### Destructive
- Background: `terra-600`
- Text: white
- For irreversible actions only

---

## Form Inputs

- Border: 1px `parchment-200`
- Radius: `rounded-lg`
- Padding: 12px 16px
- Focus: 2px ring `forest-700`, offset 2px
- Min height: 44px
- Font size: 16px minimum (prevents iOS zoom)
- Error state: border `terra-600`, message below in `terra-600`
- Disabled: opacity 0.5, cursor not-allowed

`.input-base` class encapsulates this.

---

## Layout

### Max Widths
- Content (reading): `max-w-4xl` (896px)
- Wide (grids): `max-w-6xl` (1152px)
- Full (dashboards): `max-w-7xl` (1280px)

### Page Structure
```html
<main>
  <header>          <!-- Page title + breadcrumb -->
    <h1>
    <p subtitle>
  </header>
  <section>         <!-- Repeating content sections -->
    <h2>
    [content]
  </section>
</main>
```

### Grid
- Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Gap: `gap-6` (24px)
- Marketplace: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

---

## Animations

### Principles
- Subtle, never flashy
- Serve a purpose (guide attention, confirm action)
- Duration: 150–300ms
- Easing: ease-out for enters, ease-in for exits

### Standard Transitions
- Hover lift: `translateY(-1px)` over 200ms
- Fade in: opacity 0→1 over 200ms
- Slide up: `translateY(8px)→0` + fade over 300ms
- Skeleton pulse: subtle opacity oscillation

### Gestures (Phases 6–7)
- Pull to refresh — Home, Today block
- Horizontal scroll with snap — Today tiles, "Neighbors are giving" (Phase 16)
- Bottom sheet — forum reply, new post, contact seller, FAB actions
- Swipe between photos — listing lightbox

### Prohibited
- Animations longer than 300ms
- Modal popups for anything non-destructive
- Carousels (horizontal scroll with snap is the substitute)
- Sticky elements other than: top brand bar, bottom tab bar, FAB
- Auto-playing media
- Pop-ups that block content

---

## Iconography

- Style: Lucide icons (outline, 1.5px stroke)
- Sizes: 20px body, 24px navigation, 16px inline
- Color: inherit from text color
- Never use emoji as functional icons (decorative use is acceptable in user-submitted content)

---

## Empty States, Error States, and Data Status

Use the canonical patterns in `empty-states.md` and `error-states.md`. Never silently render an empty list.

Every section that depends on live data (ferry, tides, weather, scraped events) carries a quiet data status indicator showing whether the data is live, cached with timestamp, or "On Island Time" (upstream source unreachable). See `error-states.md` for the pattern. The `<DataStatus>` component (added in Phase 14) implements it.

Error states follow the framing distinction:
- **"On Island Time"** = upstream API we depend on is down
- **"Something's broken on our end"** = our code, our bug
- **"You're offline"** = the user's connection
- **"Sign in to continue" / "Locals only"** = intentional gates

Mixing these framings is the failure mode. Owning our own bugs honestly builds more trust than uniform charm.

---

## Inclusion

- Default body 18px on mobile, 16px on desktop (older-user readability)
- Large-text toggle (`TextSizeToggle`) in footer
- All images carry alt text
- All icon-only buttons carry aria-label
- Color is never the only signal — pair with shape, icon, or text
- Focus states visible and high-contrast (2px forest-700 ring with 2px offset)
- Coast Salish land acknowledgment in footer and `/lands` page (Phase 9)
- Future: OpenDyslexic font option, Spanish translation of visitor pages

---

## Responsive Breakpoints

| Name | Min-width | Usage |
|------|-----------|-------|
| `sm` | 640px | Two-column layouts begin |
| `md` | 768px | Tablet landscape, desktop nav |
| `lg` | 1024px | Three-column grids |
| `xl` | 1280px | Four-column grids, wide content |

Mobile-first means designing at 320px first, then enhancing up. Every new component must work at 320px before it works at 1280px.

---

## Performance Constraints

- No image larger than 200KB above the fold without explicit justification
- No hero video, ever
- Cumulative Layout Shift < 0.05 after initial paint
- Skeleton placeholders match final content dimensions
- Heavy components lazy-loaded below the fold
- LCP target < 2.5s on mobile
- Initial JS budget < 200KB per page
