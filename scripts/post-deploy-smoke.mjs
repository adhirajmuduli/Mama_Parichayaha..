const deploymentUrl = process.env.DEPLOYMENT_URL?.trim()

if (!deploymentUrl) {
  throw new Error('Set DEPLOYMENT_URL to the deployed site origin before running this smoke check.')
}

const baseUrl = new URL(deploymentUrl)

if (baseUrl.protocol !== 'https:' && process.env.SMOKE_ALLOW_HTTP !== 'true') {
  throw new Error(
    'DEPLOYMENT_URL must use HTTPS unless SMOKE_ALLOW_HTTP=true is set for a local check.',
  )
}

const expectedHeaders = [
  'content-security-policy',
  'cross-origin-opener-policy',
  'permissions-policy',
  'referrer-policy',
  'x-content-type-options',
  'x-frame-options',
]
const checks = [
  { path: '/', contentType: 'text/html' },
  { path: '/api/health', contentType: 'application/json', cacheControl: 'no-store' },
  { path: '/icon.png', contentType: 'image/png' },
  { path: '/manifest.webmanifest', contentType: 'application/manifest+json' },
  { path: '/robots.txt', contentType: 'text/plain' },
  { path: '/sitemap.xml', contentType: 'application/xml' },
  { path: '/opengraph-image', contentType: 'image/png' },
  { path: '/models/dna_for_site.glb', contentType: 'model/gltf-binary', cacheControl: 'max-age=' },
]

async function assertCheck({ path, contentType, cacheControl }) {
  const response = await fetch(new URL(path, baseUrl), { redirect: 'error' })

  if (!response.ok) {
    throw new Error(`${path} responded with ${response.status}.`)
  }

  const receivedContentType = response.headers.get('content-type') ?? ''
  if (!receivedContentType.includes(contentType)) {
    throw new Error(
      `${path} returned ${receivedContentType || 'no content type'}, expected ${contentType}.`,
    )
  }

  if (cacheControl && !(response.headers.get('cache-control') ?? '').includes(cacheControl)) {
    throw new Error(`${path} is missing expected Cache-Control directive ${cacheControl}.`)
  }

  return response
}

const homepage = await assertCheck(checks[0])

for (const header of expectedHeaders) {
  if (!homepage.headers.get(header)) {
    throw new Error(`Homepage is missing required ${header} header.`)
  }
}

if (
  process.env.SMOKE_EXPECT_HSTS === 'true' &&
  !homepage.headers.get('strict-transport-security')
) {
  throw new Error('Homepage is missing Strict-Transport-Security while SMOKE_EXPECT_HSTS=true.')
}

for (const check of checks.slice(1)) {
  await assertCheck(check)
}

const health = await fetch(new URL('/api/health', baseUrl)).then((response) => response.json())
if (health.status !== 'ok') {
  throw new Error('Health response does not report status=ok.')
}

if (process.env.SMOKE_EXPECT_CONTACT === 'true' && health.contact !== 'configured') {
  throw new Error(`Contact is ${String(health.contact)}; expected configured.`)
}

console.log(
  JSON.stringify({
    contact: health.contact,
    deployment: baseUrl.origin,
    event: 'post_deploy_smoke_passed',
    hsts: Boolean(homepage.headers.get('strict-transport-security')),
  }),
)
