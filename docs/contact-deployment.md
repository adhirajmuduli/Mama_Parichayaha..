# Contact Delivery Deployment

The Phase 9 endpoint is fail-closed. It returns a generic unavailable response until every server-only value below is configured in the Netlify production environment.

## Required Netlify environment variables

Set these through Netlify's environment-variable UI for the production context. Do not commit or expose their values in browser code, logs, GitHub Actions, or documentation.

| Variable                         | Purpose                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `RESEND_API_KEY`                 | Resend server API credential                                                  |
| `CONTACT_TO_EMAIL`               | Inbox receiving portfolio messages                                            |
| `CONTACT_FROM_EMAIL`             | A Resend-verified sender, such as `Portfolio <contact@your-verified-domain>`  |
| `UPSTASH_REDIS_REST_URL`         | HTTPS Upstash REST endpoint                                                   |
| `UPSTASH_REDIS_REST_TOKEN`       | Upstash REST token                                                            |
| `TURNSTILE_SECRET_KEY`           | Cloudflare Turnstile server secret                                            |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile browser site key                                         |
| `CONTACT_ALLOWED_ORIGINS`        | Comma-separated exact public origins, for example `https://portfolio.example` |

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is intentionally public. Every other listed value is server-only.

## Resend sender staging

`onboarding@resend.dev` may be used temporarily as `CONTACT_FROM_EMAIL` for an owner-only smoke test that delivers to the Resend account email. Before opening the form to public use, verify a sender address/domain in Resend and replace it with that verified sender. The endpoint remains fail-closed when the sender value is missing.

## Required owner actions before production activation

1. Supply the exact Netlify site/custom-domain origin for `CONTACT_ALLOWED_ORIGINS`.
2. Verify a Resend sender domain/address and set `CONTACT_FROM_EMAIL`.
3. Add the values to Netlify production environment variables, then redeploy.
4. Confirm the Turnstile hostname allowlist contains the production domain.
5. Send one controlled submission and confirm it reaches the recipient inbox.

## Retention and deletion

Messages are delivered to `CONTACT_TO_EMAIL`; they remain in that inbox until manually deleted by its owner. The site has no message database. Upstash stores only SHA-256-derived IP/email rate-limit keys for one hour. The endpoint logs request ID, outcome category, and latency only; it never logs contact names, email addresses, affiliations, or message text.

## Security behavior

- POST JSON only; maximum body size 12,000 bytes.
- Exact allowed-origin and host comparison; no cross-origin API access.
- Server-side Unicode normalization, schema validation, control-character/header-injection rejection, and plain-text/escaped-HTML mail rendering.
- Honeypot and a 2.5-second minimum-fill-time signal.
- Production Turnstile verification with a five-second timeout; failure rejects the request.
- Upstash distributed limits: five submissions/IP/hour and three submissions/email/hour. A rate-limit failure rejects the request.
- Resend delivery has an eight-second timeout and generic public errors only.
