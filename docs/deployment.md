# Deployment and operations

## Supported deployment profiles

The primary hosted profile is a Next-compatible platform. The current public origin is `https://adhirajmuduli.netlify.app`; configure that exact origin in `CONTACT_ALLOWED_ORIGINS`. The reproducible secondary profile is the repository `Dockerfile`, which runs the Next standalone output as a non-root Node 22.17.0 service.

Build and container commands:

- `corepack npm run build`
- `corepack npm run prepare:standalone`
- `docker build -t bio-portfolio:local .`
- `docker run --rm -p 3000:3000 --env-file .env bio-portfolio:local`

The Docker health probe calls `/api/health`. It reports only `status: ok` and a non-secret contact state: `configured`, `unavailable`, or `disabled`.

## Environment validation and contact control

The contact route remains fail-closed. It validates its required server-only configuration per request so the public portfolio remains deployable without exposing or requiring contact-provider credentials at static build time.

`CONTACT_DELIVERY_ENABLED=false` is the immediate contact failover/disable switch. It makes contact submissions return the existing generic unavailable response and causes health to report `contact: disabled`. Restore it to `true` only after the provider configuration and a controlled delivery test are verified.

Set `ENABLE_HSTS=true` only after the final HTTPS domain and subdomain policy are stable. HSTS is intentionally off by default for local, preview, and Netlify-generated preview domains.

## HTTP policy

Every response receives CSP, framing, MIME-sniffing, referrer, permission, cross-origin, DNS-prefetch, and cross-domain-policy protections. Next static chunks are immutable for one year. Model paths use a bounded one-day browser/seven-day CDN cache because deployed model filenames are not content-hashed; do not mark them immutable until filenames carry a content digest. API responses are `no-store`.

The CSP permits only same-origin application resources plus the Cloudflare Turnstile frame/script/connect origins. Any new external resource must be added deliberately to both CSP and the privacy disclosure.

## Post-deploy smoke check

Run this against each preview and production deployment:

```powershell
$env:DEPLOYMENT_URL='https://your-deployment.example'
$env:SMOKE_EXPECT_HSTS='true' # only for a stable HTTPS production domain
$env:SMOKE_EXPECT_CONTACT='true' # only after contact configuration is live
corepack npm run deploy:smoke
```

The check verifies HTTPS, security headers, health, icon, manifest, robots, sitemap, social image, deployed DNA model, content types, and cache headers. Browser checks remain the evidence for desktop/mobile WebGL, no-WebGL fallback, contact interaction, and visual rendering; run the existing Playwright suite against the deployment before promotion. The CV route is intentionally not smoke-required until the owner supplies the real CV PDF.

## Promotion, preview, and rollback

- Pull requests use the platform preview deployment and the existing quality, browser, visual, Lighthouse, and security workflows.
- Promote production only from protected `main` or a reviewed release tag after all workflows pass.
- Record the deployment URL and immutable platform deployment ID before promotion.
- Roll back by redeploying the previous known-good immutable deployment; then run `deploy:smoke` with its URL.
- If contact delivery is suspect, set `CONTACT_DELIVERY_ENABLED=false` first, redeploy, and investigate provider logs without exposing message content.

## Monitoring and privacy

No third-party browser monitoring is enabled by default. The current privacy disclosure is therefore accurate: no analytics or error tracker receives visitor data. Server contact outcomes are structured operational logs containing only request ID, outcome category, and latency.

Before adding an external monitoring provider, select it explicitly and update the privacy page, CSP, retention policy, sampling rate, and redaction contract. Any client report must exclude names, email addresses, free-text messages, raw IP addresses, URLs containing user input, and model binary data.
