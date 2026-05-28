# Phase 10 — Forms & Submission Flows

## Goal

All submission forms (events, listings, contact, feedback) use consistent validation UX, success states, and progress indicators.

## Files to Read

- `app/submit-event/`, `app/submit-listing/`, `app/contact/`
- `components/FeedbackButton.tsx`
- `lib/validate.ts`
- `Planning Documents/design/DESIGN.md` (form inputs)
- `Planning Documents/design/error-states.md` (form validation pattern)

## Planning Prompt

```
Phase 10 goal: every form on the site feels consistent and forgiving.

Specs:

1. All inputs use .input-base
2. Validation:
   - Inline per-field error messages in terra-600 below the field
   - Summary at top if there are multiple errors
   - Error border on invalid field (terra-600)
   - Messages are specific and helpful ("Title must be under 200 characters" not "Invalid")
3. Required fields marked with asterisk in forest-600
4. Optional fields labeled "(optional)" in body-sm muted
5. Submit buttons use .btn-primary; disabled state during submission
6. Success states:
   - Toast on success per error-states.md toast pattern
   - For long flows (submit-event, submit-listing), full success page with next-actions ("Your event is submitted. We'll review and publish within 24 hours.")
7. Audit fix: submit-event Category select moved out of "more details" toggle to the top fields
8. Photo upload (submit-listing):
   - Remove-photo button ≥32px touch target
   - Progress indicator during upload

Constraints:
- Do not change underlying validation rules (lib/validate.ts)
- Do not change API contracts
- Do not require login on contact form

Plan output: list every form file, the changes per form, where validation messages live.
```

## Iteration Checklist

- [ ] All inputs use .input-base
- [ ] Error messages specific and helpful
- [ ] Submit-event Category is visible from the top, not buried in a toggle
- [ ] Toast on success for short flows; success page for long flows
- [ ] Photo upload has visible progress

## Definition of Done

- Every form submits cleanly with appropriate feedback
- Validation errors are scannable, specific, and friendly
- Submit-event Category never hidden
- `npm run build` passes
