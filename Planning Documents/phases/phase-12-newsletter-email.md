# Phase 12 — Newsletter & Email

## Goal

Email template design, subscription management, digest layout, preference center.

## Files to Read

- `app/newsletter/`
- `lib/email.ts`, `lib/newsletter.ts`, `lib/resend.ts`
- All API routes that send email (grep for `resend.emails.send`)
- `Planning Documents/design/DESIGN.md` (color, type)

## Planning Prompt

```
Phase 12 goal: emails feel like the site. Subscription management is clean.

Specs:

1. Email template system in lib/email.ts:
   - Shared emailLayout(content) function with header, footer, brand
   - emailButton, emailCard, emailDivider helpers
   - All inline styles (email clients don't load external CSS)
   - Forest-700 primary, parchment background, Lora-equivalent web-safe font (Georgia)

2. Email templates:
   - emailWelcome (newsletter signup confirmation)
   - emailForumReply (existing — refactor to use new layout)
   - emailListingAlert (existing — refactor)
   - emailContactReceived (existing — refactor)
   - emailEventApproved, emailListingApproved, emailGuideApproved (per existing flows)
   - emailWeeklyDigest (existing — refactor with new layout)

3. Newsletter signup:
   - Form at /newsletter and inline on home
   - Uses .input-base
   - Toast success per error-states.md
   - "Already subscribed" empty-state pattern if email already exists

4. Subscription management /newsletter/manage:
   - Token-based access (existing pattern)
   - Toggle subscription per category (news, events, weekly digest)
   - Unsubscribe link clearly visible

Constraints:
- Do not migrate existing emails to notify() yet — Phase 15 does that
- Do not change the underlying Resend integration
- Inline styles for all email HTML (no external CSS dependency)

Plan output: list all templates, the shared layout helpers, and confirm inline-style discipline.
```

## Iteration Checklist

- [ ] All emails use shared emailLayout()
- [ ] Inline styles throughout (no external CSS)
- [ ] Subscription manage page works with token
- [ ] No notify() refactor yet (Phase 15)

## Definition of Done

- Welcome email renders correctly in Gmail, Apple Mail, Outlook
- Newsletter signup → toast → confirmation email arrives
- Unsubscribe link in every email works
- `npm run build` passes
