import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/로그인|유니피벗|UniPivot/i)
  })

  test('should redirect protected routes to login', async ({ page }) => {
    await page.goto('/club/profile')
    // Should redirect to login or show auth wall
    await expect(page).toHaveURL(/\/(login|auth|api\/auth)/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    const emailInput = page.locator('input[name="email"], input[type="email"]')
    const passwordInput = page.locator('input[name="password"], input[type="password"]')

    if ((await emailInput.count()) > 0) {
      await emailInput.fill('wrong@example.com')
      await passwordInput.fill('wrongpassword')
      await page.click('button[type="submit"]')

      // Should show error or remain on login page
      await expect(page).toHaveURL(/\/(login|auth)/)
    }
  })

  test('should show main page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    // Main page should load without errors
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
