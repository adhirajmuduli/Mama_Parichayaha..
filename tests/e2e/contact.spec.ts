import { expect, test } from '@playwright/test'

test('renders the accessible contact form and privacy boundary without exposing server credentials', async ({
  page,
}) => {
  await page.goto('/')

  const contact = page.getByRole('region', { name: 'Get in touch' })

  await expect(contact.getByLabel('Name')).toBeVisible()
  await expect(contact.getByLabel('Email')).toBeVisible()
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
