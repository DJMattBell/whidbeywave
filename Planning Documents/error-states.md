# Error State Patterns

This doc covers two related things:

1. **Data status** — how the site communicates that things are working, or aren't, so users never have to guess
2. **Error states** — five canonical patterns for when something fails

Together they answer "can I trust what I'm seeing right now?"

---

## The Principle

Whidbey humor is welcome. Confusion is not.

We use the phrase **"On Island Time"** as the warm framing for upstream APIs we depend on being unavailable. But warmth never obscures substance. Every status message answers two questions, fast:

1. **What's not working?** (Specifically.)
2. **What about this data should I trust right now?** (Live, cached with timestamp, or missing.)

A commuter checking the ferry at 6am doesn't have time to decode metaphors. The headline can be charming. The substance cannot be vague.

---

## Data Status Indicators

Every section that depends on live data carries a quiet status indicator. Users don't have to look for it, but it's there when they do.

### Three states

| State | Visual | Means |
|---|---|---|
| **Live** | small forest-700 dot, "Live" caption | Data is current, from upstream |
| **Cached** | small amber-600 dot, "Updated HH:MM" caption | Data is from cache, with timestamp |
| **On Island Time** | small terra-600 dot, "On Island Time" caption | Source is unreachable, no recent cache |

### Placement

The indicator sits at the top-right of any data-dependent section, in `text-caption` size, opacity 70%. Examples:

- Ferry section header: "Ferry • Live"
- Tides section header: "Tides • Updated 6:14am"
- Weather widget: "Weather • On Island Time"

Tapping the indicator opens a small sheet explaining: what source feeds this data, when it was last successful, and what "On Island Time" means right now (e.g., "We can't reach WSDOT — they may be doing maintenance. We'll keep trying.").

### Why three states, not two

Cached-with-timestamp is different from broken. A commuter offline on the ferry with 30-minute-old tide data is fine. A commuter at the terminal with no data at all is not. The amber/terra distinction matters.

### Implementation

The `<DataStatus>` component is added in Phase 14 alongside the observability tooling. Until then, sections use inline timestamp text per existing patterns.

---

## Error Categories

### 1. You're Offline (recoverable, user-side)

> ⚠ You're offline. Showing what we have cached.
>
> *Last refreshed: 2 hours ago*

**Triggered by:** `navigator.onLine === false` or network fetch error.
**Visual:** small sound-blue banner at top of affected section. DataStatus on each cached section shows amber dot.
**Action:** none — passive. Auto-clears when signal returns.
**Voice note:** this is the user's situation, not ours. No "On Island Time" framing — that phrase is reserved for *our* upstream outages.

### 2. On Island Time (upstream API unavailable)

> ⚠ Ferry status is on island time.
>
> We can't reach the schedule right now. We'll keep trying. The last known status is from 23 minutes ago.
>
> [Try again →]

**Triggered by:** WSDOT, NOAA, Open-Meteo, etc. returning 4xx, 5xx, or timing out.
**Visual:** inline within the affected card. Terra accent (matches the status indicator).
**Action:** manual retry button. Also auto-retries every 60s in background.
**Voice note:** name what's on island time specifically. Never generic "service unavailable."

Source-specific variants (same pattern):

- "Ferry status is on island time."
- "Weather is on island time."
- "Tides are on island time."
- "The newsletter is on island time."
- "Notifications are on island time."

### 3. Form Validation (recoverable)

- **When:** User submits invalid data
- **Pattern:** Inline per-field messages + summary at top
- **Tone:** Specific and helpful ("Title must be under 200 characters")
- **Visual:** Field border `terra-600`, message below in `terra-600`, no icon (color is sufficient)

### 4. Sign In Required (intentional gate)

> ⚠ You'll need to be signed in to [reply / post a listing / recommend a business].
>
> [Sign in →]

**Triggered by:** authenticated-only action without auth.
**Visual:** bottom sheet on mobile, modal on desktop. Forest accent.
**Voice note:** this is a polite gate, not an error. No "On Island Time" framing.

### 5. Locals Only (Phase 17 — recommendations)

