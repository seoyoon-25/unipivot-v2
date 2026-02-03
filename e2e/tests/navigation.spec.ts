import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should load main page', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL('/about')
  })

  test('should navigate to programs page', async ({ page }) => {
    await page.goto('/programs')
    await expect(page).toHaveURL('/programs')
  })

  test('should have working club route', async ({ page }) => {
    await page.goto('/club')
    // Club should either load or redirect to login
    const url = page.url()
    expect(url).toMatch(/\/(club|login|auth|api\/auth)/)
  })

  test('mobile navigation should work', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
