import { test, expect } from '@playwright/test';

test.describe('Core pages render', () => {
  test('home returns 200', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
  });

  test('/events returns 200', async ({ page }) => {
    const res = await page.goto('/events');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/forum returns 200', async ({ page }) => {
    const res = await page.goto('/forum');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/marketplace returns 200', async ({ page }) => {
    const res = await page.goto('/marketplace');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/ferry returns 200', async ({ page }) => {
    const res = await page.goto('/ferry');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/news returns 200', async ({ page }) => {
    const res = await page.goto('/news');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/tides returns 200', async ({ page }) => {
    const res = await page.goto('/tides');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });
});
