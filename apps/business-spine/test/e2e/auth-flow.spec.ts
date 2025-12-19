import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Auth-Spine/);
    await expect(page.locator('h1')).toContainText('Auth-Spine Platform');
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should load Swagger documentation', async ({ page }) => {
    await page.goto(`${BASE_URL}/swagger`);
    await expect(page).toHaveURL(/\/swagger/);
  });

  test('should show API metrics', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/metrics`);
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('process_cpu');
  });
});

test.describe('API Endpoints', () => {
  test('health check should return healthy status', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('providers endpoint should return data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/providers`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('OpenAPI spec should be accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/openapi.json`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.openapi).toBeDefined();
    expect(data.info).toBeDefined();
  });
});

test.describe('UI Components', () => {
  test('homepage should show feature cards', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for feature cards
    await expect(page.locator('text=Core Platform')).toBeVisible();
    await expect(page.locator('text=Operations Spine')).toBeVisible();
    await expect(page.locator('text=AI Assistant')).toBeVisible();
  });

  test('homepage should have working quick links', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for quick links
    await expect(page.locator('text=API Documentation')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Operations Panel')).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click dashboard link
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(BASE_URL);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    
    await expect(page.locator('h1')).toBeVisible();
  });
});

