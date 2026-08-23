# Phase 9 Completion Record

Implementation completed: 2026-07-18
Recorded: 2026-08-22

## Status

Phase 9 is implemented and fail-closed. The contact endpoint returns a generic unavailable response until the owner configures the Netlify production environment variables, a verified Resend sender, and Turnstile hostnames. The activation runbook and owner checklist live in `docs/contact-deployment.md`; no code work remains for this phase.

## Delivered

- One shared zod contract (`lib/contact/contract.ts`) used verbatim by the client form and the server route: NFC-normalized single-line fields, control-character and header-injection rejection, multiline normalization, length and byte caps, honeypot, minimum-fill-time, and Turnstile passthroughs.
- Server-only boundary (`'server-only'` modules): strict POST JSON content type, streaming body reader with a fatal 12,000-byte cap, exact Origin/Host cross-check, Netlify client-IP extraction with hashed privacy-preserving rate-limit keys.
- Upstash distributed limits (five per IP per hour, three per email per hour) that fail closed on infrastructure error.
- Cloudflare Turnstile verification with a five-second timeout; production requests without a valid token are rejected.
- Resend delivery with escaped plain-text/HTML bodies, reply-to, an eight-second timeout, and generic public error messages only.
- Enumerated outcome taxonomy; structured logs carry request id, outcome category, and latency only — never names, emails, or message text.
- `CONTACT_DELIVERY_ENABLED` kill switch plus non-secret contact state on `/api/health`.
- Privacy page discloses processing, retention, and deletion behavior matching the actual providers.

## Provenance

- Implementation landed in commit `493f7eb` alongside `docs/contact-deployment.md`.
- ADR `0004-contact-delivery-and-abuse-controls.md` records the provider and abuse-control decisions.

## Verification

| Command                                                                  | Result |
| ------------------------------------------------------------------------ | ------ |
| `npm run contact:security` (contract + security unit suites)             | Passed |
| `npx playwright test tests/e2e/contact.spec.ts` across all four profiles | Passed |
| Re-run on 2026-08-22                                                     | Passed |

Remaining owner actions before production activation are listed in `docs/contact-deployment.md` under "Required owner actions".
