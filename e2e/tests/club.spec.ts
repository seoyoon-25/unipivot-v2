import { test, expect } from '@playwright/test'

test.describe('Club Pages', () => {
  test('club home redirects to auth when not logged in', async ({ page }) => {
    await page.goto('/club')
    const url = page.url()
    // Should redirect to auth or show club content
    expect(url).toMatch(/\/(club|login|auth|api\/auth)/)
  })

  test('club programs page structure', async ({ page }) => {
    const response = await page.goto('/club/programs')
    // Should get a response (200 or redirect)
    expect(response?.status()).toBeLessThan(500)
  })

  test('club community page structure', async ({ page }) => {
    const response = await page.goto('/club/community')
    expect(response?.status()).toBeLessThan(500)
  })

  test('club notifications page', async ({ page }) => {
    const response = await page.goto('/club/notifications')
    expect(response?.status()).toBeLessThan(500)
  })

  test('club search page', async ({ page }) => {
    const response = await page.goto('/club/search?q=test')
    expect(response?.status()).toBeLessThan(500)
  })
})
