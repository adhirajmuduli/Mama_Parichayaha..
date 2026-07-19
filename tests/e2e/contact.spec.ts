import { expect, test } from '@playwright/test'

test('renders the accessible contact form and privacy boundary without exposing server credentials', async ({
  page,
}) => {
  await page.goto('/')

  const contact = page.getByRole('region', { name: 'Get in touch' })

  await expect(contact.getByLabel('Name')).toBeVisible()
  await expect(contact.getByRole('textbox', { name: 'Email' })).toBeVisible()
  await expect(contact.getByLabel('Subject')).toBeVisible()
  await expect(contact.getByLabel(/Affiliation/)).toBeVisible()
  await expect(contact.getByLabel('Message')).toBeVisible()
  await expect(contact.getByRole('button', { name: 'Send message' })).toBeVisible()
  await expect(contact).toContainText('temporary abuse-control hashes expire automatically')

  const pageContent = await page.content()
  expect(pageContent).not.toContain('RESEND_API_KEY')
  expect(pageContent).not.toContain('UPSTASH_REDIS_REST_TOKEN')
  expect(pageContent).not.toContain('TURNSTILE_SECRET_KEY')
})

test('guides offline visitors to reconnect before attempting a contact submission', async ({
  page,
}) => {
  await page.goto('/')
  await page.context().setOffline(true)
  await page.evaluate(() => window.dispatchEvent(new Event('offline')))

  const contact = page.getByRole('region', { name: 'Get in touch' })
  await expect(contact.getByRole('button', { name: 'Send message' })).toBeDisabled()
  await expect(contact.getByRole('status').filter({ hasText: 'You are offline.' })).toBeVisible()

  await page.context().setOffline(false)
})
