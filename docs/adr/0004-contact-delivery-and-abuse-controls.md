# ADR 0004: Server-side contact boundary

Status: Implemented conditionally; production activation pending sender and origin configuration.

Contact submission is a server-only POST boundary with strict JSON/schema validation, body limits, exact origin/host policy, honeypot and timing controls, production Turnstile verification, distributed Upstash rate limiting, Unicode normalization, plaintext sanitization, generic public errors, and redacted logs. Credentials, provider responses, and message bodies never enter client bundles or ordinary logs.

The selected services are Resend for delivery, Upstash Redis for one-hour privacy-preserving rate-limit keys, and Cloudflare Turnstile for production anti-bot verification. Contact messages are delivered to the configured inbox and retained there until manually deleted; the site stores no message archive.

The endpoint remains fail-closed until the owner supplies an exact production origin in `CONTACT_ALLOWED_ORIGINS` and a Resend-verified `CONTACT_FROM_EMAIL`, configures every value in Netlify, and performs a controlled production submission test.
