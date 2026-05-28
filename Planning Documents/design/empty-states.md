# Empty State Patterns

## Principles

- Never show a blank page — always communicate what could be here
- Warm, encouraging language — never accusatory or apologetic ("Oops!" is banned)
- Include a clear next action when one exists
- Lucide icons, muted color, never stock illustrations

## Anatomy

```
┌─────────────────────────────────┐
│                                 │
│         [Icon]                  │  ← Lucide, 48px, parchment-300
│                                 │
│    Headline (h3, Playfair)      │  ← What's missing
│    Subtext (body-sm)            │  ← Why / what to do next
│                                 │
│       [Optional CTA]            │  ← Primary action
│                                 │
└─────────────────────────────────┘
```

Use the `.empty-state` / `.empty-state-icon` / `.empty-state-title` / `.empty-state-text` classes already in `globals.css`.

## Standard Copy

### Events — No upcoming events
- Icon: `Calendar`
- Headline: "The calendar's looking quiet"
- Subtext: "Check back soon or submit your own community event."
- CTA: "Submit an event"

### Events — Filter returns nothing
- Icon: `Filter`
- Headline: "No events match those filters"
- Subtext: "Try adjusting your date range or categories."
- CTA: "Clear filters"

### News — No articles
- Icon: `Newspaper`
- Headline: "The newsroom is between stories"
- Subtext: "Stories from the island will appear here."

### Marketplace — No listings
- Icon: `ShoppingBag`
- Headline: "No listings yet"
- Subtext: "Be the first to post something for sale or free."
- CTA: "Post a listing"

### Marketplace — Search returns nothing
- Icon: `Search`
- Headline: "Nothing matches your search"
- Subtext: "Try different keywords or browse all categories."
- CTA: "Browse all"

### Forum — No posts in category
- Icon: `MessageCircle`
- Headline: "Nobody's asked about this yet"
- Subtext: "Start the conversation with your neighbors."
- CTA: "New post"

### Forum — No replies on a thread
- Icon: `MessageCircle`
- Headline: "Hold tight — sometimes good answers take a day"
- Subtext: (none)

### Recommendations — No reviews
- Icon: `Star`
- Headline: "No neighbors have weighed in yet"
- Subtext: "Share your experience with this place."
- CTA: "Write a review"

### Search — No results
- Icon: `Search`
- Headline: "Nothing found for "[query]""
- Subtext: "Try different keywords or check your spelling."

### Newsletter — Already subscribed
- Icon: `CheckCircle`
- Headline: "You're already on the list"
- Subtext: "Check your inbox for the next edition."

### Home — No flash gives (Phase 16)
- The section *hides itself* when there are fewer than 2 free listings. No empty state on the home — an empty Buy Nothing section signals a dead community.

### /visit/this-weekend — Nothing this weekend (Phase 9)
- Icon: `Calendar`
- Headline: "Quiet weekend ahead"
- Subtext: "A good time to wander. Browse the guides for ideas."
- CTA: "Browse all guides"

### Notifications inbox — Empty (Phase 15)
- Icon: `Bell`
- Headline: "Nothing for you right now"
- Subtext: (none)

## Tone Rules

- No "Oops!" or "Sorry!"
- No "Looks like..."
- Never "Coming soon!" except where genuinely true and dated
- Place-rooted ("the calendar's looking quiet," "nobody's asked about this yet") but not forced
- Single sentence beats two when possible

## Styling

- Container: centered, `max-w-sm`, `py-16`
- Icon: `text-parchment-300` (very muted)
- Headline: `text-stone-700`, `font-semibold`, Playfair
- Subtext: `text-stone-500`, `text-sm`
- CTA: `.btn-primary`
- Overall tone: gentle, never accusatory

## Implementation

A reusable `<EmptyState>` component should be added when convenient (Phase 14 or as needed):

```tsx
<EmptyState
  icon={Calendar}
  headline="The calendar's looking quiet"
  subtext="Check back soon or submit your own community event."
  cta={{ label: "Submit an event", href: "/submit-event" }}
/>
```

Until that component exists, use the `.empty-state*` CSS classes directly with Lucide icons inline.
