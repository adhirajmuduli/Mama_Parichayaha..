# ADR 0004: Server-side contact boundary

Status: Accepted for security posture; provider selection deferred to Phase 9 evidence.

Contact submission will be a server-only POST boundary with schema validation, body limits, origin policy, honeypot and timing controls, production anti-bot verification, distributed rate limiting, plaintext sanitization, generic public errors, and redacted logs. Credentials, provider responses, and message bodies never enter client bundles or ordinary logs.

The mail provider, rate-limit service, Turnstile keys, allowed production origins, and retention period require owner-supplied deployment decisions. No contact endpoint will be exposed until those values are available and tested.