> ⚠ This one's locals-only.
>
> Recommendations come from neighbors with a Whidbey zip on their profile. If you live on Whidbey, you can update your zip in your profile. If you're visiting, you're welcome to read everything here.
>
> [What "local" means here →]

**Triggered by:** non-local user attempting to recommend, etc.
**Visual:** bottom sheet on mobile, modal on desktop. Forest accent.
**Voice note:** never exclusionary in tone. Acknowledge visitor presence positively.

### 6. Not Found (terminal)

- **When:** Page or resource doesn't exist
- **Pattern:** Full-page 404 with navigation suggestions
- **Tone:** "This page doesn't exist on the island."

### 7. Something's Broken on Our End (terminal, our fault)

> ⚠ Something's broken on our end. We've been notified.
>
> [Try again →  ·  Tell us what happened →]
>
> *Error ID: a1b2c3*

**Triggered by:** unhandled exception, captured by error boundary or Sentry.
**Visual:** full-section replacement. Terra accent.
**Voice note:** "we" own it. Specific where possible ("the marketplace search is broken" beats "something went wrong"). **Never "On Island Time" framing for our own bugs** — that's reserved for upstream outages. Owning our bugs honestly builds more trust than uniform charm.

---

## When to Use Which Framing

This distinction is load-bearing.

| Situation | Framing | Why |
|---|---|---|
| Upstream API down | "On Island Time" | Not our fault, but we're honest about what's affected |
| Our code/infrastructure | "Something's broken on our end" | Plain because we own it; accountability beats cuteness |
| User is offline | "You're offline" | Their situation, factual |
| Auth/permission gate | "Sign in to continue" / "Locals only" | Polite gate, not error |

Mixing these is the failure mode. Don't say "On Island Time" when our code crashed. Don't say "Something broke on our end" when WSDOT is down.

---

## Error Banner Component

```
┌──────────────────────────────────────────┐
│ ⚠ [Message text]            [Retry btn] │
└──────────────────────────────────────────┘
```

- Background: `terra-50`
- Border-left: 3px solid `terra-600`
- Icon: `AlertTriangle` (Lucide), `terra-600`
- Text: `stone-700`
- Retry: ghost style
- Radius: `rounded-lg`
- Padding: 12px 16px

Use the `.error-banner` class from `globals.css`. There are also `.success-banner` (forest accent) and `.info-banner` (sound accent) for the related patterns.

---

## Toast Notifications

- Position: bottom-center on mobile, top-right on desktop
- Duration: 4 seconds auto-dismiss
- Success: `forest-50` bg, `forest-700` text, `CheckCircle` icon
- Error: `terra-50` bg, `terra-600` text, `AlertCircle` icon
- Animate: slide-up + fade-in on enter, slide-down + fade-out on exit

---

## Graceful Degradation Rules

| Service | If unavailable | Show instead |
|---|---|---|
| WSDOT Ferry API | DataStatus → "On Island Time" | "Ferry status is on island time" inline card with retry |
| Weather API | DataStatus → "On Island Time" | "Weather is on island time" inline; or hide the section |
| Tide API | DataStatus → "On Island Time" | "Tides are on island time" inline |
| Supabase | Show static data | Fallback to `lib/data.ts` demo content (clearly flagged as demo) |
| Resend | Succeed silently | DB write still completes; notification fires later via cron retry |
| Event scrapers | Return [] | Only show manually submitted events; DataStatus on Events page reflects the most-pessimistic source state |

---

## Logging

Every error state logs to Sentry (Phase 14) with:

- `kind` (one of the seven above)
- `source` (what specifically — ferry, weather, marketplace, etc.)
- `user_id` if authenticated
- `last_successful_fetch_at` for on-island-time and offline
- Stack trace if available

This is how we know what to fix and how often "On Island Time" actually happens. If WSDOT goes down twice a week, that's a real operational signal.

---

## Tone Rules (Summary)

- "We" when we own the problem, "you" when the user has agency
- Name what's broken specifically
- Never leave the user wondering whether the data they see is current
- No technical detail in user-visible text — error IDs link to a contact form
- Never blame the user
- No animated illustrations of broken robots
- No "Oops!"
- "On Island Time" is reserved for upstream outages; using it for our own bugs dilutes the meaning
