import { chromium, devices } from '@playwright/test'

const probe = async () => {
  const browser = await chromium.launch({ channel: 'chrome' })

  for (const descriptor of ['iPhone 13', 'Desktop Chrome']) {
    const context = await browser.newContext({ ...devices[descriptor] })
    const page = await context.newPage()

    await page.goto('http://127.0.0.1:3100/contact', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    })

    const report = await page.evaluate(() => ({
      pointerCoarse: window.matchMedia('(pointer: coarse)').matches,
      pointerFine: window.matchMedia('(pointer: fine)').matches,
      anyPointerCoarse: window.matchMedia('(any-pointer: coarse)').matches,
      anyPointerFine: window.matchMedia('(any-pointer: fine)').matches,
      hover: window.matchMedia('(hover: hover)').matches,
      anyHover: window.matchMedia('(any-hover: hover)').matches,
      maxTouchPoints: navigator.maxTouchPoints,
      touchSupport: 'ontouchstart' in window,
    }))

    console.log(descriptor, JSON.stringify(report))

    await context.close()
  }

  await browser.close()
}

probe().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
